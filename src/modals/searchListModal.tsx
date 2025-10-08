import { Search } from "lucide-react";
import { useEffect, useState, useRef, JSX } from "react";
import { Course, getAllCourses, COURSE_STATUS } from "../utils/firebaseCourses";

// Define types
interface LectureInfo {
  lectureName: string;
  sectionName: string;
  description: string;
}

interface SearchResult {
  type: 'course' | 'lecture';
  course: Course;
  matchedLecture: LectureInfo | null;
  hasLectureMatches?: boolean;
}

// Helper function to extract all lecture names from a course
const extractLectureNames = (course: Course): LectureInfo[] => {
  const lectureNames: LectureInfo[] = [];
  if (course.curriculum?.sections) {
    course.curriculum.sections.forEach((section: any) => {
      if (section.items) {
        section.items.forEach((item: any) => {
          if (item.lectureName && item.type === 'lecture') {
            lectureNames.push({
              lectureName: item.lectureName,
              sectionName: section.name,
              description: item.description || ''
            });
          }
        });
      }
    });
  }
  return lectureNames;
};

// Helper function to highlight matched text
const highlightText = (text: string, searchTerm: string): (string | JSX.Element)[] => {
  if (!searchTerm || !text) return [text];
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part: string, index: number) => 
    regex.test(part) ? 
      <span key={index} className="bg-yellow-200 font-semibold">{part}</span> : 
      part
  );
};

export default function SearchWithPopup() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [searchTxt, setSearchtext] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const firebaseCourses = await getAllCourses();
        setCourses(firebaseCourses);
        
        // Initialize with all courses
        const initialResults: SearchResult[] = firebaseCourses.map(course => ({
          type: 'course',
          course,
          matchedLecture: null
        }));
        setFilteredResults(initialResults);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
        setFilteredResults([]);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!searchTxt.trim()) {
      // Show all courses when no search term
      const allCourseResults: SearchResult[] = courses.map(course => ({
        type: 'course',
        course,
        matchedLecture: null
      }));
      setFilteredResults(allCourseResults);
    } else {
      const lower = searchTxt.toLowerCase();
      const results: SearchResult[] = [];

      courses.forEach(course => {
        let courseMatched = false;
        
        // Check if course title, category, or subcategory matches
        if (course.title?.toLowerCase().includes(lower) ||
            course.category?.toLowerCase().includes(lower) ||
            course.subcategory?.toLowerCase().includes(lower)) {
          results.push({
            type: 'course',
            course,
            matchedLecture: null
          });
          courseMatched = true;
        }

        // Check lecture names
        const lectures = extractLectureNames(course);
        lectures.forEach(lecture => {
          if (lecture.lectureName.toLowerCase().includes(lower)) {
            // If course wasn't already added, add it with matched lecture
            if (!courseMatched) {
              results.push({
                type: 'lecture',
                course,
                matchedLecture: lecture
              });
            } else {
              // Update existing course result to show it also has lecture matches
              const existingResult = results.find(r => r.course.id === course.id && r.type === 'course');
              if (existingResult) {
                existingResult.hasLectureMatches = true;
              }
            }
          }
        });
      });

      setFilteredResults(results);
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

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    if (result.type === 'lecture' && result.matchedLecture) {
      setSearchtext(result.matchedLecture.lectureName);
    } else {
      setSearchtext(result.course.title || '');
    }
    console.log('Navigating to course details for course ID:', result);
    if(result.matchedLecture?.sectionName){
      const sectionIndex = result.course.curriculum?.sections.findIndex((sec: any) => sec.name === result.matchedLecture?.sectionName) || 0; 
      window.location.href = `#/courseDetails?courseId=${result.course?.id}/sectionIndex=${sectionIndex}`;
    }
    else{
    window.location.href = `#/courseDetails?courseId=${result.course?.id}`;
    }
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
        placeholder="Search courses or lectures..."
        className="bg-neutral-100 border-none rounded-[27px] w-full pl-12 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      
      {/* Custom Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-auto z-50">
          {filteredResults.length > 0 ? (
            <>
              {/* Search Results Header */}
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <p className="text-sm text-gray-600">
                  {searchTxt ? `${filteredResults.length} results for "${searchTxt}"` : 'All courses'}
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
              
              {/* Results */}
              {filteredResults.map((result, idx) => (
                <div
                  key={`${result.course.id}-${result.type}-${idx}`}
                  className="flex items-start gap-4 p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                  onClick={() => handleResultClick(result)}
                >
                  <img
                    src={result.course.thumbnailUrl}
                    alt={result.course.title}
                    className="w-24 h-16 object-cover rounded-md flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-course.jpg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {result.type === 'lecture' && result.matchedLecture ? (
                        <>
                          <span className="text-blue-600 text-xs uppercase tracking-wide">Lecture: </span>
                          {highlightText(result.matchedLecture.lectureName, searchTxt)}
                        </>
                      ) : (
                        highlightText(result.course.title || '', searchTxt)
                      )}
                    </h3>
                    
                    {result.type === 'lecture' && result.matchedLecture ? (
                      <div>
                        <p className="text-xs text-gray-500 mt-1">
                          Course: {result.course.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          Section: {result.matchedLecture.sectionName}
                        </p>
                        {result.matchedLecture.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {result.matchedLecture.description}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {result.course.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      {result.course.category && (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {result.course.category}
                        </span>
                      )}
                      {result.type === 'lecture' && (
                        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Lecture Match
                        </span>
                      )}
                      {result.hasLectureMatches && (
                        <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          + Lecture Matches
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-600 flex-shrink-0">
                    {result.course.pricing}
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
                {searchTxt ? `No courses or lectures found for "${searchTxt}"` : 'Start typing to search courses and lectures'}
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