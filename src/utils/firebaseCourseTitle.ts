import { db } from "../lib/firebase";
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";

export const createNewCourseDraft = async (): Promise<string> => {
  try {
    const courseData = {
      title: "",
      createdAt: new Date(),
      status: "draft",
      progress: 0
    };

    const docRef = await addDoc(collection(db, "courseDrafts"), courseData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating course draft:", error);
    throw error;
  }
};

export const saveCourseTitle = async (courseId: string, title: string) => {
  if (!courseId) {
    throw new Error("Course ID is required");
  }
  const courseRef = doc(db, "courseDrafts", courseId);
  await setDoc(courseRef, { title }, { merge: true });
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
