import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const getCategories = async () => {
  const querySnapshot = await getDocs(collection(db, "categories"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getSubCategories = async () => {
  const querySnapshot = await getDocs(collection(db, "sub-categories"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
