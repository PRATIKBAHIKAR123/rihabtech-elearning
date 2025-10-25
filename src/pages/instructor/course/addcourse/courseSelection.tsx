
import { useState, useEffect, useCallback } from "react";
import { Button } from "../../../../components/ui/button";
import { BookOpen, Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import {
  getInstructorCourses,
  deleteCourse
} from "../../../../utils/firebaseInstructorCourses";
import { COURSE_STATUS, COURSE_STATUS_LABELS } from "../../../../utils/firebaseCourses";
import { courseApiService, CourseResponse } from "../../../../utils/courseApiService";
import { getStatusById, getStatusColor, COURSE_STATUS as STATUS_CONSTANTS } from "../../../../constants/courseStatus";

// Interface for API course display
interface ApiCourseDisplayData extends CourseResponse {
  progress: number;
  lastModified: Date;
  visibility: string;
  pricing: string;
  thumbnail?: string | null;
  description?: string | null;
}

const CourseSelection = () => {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<any[]>([]);
  const [apiCourses, setApiCourses] = useState<ApiCourseDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(true);

  const fetchInstructorCourses = useCallback(async () => {
    try {
      setLoading(true);

      if (!user?.UserName) {
        console.log("No user email found");
        return;
      }

      console.log("Fetching courses for user:", user.UserName);
      const instructorCourses = await getInstructorCourses(user.UserName);

      // Transform Firebase data to match the original mock data structure
      const transformedCourses = instructorCourses.filter(course => course.status === COURSE_STATUS.DRAFT || course.status === COURSE_STATUS.PENDING_REVIEW).map(course => ({
        id: course.id,
        title: course.title || "Untitled Course",
        status: course.status || COURSE_STATUS.DRAFT,
        visibility: course.visibility || 'Private',
        progress: course.progress || 0,
        thumbnail: course.thumbnail || null,
        lastModified: course.lastModified,
        description: truncateDescription(course.description || "", 80) // Truncate description to 80 characters
      }));

      console.log("Transformed courses:", transformedCourses);
      setDrafts(transformedCourses);
    } catch (err) {
      console.error("Error fetching courses:", err);
      // Fallback to mock data if Firebase fails
      setDrafts([
        {
          id: 1,
          title: 'Photoshop',
          status: 'DRAFT',
          visibility: 'Public',
          progress: 85,
          thumbnail: null,
          lastModified: '2 days ago',
          description: 'Complete guide to Adobe Photoshop for beginners'
        },
        {
          id: 2,
          title: 'Photoshop',
          status: 'DRAFT',
          visibility: 'Public',
          progress: 25,
          thumbnail: null,
          lastModified: '1 week ago',
          description: 'Advanced Photoshop techniques and workflows'
        },
        {
          id: 3,
          title: 'React Development Masterclass',
          status: 'DRAFT',
          visibility: 'Private',
          progress: 60,
          thumbnail: null,
          lastModified: '3 days ago',
          description: 'Learn React from basics to advanced concepts'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [user?.UserName]);

  const fetchApiCourses = useCallback(async () => {
    try {
      setApiLoading(true);

      if (!user?.UserName) {
        console.log("No user email found for API courses");
        return;
      }

      console.log("Fetching API courses for user:", user.UserName);
      const apiCoursesData = await courseApiService.getAllCourses();
      console.log("API courses:", apiCoursesData);

      // Transform API data to match the UI structure and filter for Draft courses (status: 1)
      const transformedApiCourses: ApiCourseDisplayData[] = apiCoursesData
        .filter(course => course.status === STATUS_CONSTANTS.DRAFT) // Filter for Draft courses only
        .map(course => ({
          ...course,
          // Add mock data for display purposes
          progress: Math.floor(Math.random() * 100), // Random progress
          lastModified: course.updatedAt ? new Date(course.updatedAt) : new Date(),
          visibility: 'Public', // Default visibility
          pricing: course.pricing || 'Free', // Use API pricing or default
          thumbnail: course.thumbnailUrl,
          description: course.description
        }));

      console.log("Transformed API courses:", transformedApiCourses);
      setApiCourses(transformedApiCourses);
    } catch (err) {
      console.error("Error fetching API courses:", err);
    } finally {
      setApiLoading(false);
    }
  }, [user?.UserName]);

  // Fetch instructor courses on component mount
  useEffect(() => {
    if (user?.UserName) {
      fetchInstructorCourses();
      fetchApiCourses();
    }
  }, [user?.UserName, fetchInstructorCourses, fetchApiCourses]);

  // Helper function to truncate description
  const truncateDescription = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleAddNewCourse = () => {
    console.log('Add new course clicked');
    // Get courseId before clearing it
    const courseId = localStorage.getItem('courseId');
    // Clear any existing course data from localStorage
    localStorage.removeItem('courseId');
    localStorage.removeItem('draftId');
    localStorage.removeItem('addcourseType');
    // Clear any curriculum data from localStorage
    if (courseId) {
      localStorage.removeItem(`curriculum_${courseId}`);
    }
    // Clear global course data state
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('clearCourseData'));
    }
    // Navigate to course creation
    window.location.hash = '#/instructor/course-title';
  };

  const handleEditCourse = (course: any) => {
    console.log('Edit course:', course);
    // Store the course ID in localStorage for the edit flow
    localStorage.setItem('draftId', course.id);
    window.location.hash = '#/instructor/course-title';
  };

  const handleDeleteCourse = async (course: any) => {
    if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      try {
        await deleteCourse(course.id);
        // Remove from local state
        setDrafts(drafts.filter((draft: any) => draft.id !== course.id));
        console.log(`Course "${course.title}" deleted successfully`);
      } catch (err) {
        console.error("Error deleting course:", err);
        alert("Failed to delete course. Please try again.");
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="ins-heading mb-6">Add New Course</h1>

      <div className="grid grid-cols-1 gap-6">
        <CourseCard
          title="Course"
          icon={'Images/icons/Display 1.png'}
          buttonText="Create Course"
        />
        {/* <CourseCard 
          title="Practice Test"
          icon={'Images/icons/Document Align Left 8.png'}
          buttonText="Create Test"
        /> */}
      </div>

      <div className="space-y-4 mt-2">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Drafts</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your courses...</p>
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No course drafts yet</h3>
            <p className="text-gray-600 mb-4">Start creating your first course to see it here.</p>
            <button
              onClick={handleAddNewCourse}
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Create Your First Course
            </button>
          </div>
        ) : (
          <>
            {drafts.map((course) => (
              <DraftCourseCard
                key={course.id}
                course={course}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
              />
            ))}
          </>
        )}
      </div>

      {/* API Courses Section */}
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">API Courses</h2>

        {apiLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading API courses...</p>
          </div>
        ) : apiCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No API courses yet</h3>
            <p className="text-gray-600 mb-4">API courses will appear here when available.</p>
          </div>
        ) : (
          <>
            {apiCourses.map((course) => (
              <ApiDraftCourseCard
                key={course.id}
                course={course}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const DraftCourseCard = ({ course, onEdit, onDelete }: any) => {
  const [showDropdown, setShowDropdown] = useState(false);


  const getStatusColor = (status: number | string) => {
    const statusValue = typeof status === 'number' ? status : status.toLowerCase();
    switch (statusValue) {
      case COURSE_STATUS.PUBLISHED:
      case 'published':
      case 'live':
        return 'bg-[#3ab500]';
      case COURSE_STATUS.APPROVED:
      case 'approved':
        return 'bg-blue-500';
      case COURSE_STATUS.DRAFT:
      case 'draft':
        return 'bg-gray-400';
      case COURSE_STATUS.PENDING_REVIEW:
      case 'pending_review':
      case 'pending':
        return 'bg-yellow-400';
      case COURSE_STATUS.NEEDS_REVISION:
      case 'needs_revision':
      case 'rejected':
        return 'bg-red-400';
      case COURSE_STATUS.DRAFT_UPDATE:
      case 'draft_update':
        return 'bg-orange-400';
      case COURSE_STATUS.ARCHIVED:
      case 'archived':
        return 'bg-gray-600';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: number | string) => {
    const statusValue = typeof status === 'number' ? status : status.toLowerCase();
    switch (statusValue) {
      case COURSE_STATUS.PUBLISHED:
      case 'published':
        return 'Published';
      case COURSE_STATUS.APPROVED:
      case 'approved':
        return 'Approved';
      case COURSE_STATUS.DRAFT:
      case 'draft':
        return 'Draft';
      case COURSE_STATUS.PENDING_REVIEW:
      case 'pending_review':
      case 'pending':
        return 'Pending Review';
      case COURSE_STATUS.NEEDS_REVISION:
      case 'needs_revision':
        return 'Needs Revision';
      case COURSE_STATUS.DRAFT_UPDATE:
      case 'draft_update':
        return 'Draft Update';
      case COURSE_STATUS.ARCHIVED:
      case 'archived':
        return 'Archived';
      default:
        return COURSE_STATUS_LABELS[status] || 'Unknown';
    }
  };

  return (
    <div key={course.id} className="flex flex-col bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      {/* Main Course Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-4">

        {/* Left Section: Thumbnail + Info */}
        <div className="flex items-start sm:items-center space-x-4 flex-1 md:truncate">
          {/* Course Thumbnail */}
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 relative">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <BookOpen className="w-8 h-8 text-gray-400" />
            )}

          </div>

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {course.title}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getStatusColor(course.status)}`}>
                {getStatusText(course.status)}
              </span>
              <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded">
                {course.visibility}
              </span>
              <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded">
                {course.pricing}
              </span>

            </div>

            {course.description && (
              <div className="text-sm text-gray-600 line-clamp-2 sm:truncate mb-2" dangerouslySetInnerHTML={{ __html: course.description }}>
              </div>
            )}


            <div className="text-left sm:text-right min-w-[120px]">
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Finish your course
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {course.progress}%
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Last modified {course.lastModified.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Right Section: Stats + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 gap-4 sm:gap-0 w-full sm:w-auto">
          {/* <div>
                      <div className="text-[#1e1e1e] text-lg font-medium font-['Poppins']">
                        INR {(course.earnings || 0).toFixed(2)}
                      </div>
                      <div className="text-[#1e1e1e] text-sm font-medium font-['Nunito'] flex gap-2 items-center">
                        Earned This Month
                      </div>
                    </div> */}
          <div>
            <div className="text-[#1e1e1e] text-lg font-medium font-['Poppins']">
              {course.enrollments || 0}
            </div>
            <div className="text-[#1e1e1e] text-sm font-medium font-['Nunito'] flex gap-2 items-center">
              Enrollments this month
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center justify-between gap-2 md:gap-4">
            {/* Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <button
                onClick={() => onEdit(course)}
                className="px-3 py-2 text-sm font-medium text-primary border border-primary rounded hover:bg-purple-50 transition-colors w-full sm:w-auto"
              >
                Edit / manage course
              </button>

              {/* More Actions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {showDropdown === course.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={() => {
                        onEdit(course);
                        setShowDropdown(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Course
                    </button>
                    <button
                      onClick={() => {
                        onDelete(course);
                        setShowDropdown(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Course
                    </button>

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

const ApiDraftCourseCard = ({ course, onEdit, onDelete }: any) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getCourseStatusColor = (status: number) => {
    return getStatusColor(status);
  };

  const getCourseStatusText = (status: number) => {
    return getStatusById(status);
  };

  return (
    <div key={course.id} className="flex flex-col bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      {/* Main Course Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-4">

        {/* Left Section: Thumbnail + Info */}
        <div className="flex items-start sm:items-center space-x-4 flex-1 md:truncate">
          {/* Course Thumbnail */}
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 relative">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <BookOpen className="w-8 h-8 text-gray-400" />
            )}
          </div>

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {course.title}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getCourseStatusColor(course.status)}`}>
                {getCourseStatusText(course.status)}
              </span>
              <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded">
                {course.visibility}
              </span>
              <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded">
                {course.pricing}
              </span>
            </div>

            {course.description && (
              <div className="text-sm text-gray-600 line-clamp-2 sm:truncate mb-2" dangerouslySetInnerHTML={{ __html: course.description }}>
              </div>
            )}

            <div className="text-left sm:text-right min-w-[120px]">
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Finish your course
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {course.progress}%
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Last modified {course.lastModified.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Right Section: Stats + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 gap-4 sm:gap-0 w-full sm:w-auto">
          <div>
            <div className="text-[#1e1e1e] text-lg font-medium font-['Poppins']">
              {course.enrollments || 0}
            </div>
            <div className="text-[#1e1e1e] text-sm font-medium font-['Nunito'] flex gap-2 items-center">
              Enrollments this month
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center justify-between gap-2 md:gap-4">
            {/* Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <button
                onClick={() => {
                  localStorage.setItem('courseId', course.id.toString());
                  onEdit(course);
                }}
                className="px-3 py-2 text-sm font-medium text-primary border border-primary rounded hover:bg-purple-50 transition-colors w-full sm:w-auto"
              >
                Edit / manage course
              </button>

              {/* More Actions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={() => {
                        localStorage.setItem('courseId', course.id.toString());
                        onEdit(course);
                        setShowDropdown(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Course
                    </button>
                    <button
                      onClick={() => {
                        onDelete(course);
                        setShowDropdown(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Course
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CourseCardProps {
  title: string;
  icon: string;
  buttonText: string;
}

const CourseCard = ({ title, icon, buttonText }: CourseCardProps) => {

   const handleCoursetestSelection = (type: string) => {
     if (type === 'Practice Test') {
       localStorage.setItem('addcourseType', 'practiceTest')
     } else {
       localStorage.removeItem('addcourseType')
     }
     // Get courseId before clearing it
     const courseId = localStorage.getItem('courseId');
     // Clear any existing course data when starting a new course
     localStorage.removeItem('draftId');
     localStorage.removeItem('courseId');
     // Clear any curriculum data from localStorage
     if (courseId) {
       localStorage.removeItem(`curriculum_${courseId}`);
     }
     // Clear global course data state
     if (typeof window !== 'undefined') {
       window.dispatchEvent(new CustomEvent('clearCourseData'));
     }
     window.location.hash = '#/instructor/course-title';
   }
  return (
    <div className="bg-white p-4 md:p-6 border border-gray-200 flex flex-col items-center text-center justify-center">
      <img src={icon} className="h-6" alt={title} />
      <h2 className="text-[#393939] text-[14px] md:text-[22px] font-semibold font-['Raleway'] leading-snug mt-4 mb-2">{title}</h2>
      {/* <p className="text-[#1e1e1e] text-[10px] md:text-sm font-medium font-['Nunito'] mb-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse laoreet, nulla vitae ultrices iaculis, tortor lorem maximus sem, eu luctus orci dui id sem.
        </p> */}
      <Button className="rounded-none transition-colors" onClick={() => { handleCoursetestSelection(title) }}>
        {buttonText}
      </Button>
    </div>
  );
};

export default CourseSelection