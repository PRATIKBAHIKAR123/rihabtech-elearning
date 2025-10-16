import { useState } from 'react';
import { courseApiService, CourseResponse, UpdateCourseMessageResponse } from '../utils/courseApiService';
import { toast } from 'sonner';

export const useCourseApi = () => {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all courses
  const getAllCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const allCourses = await courseApiService.getAllCourses();
      setCourses(allCourses);
      return allCourses;
    } catch (err) {
      const errorMessage = 'Failed to fetch courses';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get course by ID
  const getCourseById = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const course = await courseApiService.getCourseById(id);
      return course;
    } catch (err) {
      const errorMessage = 'Failed to fetch course';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create new course
  const createCourse = async (title: string) => {
    setLoading(true);
    setError(null);
    try {
      const newCourse = await courseApiService.createCourse({ title });
      setCourses(prev => [newCourse, ...prev]);
      toast.success('Course created successfully!');
      return newCourse;
    } catch (err) {
      const errorMessage = 'Failed to create course';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update course
  const updateCourse = async (courseData: {
    id: number;
    title: string;
    subtitle: string | null;
    description: string | null;
    category: number | null;
    subCategory: number | null;
    level: string | null;
    language: string | null;
    pricing: string | null;
    thumbnailUrl: string | null;
    promoVideoUrl: string | null;
    welcomeMessage: string | null;
    congratulationsMessage: string | null;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const updateResponse: UpdateCourseMessageResponse = await courseApiService.updateCourse(courseData);
      
      // Update the local course data with the new title
      setCourses(prev => prev.map(course => 
        course.id === courseData.id ? { ...course, title: courseData.title } : course
      ));
      
      toast.success(updateResponse.message || 'Course updated successfully!');
      return updateResponse;
    } catch (err) {
      const errorMessage = 'Failed to update course';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    courses,
    loading,
    error,
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
  };
};

export default useCourseApi;
