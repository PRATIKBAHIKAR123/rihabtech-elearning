import { Star, Play } from "lucide-react";
import Divider from "../../../components/ui/divider";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import SuggestedCourses from "./courses";
import Curriculum from "./coursecurriculam";
import CartModal from "../../../modals/cartModal";
import CheckoutModal from "../../../components/ui/CheckoutModal";
import CoursePreviewModal from "../../../modals/coursePreviewModal";
import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { Course, calculateCourseDuration } from "../../../utils/firebaseCourses";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import { enrollUserInCourse, isUserEnrolledInCourse } from "../../../utils/paymentService";
import { toast } from "sonner";
import { InstructorData } from "../../../utils/firebaseInstructorData";

// Extended Course interface with additional properties from Firebase
interface ExtendedCourse extends Omit<Course, 'requirements'> {
  learn?: string[];
  requirements: string[];
  target?: string[];
  welcomeMessage?: string;
}

export default function CourseDetails() {
  const [isCartModalOpen, setIsCartModalOpen] = React.useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = React.useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = React.useState(false);
  const [course, setCourse] = useState<ExtendedCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableCourses, setAvailableCourses] = useState<ExtendedCourse[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [instructor, setInstructor] = useState<InstructorData | null>(null);

  // Get course ID from multiple sources
  const { courseId } = useParams<{ courseId: string }>();

  // Function to extract course ID from URL hash or query parameters
  const getCourseIdFromURL = (): string | null => {
    // First try useParams
    if (courseId) return courseId;

    // Try to get from URL hash (e.g., #/courseDetails?courseId=123)
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const queryString = hash.split('?')[1];
      const urlParams = new URLSearchParams(queryString);
      return urlParams.get('courseId');
    }

    // Try to get from URL search params
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('courseId');
  };

  // Function to fetch available courses for selection
  const fetchAvailableCourses = async () => {
    try {
      const coursesRef = collection(db, "courseDrafts");
      const coursesQuery = query(
        coursesRef,
        where("status", "==", "approved"),
        where("isPublished", "==", true)
      );

      const querySnapshot = await getDocs(coursesQuery);
      const courses: ExtendedCourse[] = [];

      querySnapshot.forEach((doc) => {
        const courseData = doc.data() as ExtendedCourse;
        courses.push({
          ...courseData,
          id: doc.id,
          requirements: courseData.requirements || []
        });
      });

      setAvailableCourses(courses);
    } catch (error) {
      console.error("Error fetching available courses:", error);
    }
  };

  // Check enrollment status
  const checkEnrollmentStatus = async (courseId: string) => {
    if (!user) return;

    setCheckingEnrollment(true);
    try {
      const enrolled = await isUserEnrolledInCourse(courseId, user.uid);
      setIsEnrolled(enrolled);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  // Fetch course data from Firebase
  useEffect(() => {
    const fetchCourse = async () => {
      const extractedCourseId = getCourseIdFromURL();

      if (!extractedCourseId) {
        // No course ID provided, fetch available courses instead
        await fetchAvailableCourses();
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const courseRef = doc(db, "courseDrafts", extractedCourseId);
        const courseSnap = await getDoc(courseRef);

        if (courseSnap.exists()) {
          const courseData = courseSnap.data() as ExtendedCourse;
          const courseWithId = {
            ...courseData,
            id: courseSnap.id,
            requirements: courseData.requirements || []
          };
          setCourse(courseWithId);

          // Check enrollment status
          if (user) {
            await checkEnrollmentStatus(courseWithId.id);
          }
        } else {
          setError("Course not found");
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user]);

  // Function to count students (members with student role)
  const countStudents = (members?: Course['members']): number => {
    if (!members) return 0;
    return members.filter(member => member.role === 'student').length;
  };

  // Function to count total lessons from curriculum
  const countTotalLessons = (curriculum?: Course['curriculum']): number => {
    if (!curriculum?.sections) return 0;
    let totalLessons = 0;
    curriculum.sections.forEach(section => {
      if (section.published) {
        totalLessons += section.items.filter(item => item.published).length;
      }
    });
    return totalLessons;
  };

  const getInstructorDetails = (): void => {
    if (!course?.members) return;
    const instructorId = course.instructorId;
    if (instructorId) {
      const fetchInstructor = async () => {
        try {
          const userRef = doc(db, "users", instructorId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setInstructor(userSnap.data() as InstructorData);
          }
        } catch (error) {
          console.error("Error fetching instructor details:", error);
        }
      };
      fetchInstructor();
    }
  };
  useEffect(() => {
    getInstructorDetails();
  }, [course]);

  // Function to get instructor name from members
  const getInstructorName = (members?: Course['members']): string => {
    if (!members) return "Unknown Instructor";
    const instructor = members.find(member => member.role === 'teacher');
    return instructor?.email?.split('@')[0] || "Unknown Instructor";
  };

  // Function to get instructor email from members
  const getInstructorEmail = (members?: Course['members']): string => {
    if (!members) return "";
    const instructor = members.find(member => member.role === 'teacher');
    return instructor?.email || "";
  };

  // Function to get course duration with fallback
  const getCourseDuration = (): string => {
    if (!course) return "Duration not available";

    console.log('getCourseDuration called with course:', course);
    console.log('Course curriculum:', course.curriculum);
    
    // Calculate duration directly from curriculum items
    if (course.curriculum?.sections) {
      console.log('Calculating duration from curriculum items');
      let totalSeconds = 0;
      
      course.curriculum.sections.forEach((section, sectionIndex) => {
        console.log(`Section ${sectionIndex}: ${section.name} with ${section.items?.length || 0} items`);
        
        if (section.items) {
          section.items.forEach((item, itemIndex) => {
            console.log(`Item ${itemIndex}: ${item.lectureName}, contentType: ${item.contentType}`);
            
            if (item.contentFiles && item.contentFiles.length > 0) {
              console.log(`Item ${itemIndex} has ${item.contentFiles.length} content files:`, item.contentFiles);
              
              item.contentFiles.forEach((file, fileIndex) => {
                if (file.duration !== undefined && file.duration !== null) {
                  let durationValue: number;
                  
                  // Handle both integer and decimal duration values
                  if (typeof file.duration === 'string') {
                    // Check if it's already formatted as "MM:SS" or "HH:MM:SS"
                    if (file.duration.includes(':')) {
                      const parts = file.duration.split(':');
                      if (parts.length === 2) {
                        // Format: "MM:SS"
                        durationValue = parseInt(parts[0]) * 60 + parseFloat(parts[1]);
                      } else if (parts.length === 3) {
                        // Format: "HH:MM:SS"
                        durationValue = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
                      } else {
                        durationValue = parseFloat(file.duration);
                      }
                    } else {
                      // Try to parse as number
                      durationValue = parseFloat(file.duration);
                    }
                  } else {
                    durationValue = file.duration;
                  }
                  
                  if (!isNaN(durationValue) && durationValue > 0) {
                    totalSeconds += durationValue; // Don't round, keep decimal precision
                    console.log(`Duration: Adding ${durationValue} seconds from file: ${file.name}`);
                  }
                }
              });
            }
          });
        }
      });

      console.log(`Total duration in seconds: ${totalSeconds}`);

      if (totalSeconds > 0) {
        const hours = totalSeconds / 3600;
        const roundedHours = Math.round(hours * 10) / 10; // Round to 1 decimal place
        console.log(`Total duration in hours: ${roundedHours}`);
        return `${roundedHours} hours`;
      }
    }

    return "Duration not available";
  };

  // Handle Buy Now click
  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please log in to purchase this course');
      window.location.hash = '#/login';
      return;
    }

    if (isEnrolled) {
      toast.info('You are already enrolled in this course');
      window.location.hash = '#/learner/my-learnings';
      return;
    }
if(!isEnrolled){
      const courseEnrollmentResponse = await enrollUserInCourse(course!.id, user.email || user.uid, user.email || '', undefined, course?.pricing === 'free' ? 'free' : 'paid')
      console.log('Course enrollment response:', courseEnrollmentResponse);
      toast.success('Course added to cart');
    }
    else{
if (course?.pricing === "paid") {
      // Redirect to pricing page for subscription selection
      // window.location.hash = '#/pricing';
      setIsCheckoutModalOpen(true);
      return;
    }
    }
    // Check if this is a subscription-based course
    
    

    // For direct purchase courses (Free or specific price)
    
  };

  // Handle Go to Course (for enrolled users)
  const handleGoToCourse = () => {
    if (!user) {
      toast.error('Please log in to access your courses');
      return;
    }

    window.location.hash = '#/learner/current-course?courseId=' + course?.id;
  };

  // Get button text and action
  const getButtonConfig = () => {

    // Show loading state while auth is loading
    if (authLoading) {
      return {
        text: "Loading...",
        action: () => { },
        disabled: true,
        variant: "default" as const
      };
    }

    if (!user) {
      return {
        text: course?.pricing === "Free" ? "Login to Enroll" : "Login to Buy",
        action: () => {
          window.location.hash = '#/login';
        },
        disabled: false,
        variant: "default" as const
      };
    }

    if (checkingEnrollment) {
      return {
        text: "Checking...",
        action: () => { },
        disabled: true,
        variant: "default" as const
      };
    }

    if (isEnrolled) {
      return {
        text: "Go to Course",
        action: handleGoToCourse,
        disabled: false,
        variant: "default" as const
      };
    }

    // Determine button text based on pricing type
    let buttonText = "Enroll Now";
    if (course?.pricing == "free") {
      buttonText = "Enroll Now";
    } else if (course?.pricing === "paid") {
      buttonText = "Enroll Now"; // Will redirect to pricing page
    } else {
      buttonText = `Buy for ₹${course?.pricing}`;
    }

    return {
      text: buttonText,
      action: handleBuyNow,
      disabled: false,
      variant: "default" as const
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container mx-auto px-4 py-10">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state or course selection state
  if (error || (!course && !loading && availableCourses.length > 0)) {
    if (error) {
      return (
        <div className="flex flex-col min-h-screen">
          <div className="container mx-auto px-4 py-10">
            <div className="text-center py-8">
              <p className="text-red-600 text-lg">{error}</p>
              <Button
                className="mt-4"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Show course selection interface
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container mx-auto px-4 py-10">
          <div className="text-center py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Select a Course</h1>
            <p className="text-gray-600 mb-8">Choose a course from the list below to view its details</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((courseItem) => (
                <div
                  key={courseItem.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => {
                    // Navigate to course details with the selected course ID
                    window.location.hash = `#/courseDetails?courseId=${courseItem.id}`;
                    window.location.reload(); // Reload to fetch the selected course
                  }}
                >
                  <div className="relative">
                    <img
                      src={courseItem.thumbnailUrl || "Images/courses/default-course.jpg"}
                      alt={courseItem.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-sm font-medium">
                      {courseItem.pricing === "Free" ? "Free" : `₹${courseItem.pricing}`}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2">
                      {courseItem.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {courseItem.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{courseItem.level || "Beginner"}</span>
                      <span>{courseItem.language || "English"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no course and no available courses, show a different message
  if (!course && !loading && availableCourses.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container mx-auto px-4 py-10">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No courses available at the moment</p>
            <Button
              onClick={() => window.history.back()}
              className="bg-primary text-white"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Ensure course exists before rendering the main content
  if (!course) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="container mx-auto px-4 py-10">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  const sampleCartItem = {
    id: parseInt(course.id) || 1, // Convert string ID to number or use fallback
    title: course.title,
    description: course.description,
    price: course.pricing === "Free" ? 0 : parseFloat(course.pricing) || 0,
    image: course.thumbnailUrl,
    students: countStudents(course.members),
    duration: getCourseDuration()
  };
  return (
    <div className="flex flex-col min-h-screen">

      <section className="gradient-header">
        <div className="container mx-auto">
          <div className="w-full md:w-1/2 text-left text-white text-lg md:text-4xl font-bold font-['Spartan'] leading -[30px] md:leading-[50.40px]">
            {course.title}
          </div>
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mt-2">
            <div className="flex items-center gap-2">
              <img src="Images/icons/user-laptop.png" alt="Star" className="w-4 h-4" />
              <div
                className="text-white text-[15px] font-medium font-['Poppins'] leading-relaxed cursor-pointer hover:underline hover:text-gray-300 transition-all duration-200"
                onClick={() => { window.location.href = '/#/instructorDetails' }}
              >
                By {getInstructorName(course.members)}
              </div>
            </div>
            <Divider className="h-0 md:h-4 bg-white" />
            <div className="flex items-center gap-2">
              <img src="Images/icons/Icon (1).png" alt="Star" className="w-4 h-4" />
              <div className="text-white text-[15px] font-medium font-['Poppins'] leading-relaxed">
                {course.level || "Beginner"}
              </div>
            </div>
            <Divider className="h-0 md:h-4 bg-white" />
            <div className="flex items-center gap-2">
              <div className="flex justify-left">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src="Images/icons/Container (6).png" alt="Star" className="w-4 h-4" />
                ))}
              </div>
              <div className="text-white text-[15px] font-medium font-['Poppins'] leading-relaxed">(2 Reviews)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔳 Tabs + Sidebar */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left: Tabs Section */}
          <div className="w-full lg:w-2/3">
            <Tabs defaultValue="overview" className="w-full custom-tabs">
              <TabsList className="custom-tabs-list overflow-x-scroll overflow-y-hidden md:overflow-x-auto">
                <TabsTrigger value="overview" className="custom-tab-trigger">Overview</TabsTrigger>
                <TabsTrigger value="curriculum" className="custom-tab-trigger">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor" className="custom-tab-trigger">Instructor</TabsTrigger>
                <TabsTrigger value="reviews" className="custom-tab-trigger">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="py-4">
                <h2 className="details-title mb-4">Course Description</h2>
                <p className="mb-6 details-description">
                  {course.description || "No description available for this course."}
                </p>

                {course.subtitle && (
                  <p className="mb-6 details-description">
                    {course.subtitle}
                  </p>
                )}

                <h2 className="details-title mb-4">What You'll Learn From This Course</h2>
                {course.learn && course.learn.length > 0 ? (
                  <ul className="list-disc pl-5 mb-6 details-description space-y-2">
                    {course.learn.map((learningPoint, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{learningPoint}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="details-description text-gray-500 text-center">
                      Learning objectives not specified for this course.
                    </p>
                  </div>
                )}

                <h2 className="details-title mb-4">Requirements</h2>
                {course.requirements && course.requirements.length > 0 ? (
                  <ul className="list-disc pl-5 mb-6 details-description space-y-2">
                    {course.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="details-description text-gray-500 text-center">
                      No specific requirements listed for this course.
                    </p>
                  </div>
                )}

                <h2 className="details-title mb-4">Target Audience</h2>
                {course.target && course.target.length > 0 ? (
                  <ul className="list-disc pl-5 mb-6 details-description space-y-2">
                    {course.target.map((target, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{target}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <p className="details-description text-gray-500 text-center">
                      Target audience not specified for this course.
                    </p>
                  </div>
                )}

                <h2 className="details-title mb-4">Course Level & Language</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Difficulty Level</h4>
                    <p className="text-gray-600 capitalize">{course.level || "Beginner"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Language</h4>
                    <p className="text-gray-600 capitalize">{course.language || "English"}</p>
                  </div>
                </div>

                <h2 className="details-title mb-4">Certification</h2>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="details-description text-green-800">
                    {course.welcomeMessage || "Certificate of completion will be provided upon finishing this course."}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="curriculum" className="py-4">
                <Curriculum course={course} onPreviewCourse={() => setIsPreviewModalOpen(true)} />
              </TabsContent>

              <TabsContent value="instructor" className="py-4">
                <div className="instructor-container">
                  <h2 className="details-title mb-6">About Your Instructor</h2>

                  <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Instructor Image */}
                      <div className="flex-shrink-0">
                        <img
                          src="Images/users/team-18.jpg.jpg"
                          alt={getInstructorName(course.members)}
                          className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                        />
                      </div>

                      {/* Instructor Info */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          {course.members && course.members.length>0? getInstructorName(course.members):course.instructorName}
                        </h3>
                        <p className="text-lg text-gray-600 mb-4">{instructor?.role}</p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{countStudents(course.members)}</div>
                            <div className="text-sm text-gray-600">Students</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">4.7</div>
                            <div className="text-sm text-gray-600">Rating</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">7</div>
                            <div className="text-sm text-gray-600">Courses</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">958</div>
                            <div className="text-sm text-gray-600">Reviews</div>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            {getInstructorEmail(course.members) || "Email not available"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio Sections */}
                  <div className="space-y-6">
                    {/* Short Bio */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Short Bio</h3>
                      <p className="text-gray-700 leading-relaxed">
                        I'm {getInstructorName(course.members)}, a developer with a passion for teaching.
                        I'm the lead instructor for this course and have helped hundreds of students learn
                        to code and change their lives by becoming developers.
                      </p>
                    </div>

                    {/* Full Bio */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Full Biography</h3>
                      <div className="text-gray-700 leading-relaxed space-y-4">
                        <p>
                          I'm {getInstructorName(course.members)}, a developer with a passion for teaching.
                          I'm the lead instructor for this course. I've helped hundreds of thousands of
                          students learn to code and change their lives by becoming a developer.
                        </p>
                        <p>
                          I've been invited by companies such as Twitter, Facebook and Google to teach
                          their employees. My first foray into programming was when I was just 12 years old,
                          wanting to build my own Space Invader game.
                        </p>
                        <p>
                          Since then, I've made hundreds of websites, apps and games. But most importantly,
                          I realised that my greatest passion is teaching. I believe that everyone can learn
                          to code, and I'm here to make that journey as smooth and enjoyable as possible.
                        </p>
                      </div>
                    </div>

                    {/* Expertise */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Areas of Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {['Web Development', 'JavaScript', 'React', 'Node.js', 'Python', 'Data Science', 'Machine Learning'].map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="py-4">
                <div className="reviews-container">
                  <h2 className="details-title mb-6">Student Reviews</h2>

                  {/* Reviews Summary */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      {/* Overall Rating */}
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">4.7</div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">Based on 2 reviews</p>
                      </div>

                      {/* Rating Breakdown */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-3">Rating Breakdown</h3>
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center gap-3">
                              <span className="text-sm text-gray-600 w-8">{rating} stars</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-yellow-400 h-2 rounded-full"
                                  style={{
                                    width: `${rating === 5 ? 100 : rating === 4 ? 0 : 0}%`
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-12">
                                {rating === 5 ? '2' : rating === 4 ? '0' : '0'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {/* Sample Review 1 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                          JD
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-800">John Doe</h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className="w-4 h-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">
                            Excellent course! The instructor explains complex concepts in a very clear and understandable way.
                            The practical examples and hands-on projects really helped me grasp the material.
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>2 weeks ago</span>
                            <span>Course: {course.title}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sample Review 2 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                          JS
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-800">Jane Smith</h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className="w-4 h-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">
                            Great learning experience! The course structure is well-organized and the content is up-to-date.
                            I especially appreciated the real-world examples and the instructor's responsiveness to questions.
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>1 month ago</span>
                            <span>Course: {course.title}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Write Review Button */}
                  <div className="text-center mt-8">
                    <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                      Write a Review
                    </button>
                  </div>
                </div>
              </TabsContent>

              {/* Add more <TabsContent /> blocks here for other tabs */}
            </Tabs>
          </div>

          {/* Right: Sidebar Card */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-[5px] shadow-[0px_10px_50px_0px_rgba(26,46,85,0.07)] p-4">
              <ReactPlayer
                controls={true}
                url={course.promoVideoUrl || '/courses/video2 - Trim.mp4'}
                className="rounded-md mb-4 z-999"
                height={'220px'}
                width={'320px'}
              />
              {/* <img src="Images/Banners/Background.png" className="rounded-md mb-4" /> */}
              <div className="p-4">
                <h3 className="details-title mb-4">Course Includes:</h3>
                <ul className="text-[#181818] text-[15px] font-medium font-['Spartan'] leading-relaxed space-y-3 text-left">
                  <li className="flex justify-between">
                    <span className="flex items-center gap-4">
                      <img src="Images/icons/course-Icon.png" className="h-6" /> Price:
                    </span>
                    <span className="text-primary text-lg font-semibold font-['Poppins'] leading-[34.60px] font-semibold">
                      {course.pricing == "free" ?
                        (<span className="badge-free">Free</span>) :
                        (<span className="badge-paid">Paid</span>)
                      }
                    </span>
                  </li>
                  <hr className="w-full bg-[#E5E5E5]" />
                  <li className="flex justify-between">
                    <span className="flex items-center gap-4">
                      <img src="Images/icons/course-Icon-1.png" className="h-6" /> Instructor:
                    </span>
                    <span className="text-[#181818] text-[15px] font-medium font-['Poppins'] leading-relaxed cursor-pointer" onClick={() => { window.location.href = '/#/instructorDetails' }}>
                      {course.members && course.members.length > 0 ? getInstructorName(course.members) : course.instructorName}
                    </span>
                  </li>
                  <hr className="w-full bg-[#E5E5E5]" />
                  <li className="flex justify-between">
                    <span className="flex items-center gap-4">
                      <img src="Images/icons/course-Icon-2.png" className="h-6" /> Duration:
                    </span>
                    <span className="text-[#181818] text-[15px] font-medium font-['Poppins'] leading-relaxed">
                      {getCourseDuration()}
                    </span>
                  </li>
                  <hr className="w-full bg-[#E5E5E5]" />
                  <li className="flex justify-between">
                    <span className="flex items-center gap-4">
                      <img src="Images/icons/books.svg.png" className="h-6" /> Lessons:
                    </span>
                    <span className="text-[#181818] text-[15px] font-medium font-['Poppins'] leading-relaxed">
                      {countTotalLessons(course.curriculum)}
                    </span>
                  </li>
                  <hr className="w-full bg-[#E5E5E5]" />
                  <li className="flex justify-between">
                    <span className="flex items-center gap-4">
                      <img src="Images/icons/course-Icon-3.png" className="h-6" /> Students:
                    </span>
                    <span className="text-[#181818] text-[15px] font-medium font-['Poppins'] leading-relaxed">
                      {countStudents(course.members)}
                    </span>
                  </li>
                  <hr className="w-full bg-[#E5E5E5]" />
                  <li className="flex justify-between">
                    <span className="flex items-center gap-4">
                      <img src="Images/icons/course-Icon-4.png" className="h-6" /> Language:
                    </span>
                    <span className="text-[#181818] text-[15px] font-medium font-['Poppins'] leading-relaxed">
                      {course.language || "English"}
                    </span>
                  </li>
                  <hr className="w-full bg-[#E5E5E5]" />
                  <li className="flex justify-between">
                    <span className="flex items-center gap-4">
                      <img src="Images/icons/Icon-5.png" className="h-6" /> Level:
                    </span>
                    <span className="text-[#181818] text-[15px] font-medium font-['Poppins'] leading-relaxed">
                      {course.level || "Beginner"}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Preview Course Button */}
              <Button
                className="w-full py-4 text-sm font-normal font-['Spartan'] text-primary border-2 border-primary bg-white hover:bg-primary hover:text-white transition-colors mb-3"
                variant="outline"
                onClick={() => setIsPreviewModalOpen(true)}
              >
                <Play size={16} className="mr-2" />
                Preview Course
              </Button>

              {(() => {
                const buttonConfig = getButtonConfig();
                return (
                  <Button
                    className="w-full py-6 text-sm font-normal font-['Spartan'] text-white"
                    variant={buttonConfig.variant}
                    onClick={buttonConfig.action}
                    disabled={buttonConfig.disabled}
                    data-enroll-button
                  >
                    {buttonConfig.text}
                  </Button>
                );
              })()}

              <div className="mt-6">
                <p className="details-title mb-2">Share On:</p>
                <div className="flex gap-4">
                  <img src="Images/icons/Item → Link.png" className="h-8" />
                  <img src="Images/icons/Item → Link-1.png" className="h-8" />
                  <img src="Images/icons/Item → Link-2.png" className="h-8" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      <SuggestedCourses courses={availableCourses} currentCourseId={course.id} />
      <CartModal
        isOpen={isCartModalOpen}
        setIsOpen={setIsCartModalOpen}
        cartItem={sampleCartItem}
      />

      {/* Checkout Modal */}
      {course && (
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          course={{
            id: course.id,
            title: course.title,
            pricing: course.pricing,
            thumbnailUrl: course.thumbnailUrl,
            description: course.description
          }}
        />
      )}

      {/* Course Preview Modal */}
      {course && (
        <CoursePreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          course={course}
        />
      )}
    </div>
  )
}