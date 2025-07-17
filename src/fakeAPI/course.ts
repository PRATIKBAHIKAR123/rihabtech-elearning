import { db } from "../lib/firebase"; // your initialized firebase config
import { doc, setDoc, getDoc } from "firebase/firestore";

export const saveCourseDraft = async (draftId: string, data: Partial<CourseDraft>) => {
  const ref = doc(db, "courseDrafts", draftId);
  await setDoc(ref, data, { merge: true }); // merge allows partial updates
};

export const getCourseDraft = async (draftId: string): Promise<CourseDraft | null> => {
  const ref = doc(db, "courseDrafts", draftId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? (snapshot.data() as CourseDraft) : null;
};


type CourseDraft = {
  id: string; // Firestore doc ID or a UUID
  title?: string;
  category?: string;
  subcategory?: string;
  sections?: {
    title: string;
    content: string;
  }[];
  progress: number; // percentage or steps completed
};