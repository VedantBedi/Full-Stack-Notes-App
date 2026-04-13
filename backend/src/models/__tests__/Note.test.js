import mongoose from 'mongoose';
import Note from '../Note.js';

describe('Note Model', () => {
  describe('Schema validation', () => {
    it('should have required fields: title and content', () => {
      const schema = Note.schema;
      expect(schema.paths.title.isRequired).toBe(true);
      expect(schema.paths.content.isRequired).toBe(true);
    });

    it('should have timestamps', () => {
      const schema = Note.schema;
      expect(schema.options.timestamps).toBe(true);
    });

    it('should set proper types for fields', () => {
      const schema = Note.schema;
      expect(schema.paths.title.instance).toBe('String');
      expect(schema.paths.content.instance).toBe('String');
      expect(schema.paths.createdAt.instance).toBe('Date');
      expect(schema.paths.updatedAt.instance).toBe('Date');
    });
  });

  describe('Model methods', () => {
    it('should have the correct model name', () => {
      expect(Note.modelName).toBe('Note');
    });

    it('should have collection name "notes"', () => {
      expect(Note.collection.name).toBe('notes');
    });
  });

  describe('Field constraints', () => {
    it('title field should be String type', () => {
      const titleField = Note.schema.paths.title;
      expect(titleField.instance).toBe('String');
      expect(titleField.isRequired).toBe(true);
    });

    it('content field should be String type', () => {
      const contentField = Note.schema.paths.content;
      expect(contentField.instance).toBe('String');
      expect(contentField.isRequired).toBe(true);
    });
  });
});
