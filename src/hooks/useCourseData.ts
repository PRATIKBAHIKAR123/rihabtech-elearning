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
let lastCourseId: string | null = null;

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
      lastCourseId = null;
      setCourseData(null);
      setIsNewCourse(true);
      return;
    }

    // Check if course ID has changed
    if (lastCourseId !== existingCourseId) {
      console.log("Course ID changed from", lastCourseId, "to", existingCourseId);
      lastCourseId = existingCourseId;
      globalInitialized = false; // Reset initialization flag
    }

    try {
      setIsLoading(true);
      globalIsLoading = true;
      
      const apiCourseData = await courseApiService.getCourseById(parseInt(existingCourseId));
      
      globalCourseData = apiCourseData;
      globalIsNewCourse = false;
      setCourseData(apiCourseData);
      setIsNewCourse(false);
      
      console.log("Course data refreshed for ID", existingCourseId, ":", apiCourseData);
    } catch (error) {
      console.error("Failed to refresh course data:", error);
      toast.error("Failed to load course data. Please try again.");
    } finally {
      setIsLoading(false);
      globalIsLoading = false;
    }
  }, []);

  // Initialize course data and watch for course ID changes
  useEffect(() => {
    const initializeCourseData = async () => {
      const currentCourseId = localStorage.getItem("courseId");
      
      // If course ID has changed or not initialized, refresh data
      if (!globalInitialized || lastCourseId !== currentCourseId) {
        console.log("Initializing course data for ID:", currentCourseId);
        globalInitialized = true;
        await refreshCourseData();
      } else {
        // Use existing global data
        setCourseData(globalCourseData);
        setIsNewCourse(globalIsNewCourse);
        setIsLoading(globalIsLoading);
      }
    };

    initializeCourseData();

    // Listen for localStorage changes (when courseId changes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'courseId' && e.newValue !== lastCourseId) {
        console.log("Course ID changed in localStorage, refreshing data");
        refreshCourseData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab changes)
    const handleCourseIdChange = () => {
      const currentCourseId = localStorage.getItem("courseId");
      if (currentCourseId !== lastCourseId) {
        console.log("Course ID changed via custom event, refreshing data");
        refreshCourseData();
      }
    };

    window.addEventListener('courseIdChanged', handleCourseIdChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('courseIdChanged', handleCourseIdChange);
    };
  }, [refreshCourseData]); // Include refreshCourseData dependency

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
  lastCourseId = null;
  localStorage.removeItem("courseId");
};

// Helper function to trigger course data refresh when course ID changes
export const triggerCourseDataRefresh = () => {
  window.dispatchEvent(new CustomEvent('courseIdChanged'));
};
