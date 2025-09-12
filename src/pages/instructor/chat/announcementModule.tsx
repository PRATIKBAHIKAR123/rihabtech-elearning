import React, { useState, useMemo } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Trash2, Edit, Plus } from 'lucide-react';

// Types
export type Announcement = {
  id: string;
  title: string;
  message: string;
  courseId: string | 'all';
  createdAt: string; // ISO
};

export type Course = {
  id: string;
  title: string;
};

// Static mock data
const MOCK_COURSES: Course[] = [
  { id: 'all-courses', title: 'All Courses' },
  { id: 'course-1', title: 'React Fundamentals' },
  { id: 'course-2', title: 'Advanced TypeScript' },
  { id: 'course-3', title: 'Node.js for Beginners' },
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'Welcome to the course!',
    message: 'Hello learners — welcome. Please check the syllabus and introduce yourself in the forum.',
    courseId: 'course-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a2',
    title: 'Maintenance downtime',
    message: 'Platform will be under maintenance on Saturday 10 PM - 11 PM.',
    courseId: 'all',
    createdAt: new Date().toISOString(),
  }
];

// Helpers
const uid = () => Math.random().toString(36).slice(2, 9);

export default function AnnouncementModule() {
  const [courses] = useState<Course[]>(MOCK_COURSES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [filterCourse, setFilterCourse] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const filtered = useMemo(() => {
    if (filterCourse === 'all') return announcements.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return announcements.filter(a => a.courseId === filterCourse).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [filterCourse, announcements]);

  const openCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditing(ann);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={filterCourse} onValueChange={(v) => setFilterCourse(v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" onClick={() => setFilterCourse('all')}>Reset</Button>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={openCreate}>
            <Plus size={14} />
            <span className="ml-2">New Announcement</span>
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="p-4 bg-white rounded shadow text-sm text-gray-600">No announcements for selected course.</div>
        )}

        {filtered.map(a => (
          <div key={a.id} className="p-3 bg-white rounded shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{a.title}</h3>
                <span className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</span>
                <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">{a.courseId === 'all' ? 'All Courses' : courses.find(c => c.id === a.courseId)?.title}</span>
              </div>
              <p className="text-sm text-gray-700 mt-2 break-words">{a.message}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => openEdit(a)} title="Edit">
                <Edit size={16} />
              </Button>
              <Button variant="ghost" onClick={() => handleDelete(a.id)} title="Delete">
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AnnouncementModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courses={courses}
        initial={editing}
        onSave={(payload) => {
          if (editing) {
            setAnnouncements(prev => prev.map(p => p.id === editing.id ? { ...p, ...payload } : p));
          } else {
            const newAnn: Announcement = { id: uid(), ...payload, createdAt: new Date().toISOString() };
            setAnnouncements(prev => [newAnn, ...prev]);
          }
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}

function AnnouncementModal({ open, onClose, courses, initial, onSave }: {
  open: boolean;
  onClose: () => void;
  courses: Course[];
  initial?: Announcement | null;
  onSave: (payload: Omit<Announcement, 'id' | 'createdAt'>) => void;
}){
  const [title, setTitle] = useState(initial?.title || '');
  const [message, setMessage] = useState(initial?.message || '');
  const [courseId, setCourseId] = useState<string>(initial?.courseId || 'all');

  // Sync when initial changes
  React.useEffect(() => {
    setTitle(initial?.title || '');
    setMessage(initial?.message || '');
    setCourseId(initial?.courseId || 'all');
  }, [initial]);

  const handleSubmit = () => {
    if (!title.trim() || !message.trim()) {
      alert('Please provide title and message');
      return;
    }
    onSave({ title: title.trim(), message: message.trim(), courseId });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />

          <label className="text-sm font-medium">Message</label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} />

          <label className="text-sm font-medium">Course</label>
          <Select value={courseId} onValueChange={(v) => setCourseId(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>{initial ? 'Save' : 'Create'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
