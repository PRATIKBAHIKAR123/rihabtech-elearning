import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  DocumentData
} from 'firebase/firestore';

export interface CourseNote {
  id: string;
  studentId: string;
  courseId: string;
  heading: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  moduleId?: string; // Optional: if note is related to specific module
  timestamp?: number; // Optional: video timestamp when note was created
}

class FirebaseNotesService {
  private readonly COLLECTION_NAME = 'courseNotes';

  // Create a new note
  async createNote(note: Omit<CourseNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const noteData = {
        ...note,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), noteData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating note:', error);
      throw new Error('Failed to create note');
    }
  }

  // Get all notes for a specific course and student
  async getCourseNotes(studentId: string, courseId: string): Promise<CourseNote[]> {
    try {
      const notesRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        notesRef,
        where('studentId', '==', studentId),
        where('courseId', '==', courseId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          studentId: data.studentId,
          courseId: data.courseId,
          heading: data.heading,
          content: data.content,
          moduleId: data.moduleId,
          timestamp: data.timestamp,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as CourseNote;
      });
    } catch (error) {
      console.error('Error fetching course notes:', error);
      throw new Error('Failed to fetch notes');
    }
  }

  // Update an existing note
  async updateNote(noteId: string, updates: Partial<Pick<CourseNote, 'heading' | 'content'>>): Promise<void> {
    try {
      const noteRef = doc(db, this.COLLECTION_NAME, noteId);
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating note:', error);
      throw new Error('Failed to update note');
    }
  }

  // Delete a note
  async deleteNote(noteId: string): Promise<void> {
    try {
      const noteRef = doc(db, this.COLLECTION_NAME, noteId);
      await deleteDoc(noteRef);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error('Failed to delete note');
    }
  }

  // Subscribe to real-time updates for course notes
  subscribeToCourseNotes(
    studentId: string,
    courseId: string,
    callback: (notes: CourseNote[]) => void
  ): () => void {
    const notesRef = collection(db, this.COLLECTION_NAME);
    const q = query(
      notesRef,
      where('studentId', '==', studentId),
      where('courseId', '==', courseId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, {
      next: (snapshot) => {
        const notes = (snapshot as any).docs.map((doc: any) => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            studentId: data.studentId,
            courseId: data.courseId,
            heading: data.heading,
            content: data.content,
            moduleId: data.moduleId,
            timestamp: data.timestamp,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as CourseNote;
        });
        callback(notes);
      },
      error: (error: Error) => {
        console.error('Error in notes subscription:', error);
      }
    });
  }

  // Get notes for a specific module (if needed)
  async getModuleNotes(studentId: string, courseId: string, moduleId: string): Promise<CourseNote[]> {
    try {
      const notesRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        notesRef,
        where('studentId', '==', studentId),
        where('courseId', '==', courseId),
        where('moduleId', '==', moduleId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          studentId: data.studentId,
          courseId: data.courseId,
          heading: data.heading,
          content: data.content,
          moduleId: data.moduleId,
          timestamp: data.timestamp,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as CourseNote;
      });
    } catch (error) {
      console.error('Error fetching module notes:', error);
      throw new Error('Failed to fetch module notes');
    }
  }
}

// Export a singleton instance
export const firebaseNotesService = new FirebaseNotesService();

// Export individual functions for convenience
export const {
  createNote,
  getCourseNotes,
  updateNote,
  deleteNote,
  subscribeToCourseNotes,
  getModuleNotes
} = firebaseNotesService;
