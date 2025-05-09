import { BookOpen, ChevronRight,  Filter, User2 } from "lucide-react";
import { Course } from "../../../types/course";
import { Button } from "../../../components/ui/button";
import Divider from "../../../components/ui/divider";

export default function CourseList() {
    const courses = [
        {
          id: 1,
          title: "Introduction LearnPress - LMS Plugin",
          description: "A WordPress LMS Plugin to create WordPress Learning Management System.",
          students: 76,
          duration: 10,
          price: 0,
          image: "Images/courses/Link.jpg"
        },
        {
          id: 2,
          title: "Create An LMS Website With WordPress",
          description: "Lorem ipsum dolor sit amet. Qui mollitia dolores non voluptas.",
          students: 25,
          duration: 12,
          price: 0,
          image: "Images/courses/create-an-lms-website-with-learnpress 4.jpg"
        },
        {
          id: 3,
          title: "How To Sell In-Person Course With LearnPress",
          description: "This course is a detailed and easy roadmap to get you all setup and...",
          students: 5,
          duration: 8,
          price: 129.00,
          image: "Images/courses/course-offline-01.jpg"
        },
        {
          id: 4,
          title: "How To Teach An Online Course",
          description: "This tutorial will introduce you to PHP, a server-side scripting...",
          students: 28,
          duration: 10,
          price: 79.00,
          image: "Images/courses/eduma-learnpress-lms 4.jpg"
        },
        {
          id: 5,
          title: "How To Create An Online Course",
          description: "The iStudy team knows all about cross-browser issues, and they're...",
          students: 76,
          duration: 10,
          price: 70.00,
          originalPrice: 115.99,
          image: "Images/courses/course 4.jpg"
        },
        {
          id: 6,
          title: "The Complete Online Teaching Masterclass",
          description: "In this course, We'll learn how to create websites by structuring and...",
          students: 28,
          duration: 12,
          price: 80.00,
          originalPrice: 125.00,
          image: "Images/courses/course 5.jpg"
        },
        {
          id: 7,
          title: "Online Course Creation Secrets",
          description: "Many of the most powerful, memorable and effective...",
          students: 27,
          duration: 10,
          price: 65.00,
          image: "Images/courses/course 6.jpg"
        },
        {
          id: 8,
          title: "Launch Your Own Online School And Increase Your Income",
          description: "Photography Masterclass: Your Complete Guide to Photography...",
          students: 81,
          duration: 10,
          price: 50.00,
          image: "Images/courses/course 7.jpg"
        },
        {
          id: 9,
          title: "How To Teach Online Courses Effectively",
          description: "Build and deploy a live NodeJs, React.JS & Express sites while...",
          students: 45,
          duration: 10,
          price: 0,
          image: "Images/courses/course 8.jpg"
        },
        {
          id: 10,
          title: "Accelerate Your Course Creation Speed",
          description: "Lorem ipsum is simply dummy text of the printing and typesetting...",
          students: 11,
          duration: 8,
          price: 65.00,
          image: "Images/courses/course 9.jpg"
        },
        {
          id: 11,
          title: "Instructional Design For Learning And Development",
          description: "This tutorial will introduce you to PHP, a server-side scripting...",
          students: 17,
          duration: 4,
          price: 50.00,
          image: "Images/courses/course 16.jpg"
        },
        {
          id: 12,
          title: "How To Teach English Online And Get Paid",
          description: "In this course, We'll learn how to create websites by structuring and...",
          students: 14,
          duration: 6,
          price: 39.00,
          image: "Images/courses/course 18.jpg"
        }
      ];

      return(
  <section className="min-h-screen bg-white font-sans">

    {/* Breadcrumb Navigation */}
    <div className="container mx-auto px-4 py-4">
        <div className="flex items-center text-sm">
          <a href="#" className=" text-[#000927] text-base font-normal font-['Barlow'] leading-relaxed hover:text-primary">Home</a>
          <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
          <a href="#" className=" text-[#000927] text-base font-normal font-['Barlow'] leading-relaxed hover:text-primary">Courses</a>
          <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
          <span className=" text-gray-500 text-base font-normal font-['Barlow'] leading-relaxed">Design</span>
        </div>
      </div>

      {/* Design Category Header */}
      <div className="container mx-auto px-4 py-2">
        <h1 className="page-title mb-6">Design</h1>
        
        <div className="flex items-center space-x-8 mb-6">
          <div className="flex items-center text-[#666666] text-sm font-normal font-['Barlow'] leading-snug">
            <BookOpen className="mr-2" color="#666666" size={16} />
            <span>8 Free Courses</span>
          </div>
          <div className="flex items-center text-[#666666] text-sm font-normal font-['Barlow'] leading-snug">
            <User2 className="mr-2" color="#666666" size={16} />
            <span>318 Students</span>
          </div>
        </div>
        
        <p className="text-[#666666] text-base font-normal font-['Barlow'] leading-relaxed mb-8 max-w-6xl">
        Step into a world of endless learning opportunities with our online course marketplace. Browse a wide range of expertly crafted courses that help you build new skills, grow professionally, and follow your passions. Whether you're aiming to level up your career or dive into a personal hobby, find the perfect course that fits your goals and sparks your curiosity.
        </p>
        
        {/* Filter and Results */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <Button className="mb-4 md:mb-0 px-8 py-2 rounded-none flex items-center justify-center">
            <Filter size={20} />
            Filter
          </Button>
          
          <div className="flex items-center space-x-3">
            <span className="text-[#666666] text-base font-normal font-['Barlow'] leading-relaxed">Showing 1 - 15 of 15 results</span>
            <Divider className=""/>
            <div className="text-[#666666] text-base font-normal font-['Barlow'] leading-[19px]">Newly published</div>
          </div>
        </div>
        </div>
    
          <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-2 mb-6">
            {courses.map((course, index) => (
              <CourseCard key={index} course={course} />
            ))}
          </div>
          <div className="w-full flex justify-center mb-3">
                <Button variant={'outline'} className="border-black text-black rounded-none px-4 py-2 text-sm font-medium hover:bg-blue-50" onClick={() => {
                    
                  }}>
                    Load More
                </Button>
            </div>
          </div>
        </section>
  )
  }

 export function CourseCard({ course, progress = false }: { course: Course; progress?: boolean }) {
    return (
      <div className="course-card overflow-hidden" onClick={() => {
        window.location.href = '/#/courseDetails';
      }}>
        <div className="relative">
          <img src={course.image} alt={course.title} />
         
        </div>
        
        <div className="course-details-section">
        <div className="course-students">
                      <div className=" py-0.5 flex gap-2 items-center">
                        {/* <User2 size={16}/> */}
                        <span>{course.students} Students</span>
                      </div>
                      {/* <Divider/> */}
                      <div className="py-0.5 flex items-center gap-2">
                        {/* <Clock size={16}/> */}
                        <span>{course.duration} Weeks</span>
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
          
          {course.price !== undefined && (
            <div className="course-price-section">
              {course.price === 0 ? (
                <span className="price-free">Free</span>
              ) : (
                <div>
                  <span className="course-price">₹{course.price}</span>
                  {course.originalPrice && (
                    <span className="course-original-price">₹{course.originalPrice}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }