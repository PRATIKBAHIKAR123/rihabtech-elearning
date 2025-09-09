import { db } from "../lib/firebase";
import { collection, getDocs, query, where, orderBy, limit, getCountFromServer } from "firebase/firestore";

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  promoVideoUrl?: string;
  featured: boolean;
  isPublished: boolean;
  status: string;
  category: string;
  subcategory?: string;
  level: string;
  language: string;
  progress?: number;
  pricing: string;
  submittedAt: string;
  approvedAt?: string;
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
        isPromotional?: boolean;
        contentFiles?: Array<{
          duration?: number | string;
          name: string;
          url: string;
        }>;
      }>;
    }>;
  };
  members?: Array<{
    id: string;
    email: string;
    role: string;
  }>;
}

// Helper function to calculate course duration from curriculum
export const calculateCourseDuration = (course: Course): number => {
  if (!course.curriculum?.sections) return 0;

  let totalDuration = 0;

  course.curriculum.sections.forEach(section => {
    // Include all sections, not just published ones
    if (section.items) {
      section.items.forEach(item => {
        // Include all items, not just published ones
        if (item.contentFiles) {
          item.contentFiles.forEach(file => {
            if (file.duration !== undefined && file.duration !== null) {
              let durationValue: number;

              // Handle both integer and decimal duration values
              if (typeof file.duration === 'string') {
                // Check if it's already formatted as "MM:SS" or "HH:MM:SS"
                if (file.duration.includes(':')) {
                  const parts = file.duration.split(':');
                  if (parts.length === 2) {
                    // Format: "MM:SS"
                    durationValue = parseInt(parts[0]) * 60 + parseFloat(parts[1]);
                  } else if (parts.length === 3) {
                    // Format: "HH:MM:SS"
                    durationValue = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
                  } else {
                    durationValue = parseFloat(file.duration);
                  }
                } else {
                  // Try to parse as number
                  durationValue = parseFloat(file.duration);
                }
              } else {
                durationValue = file.duration;
              }

              if (!isNaN(durationValue) && durationValue > 0) {
                totalDuration += durationValue; // Don't round, keep decimal precision
                console.log(`Course duration: Adding ${durationValue} seconds from file: ${file.name}`);
              }
            }
          });
        }
      });
    }
  });

  console.log(`Total course duration in seconds: ${totalDuration}`);

  // Convert seconds to hours and round to nearest 0.1 hour
  const hours = totalDuration / 3600;
  return Math.round(hours * 10) / 10; // Round to 1 decimal place
};

// Get all courses without any filters
export const getAllCourses = async (): Promise<Course[]> => {
  try {


    const coursesRef = collection(db, "courseDrafts");
    const querySnapshot = await getDocs(coursesRef);


    const allCourses = querySnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data
      } as Course;
    });

    if (allCourses.length > 0) {
    }

    return allCourses;
  } catch (error) {
    return [];
  }
};

// Get featured courses
export const getFeaturedCourses = async (): Promise<Course[]> => {
  try {
    const coursesRef = collection(db, "courseDrafts");
    const featuredQuery = query(
      coursesRef,
      where("isPublished", "==", true),
      where("status", "==", "approved"),
      where("featured", "==", true)
    );

    const featuredSnapshot = await getDocs(featuredQuery);
    const featuredCourses = featuredSnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data
      } as Course;
    });

    // If no featured courses found, get all published and approved courses as fallback
    if (featuredCourses.length === 0) {
      const fallbackQuery = query(
        coursesRef,
        where("isPublished", "==", true),
        where("status", "==", "approved")
      );

      const fallbackSnapshot = await getDocs(fallbackQuery);
      return fallbackSnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...data
        } as Course;
      });
    }

    return featuredCourses;
  } catch (error) {
    return [];
  }
};

// Get courses by category
export const getCoursesByCategory = async (categoryId: string): Promise<Course[]> => {
  try {
    const coursesRef = collection(db, "courseDrafts");
    const categoryQuery = query(
      coursesRef,
      where("category", "==", categoryId),
      where("isPublished", "==", true),
      where("status", "==", "approved")
    );

    const categorySnapshot = await getDocs(categoryQuery);
    return categorySnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data
      } as Course;
    });
  } catch (error) {
    return [];
  }
};

// Get course count by category
export const getCourseCountByCategory = async (categoryId: string): Promise<number> => {
  try {
    const coursesRef = collection(db, "courseDrafts");
    const countQuery = query(
      coursesRef,
      where("category", "==", categoryId),
      where("isPublished", "==", true),
      where("status", "==", "approved")
    );

    const snapshot = await getCountFromServer(countQuery);
    return (snapshot.data() as any).count;
  } catch (error) {
    return 0;
  }
};

// Get all course counts by category
export const getAllCourseCountsByCategory = async (): Promise<Record<string, number>> => {
  try {
    const categories = await getDocs(collection(db, "categories"));
    const courseCounts: Record<string, number> = {};

    for (const categoryDoc of categories.docs) {
      const categoryId = categoryDoc.id;
      const count = await getCourseCountByCategory(categoryId);
      courseCounts[categoryId] = count;
    }

    return courseCounts;
  } catch (error) {
    return {};
  }
};
