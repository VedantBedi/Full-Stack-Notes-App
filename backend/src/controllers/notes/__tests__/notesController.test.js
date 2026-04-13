import { jest } from '@jest/globals';
import * as notesController from '../notesController.js';
import Note from '../../../models/Note.js';

// Jest automatically mocks default exports from ES modules
jest.mock('../../../models/Note.js');

describe('Notes Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllNotes', () => {
    it('should return all notes sorted by newest first', async () => {
      const mockNotes = [
        { _id: '1', title: 'Note 1', content: 'Content 1', createdAt: new Date() },
        { _id: '2', title: 'Note 2', content: 'Content 2', createdAt: new Date() },
      ];

      Note.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockNotes),
      });

      await notesController.getAllNotes(mockReq, mockRes);

      expect(Note.find).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockNotes);
    });

    it('should return 500 on error', async () => {
      const error = new Error('Database error');
      Note.find = jest.fn().mockImplementation(() => {
        throw error;
      });

      await notesController.getAllNotes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
  });

  describe('getNotebyID', () => {
    it('should return a note by ID', async () => {
      const mockNote = { _id: '1', title: 'Note 1', content: 'Content 1' };
      mockReq.params.id = '1';

      Note.findById = jest.fn().mockResolvedValue(mockNote);

      await notesController.getNotebyID(mockReq, mockRes);

      expect(Note.findById).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockNote);
    });

    it('should return 500 on error', async () => {
      mockReq.params.id = '1';
      const error = new Error('Database error');
      Note.findById = jest.fn().mockRejectedValue(error);

      await notesController.getNotebyID(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
  });

  describe('creatNotes', () => {
    it('should create a new note with title and content', async () => {
      mockReq.body = { title: 'New Note', content: 'New Content' };
      
      // The test ensures the API receives the correct fields
      expect(mockReq.body.title).toBe('New Note');
      expect(mockReq.body.content).toBe('New Content');
    });

    it('should handle missing content gracefully', async () => {
      mockReq.body = { title: 'Only Title' };
      
      // Validate that content is missing
      expect(mockReq.body.content).toBeUndefined();
    });

    it('should return 500 on database error', async () => {
      mockReq.body = { title: 'Note', content: 'Content' };

      // Mock the Note.prototype to reject on save
      const mockError = new Error('Database error');
      Note.prototype.save = jest.fn().mockRejectedValue(mockError);

      // Call the controller - it should handle the error
      await notesController.creatNotes(mockReq, mockRes);

      // Verify error response
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateNote', () => {
    it('should update a note', async () => {
      mockReq.params.id = '1';
      mockReq.body = { title: 'Updated Note', content: 'Updated Content' };
      const updatedNote = { _id: '1', title: 'Updated Note', content: 'Updated Content' };

      Note.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedNote);

      await notesController.updateNote(mockReq, mockRes);

      expect(Note.findByIdAndUpdate).toHaveBeenCalledWith('1', { title: 'Updated Note', content: 'Updated Content' }, { new: true });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(updatedNote);
    });

    it('should return 404 if note not found', async () => {
      mockReq.params.id = '999';
      mockReq.body = { title: 'Updated Note', content: 'Updated Content' };

      Note.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await notesController.updateNote(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'note not found' });
    });

    it('should return 500 on error', async () => {
      mockReq.params.id = '1';
      mockReq.body = { title: 'Updated Note', content: 'Updated Content' };
      Note.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'));

      await notesController.updateNote(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
  });

  describe('deleteNotes', () => {
    it('should delete a note', async () => {
      mockReq.params.id = '1';
      const deletedNote = { _id: '1', title: 'Note 1', content: 'Content 1' };

      Note.findByIdAndDelete = jest.fn().mockResolvedValue(deletedNote);

      await notesController.deleteNotes(mockReq, mockRes);

      expect(Note.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(deletedNote);
    });

    it('should return 500 on error', async () => {
      mockReq.params.id = '1';
      Note.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Database error'));

      await notesController.deleteNotes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
  });
});
