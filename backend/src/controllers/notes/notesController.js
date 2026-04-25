import Note from "../../models/Note.js"
import { JsonFormatter, MarkdownFormatter } from '../../services/export/Formatters.js';
import { DownloadExporter, ConsoleExporter } from '../../services/export/Exporters.js';

export const exportNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { format = 'json', method = 'download' } = req.query;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
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
      return res.send(result.data);
    } 
    
    if (result.type === 'console') {
      return res.status(200).json({ success: true, message: "Exported to backend console" });
    }

  } catch (error) {
    console.error("Export Error:", error);
    next(error);
  }
};

export async function getAllNotes( req, res){
    try {
        const notes = await Note.find().sort({createdAt:-1}); // sort by newest
        res.status(200).json(notes);
    } catch (error){
        console.log("error in getallnotes method", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export async function getNotebyID(req, res){
    try {
        const notes = await Note.findById(req.params.id);
        res.status(200).json(notes);
    } catch (error){
        console.log("error in getnote method", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export async function creatNotes ( req, res) {
    try {
        const  {title, content} = req.body;
        const newnote = new Note({title: title, content: content});

        const savednote = await newnote.save();
        res.status(201).json(savednote);
    } catch (error) {
        console.log("error in createnote method", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export async function  updateNote ( req, res) {
    try {
        const {title, content} = req.body;
        const updatednote = await Note.findByIdAndUpdate(req.params.id, {title:title, content:content}, {new:true});

        if(!updatednote){
            return res.status(404).json({message: "note not found"});
        }
        res.status(201).json(updatednote);
    } catch (error) {
        console.log("error in updatenote method", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export async function  deleteNotes (req,res) {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);
        res.status(201).json(note);
    } catch (error) {
        console.log("error in deletenote method", error);
        res.status(500).json({message: "Internal Server Error"});
    }
};