import { BookOpen, ChevronDown, ChevronRight, Filter, User2, X } from "lucide-react";
import { Course } from "../../../types/course";
import { Button } from "../../../components/ui/button";
import Divider from "../../../components/ui/divider";
import { useState } from "react";
import { Checkbox } from "../../../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio";

export default function CourseList() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);
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

  return (
    <section className="min-h-screen bg-white font-sans relative">
      {/* Breadcrumb Navigation */}
      {/* Main content with desktop filter */}
      <div className="flex flex-row w-full justify-center">
        {/* Filter Sidebar - Desktop */}
        <div className={`hidden lg:block lg:w-1/4 xl:w-1/5 pr-8 ${isFilterOpen ? '' : 'lg:hidden'}`}>
          <FilterContent />
        </div>
        <div>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center text-sm">
              <a href="#" className="text-[#000927] text-base font-normal font-['Barlow'] leading-relaxed hover:text-primary">Home</a>
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              <a href="#" className="text-[#000927] text-base font-normal font-['Barlow'] leading-relaxed hover:text-primary">Courses</a>
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              <span className="text-gray-500 text-base font-normal font-['Barlow'] leading-relaxed">Design</span>
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
              <Button
                className="mb-4 md:mb-0 px-8 py-2 rounded-none flex items-center justify-center"
                onClick={toggleFilter}
              >
                <Filter size={20} className="mr-2" />
                Filter
              </Button>

              <div className="flex items-center space-x-3">
                <span className="text-[#666666] text-base font-normal font-['Barlow'] leading-relaxed">Showing 1 - 15 of 15 results</span>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="text-[#666666] text-base font-normal font-['Barlow'] leading-[19px]">Newly published</div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row">
              {/* Filter Sidebar - Mobile */}
              <div className={`fixed inset-y-0 right-0 transform lg:hidden bg-white w-4/5 max-w-sm z-50 overflow-y-auto shadow-lg transition-transform duration-300 ease-in-out ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Filters</h2>
                    <Button variant="ghost" onClick={toggleFilter} className="p-1">
                      <X size={24} />
                    </Button>
                  </div>

                  <FilterContent />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-2 mb-6">
                  {courses.map((course, index) => (
                    <CourseCard key={index} course={course} />
                  ))}
                </div>
                <div className="w-full flex justify-center mb-3">
                  <Button
                    variant="outline"
                    className="border-black text-black rounded-none px-4 py-2 text-sm font-medium hover:bg-blue-50"
                  >
                    Load More
                  </Button>
                </div>
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
function FilterContent() {
  // State for expanded sections
  const [showMoreDuration, setShowMoreDuration] = useState(false);
  const [showMoreTopics, setShowMoreTopics] = useState(false);
  
  // Additional items that will show when "Show more" is clicked
  const additionalDurations = [
    { id: "duration-17-plus", label: "17+ Hours (145)" },
    { id: "duration-all", label: "All Durations (805)" }
  ];
  
  const additionalTopics = [
    { id: "topic-angular", label: "Angular (425)" },
    { id: "topic-vue", label: "Vue.js (312)" },
    { id: "topic-javascript", label: "JavaScript (921)" },
    { id: "topic-typescript", label: "TypeScript (475)" }
  ];

  return (
    <div className="space-y-2">
      {/* Ratings Filter */}
      
      <FilterAccordion title="Ratings">
        <div className="space-y-3">
          <RadioGroup>
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

      <FilterAccordion title="Price">
<div className="space-y-3 font-bold">
          <div className="flex items-center">
            <Checkbox id="free" className="mr-3" />
            <label htmlFor="free">Free</label>
          </div>
          <div className="flex items-center">
            <Checkbox id="paid" className="mr-3" />
            <label htmlFor="paid">Paid</label>
          </div>
          
          </div>
      </FilterAccordion>

      {/* Video Duration Filter */}
      <FilterAccordion title="Video Duration">
        <div className="space-y-3 font-bold">
          <div className="flex items-center">
            <Checkbox id="duration-0-1" className="mr-3" />
            <label htmlFor="duration-0-1">0-1 Hour (72)</label>
          </div>
          <div className="flex items-center">
            <Checkbox id="duration-1-3" className="mr-3" />
            <label htmlFor="duration-1-3">1-3 Hours (168)</label>
          </div>
          <div className="flex items-center">
            <Checkbox id="duration-3-6" className="mr-3" />
            <label htmlFor="duration-3-6">3-6 Hours (141)</label>
          </div>
          <div className="flex items-center">
            <Checkbox id="duration-6-17" className="mr-3" />
            <label htmlFor="duration-6-17">6-17 Hours (279)</label>
          </div>
          
          {/* Additional items that appear when "Show more" is clicked */}
          {showMoreDuration && (
            <>
              {additionalDurations.map(duration => (
                <div key={duration.id} className="flex items-center">
                  <Checkbox id={duration.id} className="mr-3" />
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
      
      {/* Topic Filter */}
      <FilterAccordion title="Topic">
        <div className="space-y-3 font-bold">
          <div className="flex items-center">
            <Checkbox id="topic-react" className="mr-3" />
            <label htmlFor="topic-react">React JS (838)</label>
          </div>
          
          {/* Additional topics that appear when "Show more" is clicked */}
          {showMoreTopics && (
            <>
              {additionalTopics.map(topic => (
                <div key={topic.id} className="flex items-center">
                  <Checkbox id={topic.id} className="mr-3" />
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
    </div>
  );
}


export function CourseCard({ course, progress = false }: { course: Course; progress?: boolean }) {
  return (
    <div className="course-card overflow-hidden" onClick={() => {
      if(course.progress){
        window.location.href = '/#/learner/current-course';
      }else{
      window.location.href = '/#/courseDetails';
    }
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
                <span className="course-price">Included in Subscription</span>
                {/* {course.originalPrice && (
                    <span className="course-original-price">₹{course.originalPrice}</span>
                  )} */}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}