import { useState, useEffect, useCallback } from "react";
import { Search, Star, ChevronDown, Edit3, MoreHorizontal, BookOpen, Send, Globe } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../context/AuthContext";
import { payoutService, EarningsSummary } from "../../../utils/payoutService";
import { courseApiService, CourseResponse } from "../../../utils/courseApiService";
import { getStatusById, getStatusColor, COURSE_STATUS } from "../../../constants/courseStatus";

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

// Flexible interface for backward compatibility (supports both Firebase and API courses)
export interface CourseDisplayData {
  id: string | number;
  title: string;
  description?: string | null;
  earnings?: number;
  enrollments?: number;
  ratings?: number;
  ratingScore?: number;
  progress?: number;
  lastModified?: Date | string;
  visibility?: string;
  pricing?: string;
  thumbnail?: string | null;
  status?: number | string;
  [key: string]: any; // Allow additional properties for backward compatibility
}

type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a' | 'published-first' | 'unpublished-first';

// Helper function to strip HTML tags from description
const stripHtmlTags = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export default function CourseList() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<ApiCourseDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<ApiCourseDisplayData[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary | null>(null);
  const [hasPendingPayouts, setHasPendingPayouts] = useState(false);
  const [openDropdownCourseId, setOpenDropdownCourseId] = useState<string | number | null>(null);

  // Helper function to calculate course progress
  const calculateCourseProgress = (course: CourseResponse): number => {
    if (!course.curriculum || !course.curriculum.sections || course.curriculum.sections.length === 0) {
      return 0;
    }

    let totalItems = 0;
    let completedItems = 0;

    course.curriculum.sections.forEach(section => {
      if (section.items && section.items.length > 0) {
        totalItems += section.items.length;
        section.items.forEach(item => {
          if (item.published) {
            completedItems++;
          }
        });
      }
    });

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  // Load payout data for the instructor
  const loadPayoutData = useCallback(async () => {
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
  }, [user?.UserName]);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);

      if (!user?.UserName) {
        console.log("No user email found");
        return;
      }

      console.log("Fetching API courses for user:", user.UserName);
      const apiCoursesData = await courseApiService.getAllCourses();
      console.log("API courses:", apiCoursesData);

      // Transform API data to match the UI structure
      const transformedCourses: ApiCourseDisplayData[] = apiCoursesData.map(course => ({
        ...course,
        // Add mock data for display purposes
        earnings: course.earnings || 0, // Random earnings
        enrollments: course.enrollments || 0, // Random enrollments
        ratings: course.ratings || 0, // Random ratings
        ratingScore: course.ratingScore || 0, // Default rating
        progress: calculateCourseProgress(course), // Calculate progress from curriculum
        lastModified: course.updatedAt ? new Date(course.updatedAt) : (course.createdAt ? new Date(course.createdAt) : new Date()),
        visibility: 'Public', // Default visibility
        pricing: course.pricing || 'Free', // Use API pricing or default
        thumbnail: course.thumbnailUrl,
        description: course.description || null,
        status: course.status || 1 // Ensure status is a number, default to 1 (Draft)
      }));

      console.log("Transformed API courses:", transformedCourses);
      setCourses(transformedCourses);

      // Load payout data
      await loadPayoutData();
    } catch (err) {
      console.error("Error fetching API courses:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.UserName, loadPayoutData]);

  // Fetch instructor courses on component mount
  useEffect(() => {
    if (user?.UserName) {
      fetchCourses();
    }
  }, [user?.UserName, fetchCourses]);

  // Filter and sort courses when search term or sort option changes
  useEffect(() => {
    let filtered = courses;

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && stripHtmlTags(course.description).toLowerCase().includes(searchTerm.toLowerCase()))
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

    setFilteredCourses(sortedCourses);
  }, [searchTerm, courses, sortBy]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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

  // Course Actions
  const handlePublishCourse = async (course: ApiCourseDisplayData) => {
    if (window.confirm(`Are you sure you want to publish "${course.title}"?`)) {
      try {
        const response = await courseApiService.publishCourse(course.id);
        console.log('Course published successfully:', response);

        // Refresh the courses list
        await fetchCourses();
        alert("Course published successfully!");
      } catch (err) {
        console.error("Error publishing course:", err);
        alert("Failed to publish course. Please try again.");
      }
    }
  };

  const handleEditCourse = (course: ApiCourseDisplayData) => {
    console.log('Edit course:', course);
    // Store the course ID in localStorage for the edit flow
    localStorage.setItem('courseId', course.id.toString());
    localStorage.removeItem('draftId');
    window.location.hash = '#/instructor/course-title';
  };

  // Delete course function - temporarily disabled
  // const handleDeleteCourse = async (course: ApiCourseDisplayData) => {
  //   if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
  //     try {
  //       // TODO: Add delete API endpoint to courseApiService if needed
  //       // For now, just remove from local state
  //       setCourses(courses.filter(c => c.id !== course.id));
  //       setFilteredCourses(filteredCourses.filter(c => c.id !== course.id));
  //       console.log(`Course "${course.title}" removed from list`);
  //       // Note: This only removes from UI. Actual deletion requires API endpoint.
  //     } catch (err) {
  //       console.error("Error deleting course:", err);
  //       alert("Failed to delete course. Please try again.");
  //     }
  //   }
  // };

  const handleSubmitForReview = async (course: ApiCourseDisplayData) => {
    if (window.confirm(`Are you sure you want to submit "${course.title}" for review?`)) {
      try {
        const response = await courseApiService.submitCourseForReview(course.id);
        console.log('Course submitted for review:', response);

        // Refresh the courses list
        await fetchCourses();
        alert("Course submitted for review successfully!");
      } catch (err) {
        console.error("Error submitting course for review:", err);
        alert("Failed to submit course for review. Please try again.");
      }
    }
  };

  const canPublishCourse = (course: ApiCourseDisplayData) => {
    return course.status === COURSE_STATUS.APPROVED;
  };

  const canSubmitForReview = (course: ApiCourseDisplayData) => {
    return course.status === COURSE_STATUS.DRAFT && course.progress === 100;
  };

  return (
    <div className=" p-4 md:p-8">
      <div className="flex flex-col min-h-screen">
        <div className="ins-heading">
          Courses
        </div>
        {/* Payout Notification Banner - Only show if there are pending payouts or available earnings */}
        {/* {(hasPendingPayouts || (earningsSummary?.availableForPayout || 0) >= 1000) && (
          <div className="rounded-[15px] border border-gray p-6 bg-gradient-to-r from-blue-50 to-green-50">
            <div className="text-[#393939] text-lg font-semibold font-['Raleway'] flex flex-col md:flex-row items-start md:items-center gap-2">
              <Button className="rounded-none bg-green-600 text-white hover:bg-green-700">
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
        )} */}
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-400 overflow-hidden mt-6">
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
              {/* <div className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                Progress
              </div> */}
              <div className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                Actions
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-400">
              {filteredCourses.map((course) => (
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
                    {/* <div className="p-4 flex flex-col items-center justify-center">
                      <div className="w-full max-w-[60px] bg-gray-200 rounded-full h-1.5 mb-1">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium">
                        {course.progress}%
                      </div>
                    </div> */}

                    {/* Actions */}
                    <div className="p-4 flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="p-2 text-gray-600 hover:text-primary hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit Course"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {canSubmitForReview(course) && (
                        <button
                          onClick={() => handleSubmitForReview(course)}
                          className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Submit for Review"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}

                      {canPublishCourse(course) && (
                        <button
                          onClick={() => handlePublishCourse(course)}
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
                                handleEditCourse(course);
                                setOpenDropdownCourseId(null);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit3 className="w-3.5 h-3.5 mr-2" />
                              Edit Course
                            </button>
                            {/* Delete Course button hidden temporarily */}
                            {/* <button
                              onClick={() => {
                                handleDeleteCourse(course);
                                setOpenDropdownCourseId(null);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Delete Course
                            </button> */}
                            {canPublishCourse(course) && (
                              <button
                                onClick={() => {
                                  handlePublishCourse(course);
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
                        onClick={() => handleEditCourse(course)}
                        className="p-2 text-gray-600 hover:text-primary hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit Course"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {canSubmitForReview(course) && (
                        <button
                          onClick={() => handleSubmitForReview(course)}
                          className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Submit for Review"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}

                      {canPublishCourse(course) && (
                        <button
                          onClick={() => handlePublishCourse(course)}
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
                                handleEditCourse(course);
                                setOpenDropdownCourseId(null);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit3 className="w-3.5 h-3.5 mr-2" />
                              Edit Course
                            </button>
                            {/* Delete Course button hidden temporarily */}
                            {/* <button
                              onClick={() => {
                                handleDeleteCourse(course);
                                setOpenDropdownCourseId(null);
                              }}
                              className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Delete Course
                            </button> */}
                            {canPublishCourse(course) && (
                              <button
                                onClick={() => {
                                  handlePublishCourse(course);
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
  );
}
