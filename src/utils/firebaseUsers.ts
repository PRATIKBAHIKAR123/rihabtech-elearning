import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const getAllUsers = async () => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map(doc => {
    const data = doc.data() as any;
    return { id: doc.id, ...data };
  });
};
