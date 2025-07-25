
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const getDraftRef = (courseId: string) => doc(db, "courseDrafts", courseId);

export const getFullCourseData = async (courseId: string) => {
  const draftRef = getDraftRef(courseId);
  const docSnap = await getDoc(draftRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};

export const getCourseCurriculum = async (courseId: string) => {
  const draftRef = getDraftRef(courseId);
  const docSnap = await getDoc(draftRef);
  if (docSnap.exists()) {
    return docSnap.data().curriculum || [];
  } else {
    return [];
  }
};

export const getCourseLandingPage = async (courseId: string) => {
  const draftRef = getDraftRef(courseId);
  const docSnap = await getDoc(draftRef);
  if (docSnap.exists()) {
    return docSnap.data().landingPage || {};
  } else {
    return {};
  }
};

export const getCourseIntendedLearners = async (courseId: string) => {
  const draftRef = getDraftRef(courseId);
  const docSnap = await getDoc(draftRef);
  if (docSnap.exists()) {
    return docSnap.data().intendedLearners || [];
  } else {
    return [];
  }
};

export const getCourseStructure = async (courseId: string) => {
  const draftRef = getDraftRef(courseId);
  const docSnap = await getDoc(draftRef);
  if (docSnap.exists()) {
    return docSnap.data().structure || [];
  } else {
    return [];
  }
};
