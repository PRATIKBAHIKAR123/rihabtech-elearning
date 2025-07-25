import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface CourseMessagesData {
  courseId: string;
  welcomeMessage: string;
  congratulationsMessage: string;
}

export const saveCourseMessages = async (data: CourseMessagesData) => {
  const courseRef = doc(db, "courses", data.courseId);
  await setDoc(courseRef, {
    welcomeMessage: data.welcomeMessage,
    congratulationsMessage: data.congratulationsMessage,
  }, { merge: true });
};

export const getCourseMessages = async (courseId: string) => {
  const courseRef = doc(db, "courses", courseId);
  const docSnap = await getDoc(courseRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      welcomeMessage: data.welcomeMessage || "",
      congratulationsMessage: data.congratulationsMessage || "",
    };
  } else {
    return {
      welcomeMessage: "",
      congratulationsMessage: "",
    };
  }
};
