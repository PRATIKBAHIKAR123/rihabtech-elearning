import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";
import { COURSE_STATUS } from "./firebaseCourses";

export const createNewCourseDraft = async (title: string, instructorId?: string): Promise<string> => {
  try {
    const courseData = {
      instructorId:instructorId,
      title: title,
      createdAt: new Date(),
      status: COURSE_STATUS.DRAFT,
      progress: 0
    };

    const docRef = await addDoc(collection(db, "courseDrafts"), courseData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating course draft:", error);
    throw error;
  }
};

export const saveCourseTitle = async (courseId: string, title: string, instructorId?: string) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }
  const courseRef = doc(db, "courseDrafts", courseId);
  await setDoc(courseRef, { title,instructorId }, { merge: true });
};

export const getCourseTitle = async (courseId: string) => {
  if (!courseId) {
    return "";
  }
  const courseRef = doc(db, "courseDrafts", courseId);
  const docSnap = await getDoc(courseRef);
  if (docSnap.exists()) {
    return (docSnap.data() as any).title || "";
  } else {
    return "";
  }
};
