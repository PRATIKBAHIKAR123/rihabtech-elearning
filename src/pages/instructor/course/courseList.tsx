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
import { COURSE_STATUS_LABELS, COURSE_STATUS } from "../../../utils/firebaseCourses";
import { CourseWorkflowService } from "../../../utils/courseWorkflowService";

// Extended interface for UI display with additional properties
export interface CourseDisplayData extends InstructorCourse {
  earnings: number;
  enrollments: number;
  ratings: number;
  ratingScore: number;
}

type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a' | 'published-first' | 'unpublished-first';

export default function CourseList() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<CourseDisplayData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredCourses, setFilteredCourses] = useState<CourseDisplayData[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [earningsSummary, setEarningsSummary] = useState<EarningsSummary | null>(null);
    const [hasPendingPayouts, setHasPendingPayouts] = useState(false);
    // const [openDropdownCourseId, setOpenDropdownCourseId] = useState(false);
    const [openDropdownCourseId, setOpenDropdownCourseId] = useState<string | null>(null);

    // Fetch instructor courses on component mount
    useEffect(() => {
        if (user?.UserName) {
            fetchInstructorCourses();
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
        return course.progress==100 && course.status === COURSE_STATUS.DRAFT || course.status === COURSE_STATUS.DRAFT_UPDATE;
      };

      const canMakeLive = (course: any) => {
        return course.status === COURSE_STATUS.APPROVED;
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
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                            sortBy === option.value ? 'text-primary bg-primary/5' : 'text-gray-700'
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
                    onClick={() => (window.location.href = "/#/instructor/course-test-selection")}
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
                <div className="flex flex-col gap-2 mt-4">
      {filteredCourses.map((course) => {
        // Get all coupons for this specific course (both active and inactive)
        const activeCoupons = course.coupons?.filter(coupon => 
          coupon.courseId === course.id
        ) || [];
        const bestCoupon = activeCoupons[0]; // Assuming coupons are sorted by priority
        
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
                  
                  {/* Coupon Badge Overlay */}
                  {activeCoupons.length > 0 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Tag className="w-3 h-3" />
                      {activeCoupons.length}
                    </div>
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
                    
                    {/* Best Coupon Badge */}
                    {bestCoupon && (
                      <span className={`px-2 py-1 text-xs font-medium rounded flex items-center gap-1 ${
                        bestCoupon.isActive 
                          ? 'text-green-700 bg-green-100' 
                          : 'text-red-700 bg-red-100'
                      }`}>
                        {bestCoupon.type === 'percentage' ? `${bestCoupon.value}% OFF` : `₹${bestCoupon.value} OFF`}
                      </span>
                    )}
                  </div>
                  
                  {course.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 sm:truncate mb-2">
                      {course.description}
                    </p>
                  )}
                  
                  {/* Coupon Quick Info */}
                  {bestCoupon && (
                    <div className={`text-xs mb-2 ${bestCoupon.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      Best offer: <code className={`px-1 py-0.5 rounded ${
                        bestCoupon.isActive 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>{bestCoupon.code}</code>
                      {activeCoupons.length > 1 && (
                        <span className="ml-2 text-gray-500">+{activeCoupons.length - 1} more</span>
                      )}
                    </div>
                  )}

                  {(course.rejectionInfo && course.status == COURSE_STATUS.NEEDS_REVISION) && (
                    <div className={`text-xs mb-2  text-red-600`}>
                      Reject Reason: <code className={`px-1 py-0.5 rounded 
                       
                           bg-red-50 text-red-700
                      `}>{course.rejectionInfo?.rejectionReason}</code>
                      
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
                      onClick={() => handleEditCourse(course)}
                      className="px-3 py-2 text-sm font-medium text-primary border border-primary rounded hover:bg-purple-50 transition-colors w-full sm:w-auto"
                    >
                      Edit / manage course
                    </button>

                    {/* Submit for Review Button */}
                    {canSubmitForReview(course) && (
                      <button
                        onClick={() => handleSubmitForReview(course)}
                        className="px-3 py-2 text-sm font-medium text-white bg-orange-500 rounded hover:bg-orange-600 transition-colors w-full sm:w-auto flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Submit for Review
                      </button>
                    )}

                    {/* Make Live Button */}
                    {canMakeLive(course) && (
                      <button
                        onClick={() => handleMakeLive(course)}
                        className="px-3 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 transition-colors w-full sm:w-auto flex items-center gap-2"
                      >
                        <Globe className="w-4 h-4" />
                        Make Live
                      </button>
                    )}

                    {/* More Actions Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdownCourseId(openDropdownCourseId === course.id ? null : course.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                      {openDropdownCourseId === course.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={() => {
                              handleEditCourse(course);
                              setOpenDropdownCourseId(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Course
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteCourse(course);
                              setOpenDropdownCourseId(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Course
                          </button>
                          
                          {/* Coupon Management Options */}
                          {activeCoupons.length > 0 && (
                            <>
                              <hr className="my-1" />
                              <button
                                onClick={() => {
                                  // Navigate to coupon management
                                  // handleManageCoupons(course.id);
                                  setOpenDropdownCourseId(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                              >
                                <Tag className="w-4 h-4 mr-2" />
                                Manage Coupons
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={18} 
                          className={`${i < Math.floor(course.ratingScore || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-[#181818] text-[12px] md:text-sm font-medium font-['Poppins'] leading-[14px] ml-1">
                      ({course.ratings || 0} Ratings)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Expandable Coupon Details Section */}
            {activeCoupons.length > 1 && (
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">
                    All Coupons ({activeCoupons.length})
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Active</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Inactive</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeCoupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className={`bg-white border rounded px-3 py-2 text-xs flex items-center gap-2 ${
                        coupon.isActive 
                          ? 'border-green-200' 
                          : 'border-red-200'
                      }`}
                    >
                      <code className={`font-mono ${
                        coupon.isActive ? 'text-gray-800' : 'text-red-700'
                      }`}>{coupon.code}</code>
                      <span className={`font-medium ${
                        coupon.isActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`} OFF
                      </span>
                      <span className="text-gray-500">
                        {coupon.usedCount}/{coupon.maxUses} used
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
        </div>
        </div>
    );
}


  const DraftCourseCard = ({ course, onEdit, onDelete }:any) => {
  const [openDropdownCourseId, setOpenDropdownCourseId] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow gap-4">
  
  {/* Left Section: Thumbnail + Info */}
  <div className="flex items-start sm:items-center space-x-4 flex-1">
    {/* Course Thumbnail */}
    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
        <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
          {course.status}
        </span>
        <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded">
          {course.visibility}
        </span>
      </div>
      {course.description && (
        <p className="text-sm text-gray-600 line-clamp-2 sm:truncate mb-2">
          {course.description}
        </p>
      )}
      <p className="text-xs text-gray-500">
        Last modified {course.lastModified}
      </p>
    </div>
  </div>

  {/* Right Section: Progress + Actions */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 gap-4 sm:gap-0 w-full sm:w-auto">
    {/* Progress Section */}
    <div className="text-left sm:text-right min-w-[120px]">
      <div className="text-sm font-medium text-gray-900 mb-1">
        Finish your course
      </div>
      <div className="flex items-center space-x-2">
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
    <div>
                                <div className="text-[#1e1e1e] text-lg font-medium font-['Poppins']">
                                    INR {(course.earnings || 0).toFixed(2)}
                                </div>
                                <div className="text-[#1e1e1e] text-sm font-medium font-['Nunito'] flex gap-2 items-center">
                                    Earned This Month
                                </div>
                            </div>
                            <div>
                                <div className="text-[#1e1e1e] text-lg font-medium font-['Poppins']">
                                    {course.enrollments || 0}
                                </div>
                                <div className="text-[#1e1e1e] text-sm font-medium font-['Nunito'] flex gap-2 items-center">
                                    Enrollments this month
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={18} 
                                            className={`${i < Math.floor(course.ratingScore || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                        />
                                    ))}
                                </div>
                                <span className="text-[#181818] text-[12px] md:text-sm font-medium font-['Poppins'] leading-[14px] ml-1">
                                    ({course.ratings || 0} Ratings)
                                </span>
                            </div>

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
          onClick={() => setOpenDropdownCourseId(!openDropdownCourseId)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {openDropdownCourseId && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
            <button
              onClick={() => {
                onEdit(course);
                setOpenDropdownCourseId(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Course
            </button>
            <button
              onClick={() => {
                onDelete(course);
                setOpenDropdownCourseId(false);
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
    );
};
