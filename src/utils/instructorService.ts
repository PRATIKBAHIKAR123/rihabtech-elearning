import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export interface InstructorDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  address: string;
  phone: string;
  profilePicture: string;
  rating: number;
  totalStudents: number;
  totalCourses: number;
  isVerified: boolean;
  joinDate: any;
  role: string;
}

export const getInstructorById = async (instructorId: string): Promise<InstructorDetails | null> => {
  try {
    const instructorRef = doc(db, "users", instructorId);
    const instructorSnap = await getDoc(instructorRef);
    
    if (instructorSnap.exists()) {
      const data = instructorSnap.data() as any;
      return {
        id: instructorSnap.id,
        email: data.email || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        bio: data.bio || "",
        address: data.address || "",
        phone: data.phone || "",
        profilePicture: data.profilePicture || "",
        rating: data.rating || 0,
        totalStudents: data.totalStudents || 0,
        totalCourses: data.totalCourses || 0,
        isVerified: data.isVerified || false,
        joinDate: data.joinDate,
        role: data.role || "instructor"
      } as InstructorDetails;
    } else {
      console.log("Instructor not found with ID:", instructorId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching instructor:", error);
    return null;
  }
};


