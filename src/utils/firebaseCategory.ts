import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  showOnHomePage: boolean;
}

export const getCategories = async (): Promise<Category[]> => {
  const querySnapshot = await getDocs(collection(db, "categories"));
  return querySnapshot.docs.map(doc => {
    const data = doc.data() as any;
    return { id: doc.id, ...data } as Category;
  });
};

export const getSubCategories = async () => {
  const querySnapshot = await getDocs(collection(db, "sub-categories"));
  return querySnapshot.docs.map(doc => {
    const data = doc.data() as any;
    return { id: doc.id, ...data };
  });
};

export const getHomePageCategories = async (): Promise<Category[]> => {
  try {
    console.log('🔍 getHomePageCategories: Starting to fetch categories...');

    const categoriesRef = collection(db, "categories");

    // First try to get categories that should show on home page
    const homePageQuery = query(
      categoriesRef,
      where("isActive", "==", true),
      where("showOnHomePage", "==", true)
    );

    const homePageSnapshot = await getDocs(homePageQuery);
    console.log('🔍 getHomePageCategories: Home page categories found:', homePageSnapshot.docs.length);

    const homePageCategories = homePageSnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data
      } as Category;
    });

    // If no categories found with showOnHomePage filter, get all active categories as fallback
    if (homePageCategories.length === 0) {
      console.log('⚠️ getHomePageCategories: No home page categories found, getting all active categories as fallback');
      const fallbackQuery = query(
        categoriesRef,
        where("isActive", "==", true)
      );

      const fallbackSnapshot = await getDocs(fallbackQuery);
      const fallbackCategories = fallbackSnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...data
        } as Category;
      });

      console.log('🔍 getHomePageCategories: Fallback categories found:', fallbackCategories.length);
      return fallbackCategories;
    }

    return homePageCategories;
  } catch (error) {
    console.error("❌ getHomePageCategories: Error fetching home page categories:", error);
    return [];
  }
};
