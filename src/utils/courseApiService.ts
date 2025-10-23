import { apiService } from './apiService';


export interface CourseCreateRequest {
  title: string;
}

export interface Category {
  id: number;
  title: string;
  isActive?: boolean;
  showOnHomePage: boolean;
}

export interface SubCategory {
  id: number;
  name?: string;
  title?: string;
  subCategoryName?: string;
  categoryId: number;
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
  learn?: string[];
  requirements?: string[];
  target?: string[];
  curriculum?: {
    sections: Array<{
      name: string;
      published: boolean;
      items: Array<{
        type: 'lecture' | 'quiz' | 'assignment';
        lectureName?: string;
        description?: string;
        contentType?: 'video' | 'article';
        videoSource?: 'upload' | 'link';
        contentUrl?: string;
        contentText?: string;
        articleSource?: 'upload' | 'link' | 'write';
        contentFiles?: Array<{
          name: string;
          url: string;
          cloudinaryUrl?: string;
          cloudinaryPublicId?: string;
          duration?: number;
          status: 'uploaded' | 'uploading' | 'failed';
          uploadedAt: string;
        }>;
        resources?: Array<{
          name: string;
          url?: string;
          cloudinaryUrl?: string;
          cloudinaryPublicId?: string;
          type: string;
        }>;
        published: boolean;
        isPromotional?: boolean;
        duration?: number;
        // Quiz specific fields
        quizTitle?: string;
        quizDescription?: string;
        quizQuestions?: Array<{
          question: string;
          options: string[];
          correctOption: number[];
        }>;
        // Assignment specific fields
        title?: string;
        totalMarks?: number;
        assignmentQuestions?: Array<{
          question: string;
          marks: number;
          answer: string;
          maxWordLimit?: number;
        }>;
      }>;
    }>;
  };
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
  learn?: string[];
  requirements?: string[];
  target?: string[];
  createdAt?: string;
  updatedAt?: string;
  status?: number | null;
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
  curriculum?: {
    sections: Array<{
      name: string;
      published: boolean;
      items: Array<{
        type: 'lecture' | 'quiz' | 'assignment';
        lectureName?: string;
        description?: string;
        contentType?: 'video' | 'article';
        videoSource?: 'upload' | 'link';
        contentUrl?: string;
        contentText?: string;
        articleSource?: 'upload' | 'link' | 'write';
        contentFiles?: Array<{
          name: string;
          url: string;
          cloudinaryUrl?: string;
          cloudinaryPublicId?: string;
          duration?: number;
          status: 'uploaded' | 'uploading' | 'failed';
          uploadedAt: string;
        }>;
        resources?: Array<{
          name: string;
          url?: string;
          cloudinaryUrl?: string;
          cloudinaryPublicId?: string;
          type: string;
        }>;
        published: boolean;
        isPromotional?: boolean;
        duration?: number;
        // Quiz specific fields
        quizTitle?: string;
        quizDescription?: string;
        quizQuestions?: Array<{
          question: string;
          options: string[];
          correctOption: number[];
        }>;
        // Assignment specific fields
        title?: string;
        totalMarks?: number;
        assignmentQuestions?: Array<{
          question: string;
          marks: number;
          answer: string;
          maxWordLimit?: number;
        }>;
      }>;
    }>;
  };
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

export interface CoursePublishRequest {
  id: number;
}

export interface CoursePublishResponse {
  message: string;
  publishedAt?: string;
  isPublished?: boolean;
}

export interface CourseSubmitForReviewResponse {
  message: string;
  submittedAt?: string;
  isSubmitted?: boolean;
}

export interface CourseGetAllResponse {
  id: number;
  title: string;
  description: string | null;
  pricing: string | null;
  enrolments: number;
  weeks: number;
  category?: number | null;
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

  // Get all courses (public endpoint)
  async getAllPublicCourses(): Promise<CourseGetAllResponse[]> {
    return apiService.post<CourseGetAllResponse[]>('/course/get-all', {});
  }

  // Publish a course
  async publishCourse(courseId: number): Promise<CoursePublishResponse> {
    return apiService.post<CoursePublishResponse>('/instructor/course/publish', courseId);
  }

  // Submit course for review
  async submitCourseForReview(courseId: number): Promise<CourseSubmitForReviewResponse> {
    return apiService.post<CourseSubmitForReviewResponse>('/instructor/course/submit-for-review', courseId);
  }
}

export const courseApiService = new CourseApiService();
export default courseApiService;
