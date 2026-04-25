import api from "./axios.js";

export const NotesAPI = {

  exportNote: async (id, format = 'json') => {
    try {
      const response = await api.get(`/notes/${id}/export?format=${format}&method=download`, {
        responseType: 'blob' 
      });
      
      return response.data;
    } catch (error) {
      console.error(`Facade Error - exportNote (${id}):`, error);
      throw new Error("Failed to download file");
    }
  },
  
  getAllNotes: async () => {
    try {
      const response = await api.get("/notes");
      return response.data; 
    } catch (error) {
      console.error("Facade Error - getAllNotes:", error);
      throw error.response?.data || error.message;
    }
  },

  getNoteById: async (id) => {
    try {
      const response = await api.get(`/notes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Facade Error - getNoteById (${id}):`, error);
      throw error.response?.data || error.message;
    }
  },

  createNote: async (noteData) => {
    try {
      const response = await api.post("/notes", noteData);
      return response.data;
    } catch (error) {
      console.error("Facade Error - createNote:", error);
      throw error.response?.data || error.message;
    }
  },

  deleteNote: async (id) => {
    try {
      const response = await api.delete(`/notes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Facade Error - deleteNote (${id}):`, error);
      throw error.response?.data || error.message;
    }
  }
};

