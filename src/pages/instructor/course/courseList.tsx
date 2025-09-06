import { useState, useEffect } from "react";
import { Search, Star, ChevronDown, DollarSign } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../context/AuthContext";
import { 
  getInstructorCourses, 
  InstructorCourse 
} from "../../../utils/firebaseInstructorCourses";
import { payoutService, EarningsSummary } from "../../../utils/payoutService";

// Extended interface for UI display with additional properties
interface CourseDisplayData extends InstructorCourse {
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
            
            // Transform Firebase data to match the UI structure
            const transformedCourses: CourseDisplayData[] = instructorCourses.map(course => ({
                ...course,
                // Add mock data for fields not in Firebase (for now)
                earnings: Math.floor(Math.random() * 5000) + 500, // Random earnings between 500-5500
                enrollments: Math.floor(Math.random() * 100) + 20, // Random enrollments between 20-120
                ratings: Math.floor(Math.random() * 200) + 500, // Random ratings between 500-700
                ratingScore: parseFloat((Math.random() * 2 + 3).toFixed(1)) // Random rating between 3.0-5.0
            }));
            
            console.log("Transformed courses:", transformedCourses);
            setCourses(transformedCourses);

            // Load payout data
            await loadPayoutData();
        } catch (err) {
            console.error("Error fetching courses:", err);
            // Fallback to mock data if Firebase fails
            const mockCourses: CourseDisplayData[] = [
                {
                    id: "1",
                    title: "Design Course",
                    status: "Live",
                    thumbnail: "Images/4860253.png",
                    earnings: 1000,
                    enrollments: 78,
                    ratings: 720,
                    ratingScore: 5.0,
                    // Required InstructorCourse properties
                    visibility: "public",
                    progress: 85,
                    lastModified: new Date(),
                    createdAt: new Date(),
                    instructorId: "mock-user",
                    description: "Complete guide to design principles"
                },
                {
                    id: "2",
                    title: "Web Development Course",
                    status: "Live",
                    thumbnail: "Images/4860253.png",
                    earnings: 1500,
                    enrollments: 92,
                    ratings: 650,
                    ratingScore: 4.8,
                    // Required InstructorCourse properties
                    visibility: "public",
                    progress: 75,
                    lastModified: new Date(Date.now() - 86400000), // 1 day ago
                    createdAt: new Date(Date.now() - 86400000),
                    instructorId: "mock-user",
                    description: "Learn web development from scratch"
                },
                {
                    id: "3",
                    title: "Mobile App Development",
                    status: "Live",
                    thumbnail: "Images/4860253.png",
                    earnings: 800,
                    enrollments: 45,
                    ratings: 420,
                    ratingScore: 4.9,
                    // Required InstructorCourse properties
                    visibility: "public",
                    progress: 60,
                    lastModified: new Date(Date.now() - 172800000), // 2 days ago
                    createdAt: new Date(Date.now() - 172800000),
                    instructorId: "mock-user",
                    description: "Build mobile apps for iOS and Android"
                }
            ];
            setCourses(mockCourses);
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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'live':
            case 'approved':
            case 'published':
                return 'bg-[#3ab500]';
            case 'draft':
                return 'bg-gray-400';
            case 'pending':
                return 'bg-yellow-400';
            case 'rejected':
                return 'bg-red-400';
            default:
                return 'bg-[#3ab500]';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
            case 'published':
                return 'Live';
            case 'draft':
                return 'Draft';
            case 'pending':
                return 'Pending';
            case 'rejected':
                return 'Rejected';
            default:
                return 'Live';
        }
    };

    return (
        <div className="flex flex-col min-h-screen p-4 md:p-8">
            <div className="ins-heading">
                Courses
            </div>
            {/* Payout Notification Banner - Only show if there are pending payouts or available earnings */}
            {(hasPendingPayouts || (earningsSummary?.availableForPayout || 0) >= 1000) && (
                <div className="rounded-[15px] border border-gray p-6 bg-gradient-to-r from-blue-50 to-green-50">
                    <div className="text-[#393939] text-lg font-semibold font-['Raleway'] flex flex-col md:flex-row items-start md:items-center gap-2">
                        <Button className="rounded-none bg-green-600 text-white hover:bg-green-700">
                            <DollarSign className="h-4 w-4 mr-2" />
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
                    {filteredCourses.map((course) => (
                        <div 
                            key={course.id} 
                            className="bg-white rounded-[15px] shadow-md p-2 flex flex-col md:flex-row items-left md:items-center justify-between hover:shadow-lg cursor-pointer" 
                            onClick={() => handleCourseClick(course)}
                        >
                            <div className="flex gap-2 items-center">
                                <img 
                                    src={course.thumbnail || "Images/4860253.png"} 
                                    className="w-20 h-[82.29px] rounded-lg object-cover" 
                                    alt={course.title}
                                />
                                <div>
                                    <div className="text-[#1e1e1e] text-lg font-medium font-['Poppins']">
                                        {course.title || "Untitled Course"}
                                    </div>
                                    <div className="text-[#1e1e1e] text-sm font-medium font-['Nunito'] flex gap-2 items-center">
                                        <span className={`size-[11px] ${getStatusColor(course.status)} rounded-full`}></span>
                                        {getStatusText(course.status)}
                                    </div>
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
