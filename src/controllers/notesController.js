import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

const ctrl = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const getAllNotes = ctrl(async (req, res) => {
  const { page = 1, perPage = 10, tag, search } = req.query;

  const filter = {};
  if (tag) filter.tag = tag;
  if (typeof search === 'string' && search.trim().length > 0) {
    // $text спрацює лише якщо є text-індекс
    filter.$text = { $search: search.trim() };
  }

  const skip = (Number(page) - 1) * Number(perPage);
  const limit = Number(perPage);

  const [notes, totalNotes] = await Promise.all([
    Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Note.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalNotes / limit) || 1);

  res.status(200).json({
    page: Number(page),
    perPage: limit,
    totalNotes,
    totalPages,
    notes,
  });
});

export const getNoteById = ctrl(async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findById(noteId);
  if (!note) throw createHttpError(404, 'Note not found');
  res.status(200).json(note);
});

export const createNote = ctrl(async (req, res) => {
  const note = await Note.create(req.body);
  res.status(201).json(note);
});

export const updateNote = ctrl(async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findByIdAndUpdate(
    noteId,
    { $set: req.body },
    { new: true, runValidators: true },
  );
  if (!note) throw createHttpError(404, 'Note not found');
  res.status(200).json(note);
});

export const deleteNote = ctrl(async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findByIdAndDelete(noteId);
  if (!note) throw createHttpError(404, 'Note not found');
  res.status(200).json(note);
});
