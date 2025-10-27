import { useState, useEffect } from "react";
import { Search, Star, ChevronDown, DollarSign, Trash2, Edit3, MoreHorizontal, BookOpen, Tag, Send, Globe } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../context/AuthContext";
import {
  deleteCourse,
  getInstructorCourses,
  InstructorCourse
} from "../../../utils/firebaseInstructorCourses";
import { payoutService, EarningsSummary } from "../../../utils/payoutService";
import { COURSE_STATUS_LABELS, COURSE_STATUS as FIREBASE_COURSE_STATUS } from "../../../utils/firebaseCourses";
import { CourseWorkflowService } from "../../../utils/courseWorkflowService";
import { courseApiService, CourseResponse, CoursePublishRequest } from "../../../utils/courseApiService";
import { getStatusById, getStatusColor, COURSE_STATUS } from "../../../constants/courseStatus";

// Extended interface for UI display with additional properties
export interface CourseDisplayData extends InstructorCourse {
  earnings: number;
  enrollments: number;
  ratings: number;
  ratingScore: number;
}

// Interface for API course display
export interface ApiCourseDisplayData extends CourseResponse {
  earnings: number;
  enrollments: number;
  ratings: number;
  ratingScore: number;
  progress: number;
  lastModified: Date;
  visibility: string;
  pricing: string;
  thumbnail?: string | null;
  description?: string | null;
  status: number; // Ensure status is a number
}

type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a' | 'published-first' | 'unpublished-first';

// Helper function to strip HTML tags from description
const stripHtmlTags = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export default function CourseList() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseDisplayData[]>([]);
  const [apiCourses, setApiCourses] = useState<ApiCourseDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<CourseDisplayData[]>([]);
  const [filteredApiCourses, setFilteredApiCourses] = useState<ApiCourseDisplayData[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary | null>(null);
  const [hasPendingPayouts, setHasPendingPayouts] = useState(false);
  // const [openDropdownCourseId, setOpenDropdownCourseId] = useState(false);
  const [openDropdownCourseId, setOpenDropdownCourseId] = useState<string | number | null>(null);

  // Fetch instructor courses on component mount
  useEffect(() => {
    if (user?.UserName) {
      fetchInstructorCourses();
      fetchApiCourses();
    }
  }, [user?.UserName]);

  // Filter and sort courses when search term or sort option changes
  useEffect(() => {
    let filtered = courses;

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    const sortedCourses = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'oldest':
          return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
        case 'a-z':
          return a.title.localeCompare(b.title);
        case 'z-a':
          return b.title.localeCompare(a.title);
        case 'published-first':
          return (b.isPublished ? 1 : 0) - (a.isPublished ? 1 : 0);
        case 'unpublished-first':
          return (a.isPublished ? 1 : 0) - (b.isPublished ? 1 : 0);
        default:
          return 0;
      }
    });

    setFilteredCourses(sortedCourses);
  }, [searchTerm, courses, sortBy]);

  // Filter and sort API courses when search term or sort option changes
  useEffect(() => {
    let filtered = apiCourses;

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = apiCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    const sortedCourses = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'oldest':
          return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
        case 'a-z':
          return a.title.localeCompare(b.title);
        case 'z-a':
          return b.title.localeCompare(a.title);
        case 'published-first':
          return (b.status === COURSE_STATUS.PUBLISHED ? 1 : 0) - (a.status === COURSE_STATUS.PUBLISHED ? 1 : 0);
        case 'unpublished-first':
          return (a.status === COURSE_STATUS.PUBLISHED ? 1 : 0) - (b.status === COURSE_STATUS.PUBLISHED ? 1 : 0);
        default:
          return 0;
      }
    });

    setFilteredApiCourses(sortedCourses);
  }, [searchTerm, apiCourses, sortBy]);

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);

      if (!user?.UserName) {
        console.log("No user email found");
        return;
      }

      console.log("Fetching courses for user:", user.UserName);
      const instructorCourses = await getInstructorCourses(user.UserName);
      console.log("instructorCourses:", instructorCourses);

      // Transform Firebase data to match the UI structure
      const transformedCourses: CourseDisplayData[] = instructorCourses.map(course => ({
        ...course,
        // Use real data from Firestore or fallback to calculated values
        earnings: course.members?.length ? course.members.length * 100 : 0, // Calculate based on members
        enrollments: course.members?.length || 0, // Use actual member count
        ratings: course.members?.length ? Math.floor(course.members.length * 0.8) : 0, // Calculate based on members
        ratingScore: 4.5 // Default rating, can be enhanced with real review data
      }));

      console.log("Transformed courses:", transformedCourses);
      setCourses(transformedCourses);

      // Load payout data
      await loadPayoutData();
    } catch (err) {
      console.error("Error fetching courses:", err);
      // Fallba
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchApiCourses = async () => {
    try {
      setApiLoading(true);

      if (!user?.UserName) {
        console.log("No user email found for API courses");
        return;
      }

      console.log("Fetching API courses for user:", user.UserName);
      const apiCoursesData = await courseApiService.getAllCourses();
      console.log("API courses:", apiCoursesData);

      // Transform API data to match the UI structure
      const transformedApiCourses: ApiCourseDisplayData[] = apiCoursesData.map(course => ({
        ...course,
        // Add mock data for display purposes
        earnings: Math.floor(Math.random() * 10000), // Random earnings
        enrollments: Math.floor(Math.random() * 100), // Random enrollments
        ratings: Math.floor(Math.random() * 50), // Random ratings
        ratingScore: 4.5, // Default rating
        progress: Math.floor(Math.random() * 100), // Random progress
        lastModified: course.updatedAt ? new Date(course.updatedAt) : new Date(),
        visibility: 'Public', // Default visibility
        pricing: course.pricing || 'Free', // Use API pricing or default
        thumbnail: course.thumbnailUrl,
        description: course.description,
        status: course.status || 1 // Ensure status is a number, default to 1 (Draft)
      }));

      console.log("Transformed API courses:", transformedApiCourses);
      setApiCourses(transformedApiCourses);
    } catch (err) {
      console.error("Error fetching API courses:", err);
    } finally {
      setApiLoading(false);
    }
  };

  // Load payout data for the instructor
  const loadPayoutData = async () => {
    try {
      if (!user?.UserName) return;

      // Get earnings summary
      const summary = await payoutService.getEarningsSummary(user.UserName);
      setEarningsSummary(summary);

      // Check for pending payouts
      const hasPending = await payoutService.hasPendingPayouts(user.UserName);
      setHasPendingPayouts(hasPending);
    } catch (error) {
      console.error('Error loading payout data:', error);
      // Use mock data as fallback
      setEarningsSummary(payoutService.getMockEarningsSummary());
      setHasPendingPayouts(true);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCourseClick = (course: CourseDisplayData) => {
    // Store course ID for editing
    localStorage.setItem('draftId', course.id);
    window.location.hash = '#/instructor/course-title';
  };

  const handleSortChange = (sortOption: SortOption) => {
    setSortBy(sortOption);
    setShowSortDropdown(false);
  };

  const getSortDisplayText = (sortOption: SortOption) => {
    switch (sortOption) {
      case 'newest': return 'Newest';
      case 'oldest': return 'Oldest';
      case 'a-z': return 'A-Z';
      case 'z-a': return 'Z-A';
      case 'published-first': return 'Published first';
      case 'unpublished-first': return 'Unpublished first';
      default: return 'Newest';
    }
  };

  const getStatusColorForFirebase = (status: number | string) => {
    const statusValue = typeof status === 'number' ? status : status.toLowerCase();
    switch (statusValue) {
      case FIREBASE_COURSE_STATUS.PUBLISHED:
      case 'published':
      case 'live':
        return 'bg-[#3ab500]';
      case FIREBASE_COURSE_STATUS.APPROVED:
      case 'approved':
        return 'bg-blue-500';
      case FIREBASE_COURSE_STATUS.DRAFT:
      case 'draft':
        return 'bg-gray-400';
      case FIREBASE_COURSE_STATUS.PENDING_REVIEW:
      case 'pending_review':
      case 'pending':
        return 'bg-yellow-400';
      case FIREBASE_COURSE_STATUS.NEEDS_REVISION:
      case 'needs_revision':
      case 'rejected':
        return 'bg-red-400';
      case FIREBASE_COURSE_STATUS.DRAFT_UPDATE:
      case 'draft_update':
        return 'bg-orange-400';
      case FIREBASE_COURSE_STATUS.ARCHIVED:
      case 'archived':
        return 'bg-gray-600';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusTextForFirebase = (status: number | string) => {
    const statusValue = typeof status === 'number' ? status : status.toLowerCase();
    switch (statusValue) {
      case FIREBASE_COURSE_STATUS.PUBLISHED:
      case 'published':
        return 'Published';
      case FIREBASE_COURSE_STATUS.APPROVED:
      case 'approved':
        return 'Approved';
      case FIREBASE_COURSE_STATUS.DRAFT:
      case 'draft':
        return 'Draft';
      case FIREBASE_COURSE_STATUS.PENDING_REVIEW:
      case 'pending_review':
      case 'pending':
        return 'Pending Review';
      case FIREBASE_COURSE_STATUS.NEEDS_REVISION:
      case 'needs_revision':
        return 'Needs Revision';
      case FIREBASE_COURSE_STATUS.DRAFT_UPDATE:
      case 'draft_update':
        return 'Draft Update';
      case FIREBASE_COURSE_STATUS.ARCHIVED:
      case 'archived':
        return 'Archived';
      default:
        return COURSE_STATUS_LABELS[status] || 'Unknown';
    }
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
        setFilteredCourses(filteredCourses.filter((draft: any) => draft.id !== course.id));
        console.log(`Course "${course.title}" deleted successfully`);
      } catch (err) {
        console.error("Error deleting course:", err);
        alert("Failed to delete course. Please try again.");
      }
    }
  };

  const handleSubmitForReview = async (course: any) => {
    if (window.confirm(`Are you sure you want to submit "${course.title}" for review?`)) {
      try {
        await CourseWorkflowService.submitCourseForReview(
          course.id,
          user?.UserName || '',
          user?.displayName || user?.UserName || '',
          user?.email || ''
        );

        // Refresh the course list
        await fetchInstructorCourses();
        alert("Course submitted for review successfully!");
      } catch (err) {
        console.error("Error submitting course for review:", err);
        alert("Failed to submit course for review. Please try again.");
      }
    }
  };

  const handleMakeLive = async (course: any) => {
    if (window.confirm(`Are you sure you want to make "${course.title}" live?`)) {
      try {
        await CourseWorkflowService.makeCourseLive(
          course.id,
          user?.UserName || '',
          user?.displayName || user?.UserName || '',
          user?.email || ''
        );

        // Refresh the course list
        await fetchInstructorCourses();
        alert("Course is now live and available to learners!");
      } catch (err) {
        console.error("Error making course live:", err);
        alert("Failed to make course live. Please try again.");
      }
    }
  };

  const canSubmitForReview = (course: any) => {
    return course.progress == 100 && course.status === FIREBASE_COURSE_STATUS.DRAFT || course.status === FIREBASE_COURSE_STATUS.DRAFT_UPDATE;
  };

  const canMakeLive = (course: any) => {
    return course.status === FIREBASE_COURSE_STATUS.APPROVED;
  };

  // API Course Actions
  const handlePublishApiCourse = async (course: ApiCourseDisplayData) => {
    if (window.confirm(`Are you sure you want to publish "${course.title}"?`)) {
      try {
        const response = await courseApiService.publishCourse(course.id);
        console.log('Course published successfully:', response);

        // Refresh the API courses list
        await fetchApiCourses();
        alert("Course published successfully!");
      } catch (err) {
        console.error("Error publishing course:", err);
        alert("Failed to publish course. Please try again.");
      }
    }
  };

  const handleEditApiCourse = (course: ApiCourseDisplayData) => {
    console.log('Edit API course:', course);
    // Store the course ID in localStorage for the edit flow
    localStorage.setItem('courseId', course.id.toString());
    window.location.hash = '#/instructor/course-title';
  };

  const handleDeleteApiCourse = async (course: ApiCourseDisplayData) => {
    if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      try {
        // Note: You'll need to add a delete endpoint to courseApiService if it doesn't exist
        // await courseApiService.deleteCourse(course.id);

        // For now, just remove from local state
        setApiCourses(apiCourses.filter(c => c.id !== course.id));
        setFilteredApiCourses(filteredApiCourses.filter(c => c.id !== course.id));
        console.log(`API Course "${course.title}" deleted successfully`);
      } catch (err) {
        console.error("Error deleting API course:", err);
        alert("Failed to delete course. Please try again.");
      }
    }
  };

  const canPublishApiCourse = (course: ApiCourseDisplayData) => {
    return course.status === COURSE_STATUS.APPROVED;
  };

  const canSubmitApiCourseForReview = (course: ApiCourseDisplayData) => {
    return course.status === COURSE_STATUS.DRAFT && course.progress === 100;
  };

  return (
    <div className=" p-4 md:p-8">
      <div className="flex flex-col min-h-screen">
        <div className="ins-heading">
          Courses
        </div>
        {/* Payout Notification Banner - Only show if there are pending payouts or available earnings */}
        {(hasPendingPayouts || (earningsSummary?.availableForPayout || 0) >= 1000) && (
          <div className="rounded-[15px] border border-gray p-6 bg-gradient-to-r from-blue-50 to-green-50">
            <div className="text-[#393939] text-lg font-semibold font-['Raleway'] flex flex-col md:flex-row items-start md:items-center gap-2">
              <Button className="rounded-none bg-green-600 text-white hover:bg-green-700">
                {/* <DollarSign className="h-4 w-4 mr-2" /> */}
                New
              </Button>
              <span className="flex items-center">
                {hasPendingPayouts
                  ? `New Payout Available! - ₹${earningsSummary?.pendingPayouts?.toLocaleString() || 0}`
                  : `Earnings Available! - ₹${earningsSummary?.availableForPayout?.toLocaleString() || 0}`
                }
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadPayoutData}
                  className="ml-2 text-gray-600 hover:text-gray-800"
                >
                  ↻
                </Button>
              </span>

              <Button
                className="rounded-none ml-0  md:ml-auto bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.location.hash = '#/instructor/payment'}
              >
                View Payout Details
              </Button>
            </div>
            {earningsSummary && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="mr-4">Total Earnings: ₹{earningsSummary.totalEarnings.toLocaleString()}</span>
                <span className="mr-4">This Month: ₹{earningsSummary.currentMonthEarnings.toLocaleString()}</span>
                <span>Watch Time: {earningsSummary.totalWatchTime}h</span>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between mt-4 gap-4">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-1/2">
            <div className="relative flex-grow">
              <Search className="absolute top-1/2 left-4 transform -translate-y-1/2" size={22} />
              <input
                type="text"
                placeholder="Search Course"
                value={searchTerm}
                onChange={handleSearch}
                className="bg-neutral-100 border-none rounded-[27px] w-full pl-12 py-2"
              />
            </div>

            {/* Sort Dropdown Button */}
            <div className="relative">
              <Button
                variant="outline"
                className="rounded-none border-primary text-primary w-full md:w-auto flex items-center gap-2"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                {getSortDisplayText(sortBy)}
                <ChevronDown size={16} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </Button>

              {/* Dropdown Menu */}
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  {[
                    { value: 'newest', label: 'Newest' },
                    { value: 'oldest', label: 'Oldest' },
                    { value: 'a-z', label: 'A-Z' },
                    { value: 'z-a', label: 'Z-A' },
                    { value: 'published-first', label: 'Published first' },
                    { value: 'unpublished-first', label: 'Unpublished first' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value as SortOption)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${sortBy === option.value ? 'text-primary bg-primary/5' : 'text-gray-700'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Button
            className="rounded-none w-full md:w-auto"
            onClick={() => {
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
              window.location.href = "/#/instructor/course-test-selection";
            }}
          >
            Add New Course
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2 mt-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-[15px] shadow-md p-2 flex flex-col md:flex-row items-left md:items-center justify-between animate-pulse">
                <div className="flex gap-2 items-center">
                  <div className="w-20 h-[82.29px] bg-gray-200 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-28"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 mt-4">
            <div className="text-gray-500 text-lg font-medium">
              {searchTerm ? 'No courses found matching your search.' : 'No courses available yet.'}
            </div>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm("")}
                className="mt-4 rounded-none"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            {filteredCourses.map((course) => {
              const activeCoupons = course.coupons?.filter(coupon =>
                coupon.courseId === course.id
              ) || [];
              const bestCoupon = activeCoupons[0];

              return (
                <div key={course.id} className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  {/* Desktop Table Layout */}
                  <div className="hidden lg:grid lg:grid-cols-[100px_minmax(350px,1fr)_140px_140px_220px] lg:gap-6 lg:items-center p-4">

                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0 relative">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      {activeCoupons.length > 0 && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] px-1 py-0.5 rounded-full">
                          {activeCoupons.length}
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">{course.title}</h3>
                        <span className={`px-2 py-0.5 text-[11px] font-medium text-white rounded ${getStatusColorForFirebase(course.status)}`}>
                          {getStatusTextForFirebase(course.status)}
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-medium text-blue-600 bg-blue-50 rounded">
                          {course.visibility}
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-medium text-blue-600 bg-blue-50 rounded">
                          {course.pricing}
                        </span>
                      </div>

                      {course.description && (
                        <div className="text-sm text-gray-600 truncate mb-1" dangerouslySetInnerHTML={{ __html: course.description }}></div>
                      )}

                      {bestCoupon && (
                        <div className="text-xs text-green-600 mb-1">
                          <code className="px-1 py-0.5 rounded bg-green-50 text-green-700 font-mono text-[11px]">
                            {bestCoupon.code}
                          </code>
                          <span className="ml-1 text-green-700 font-medium">
                            {bestCoupon.type === 'percentage' ? `${bestCoupon.value}%` : `₹${bestCoupon.value}`} OFF
                          </span>
                        </div>
                      )}

                      {course.rejectionInfo && course.status === COURSE_STATUS.NEEDS_REVISION && (
                        <div className="text-xs text-red-600 mb-1">
                          <code className="px-1 py-0.5 rounded bg-red-50 text-red-700 text-[11px]">
                            {course.rejectionInfo.rejectionReason}
                          </code>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 max-w-[200px] bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{course.progress}%</span>
                      </div>

                      <p className="text-xs text-gray-500">
                        Last updated by {course.lastModified.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Enrollments */}
                    <div>
                      <div className="text-lg font-medium text-[#1e1e1e] font-['Poppins']">
                        {course.enrollments || 0}
                      </div>
                      <div className="text-xs text-gray-600 font-['Nunito']">Enrollments</div>
                    </div>

                    {/* Ratings */}
                    <div>
                      <div className="flex items-center gap-0.5 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${i < Math.floor(course.ratingScore || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-600 font-['Poppins']">
                        {course.ratings || 0} ratings
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="flex-1 px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded hover:bg-purple-50 transition-colors"
                      >
                        Edit
                      </button>

                      {canSubmitForReview(course) && (
                        <button
                          onClick={() => handleSubmitForReview(course)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-orange-500 rounded hover:bg-orange-600 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}

                      {canMakeLive(course) && (
                        <button title="Make Course Live"
                          onClick={() => handleMakeLive(course)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                        </button>
                      )}

                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdownCourseId(openDropdownCourseId === course.id ? null : course.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {openDropdownCourseId === course.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              onClick={() => {
                                handleEditCourse(course);
                                setOpenDropdownCourseId(null);
                              }}
                              className="flex items-center w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit3 className="w-3.5 h-3.5 mr-2" />
                              Edit Course
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteCourse(course);
                                setOpenDropdownCourseId(null);
                              }}
                              className="flex items-center w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Delete
                            </button>
                            {activeCoupons.length > 0 && (
                              <>
                                <hr className="my-1" />
                                <button
                                  onClick={() => setOpenDropdownCourseId(null)}
                                  className="flex items-center w-full px-3 py-1.5 text-sm text-green-600 hover:bg-green-50"
                                >
                                  <Tag className="w-3.5 h-3.5 mr-2" />
                                  Coupons
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="lg:hidden p-4">
                    <div className="flex gap-3 mb-3">
                      <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0 relative">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        {activeCoupons.length > 0 && (
                          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] px-1 py-0.5 rounded-full">
                            {activeCoupons.length}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">{course.title}</h3>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className={`px-2 py-0.5 text-[11px] font-medium text-white rounded ${getStatusColorForFirebase(course.status)}`}>
                            {getStatusTextForFirebase(course.status)}
                          </span>
                          <span className="px-2 py-0.5 text-[11px] font-medium text-blue-600 bg-blue-50 rounded">
                            {course.visibility}
                          </span>
                          <span className="px-2 py-0.5 text-[11px] font-medium text-blue-600 bg-blue-50 rounded">
                            {course.pricing}
                          </span>
                        </div>
                      </div>
                    </div>

                    {course.description && (
                      <div className="text-sm text-gray-600 mb-2" dangerouslySetInnerHTML={{ __html: course.description }}></div>
                    )}

                    {bestCoupon && (
                      <div className="text-xs text-green-600 mb-2">
                        <code className="px-1 py-0.5 rounded bg-green-50 text-green-700 font-mono">
                          {bestCoupon.code}
                        </code>
                        <span className="ml-1 text-green-700 font-medium">
                          {bestCoupon.type === 'percentage' ? `${bestCoupon.value}%` : `₹${bestCoupon.value}`} OFF
                        </span>
                      </div>
                    )}

                    {course.rejectionInfo && course.status === COURSE_STATUS.NEEDS_REVISION && (
                      <div className="text-xs text-red-600 mb-2">
                        <code className="px-1 py-0.5 rounded bg-red-50 text-red-700">
                          {course.rejectionInfo.rejectionReason}
                        </code>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{course.progress}%</span>
                    </div>

                    <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
                      <span>{course.lastModified.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{course.enrollments} enrollments</span>
                        <div className="flex items-center gap-0.5">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          <span>{course.ratings}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="flex-1 px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded hover:bg-purple-50"
                      >
                        Edit
                      </button>
                      {canSubmitForReview(course) && (
                        <button
                          onClick={() => handleSubmitForReview(course)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-orange-500 rounded"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {canMakeLive(course) && (
                        <button
                          onClick={() => handleMakeLive(course)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-green-500 rounded"
                        >
                          <Globe className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setOpenDropdownCourseId(openDropdownCourseId === course.id ? null : course.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Coupon Details */}
                  {activeCoupons.length > 1 && (
                    <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">
                          All Coupons ({activeCoupons.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {activeCoupons.map((coupon) => (
                          <div
                            key={coupon.id}
                            className={`bg-white border rounded px-2 py-1 text-xs flex items-center gap-2 ${coupon.isActive ? 'border-green-200' : 'border-red-200'
                              }`}
                          >
                            <code className={`font-mono ${coupon.isActive ? 'text-gray-800' : 'text-red-700'}`}>
                              {coupon.code}
                            </code>
                            <span className={`font-medium ${coupon.isActive ? 'text-green-600' : 'text-red-600'}`}>
                              {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                            </span>
                            <span className="text-gray-500 text-[11px]">
                              {coupon.usedCount}/{coupon.maxUses}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* API Courses Section */}
        <div className="mt-8">
          <div className="ins-heading mb-4">
            API Courses
          </div>

          {apiLoading ? (
            <div className="flex flex-col gap-2 mt-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-[15px] shadow-md p-2 flex flex-col md:flex-row items-left md:items-center justify-between animate-pulse">
                  <div className="flex gap-2 items-center">
                    <div className="w-20 h-[82.29px] bg-gray-200 rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-28"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredApiCourses.length === 0 ? (
            <div className="text-center py-12 mt-4">
              <div className="text-gray-500 text-lg font-medium">
                {searchTerm ? 'No API courses found matching your search.' : 'No API courses available yet.'}
              </div>
              {searchTerm && (
                <Button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 rounded-none"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-400 overflow-hidden">
              {/* Table Header */}
              <div className="hidden lg:grid lg:grid-cols-[80px_1fr_120px_120px_100px_120px] bg-gray-50 border-b border-gray-400">
                <div className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thumbnail
                </div>
                <div className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Course Details
                </div>
                <div className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                  Enrollments
                </div>
                <div className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                  Rating
                </div>
                <div className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                  Progress
                </div>
                <div className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                  Actions
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-400">
                {filteredApiCourses.map((course) => (
                  <div key={course.id} className="hover:bg-gray-50 transition-colors">
                    {/* Desktop Layout */}
                    <div className="hidden lg:grid lg:grid-cols-[80px_1fr_120px_120px_100px_120px]">
                    
                    {/* Thumbnail */}
                    <div className="p-4 flex items-center justify-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {course.thumbnail ? (
                          <img 
                            src={course.thumbnail} 
                            alt={course.title} 
                            className="w-full h-full object-cover rounded-lg" 
                          />
                        ) : (
                          <BookOpen className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="p-4 min-w-0">
                      <div className="flex flex-col gap-2">
                        {/* Title with consistent height */}
                        <div className="h-6 flex items-center">
                          <h3 className="text-sm font-semibold text-gray-900 truncate pr-2" title={course.title}>
                            {course.title}
                          </h3>
                        </div>
                        
                        {/* Description with consistent height */}
                        <div className="h-4 flex items-center">
                          {course.description ? (
                            <div className="text-xs text-gray-600 truncate" title={stripHtmlTags(course.description)}>
                              {stripHtmlTags(course.description)}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No description</span>
                          )}
                        </div>

                        {/* Status Tags */}
                        <div className="flex flex-wrap gap-1">
                          <span className={`px-2 py-0.5 text-[10px] font-medium text-white rounded ${getStatusColor(course.status)}`}>
                            {getStatusById(course.status)}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 rounded">
                            {course.visibility}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-100 rounded">
                            {course.pricing}
                          </span>
                        </div>

                        {/* Last Updated */}
                        <div className="h-3 flex items-center">
                          <span className="text-[10px] text-gray-500">
                            Updated {course.lastModified.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Enrollments */}
                    <div className="p-4 flex flex-col items-center justify-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {course.enrollments || 0}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                        Enrollments
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="p-4 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-0.5 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={`${i < Math.floor(course.ratingScore || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {course.ratings || 0} ratings
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="p-4 flex flex-col items-center justify-center">
                      <div className="w-full max-w-[60px] bg-gray-200 rounded-full h-1.5 mb-1">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium">
                        {course.progress}%
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEditApiCourse(course)}
                        className="p-2 text-gray-600 hover:text-primary hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit Course"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {canSubmitApiCourseForReview(course) && (
                        <button
                          onClick={() => handleSubmitForReview(course)}
                          className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Submit for Review"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}

                      {canPublishApiCourse(course) && (
                        <button
                          onClick={() => handlePublishApiCourse(course)}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          title="Publish Course"
                        >
                          <Globe className="w-4 h-4" />
                        </button>
                      )}

                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdownCourseId(openDropdownCourseId === course.id ? null : course.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="More Options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {openDropdownCourseId === course.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-400 py-1 z-20">
                            <button
                              onClick={() => {
                                handleEditApiCourse(course);
                                setOpenDropdownCourseId(null);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit3 className="w-3.5 h-3.5 mr-2" />
                              Edit Course
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteApiCourse(course);
                                setOpenDropdownCourseId(null);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Delete Course
                            </button>
                            {canPublishApiCourse(course) && (
                              <button
                                onClick={() => {
                                  handlePublishApiCourse(course);
                                  setOpenDropdownCourseId(null);
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-green-600 hover:bg-green-50"
                              >
                                <Globe className="w-3.5 h-3.5 mr-2" />
                                Publish Course
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="lg:hidden p-4">
                    <div className="flex gap-3 mb-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate" title={course.title}>
                          {course.title}
                        </h3>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className={`px-2 py-0.5 text-[10px] font-medium text-white rounded ${getStatusColor(course.status)}`}>
                            {getStatusById(course.status)}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 rounded">
                            {course.visibility}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-medium text-gray-600 bg-gray-100 rounded">
                            {course.pricing}
                          </span>
                        </div>
                      </div>
                    </div>

                    {course.description && (
                      <div className="text-xs text-gray-600 mb-2 line-clamp-2" title={stripHtmlTags(course.description)}>
                        {stripHtmlTags(course.description)}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{course.progress}%</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{course.enrollments || 0}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Enrollments</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-0.5 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              className={`${i < Math.floor(course.ratingScore || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <div className="text-[10px] text-gray-500">{course.ratings || 0} ratings</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          {course.lastModified.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Updated</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditApiCourse(course)}
                        className="p-2 text-gray-600 hover:text-primary hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit Course"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {canSubmitApiCourseForReview(course) && (
                        <button
                          onClick={() => handleSubmitForReview(course)}
                          className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Submit for Review"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}

                      {canPublishApiCourse(course) && (
                        <button
                          onClick={() => handlePublishApiCourse(course)}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          title="Publish Course"
                        >
                          <Globe className="w-4 h-4" />
                        </button>
                      )}

                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdownCourseId(openDropdownCourseId === course.id ? null : course.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="More Options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {openDropdownCourseId === course.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-400 py-1 z-20">
                            <button
                              onClick={() => {
                                handleEditApiCourse(course);
                                setOpenDropdownCourseId(null);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit3 className="w-3.5 h-3.5 mr-2" />
                              Edit Course
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteApiCourse(course);
                                setOpenDropdownCourseId(null);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Delete Course
                            </button>
                            {canPublishApiCourse(course) && (
                              <button
                                onClick={() => {
                                  handlePublishApiCourse(course);
                                  setOpenDropdownCourseId(null);
                                }}
                                className="flex items-center w-full px-3 py-2 text-sm text-green-600 hover:bg-green-50"
                              >
                                <Globe className="w-3.5 h-3.5 mr-2" />
                                Publish Course
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
