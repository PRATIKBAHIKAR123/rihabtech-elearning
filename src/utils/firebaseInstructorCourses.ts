import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";

export interface InstructorCourse {
  id: string;
  title: string;
  description?: string;
  status: string;
  visibility: string;
  progress: number;
  thumbnail?: string;
  lastModified: Date;
  createdAt: Date;
  instructorId: string;
  category?: string;
  subcategory?: string;
  level?: string;
  language?: string;
  pricing?: string;
  isPublished?: boolean;
  featured?: boolean;
  members?: Array<{
    id: string;
    email: string;
    role: string;
  }>;
  curriculum?: {
    sections: Array<{
      id?: string;
      name: string;
      published: boolean;
      items: Array<{
        id?: string;
        contentType: string;
        lectureName: string;
        description: string;
        published: boolean;
        contentFiles?: Array<{
          duration?: number;
          name: string;
          url: string;
        }>;
      }>;
    }>;
  };
}

// Get all courses for a specific instructor
export const getInstructorCourses = async (instructorId: string): Promise<InstructorCourse[]> => {
  try {
    const coursesRef = collection(db, "courseDrafts");

    // Get all courses and filter by instructorId
    console.log("Getting all courses to filter by instructorId:", instructorId);

        const coursesQuery = query(
      coursesRef,
      where("instructorId", "==", instructorId),
      //orderBy("createdAt", "desc")
    );
    const allCoursesSnapshot = await getDocs(coursesQuery);

const allCourses = allCoursesSnapshot.docs.map((doc) => {
  const data = doc.data() as any;

  const course: InstructorCourse = {
    id: doc.id,
    title: data.title || "Untitled Course",
    description: data.description || "",
    status: data.status || "draft",
    visibility: data.visibility || "private",
    progress: data.progress || 0,

    // ✅ Safe conversion
    lastModified:
      toDateSafe(data.lastModified) ||
      toDateSafe(data.createdAt) ||
      toDateSafe(data.submittedAt) ||
      new Date(),

    createdAt:
      toDateSafe(data.createdAt) ||
      toDateSafe(data.submittedAt) ||
      new Date(),

    instructorId: data.instructorId || data.instructor || instructorId, // fallback
    thumbnail: data.thumbnailUrl || data.thumbnail || data.thumbnailImage || null,
    category: data.category || "",
    subcategory: data.subcategory || "",
    level: data.level || "",
    language: data.language || "",
    pricing: data.pricing || "",
    isPublished:
      data.isPublished || data.status === "published" || data.status === "approved",
    featured: data.featured || false,
    members: data.members || [],
    curriculum: data.curriculum || { sections: [] },
  };

  return course;
});

    console.log("Total courses found:", allCourses.length);
    console.log("Available instructorIds:", Array.from(new Set(allCourses.map(c => c.instructorId))));

    // Filter courses by instructorId - since courseDrafts don't have instructorId, 
    // we'll return all courses for now and let the UI handle filtering
    // In a real app, you'd want to add instructorId to courseDrafts when creating courses
    const userCourses = allCourses.filter(course => {
      // For now, return all courses since we don't have instructorId in the data
      // This should be fixed by adding instructorId when creating courses
      return true;
    });

    console.log("Filtered courses for instructorId", instructorId, ":", userCourses.length);

    return userCourses;
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    return [];
  }
};

// Get course by ID
export const getCourseById = async (courseId: string): Promise<InstructorCourse | null> => {
  try {
    const courseRef = doc(db, "courseDrafts", courseId);
    const docSnap = await getDoc(courseRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        lastModified: data?.lastModified?.toDate() || data?.createdAt?.toDate() || new Date(),
        createdAt: data?.createdAt?.toDate() || new Date(),
        progress: data?.progress || 0,
        status: data?.status || "draft",
        visibility: data?.visibility || "private"
      } as InstructorCourse;
    }

    return null;
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
};

// Update course
export const updateCourse = async (courseId: string, updates: Partial<InstructorCourse>): Promise<void> => {
  try {
    const courseRef = doc(db, "courseDrafts", courseId);
    await updateDoc(courseRef, {
      ...updates,
      lastModified: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};

// Delete course
export const deleteCourse = async (courseId: string): Promise<void> => {
  try {
    const courseRef = doc(db, "courseDrafts", courseId);
    await deleteDoc(courseRef);
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

// Calculate course progress based on curriculum
export const calculateCourseProgress = (course: InstructorCourse): number => {
  if (!course.curriculum?.sections) return 0;

  let totalItems = 0;
  let completedItems = 0;

  course.curriculum.sections.forEach(section => {
    if (section.published) {
      section.items.forEach(item => {
        totalItems++;
        if (item.published) {
          completedItems++;
        }
      });
    }
  });

  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
};

// Get course statistics for instructor
export const getInstructorCourseStats = async (instructorId: string) => {
  try {
    const courses = await getInstructorCourses(instructorId);

    const stats = {
      total: courses.length,
      published: courses.filter(c => c.isPublished).length,
      drafts: courses.filter(c => c.status === "draft").length,
      pending: courses.filter(c => c.status === "pending").length,
      approved: courses.filter(c => c.status === "approved").length,
      averageProgress: courses.length > 0
        ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
        : 0
    };

    return stats;
  } catch (error) {
    console.error("Error fetching course stats:", error);
    return {
      total: 0,
      published: 0,
      drafts: 0,
      pending: 0,
      approved: 0,
      averageProgress: 0
    };
  }
};

const toDateSafe = (val: any): Date | null => {
  if (!val) return null;
  if (val.toDate) return val.toDate(); // Firestore Timestamp
  if (val instanceof Date) return val; // already a Date
  return new Date(val); // fallback if it's a string/number
};
