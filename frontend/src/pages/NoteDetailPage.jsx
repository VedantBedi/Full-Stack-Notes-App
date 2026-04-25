import { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../lib/axios";
import { NotesAPI } from '../lib/apiFacade.js';
import { triggerFileDownload } from '../lib/utils.js';
import toast from "react-hot-toast";
import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from "lucide-react";

const NoteDetailPage = () => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const navigate = useNavigate();

  const { id } = useParams();

  const handleDownload = async (format) => {
    setIsDownloading(true);
    try {
      const blob = await NotesAPI.exportNote(note._id, format);

      const extension = format === 'markdown' ? 'md' : 'json';
      const filename = `Note-${note._id}.${extension}`;

      triggerFileDownload(blob, filename);

    } catch (error) {
      alert("Uh oh! Could not download the note.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setNote(res.data);
      } catch (error) {
        console.log("Error in fetching note", error);
        toast.error("Failed to fetch the note");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      await api.delete(`/notes/${id}`);
      toast.success("Note deleted");
      navigate("/");
    } catch (error) {
      console.log("Error deleting the note:", error);
      toast.error("Failed to delete note");
    }
  };

  const handleSave = async () => {
    if (!note.title.trim() || !note.content.trim()) {
      toast.error("Please add a title or content");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/notes/${id}`, note);
      toast.success("Note updated successfully");
      navigate("/");
    } catch (error) {
      console.log("Error saving the note:", error);
      toast.error("Failed to update note");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <LoaderIcon className="animate-spin size-10" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Note not found</h2>
          <Link to="/" className="btn btn-primary">Back to Notes</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          <div className="flex items-center justify-between mb-6">
            <Link to="/" className="btn btn-ghost">
              <ArrowLeftIcon className="h-5 w-5" />
              Back to Notes
            </Link>
            <button onClick={handleDelete} className="btn btn-error btn-outline">
              <Trash2Icon className="h-5 w-5" />
              Delete Note
            </button>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">Title</span>
                </label>
                <input
                  type="text"
                  placeholder="Note title"
                  className="input input-bordered w-full"
                  value={note.title}
                  onChange={(e) => setNote({ ...note, title: e.target.value })}
                />
              </div>

              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-semibold">Content</span>
                </label>
                <textarea
                  placeholder="Write your note here..."
                  className="textarea textarea-bordered h-40 resize-y"
                  value={note.content}
                  onChange={(e) => setNote({ ...note, content: e.target.value })}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 mt-2">

                <div className="flex w-full sm:w-auto gap-3">
                  <button
                    className="btn btn-outline flex-1 sm:flex-none"
                    onClick={() => handleDownload('json')}
                    disabled={isDownloading}
                  >
                    Download JSON
                  </button>

                  <button
                    className="btn btn-outline flex-1 sm:flex-none"
                    onClick={() => handleDownload('markdown')}
                    disabled={isDownloading}
                  >
                    Download MD
                  </button>
                </div>

                <button
                  className="btn btn-primary w-full sm:w-auto"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? (
                    <><span className="loading loading-spinner loading-sm"></span> Saving...</>
                  ) : (
                    "Save Changes"
                  )}
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NoteDetailPage;
