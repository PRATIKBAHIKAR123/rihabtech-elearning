import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const saveCourseTitle = async (courseId: string, title: string) => {
  const courseRef = doc(db, "courses", courseId);
  await setDoc(courseRef, { title }, { merge: true });
};

export const getCourseTitle = async (courseId: string) => {
  const courseRef = doc(db, "courses", courseId);
  const docSnap = await getDoc(courseRef);
  if (docSnap.exists()) {
    return docSnap.data().title || "";
  } else {
    return "";
  }
};
