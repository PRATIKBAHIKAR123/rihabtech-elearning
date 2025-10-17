import { useState, useEffect, useCallback } from 'react';
import { courseApiService, CourseResponse } from '../utils/courseApiService';
import { toast } from 'sonner';

interface UseCourseDataReturn {
  courseData: CourseResponse | null;
  isLoading: boolean;
  isNewCourse: boolean;
  updateCourseData: (updates: Partial<CourseResponse>) => void;
  refreshCourseData: () => Promise<void>;
}

// Global state to store course data across the app
let globalCourseData: CourseResponse | null = null;
let globalIsNewCourse = true;
let globalIsLoading = false;
let globalInitialized = false;

export const useCourseData = (): UseCourseDataReturn => {
  const [courseData, setCourseData] = useState<CourseResponse | null>(globalCourseData);
  const [isLoading, setIsLoading] = useState(globalIsLoading);
  const [isNewCourse, setIsNewCourse] = useState(globalIsNewCourse);

  const updateCourseData = useCallback((updates: Partial<CourseResponse>) => {
    setCourseData(prev => {
      const newCourseData = prev ? { ...prev, ...updates } : null;
      globalCourseData = newCourseData;
      return newCourseData;
    });
  }, []);

  const refreshCourseData = useCallback(async () => {
    const existingCourseId = localStorage.getItem("courseId");
    
    if (!existingCourseId) {
      globalCourseData = null;
      globalIsNewCourse = true;
      setCourseData(null);
      setIsNewCourse(true);
      return;
    }

    try {
      setIsLoading(true);
      globalIsLoading = true;
      
      const apiCourseData = await courseApiService.getCourseById(parseInt(existingCourseId));
      
      globalCourseData = apiCourseData;
      globalIsNewCourse = false;
      setCourseData(apiCourseData);
      setIsNewCourse(false);
      
      console.log("Course data refreshed:", apiCourseData);
    } catch (error) {
      console.error("Failed to refresh course data:", error);
      toast.error("Failed to load course data. Please try again.");
    } finally {
      setIsLoading(false);
      globalIsLoading = false;
    }
  }, []);

  // Initialize course data only once
  useEffect(() => {
    const initializeCourseData = async () => {
      if (globalInitialized) {
        // Use existing global data
        setCourseData(globalCourseData);
        setIsNewCourse(globalIsNewCourse);
        setIsLoading(globalIsLoading);
        return;
      }

      globalInitialized = true;
      await refreshCourseData();
    };

    initializeCourseData();
  }, []); // Remove refreshCourseData from dependencies

  return {
    courseData,
    isLoading,
    isNewCourse,
    updateCourseData,
    refreshCourseData
  };
};

// Helper function to clear course data (useful when starting a new course)
export const clearCourseData = () => {
  globalCourseData = null;
  globalIsNewCourse = true;
  globalIsLoading = false;
  globalInitialized = false;
  localStorage.removeItem("courseId");
};
