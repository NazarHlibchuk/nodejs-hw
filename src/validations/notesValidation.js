// src/validations/notesValidation.js
import { celebrate, Joi, Segments } from 'celebrate';
import mongoose from 'mongoose';
import { TAGS } from '../constants/tags.js';

// GET /notes ? page, perPage, tag, search
export const getAllNotesSchema = celebrate({
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    tag: Joi.string().valid(...TAGS).optional(),
    search: Joi.string().allow('').optional(),
  }),
});

// noteId (GET by id, DELETE, буде використано і в PATCH-комбінованій схемі)
const noteIdParam = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.isValidObjectId(value)) return helpers.error('any.invalid');
    return value;
  }, 'ObjectId validation')
  .messages({ 'any.invalid': 'Invalid noteId' });

// GET /notes/:noteId, DELETE /notes/:noteId
export const noteIdSchema = celebrate({
  [Segments.PARAMS]: Joi.object({
    noteId: noteIdParam.required(),
  }),
});

// POST /notes (body)
export const createNoteSchema = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().trim().min(1).required(),
    content: Joi.string().trim().allow('').optional(),
    tag: Joi.string().valid(...TAGS).optional(),
  }),
});

// PATCH /notes/:noteId  — ОДНА схема яка валідуює і params, і body
export const updateNoteSchema = celebrate({
  [Segments.PARAMS]: Joi.object({
    noteId: noteIdParam.required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().trim().min(1),
    content: Joi.string().trim().allow(''),
    tag: Joi.string().valid(...TAGS),
  })
    .min(1) // хоча б одне поле
    .messages({ 'object.min': 'At least one field must be provided to update' }),
});
