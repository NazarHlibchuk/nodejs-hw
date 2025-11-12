// src/validations/notesValidation.js
import { Joi, Segments } from 'celebrate';
import mongoose from 'mongoose';
import { TAGS } from '../constants/tags.js';

const noteIdParam = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.isValidObjectId(value)) return helpers.error('any.invalid');
    return value;
  }, 'ObjectId validation')
  .messages({ 'any.invalid': 'Invalid noteId' });

export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    tag: Joi.string().valid(...TAGS).optional(),
    search: Joi.string().allow('').optional(),
  }),
};

export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: noteIdParam.required(),
  }),
};

export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().trim().min(1).required(),
    content: Joi.string().trim().allow('').optional(),
    tag: Joi.string().valid(...TAGS).optional(),
  }),
};

export const updateNoteSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: noteIdParam.required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().trim().min(1),
    content: Joi.string().trim().allow(''),
    tag: Joi.string().valid(...TAGS),
  }).min(1).messages({
    'object.min': 'At least one field must be provided to update',
  }),
};
