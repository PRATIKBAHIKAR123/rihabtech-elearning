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
  Timestamp 
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
    
    // For now, let's get all courses and filter client-side to avoid index issues
    // This is not ideal for production but helps with development and debugging
    console.log("Getting all courses to filter by instructorId:", instructorId);
    
    const allCoursesQuery = query(coursesRef, orderBy("createdAt", "desc"));
    const allCoursesSnapshot = await getDocs(allCoursesQuery);
    
    const allCourses = allCoursesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        title: data.title || "Untitled Course",
        description: data.description || "",
        status: data.status || "draft",
        visibility: data.visibility || "private",
        progress: data.progress || 0,
        lastModified: data.lastModified?.toDate() || data.createdAt?.toDate() || data.submittedAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || data.submittedAt?.toDate() || new Date(),
        instructorId: data.instructorId || "unknown",
        thumbnail: data.thumbnailUrl || data.thumbnail || null,
        category: data.category || "",
        subcategory: data.subcategory || "",
        level: data.level || "",
        language: data.language || "",
        pricing: data.pricing || "",
        isPublished: data.isPublished || false,
        featured: data.featured || false,
        members: data.members || []
      } as InstructorCourse;
    });
    
    console.log("Total courses found:", allCourses.length);
    console.log("Available instructorIds:", Array.from(new Set(allCourses.map(c => c.instructorId))));
    
    // Filter courses by instructorId
    const userCourses = allCourses.filter(course => {
      const matches = course.instructorId === instructorId;
      if (matches) {
        console.log("Found matching course:", course.title, "with instructorId:", course.instructorId);
      }
      return matches;
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
