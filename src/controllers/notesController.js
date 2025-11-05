import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

const ctrl = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const getAllNotes = ctrl(async (req, res) => {
  const notes = await Note.find().sort({ createdAt: -1 });
  res.status(200).json(notes);
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
    { new: true, runValidators: true }
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
