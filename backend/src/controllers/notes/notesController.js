import Note from "../../models/Note.js";
import ResponseFactory from '../../utils/ResponseFactory.js';
import { JsonFormatter, MarkdownFormatter } from '../../services/export/Formatters.js';
import { DownloadExporter, ConsoleExporter } from '../../services/export/Exporters.js';

export const exportNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { format = 'json', method = 'download' } = req.query;

    const note = await Note.findById(id);
    if (!note) {
      // 1. Using Factory for 404 Error
      return ResponseFactory.createError(res, "Note not found", 404);
    }

    let formatter;
    if (format === 'markdown') {
      formatter = new MarkdownFormatter();
    } else {
      formatter = new JsonFormatter();
    }

    let exporter;
    if (method === 'console') {
      exporter = new ConsoleExporter(formatter);
    } else {
      exporter = new DownloadExporter(formatter);
    }

    const result = exporter.export(note);

    if (result.type === 'download') {
      const contentType = format === 'markdown' ? 'text/markdown' : 'application/json';
      const fileExtension = format === 'markdown' ? 'md' : 'json';
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="note-${id}.${fileExtension}"`);
      
      // Note: We DO NOT use the Factory here because this is returning a raw file buffer, 
      // not a standard JSON API response!
      return res.send(result.data);
    } 
    
    if (result.type === 'console') {
      // 2. Using Factory for Success
      return ResponseFactory.createSuccess(res, null, "Exported to backend console");
    }

  } catch (error) {
    console.error("Export Error:", error);
    next(error);
  }
};

export async function getAllNotes(req, res) {
  try {
    const notes = await Note.find().sort({ createdAt: -1 }); 
    // 3. Factory Success
    return ResponseFactory.createSuccess(res, notes, "Notes retrieved successfully");
  } catch (error) {
    console.error("error in getAllNotes method", error);
    // 4. Factory Error
    return ResponseFactory.createError(res, "Internal Server Error", 500, error.message);
  }
}

export async function getNotebyID(req, res) {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return ResponseFactory.createError(res, "Note not found", 404);
    }
    return ResponseFactory.createSuccess(res, note, "Note retrieved successfully");
  } catch (error) {
    console.error("error in getNotebyID method", error);
    return ResponseFactory.createError(res, "Internal Server Error", 500, error.message);
  }
}

export async function creatNotes(req, res) {
  try {
    const { title, content } = req.body;
    const newnote = new Note({ title, content });

    const savednote = await newnote.save();
    return ResponseFactory.createSuccess(res, savednote, "Note created successfully", 201);
  } catch (error) {
    console.error("error in creatNotes method", error);
    return ResponseFactory.createError(res, "Internal Server Error", 500, error.message);
  }
}

export async function updateNote(req, res) {
  try {
    const { title, content } = req.body;
    const updatednote = await Note.findByIdAndUpdate(
      req.params.id, 
      { title, content }, 
      { new: true }
    );

    if (!updatednote) {
      return ResponseFactory.createError(res, "Note not found", 404);
    }
    return ResponseFactory.createSuccess(res, updatednote, "Note updated successfully");
  } catch (error) {
    console.error("error in updateNote method", error);
    return ResponseFactory.createError(res, "Internal Server Error", 500, error.message);
  }
}

export async function deleteNotes(req, res) {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
       return ResponseFactory.createError(res, "Note not found", 404);
    }
    return ResponseFactory.createSuccess(res, note, "Note deleted successfully");
  } catch (error) {
    console.error("error in deleteNotes method", error);
    return ResponseFactory.createError(res, "Internal Server Error", 500, error.message);
  }
}