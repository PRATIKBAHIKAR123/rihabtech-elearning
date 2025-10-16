import { BookOpen, ChevronDown, ChevronRight, Filter, User2, X } from "lucide-react";
import { Course, getAllCourses, calculateCourseDuration, COURSE_STATUS } from "../../../utils/firebaseCourses";
import { Button } from "../../../components/ui/button";
import Divider from "../../../components/ui/divider";
import { useState, useEffect } from "react";
import { Checkbox } from "../../../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio";
import { useParams } from "react-router-dom";
import { courseApiService, Category } from "../../../utils/courseApiService";

export default function CourseList() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(8); // Show 8 courses per page
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([]);
  
  // Filter states
  const [selectedRating, setSelectedRating] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [categoryName, setcategoryName] = useState<string | null>(null);
    const { categoryId } = useParams<{ categoryId?: string }>();
  
  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedRating("");
    setSelectedPrice([]);
    setSelectedDuration([]);
    setSelectedTopics([]);
  };

  // Check if any filters are active
  const hasActiveFilters = selectedRating || selectedPrice.length > 0 || selectedDuration.length > 0 || selectedTopics.length > 0;

  // Fetch courses from Firebase
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const firebaseCourses = await getAllCourses();
        // Filter only published and approved courses
        const publishedCourses = firebaseCourses.filter(course => 
          categoryId ? course.category === categoryId : false
        );
        if(categoryId){
        setCourses(publishedCourses);
        setFilteredCourses(publishedCourses);
        }
        else{
          setCourses(firebaseCourses);
        setFilteredCourses(firebaseCourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
        setFilteredCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

     useEffect(() => {
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const fetchedCategories = await courseApiService.getAllCategories();
      console.log('Raw fetched categories:', fetchedCategories);

      // ✅ find category by ID
      const category = fetchedCategories.find((c: any) => c.id === categoryId);

      console.log('Processed category:', category);
      if (category) {
        setcategoryName(category.title);
      }

    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchCategories();
}, [categoryId]);

  // Apply filters to courses
  const applyFilters = () => {
    let filtered = [...courses];

    // Price filter
    if (selectedPrice.length > 0) {
      filtered = filtered.filter(course => {
        const isFree = course.pricing === "Free" || course.pricing === "0";
        if (selectedPrice.includes('free') && isFree) return true;
        if (selectedPrice.includes('paid') && !isFree) return true;
        return false;
      });
    }

    // Duration filter
    if (selectedDuration.length > 0) {
      filtered = filtered.filter(course => {
        const duration = calculateCourseDuration(course);
        if (selectedDuration.includes('duration-0-1') && duration >= 0 && duration <= 1) return true;
        if (selectedDuration.includes('duration-1-3') && duration > 1 && duration <= 3) return true;
        if (selectedDuration.includes('duration-3-6') && duration > 3 && duration <= 6) return true;
        if (selectedDuration.includes('duration-6-17') && duration > 6 && duration <= 17) return true;
        if (selectedDuration.includes('duration-17-plus') && duration > 17) return true;
        return false;
      });
    }

    // Topic filter (using course title and category)
    if (selectedTopics.length > 0) {
      filtered = filtered.filter(course => {
        return selectedTopics.some(topic => 
          course.title.toLowerCase().includes(topic.toLowerCase()) ||
          course.category?.toLowerCase().includes(topic.toLowerCase()) ||
          course.subcategory?.toLowerCase().includes(topic.toLowerCase())
        );
      });
    }

    setFilteredCourses(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination logic
  const updateDisplayedCourses = () => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    setDisplayedCourses(filteredCourses.slice(startIndex, endIndex));
  };

  // Calculate pagination info
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startResult = (currentPage - 1) * coursesPerPage + 1;
  const endResult = Math.min(currentPage * coursesPerPage, filteredCourses.length);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [selectedRating, selectedPrice, selectedDuration, selectedTopics, courses]);

  // Update displayed courses when filteredCourses or currentPage changes
  useEffect(() => {
    updateDisplayedCourses();
  }, [filteredCourses, currentPage, coursesPerPage]);

  // Initialize filtered courses on component mount
  useEffect(() => {
    if (courses.length > 0) {
      setFilteredCourses(courses);
    }
  }, [courses]);

  // Calculate total students across all courses
  const totalStudents = courses.reduce((total, course) => {
    const studentCount = course.members ? course.members.filter(m => m.role === 'student').length : 0;
    return total + studentCount;
  }, 0);

  // Count free courses
  const freeCoursesCount = courses.filter(course => 
    course.pricing === "Free" || course.pricing === "0"
  ).length;

  return (
    <section className="min-h-screen bg-white font-sans relative">
      {/* Breadcrumb Navigation */}
      {/* Main content with desktop filter */}
      <div className="flex flex-row w-full justify-center">
        {/* Filter Sidebar - Desktop */}
        <div className={`hidden lg:block lg:w-1/4 xl:w-1/5 pr-8 ${isFilterOpen ? '' : 'lg:hidden'}`}>
          <FilterContent 
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            selectedPrice={selectedPrice}
            setSelectedPrice={setSelectedPrice}
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
            selectedTopics={selectedTopics}
            setSelectedTopics={setSelectedTopics}
          />
        </div>
        <div>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center text-sm">
              <a href="#" className="text-[#000927] text-base font-normal font-['Barlow'] leading-relaxed hover:text-primary">Home</a>
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              <a href="#" className="text-[#000927] text-base font-normal font-['Barlow'] leading-relaxed hover:text-primary">Courses</a>
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              <span className="text-gray-500 text-base font-normal font-['Barlow'] leading-relaxed">{categoryName??'All Courses'}</span>
            </div>
          </div>

          {/* Design Category Header */}
          <div className="container mx-auto px-4 py-2">
            <h1 className="page-title mb-6">{categoryName??'All Courses'}</h1>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">Loading courses...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-8 mb-6">
                  <div className="flex items-center text-[#666666] text-sm font-normal font-['Barlow'] leading-snug">
                    <BookOpen className="mr-2" color="#666666" size={16} />
                    <span>{freeCoursesCount} Free Courses</span>
                  </div>
                  <div className="flex items-center text-[#666666] text-sm font-normal font-['Barlow'] leading-snug">
                    <User2 className="mr-2" color="#666666" size={16} />
                    <span>{totalStudents} Students</span>
                  </div>
                </div>

                <p className="text-[#666666] text-base font-normal font-['Barlow'] leading-relaxed mb-8 max-w-6xl">
                  Step into a world of endless learning opportunities with our online course marketplace. Browse a wide range of expertly crafted courses that help you build new skills, grow professionally, and follow your passions. Whether you're aiming to level up your career or dive into a personal hobby, find the perfect course that fits your goals and sparks your curiosity.
                </p>

                {/* Filter and Results */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                  <Button
                    className="mb-4 md:mb-0 px-8 py-2 rounded-none flex items-center justify-center"
                    onClick={toggleFilter}
                  >
                    <Filter size={20} className="mr-2" />
                    Filter
                  </Button>

                  <div className="flex items-center space-x-3">
                    <span className="text-[#666666] text-base font-normal font-['Barlow'] leading-relaxed">
                      Showing {filteredCourses.length > 0 ? startResult : 0} - {endResult} of {filteredCourses.length} results
                    </span>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <div className="text-[#666666] text-base font-normal font-['Barlow'] leading-[19px]">Newly published</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row">
              {/* Filter Sidebar - Mobile */}
              <div className={`fixed inset-y-0 right-0 transform lg:hidden bg-white w-4/5 max-w-sm z-50 overflow-y-auto shadow-lg transition-transform duration-300 ease-in-out ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-xl font-semibold">Filters</h2>
                      {hasActiveFilters && (
                        <Button 
                          variant="ghost" 
                          onClick={clearAllFilters}
                          className="text-sm text-primary hover:text-primary-dark p-1"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                    <Button variant="ghost" onClick={toggleFilter} className="p-1">
                      <X size={24} />
                    </Button>
                  </div>

                  <FilterContent 
                    selectedRating={selectedRating}
                    setSelectedRating={setSelectedRating}
                    selectedPrice={selectedPrice}
                    setSelectedPrice={setSelectedPrice}
                    selectedDuration={selectedDuration}
                    setSelectedDuration={setSelectedDuration}
                    selectedTopics={selectedTopics}
                    setSelectedTopics={setSelectedTopics}
                  />
                </div>
              </div>

              {/* Overlay for mobile */}
              {isFilterOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                  onClick={toggleFilter}
                ></div>
              )}



              {/* Course Grid */}
              <div className={`w-full`}>
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <span className="ml-3 text-gray-600 text-lg">Loading courses...</span>
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-gray-500 text-lg mb-4">No courses match your current filters.</p>
                    <p className="text-gray-400">Please try adjusting your filter selections.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-2 mb-6">
                      {displayedCourses.map((course, index) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="w-full flex justify-center items-center space-x-2 mb-6">
                        <Button
                          variant="outline"
                          className="border-gray-300 text-gray-600 rounded px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        
                        {/* Page Numbers */}
                        <div className="flex space-x-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              className={`w-10 h-10 rounded text-sm font-medium ${
                                currentPage === page 
                                  ? "bg-primary text-white border-primary" 
                                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
                              }`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        
                        <Button
                          variant="outline"
                          className="border-gray-300 text-gray-600 rounded px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}

// Accordion Component
type FilterAccordionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function FilterAccordion({ title, children, defaultOpen = true }: FilterAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-4">
      <button 
        className="flex justify-between items-center w-full text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <ChevronDown 
          className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          size={20} 
        />
      </button>
      
      <div className={`mt-4 transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        {children}
      </div>
    </div>
  );
}

// Filter Content Component with Accordions
function FilterContent({ 
  selectedRating, 
  setSelectedRating, 
  selectedPrice, 
  setSelectedPrice, 
  selectedDuration, 
  setSelectedDuration, 
  selectedTopics, 
  setSelectedTopics 
}: {
  selectedRating: string;
  setSelectedRating: (value: string) => void;
  selectedPrice: string[];
  setSelectedPrice: (value: string[]) => void;
  selectedDuration: string[];
  setSelectedDuration: (value: string[]) => void;
  selectedTopics: string[];
  setSelectedTopics: (value: string[]) => void;
}) {
  // State for expanded sections
  const [showMoreDuration, setShowMoreDuration] = useState(false);
  const [showMoreTopics, setShowMoreTopics] = useState(false);
  
  // Additional items that will show when "Show more" is clicked
  const additionalDurations = [
    { id: "duration-17-plus", label: "17+ Hours" },
    { id: "duration-all", label: "All Durations" }
  ];
  
  const additionalTopics = [
    { id: "topic-angular", label: "Angular" },
    { id: "topic-vue", label: "Vue.js" },
    { id: "topic-javascript", label: "JavaScript" },
    { id: "topic-typescript", label: "TypeScript" }
  ];

  // Handle price filter changes
  const handlePriceChange = (priceType: string, checked: boolean) => {
    if (checked) {
      setSelectedPrice([...selectedPrice, priceType]);
    } else {
      setSelectedPrice(selectedPrice.filter(p => p !== priceType));
    }
  };

  // Handle duration filter changes
  const handleDurationChange = (durationId: string, checked: boolean) => {
    if (checked) {
      setSelectedDuration([...selectedDuration, durationId]);
    } else {
      setSelectedDuration(selectedDuration.filter(d => d !== durationId));
    }
  };

  // Handle topic filter changes
  const handleTopicChange = (topicId: string, checked: boolean) => {
    if (checked) {
      setSelectedTopics([...selectedTopics, topicId]);
    } else {
      setSelectedTopics(selectedTopics.filter(t => t !== topicId));
    }
  };

  return (
    <div className="space-y-2">
      

      <FilterAccordion title="Price">
        <div className="space-y-3 font-bold">
          <div className="flex items-center">
            <Checkbox 
              id="free" 
              className="mr-3" 
              checked={selectedPrice.includes('free')}
              onCheckedChange={(checked) => handlePriceChange('free', checked as boolean)}
            />
            <label htmlFor="free">Free</label>
          </div>
          <div className="flex items-center">
            <Checkbox 
              id="paid" 
              className="mr-3" 
              checked={selectedPrice.includes('paid')}
              onCheckedChange={(checked) => handlePriceChange('paid', checked as boolean)}
            />
            <label htmlFor="paid">Paid</label>
          </div>
        </div>
      </FilterAccordion>

      {/* Topic Filter */}
      <FilterAccordion title="Topic">
        <div className="space-y-3 font-bold">
          <div className="flex items-center">
            <Checkbox 
              id="topic-react" 
              className="mr-3" 
              checked={selectedTopics.includes('topic-react')}
              onCheckedChange={(checked) => handleTopicChange('topic-react', checked as boolean)}
            />
            <label htmlFor="topic-react">React JS</label>
          </div>
          
          {/* Additional topics that appear when "Show more" is clicked */}
          {showMoreTopics && (
            <>
              {additionalTopics.map(topic => (
                <div key={topic.id} className="flex items-center">
                  <Checkbox 
                    id={topic.id} 
                    className="mr-3" 
                    checked={selectedTopics.includes(topic.id)}
                    onCheckedChange={(checked) => handleTopicChange(topic.id, checked as boolean)}
                  />
                  <label htmlFor={topic.id}>{topic.label}</label>
                </div>
              ))}
            </>
          )}
        </div>
        {additionalTopics.length > 0 && (
          <button 
            className="text-purple-600 mt-3 font-medium focus:outline-none"
            onClick={() => setShowMoreTopics(!showMoreTopics)}
          >
            {showMoreTopics ? "Show less" : "Show more"}
          </button>
        )}
      </FilterAccordion>

      {/* Video Duration Filter */}
      <FilterAccordion title="Video Duration">
        <div className="space-y-3 font-bold">
          <div className="flex items-center">
            <Checkbox 
              id="duration-0-1" 
              className="mr-3" 
              checked={selectedDuration.includes('duration-0-1')}
              onCheckedChange={(checked) => handleDurationChange('duration-0-1', checked as boolean)}
            />
            <label htmlFor="duration-0-1">0-1 Hour</label>
          </div>
          <div className="flex items-center">
            <Checkbox 
              id="duration-1-3" 
              className="mr-3" 
              checked={selectedDuration.includes('duration-1-3')}
              onCheckedChange={(checked) => handleDurationChange('duration-1-3', checked as boolean)}
            />
            <label htmlFor="duration-1-3">1-3 Hours</label>
          </div>
          <div className="flex items-center">
            <Checkbox 
              id="duration-3-6" 
              className="mr-3" 
              checked={selectedDuration.includes('duration-3-6')}
              onCheckedChange={(checked) => handleDurationChange('duration-3-6', checked as boolean)}
            />
            <label htmlFor="duration-3-6">3-6 Hours</label>
          </div>
          <div className="flex items-center">
            <Checkbox 
              id="duration-6-17" 
              className="mr-3" 
              checked={selectedDuration.includes('duration-6-17')}
              onCheckedChange={(checked) => handleDurationChange('duration-6-17', checked as boolean)}
            />
            <label htmlFor="duration-6-17">6-17 Hours</label>
          </div>
          
          {/* Additional items that appear when "Show more" is clicked */}
          {showMoreDuration && (
            <>
              {additionalDurations.map(duration => (
                <div key={duration.id} className="flex items-center">
                  <Checkbox 
                    id={duration.id} 
                    className="mr-3" 
                    checked={selectedDuration.includes(duration.id)}
                    onCheckedChange={(checked) => handleDurationChange(duration.id, checked as boolean)}
                  />
                  <label htmlFor={duration.id}>{duration.label}</label>
                </div>
              ))}
            </>
          )}
        </div>
        <button 
          className="text-purple-600 mt-3 font-medium focus:outline-none"
          onClick={() => setShowMoreDuration(!showMoreDuration)}
        >
          {showMoreDuration ? "Show less" : "Show more"}
        </button>
      </FilterAccordion>
      
      

      {/* Ratings Filter */}
      <FilterAccordion title="Ratings">
        <div className="space-y-3">
          <RadioGroup value={selectedRating} onValueChange={setSelectedRating}>
          <div className="flex items-center">
            <RadioGroupItem id="rating-4.5" value={"4.5"} className="mr-3" />
            <label htmlFor="rating-4.5" className="flex items-center font-bold">
              <div className="flex text-yellow-400">
                ★★★★<span className="text-yellow-400">½</span>
              </div>
              <span className="ml-2">4.5 & up (320)</span>
            </label>
          </div>
          <div className="flex items-center">
            <RadioGroupItem id="rating-4.0" value={"4.0"} className="mr-3" />
            <label htmlFor="rating-4.0" className="flex items-center font-bold">
              <div className="flex text-yellow-400">
                ★★★★<span className="text-gray-300">★</span>
              </div>
              <span className="ml-2">4.0 & up (669)</span>
            </label>
          </div>
          <div className="flex items-center">
            <RadioGroupItem id="rating-3.5" value={"3.5"} className="mr-3" />
            <label htmlFor="rating-3.5" className="flex items-center font-bold">
              <div className="flex text-yellow-400">
                ★★★<span className="text-yellow-400">½</span><span className="text-gray-300">★</span>
              </div>
              <span className="ml-2">3.5 & up (764)</span>
            </label>
          </div>
          <div className="flex items-center">
            <RadioGroupItem id="rating-3.0" value={"3.0"} className="mr-3" />
            <label htmlFor="rating-3.0" className="flex items-center font-bold">
              <div className="flex text-yellow-400">
                ★★★<span className="text-gray-300">★★</span>
              </div>
              <span className="ml-2">3.0 & up (781)</span>
            </label>
          </div>
          </RadioGroup>
        </div>
      </FilterAccordion>
    </div>
  );
}


export function CourseCard({ course, progress = false }: { 
  course: Course | {
    id: string | number;
    title: string;
    description: string;
    students?: number;
    duration?: number;
    progress?: number;
    price?: number;
    originalPrice?: number;
    image?: string;
    thumbnailUrl?: string;
    pricing?: string;
    members?: Array<{ role: string }>;
  }; 
  progress?: boolean 
}) {
  // Calculate student count - handle both interfaces
  const studentCount = course.members 
    ? course.members.filter(m => m.role === 'student').length 
    : (course as any).students || 0;
  
  // Calculate course duration - handle both interfaces
  const courseDuration = course.members 
    ? calculateCourseDuration(course as Course)
    : (course as any).duration || 0;
  
  // Get image source - handle both interfaces
  const imageSrc = (course as any).thumbnailUrl || (course as any).image || "Images/courses/course 4.jpg";
  
  // Debug logging for image source
  console.log('CourseCard - Course data:', course);
  console.log('CourseCard - Image source:', imageSrc);
  console.log('CourseCard - thumbnailUrl:', (course as any).thumbnailUrl);
  console.log('CourseCard - image:', (course as any).image);
  
  // Get pricing - handle both interfaces
  const pricing = (course as any).pricing || (course as any).price;
  const isFree = pricing === "Free" || pricing === "0" || pricing === 0;
  
  return (
    <div className="course-card overflow-hidden" onClick={() => {
      // if(course.progress?course.progress>0:false){
      //   window.location.href = `#learner/current-course/?courseId=${course.id}`;
      // }else{
        // Navigate to course details with the course ID
        window.location.hash = `#/courseDetails?courseId=${course.id}`;
        window.location.reload();
      // }
    }}>
      <div className="relative">
        <img 
          src={imageSrc} 
          alt={course.title}
          onError={(e) => {
            console.error('Image failed to load:', imageSrc);
            e.currentTarget.src = 'Images/courses/course 4.jpg';
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', imageSrc);
          }}
        />
      </div>

      <div className="course-details-section">
        <div className="course-content">
          <div className="course-students">
            <div className=" py-0.5 flex gap-2 items-center">
              <span>{studentCount} Students</span>
            </div>
            <div className="py-0.5 flex items-center gap-2">
              <span>{courseDuration} {course.members ? 'Hours' : 'Weeks'}</span>
            </div>
          </div>
          <h3 className="course-title">{course.title}</h3>
          <p className="course-desciption">{course.description}</p>

          {progress && (
            <div className="course-progress">
              <div className="course-progress-bar">
                <div
                  className="progress-completed"
                  style={{ width: `${course.progress}%` }}
                ></div><div className="progress-dot" />
              </div>
              <div className="progress-text-completed">{course.progress}% Completed</div>
            </div>
          )}
        </div>

        <div className="course-price-section">
          {isFree ? (
            <span className="badge-free">Free</span>
          ) : (
            <span className="badge-paid">Paid</span>
          )}
        </div>
      </div>
    </div>
  );
}