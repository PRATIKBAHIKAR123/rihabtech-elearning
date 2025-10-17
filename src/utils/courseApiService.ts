import { apiService } from './apiService';


export interface CourseCreateRequest {
  title: string;
}

export interface Category {
  id: string;
  title: string;
  isActive: boolean;
  showOnHomePage: boolean;
}

export interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface CourseUpdateRequest {
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
}

export interface CourseResponse {
  id: number;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  category?: number | null;
  subCategory?: number | null;
  level?: string | null;
  language?: string | null;
  pricing?: string | null;
  thumbnailUrl?: string | null;
  promoVideoUrl?: string | null;
  welcomeMessage?: string | null;
  congratulationsMessage?: string | null;
  createdAt?: string;
  updatedAt?: string;
  status?: string | null;
  instructorId?: string | null;
  progress?: number;
  isPublished?: boolean;
  publishedAt?: string | null;
  lastPublishedAt?: string | null;
  submittedForReview?: boolean;
  submittedAt?: string | null;
  isLocked?: boolean;
  lockedBy?: string | null;
  lockedAt?: string | null;
  lockReason?: string | null;
  version?: number;
  hasUnpublishedChanges?: boolean;
  isIntendedLearnersFinal?: boolean;
  isCurriculumFinal?: boolean;
  createdDate?: string;
  rejectionInfo?: {
    rejectionReason?: string;
    rejectionNotes?: string;
    reason?: string;
    rejectedAt?: string | number | Date;
    rejectedBy?: {
      name?: string;
      timestamp?: string | number | Date;
      [key: string]: any;
    };
    [key: string]: any;
  } | null;
}

export interface UpdateCourseMessageResponse {
  message: string;
}

class CourseApiService {
  // Create a new course
  async createCourse(courseData: CourseCreateRequest): Promise<number | CourseResponse> {
    return apiService.post<number | CourseResponse>('/instructor/course/create-new', courseData);
  }

  // Update an existing course
  async updateCourse(courseData: CourseUpdateRequest): Promise<UpdateCourseMessageResponse> {
    return apiService.post<UpdateCourseMessageResponse>('/instructor/course/update', courseData);
  }

  // Get course by ID
  async getCourseById(id: number): Promise<CourseResponse> {
    return apiService.get<CourseResponse>(`/instructor/course/get-by-id/${id}`);
  }

  // Get all courses for instructor
  async getAllCourses(): Promise<CourseResponse[]> {
    return apiService.get<CourseResponse[]>('/instructor/course/get-all');
  }

  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    return apiService.get<Category[]>('/instructor/course/categories');
  }

  // Get all subcategories
  async getAllSubCategories(): Promise<SubCategory[]> {
    return apiService.get<SubCategory[]>('/instructor/course/sub-categories');
  }
}

export const courseApiService = new CourseApiService();
export default courseApiService;
