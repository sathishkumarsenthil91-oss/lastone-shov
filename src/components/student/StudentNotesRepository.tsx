import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchUserNotesFromSupabase, 
  createUserNoteInSupabase, 
  deleteUserNoteFromSupabase, 
  togglePinUserNoteInSupabase,
  StudentNote 
} from '../../services/campusSupabaseService';
import { supabase } from '../../services/supabase';
import { 
  BookOpen, 
  Plus, 
  Pin, 
  Trash2, 
  Search, 
  FileText, 
  Sparkles, 
  Clock, 
  Tag, 
  CheckCircle2, 
  X,
  ExternalLink,
  Share2,
  Copy,
  Layers,
  Database
} from 'lucide-react';

interface StudentNotesRepositoryProps {
  onNotesCountUpdated?: (count: number) => void;
}

export const StudentNotesRepository: React.FC<StudentNotesRepositoryProps> = ({
  onNotesCountUpdated
}) => {
  const { user, addNotification } = useAuth();
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeNoteView, setActiveNoteView] = useState<StudentNote | null>(null);
  
  // Create Note Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectCode, setSubjectCode] = useState('CS8601');
  const [subjectName, setSubjectName] = useState('Distributed Systems');
  const [category, setCategory] = useState<'LECTURE_NOTE' | 'LAB_MANUAL' | 'ASSIGNMENT' | 'EXAM_PREP'>('LECTURE_NOTE');
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await fetchUserNotesFromSupabase(user?.id);
      setNotes(data);
      if (onNotesCountUpdated) {
        onNotesCountUpdated(data.length);
      }
    } catch (e) {
      console.warn('Error loading student notes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();

    // Supabase Real-Time Channel Subscription
    const channel = supabase
      .channel('realtime_student_notes_repo')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        () => {
          loadNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagInput
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(Boolean);

      const created = await createUserNoteInSupabase({
        title: title.trim(),
        content: content.trim(),
        subjectCode: subjectCode.trim() || 'GEN-101',
        subjectName: subjectName.trim() || 'General Academic',
        category,
        tags,
        isPinned: false
      });

      if (created) {
        setNotes(prev => [created, ...prev]);
        if (onNotesCountUpdated) {
          onNotesCountUpdated(notes.length + 1);
        }
        addNotification('Note Saved', `"${title}" has been saved to your cloud repository.`, 'success');
        setTitle('');
        setContent('');
        setTagInput('');
        setShowCreateModal(false);
      }
    } catch (err) {
      console.warn('Error creating note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    const success = await deleteUserNoteFromSupabase(noteId);
    if (success) {
      setNotes(prev => prev.filter(n => n.id !== noteId));
      if (onNotesCountUpdated) {
        onNotesCountUpdated(Math.max(0, notes.length - 1));
      }
      if (activeNoteView?.id === noteId) {
        setActiveNoteView(null);
      }
      addNotification('Note Removed', 'The note was deleted from your repository.', 'info');
    }
  };

  const handleTogglePin = async (e: React.MouseEvent, note: StudentNote) => {
    e.stopPropagation();
    const newPinned = !note.isPinned;
    const success = await togglePinUserNoteInSupabase(note.id, newPinned);
    if (success) {
      setNotes(prev => prev.map(n => n.id === note.id ? { ...n, isPinned: newPinned } : n));
      addNotification(newPinned ? 'Note Pinned' : 'Note Unpinned', `"${note.title}" updated.`, 'info');
    }
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.subjectName && n.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (n.subjectCode && n.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || n.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Metrics */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white border border-sky-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-sky-300">
              SUPABASE CLOUD REPOSITORY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span>Student Study Notes & Material</span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 text-xs font-mono font-bold">
              {notes.length} Total Notes
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time notes, subject guides, lab manuals, and exam preparation documents.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Create New Note</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, subjects, codes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'LECTURE_NOTE', 'LAB_MANUAL', 'ASSIGNMENT', 'EXAM_PREP'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'All Materials' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-bold animate-pulse">
          Loading Supabase notes repository...
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">No Notes Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? `No notes matching "${searchQuery}".` : 'You haven\'t created any study notes yet. Click the button above to create your first note.'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Your First Note</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => setActiveNoteView(note)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                note.isPinned 
                  ? 'bg-sky-50/60 dark:bg-sky-950/20 border-sky-400/50 shadow-sm' 
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-sky-400/80 shadow-xs'
              }`}
            >
              {/* Top Accent Ribbon if Pinned */}
              {note.isPinned && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-blue-600" />
              )}

              <div className="space-y-2.5">
                
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold">
                    {note.subjectCode || 'GEN-101'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleTogglePin(e, note)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        note.isPinned
                          ? 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/40'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={(e) => handleDeleteNote(e, note.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-black text-slate-950 dark:text-white line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {note.title}
                </h3>

                {/* Excerpt */}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {note.content}
                </p>

                {/* Subject & Category */}
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {note.subjectName}
                </div>

              </div>

              {/* Footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Database className="w-3 h-3 text-sky-500" />
                  <span>{note.category?.replace('_', ' ') || 'LECTURE'}</span>
                </span>

                <span className="font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
                  Read Note →
                </span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Note */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tight">
                  Add New Study Note
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="p-5 space-y-4">
              
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus & Paxos Protocol"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="e.g. CS8601"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. Distributed Systems"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="LECTURE_NOTE">Lecture Note</option>
                  <option value="LAB_MANUAL">Lab Manual & Experiments</option>
                  <option value="ASSIGNMENT">Assignment & Submission</option>
                  <option value="EXAM_PREP">Exam Preparation & Q&A</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Content & Study Summary *
                </label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your study notes, formulas, code snippets, or lecture takeaways..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. paxos, cloud, unit-3, algorithms"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to Cloud...' : 'Save Note'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: Note Detail View */}
      {activeNoteView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-slate-950/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono text-[10px] font-bold border border-sky-500/30">
                    {activeNoteView.subjectCode} • {activeNoteView.category?.replace('_', ' ')}
                  </span>
                  {activeNoteView.isPinned && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold text-[10px] flex items-center gap-1">
                      <Pin className="w-2.5 h-2.5" /> Pinned
                    </span>
                  )}
                </div>
                <h2 className="text-base font-black text-slate-950 dark:text-white">
                  {activeNoteView.title}
                </h2>
                <p className="text-xs text-slate-500">
                  {activeNoteView.subjectName}
                </p>
              </div>

              <button
                onClick={() => setActiveNoteView(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {activeNoteView.content}
              </div>

              {activeNoteView.tags && activeNoteView.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeNoteView.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5 text-sky-500" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-500">
              <span>Synced with Supabase PostgreSQL</span>
              <button
                onClick={() => setActiveNoteView(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
