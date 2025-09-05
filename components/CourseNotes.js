"use client";

import { useState, useEffect, useRef } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiTag, FiClock, FiAlertCircle } from "react-icons/fi";

export default function CourseNotes({ courseId, videoId }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [currentTags, setCurrentTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef(null); 

  useEffect(() => {
    fetchNotes();
  }, [courseId, videoId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `/api/user/courses/${courseId}/notes${videoId ? `?videoId=${videoId}` : ""}`;

      const res = await fetch(url, {
        credentials: "include",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!res.ok) {
        if (res.status === 404) {
          setNotes([]);
          return;
        }
        const errorText = await res.text();
        throw new Error(`Failed to fetch notes: ${res.status} ${errorText}`);
      }

      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const timestamp = videoId ? (videoRef.current?.currentTime || 0) : 0; 
      const response = await fetch(`/api/user/courses/${courseId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: newNote.trim(),
          videoId: videoId || null,
          tags: currentTags,
          timestamp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const newNoteData = await response.json();
      setNotes((prev) => [newNoteData, ...prev]);
      setNewNote("");
      setCurrentTags([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!noteId) return;

    try {
      setError(null);
      const response = await fetch(`/api/user/courses/${courseId}/notes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ noteId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete note");
      }

      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTagAdd = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const tag = e.target.value.trim();
      if (tag && !currentTags.includes(tag)) {
        setCurrentTags((prev) => [...prev, tag]);
      }
      e.target.value = "";
    }
  };

  const removeTag = (indexToRemove) => {
    setCurrentTags((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-6">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
            Your Notes {videoId && "(Current Video)"}
          </h3>
          {videoId && (
            <p className="text-sm text-gray-500 mb-4">
              Notes will be saved for this specific video
            </p>
          )}

          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label
                htmlFor="note-content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Add a new note
              </label>
              <textarea
                id="note-content"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Write your note here..."
                rows="3"
                disabled={submitting}
                required
              />
            </div>

            <div>
              <label
                htmlFor="note-tags"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tags (press Enter to add)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    <FiTag className="mr-1 h-3 w-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 text-indigo-600 hover:text-indigo-800"
                      disabled={submitting}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                id="note-tags"
                type="text"
                onKeyDown={handleTagAdd}
                placeholder="Type tag and press Enter..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={submitting}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting || !newNote.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <FiPlus className="mr-2 -ml-1 h-4 w-4" />
                    Add Note
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              {notes.length} Note{notes.length !== 1 ? "s" : ""}
            </h4>

            {notes.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No notes yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first note above.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {note.content}
                        </p>
                        {note.timestamp > 0 && (
                          <p className="mt-1 text-xs text-gray-500 flex items-center">
                            <FiClock className="mr-1 h-3 w-3" />
                            Timestamp: {formatTimestamp(note.timestamp)}
                          </p>
                        )}
                        {note.tags && note.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {note.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                <FiTag className="mr-1 h-3 w-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="mt-2 text-xs text-gray-400">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={submitting}
                        className="ml-3 text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                        title="Delete note"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <button
                  onClick={fetchNotes}
                  className="mt-2 text-red-600 hover:text-red-800 underline text-xs"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}