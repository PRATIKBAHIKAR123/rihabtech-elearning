import { Clock, User2 } from "lucide-react";
import Divider from "../../../components/ui/divider";
import { Button } from "../../../components/ui/button";
import { useState, useEffect } from "react";
import { courseApiService, Category } from "../../../utils/courseApiService";
import { Course, getAllCourses } from "../../../utils/firebaseCourses";

// Course interface based on your Firebase data structure
// interface Course {
//   id: string;
//   title: string;
//   subtitle: string;
//   description: string;
//   thumbnailUrl: string;
//   pricing: string;
//   level: string;
//   language: string;
//   category: string;
//   subcategory: string;
//   status: string;
//   isPublished: boolean;
//   members?: Array<{
//     id: string;
//     email: string;
//     role: string;
//   }>;
//   curriculum?: {
//     sections: Array<{
//       name: string;
//       items: Array<{
//         lectureName: string;
//         contentType: string;
//         duration?: number;
//       }>;
//     }>;
//   };
// }

export default function Courses() {
  const [activeTab, setActiveTab] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Function to fetch courses from Firebase
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const firebaseCourses = await getAllCourses();
              setCourses(firebaseCourses);

      console.log('Fetched courses:', firebaseCourses);
      setCourses(firebaseCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Function to calculate total duration from curriculum
  const calculateTotalDuration = (curriculum?: Course['curriculum']): number => {
    if (!curriculum || !curriculum.sections) {
      return 0;
    }
    let totalDuration = 0;
    curriculum.sections.forEach(section => {
      if (section.items) {
        section.items.forEach(item => {
          if (item.contentFiles && Array.isArray(item.contentFiles)) {
            item.contentFiles.forEach(file => {
              if (file.duration) {
                totalDuration += typeof file.duration === 'string' ? parseFloat(file.duration) : file.duration;
              }
            });
          }
        });
      }
    });
    return Math.round(totalDuration / 60); // Convert to minutes and round
  };

  // Function to count students (members with student role)
  const countStudents = (members?: Course['members']): number => {
    if (!members || !Array.isArray(members)) {
      return 0;
    }
    return members.filter(member => member.role === 'student').length;
  };

  // Function to get filtered courses based on selected category
  const getFilteredCourses = () => {
    if (!activeTab || activeTab === '') {
      return courses; // Show all courses if no category is selected
    }

    // Filter courses by category ID
    return courses.filter(course => course.category === activeTab);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const fetchedCategories = await courseApiService.getAllCategories();
        console.log('Raw fetched categories:', fetchedCategories);

        // Filter categories that should show on home page (isActive and showOnHomePage)
        const homePageCategories = fetchedCategories.filter(category => 
          category.isActive && category.showOnHomePage
        );

        // If no categories found with showOnHomePage filter, get all active categories as fallback
        const categoriesToShow = homePageCategories.length > 0 ? homePageCategories : 
          fetchedCategories.filter(category => category.isActive);

        console.log('Processed categories:', categoriesToShow);
        setCategories(categoriesToShow);

        // Set the first category as active if available
        if (categoriesToShow.length > 0) {
          const firstCategoryId = categoriesToShow[0].id;
          console.log('Setting active tab to:', firstCategoryId);
          setActiveTab(firstCategoryId);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchCourses(); // Fetch courses when component mounts
  }, []);

  // Debug function to log when activeTab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
    console.log('Filtered courses count:', getFilteredCourses().length);
  }, [activeTab, courses]);

  return (
    <section className="py-16 bg-[#F2F2FB]">

      <div className="container mx-auto px-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading categories...</p>
          </div>
        ) : categories.length > 0 ? (
          <>
            <div className="grid grid-cols-3 md:grid-cols-8 gap-2 justify-start mb-8">
              {categories.map((category, index) => (
                <div key={index} className={`rounded-[35px] px-2 md:px-4 flex items-center justify-center cursor-pointer ${activeTab === category.id ? 'bg-primary text-white' : 'bg-white text-primary'}`} onClick={() => {
                  setActiveTab(category.id);
                }}>
                  <h2 className="flex flex-row justify-center text-center text-sm md:text-md font-medium font-['Archivo'] capitalize">{category.title}</h2>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No categories available</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-12">
          {coursesLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-gray-600">Loading courses...</p>
            </div>
          ) : courses.length > 0 ? (
            <>
              {getFilteredCourses().map((course, index) => (
                <div
                  key={index}
                  className="course-card-alt"
                  onClick={() => {
                    // Navigate to course details with the course ID
                    window.location.hash = `#/courseDetails?courseId=${course.id}`;
                  }}
                >
                  <div className="relative">
                    <img src={course.thumbnailUrl} alt={course.title} />
                  </div>
                  <div className="course-body">
                    <div className="course-content">
                      <h3 className="course-title">{course.title}</h3>
                      <div className="course-meta">
                        <div className="flex items-center gap-2">
                          <User2 size={16} />
                          <span>{countStudents(course.members)} Students</span>
                        </div>
                        <Divider />
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          <span>{calculateTotalDuration(course.curriculum)} Weeks</span>
                        </div>
                      </div>
                      <p className="course-description">{course.description}</p>
                    </div>

                    {course.pricing !== undefined && (
                      <div className="course-pricing">
                        {course.pricing === "Free" ? (
                          <span className="course-free">
                            Free <Divider /> <a className="course-cta">Start learning</a>
                          </span>
                        ) : (
                          <div className="course-paid">
                            <div className="flex items-center gap-2">
                              {course.pricing == "free" ?
                                (<span className="badge-free">Free</span>) :
                                (<span className="badge-paid">Paid</span>)
                              }
                            </div>
                            <Divider /> <a className="course-cta">Start learning</a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No courses available for this category.</p>
            </div>
          )}
        </div>
        <div className="w-full flex justify-center">
          <Button variant={'outline'} className="border-black text-black rounded-none px-4 py-2 text-sm font-medium hover:bg-blue-50" onClick={() => {
            window.location.href = '/#/courselist';
            window.scrollTo({ top: 0, behavior: 'smooth' })// Scroll to the top of the page
          }}>
            View All Courses
          </Button>
        </div>

      </div>
    </section>
  )
}