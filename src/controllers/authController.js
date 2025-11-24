// src/controllers/authController.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import createHttpError from 'http-errors';

import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { sendEmail } from '../utils/sendMail.js';

// Для доступу до шаблону reset-password-email.html (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resetTemplatePath = path.join(
  __dirname,
  '..',
  'templates',
  'reset-password-email.html',
);

let compiledResetTemplate;

async function getResetTemplate() {
  if (!compiledResetTemplate) {
    const source = await fs.readFile(resetTemplatePath, 'utf-8');
    compiledResetTemplate = handlebars.compile(source);
  }
  return compiledResetTemplate;
}

// ========= REGISTER =========
export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      throw createHttpError(400, 'Email in use');
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed,
    });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// ========= LOGIN =========
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw createHttpError(401, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw createHttpError(401, 'Invalid credentials');
    }

    await Session.deleteMany({ userId: user._id });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// ========= REFRESH SESSION =========
export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies || {};

    if (!sessionId || !refreshToken) {
      throw createHttpError(401, 'Session not found');
    }

    const session = await Session.findOne({ _id: sessionId, refreshToken });
    if (!session) {
      throw createHttpError(401, 'Session not found');
    }

    const now = new Date();
    if (session.refreshTokenValidUntil < now) {
      throw createHttpError(401, 'Session token expired');
    }

    const userId = session.userId;
    await Session.deleteOne({ _id: session._id });

    const newSession = await createSession(userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ message: 'Session refreshed' });
  } catch (err) {
    next(err);
  }
};

// ========= LOGOUT =========
export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies || {};

    if (sessionId) {
      await Session.deleteOne({ _id: sessionId });
    }

    const clearOpts = {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    };

    res.clearCookie('accessToken', clearOpts);
    res.clearCookie('refreshToken', clearOpts);
    res.clearCookie('sessionId', clearOpts);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// ========= REQUEST RESET EMAIL =========
export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // навіть якщо користувача немає — відповідаємо 200 (щоб не світити існування email)
    if (!user) {
      return res
        .status(200)
        .json({ message: 'Password reset email sent successfully' });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN;

    if (!JWT_SECRET || !FRONTEND_DOMAIN) {
      throw createHttpError(
        500,
        'Server configuration error: JWT_SECRET or FRONTEND_DOMAIN missing',
      );
    }

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '15m' },
    );

    const resetLink = `${FRONTEND_DOMAIN}/reset-password?token=${token}`;

    const template = await getResetTemplate();
    const html = template({
      username: user.username || user.email,
      resetLink,
    });

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password reset',
        html,
      });
    } catch (e) {
      console.error('Failed to send reset email:', e);
      throw createHttpError(
        500,
        'Failed to send the email, please try again later.',
      );
    }

    res
      .status(200)
      .json({ message: 'Password reset email sent successfully' });
  } catch (err) {
    next(err);
  }
};

// ========= RESET PASSWORD =========
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw createHttpError(500, 'Server configuration error: JWT_SECRET missing');
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return next(createHttpError(401, 'Invalid or expired token'));
    }

    const { sub, email } = payload;

    const user = await User.findOne({ _id: sub, email });
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};
