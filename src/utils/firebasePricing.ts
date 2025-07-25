import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface PricingData {
  pricing: "free" | "paid";
  access: {
    website: boolean;
    app: boolean;
    private: boolean;
  };
  members: Array<{
    id: string;
    email: string;
    role: string;
  }>;
  draftId: string;
}

export const savePricingData = async (data: PricingData) => {
  // Store pricing data under a course document
  const courseRef = doc(db, "courseDrafts", data.draftId);
  await setDoc(courseRef, {
    pricing: data.pricing,
    access: data.access,
    members: data.access.private ? data.members : [],
  }, { merge: true });
};

export const getPricingData = async (courseId: string) => {
  const courseRef = doc(db, "courseDrafts", courseId);
  const docSnap = await getDoc(courseRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};
