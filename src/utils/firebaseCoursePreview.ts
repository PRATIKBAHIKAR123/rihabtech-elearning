import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const getFullCourseData = async (courseId: string) => {
  if (!courseId) {
    return null;
  }
  const draftRef = doc(db, "courseDrafts", courseId);
  const docSnap = await getDoc(draftRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};
