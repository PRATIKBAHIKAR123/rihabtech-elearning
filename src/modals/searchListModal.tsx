import { Search } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Course, getAllCourses, COURSE_STATUS } from "../utils/firebaseCourses";

export default function SearchWithPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTxt, setSearchtext] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const firebaseCourses = await getAllCourses();
        const publishedCourses = firebaseCourses.filter(
          (course) => course.isPublished && course.status === COURSE_STATUS.APPROVED
        );
        setCourses(publishedCourses);
        setFilteredCourses(publishedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
        setFilteredCourses([]);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!searchTxt.trim()) {
      setFilteredCourses(courses);
    } else {
      const lower = searchTxt.toLowerCase();
      setFilteredCourses(
        courses.filter(
          (c) =>
            c.title?.toLowerCase().includes(lower) ||
            c.category?.toLowerCase().includes(lower) ||
            c.subcategory?.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchTxt, courses]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchtext(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleCourseClick = (course: Course) => {
    setIsOpen(false);
    setSearchtext(course.title || ''); // Optionally set the selected course title
    window.location.href = '/#/courseDetails';
  };

  const handleClearSearch = () => {
    setSearchtext('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="hidden md:block relative flex-grow mb-4">
      <Search className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 z-10" size={22} />
      <input
        ref={inputRef}
        type="text"
        value={searchTxt}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder="Search Something Here"
        className="bg-neutral-100 border-none rounded-[27px] w-full pl-12 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      {/* {searchTxt??<div className="absolute font-bold cursor-pointer right-2 top-1/2 transform -translate-y-1/2">&times;</div>} */}
      
      {/* Custom Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-auto z-50">
          {filteredCourses.length > 0 ? (
            <>
              {/* Search Results Header */}
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <p className="text-sm text-gray-600">
                  {searchTxt ? `${filteredCourses.length} results for "${searchTxt}"` : 'All courses'}
                </p>
                {searchTxt && (
                  <button
                    onClick={handleClearSearch}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                  >
                    Clear search
                  </button>
                )}
              </div>
              
              {/* Course Results */}
              {filteredCourses.map((course, idx) => (
                <div
                  key={course.id || idx}
                  className="flex items-start gap-4 p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                  onClick={() => handleCourseClick(course)}
                >
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-24 h-16 object-cover rounded-md flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-course.jpg'; // Fallback image
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {course.description}
                    </p>
                    {course.category && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {course.category}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-blue-600 flex-shrink-0">
                    {course.pricing}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-6 text-center">
              <div className="text-gray-400 mb-2">
                <Search size={32} className="mx-auto" />
              </div>
              <p className="text-gray-600">
                {searchTxt ? `No courses found for "${searchTxt}"` : 'Start typing to search courses'}
              </p>
              {searchTxt && (
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                >
                  Clear search and browse all courses
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

