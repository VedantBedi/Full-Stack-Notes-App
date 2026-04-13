import express from 'express'
import { getAllNotes, creatNotes, updateNote, deleteNotes, getNotebyID } from '../controllers/notes/notesController.js';
const router = express.Router();

router.get("/", getAllNotes);

router.get("/:id", getNotebyID);

router.post("/", creatNotes);

router.put("/:id", updateNote);

router.delete("/:id", deleteNotes);
export default router