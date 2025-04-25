import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ChevronRight, Search, ShoppingCart, Bell, ChevronDown } from "lucide-react";
import { Course } from "../../types/course";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Banner */}
      <div className="bg-navy-900 text-white text-center py-1 px-4 text-sm">
        Special welcome gift. Get 30% off your first purchase with code "Eduno". <a href="#" className="underline">Find out more!</a>
      </div>

      {/* Navigation Header */}
      <header className="border-b py-4">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <img src="/api/placeholder/40/40" alt="Eduno TechNoCodes" className="h-8" />
              <span className="ml-2 font-semibold">EDUNO TECHNOCODES</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-sm font-medium">Home</a>
              <div className="flex items-center">
                <a href="#" className="text-sm font-medium">Courses</a>
                <ChevronDown size={16} className="ml-1" />
              </div>
              <div className="flex items-center">
                <a href="#" className="text-sm font-medium">My Learnings</a>
                <ChevronDown size={16} className="ml-1" />
              </div>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative max-w-xs">
              <Input placeholder="Search Something Here" className="pr-8 h-9 bg-gray-100" />
              <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm">
              Teach With Us
            </Button>
            <div className="flex items-center space-x-2">
              <button className="p-1">
                <ShoppingCart size={20} />
              </button>
              <button className="p-1">
                <Bell size={20} />
              </button>
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-medium">
                MA
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2">
            <div className="text-sm text-gray-600 mb-2">Professional & Lifetime Learning</div>
            <h1 className="text-3xl font-bold mb-6">Welcome Back, Manas Agrawal!</h1>
            
            <div className="flex w-full max-w-md">
              <Button className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-r-none">
                <span>Categories</span>
              </Button>
              <div className="relative flex-grow">
                <Input placeholder="What do you want to learn?" className="rounded-l-none h-10" />
                <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
            <div className="bg-gray-200 w-full h-64 rounded-3xl"></div>
          </div>
        </div>
      </section>

      {/* My Learnings Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Learnings</h2>
            <button className="text-gray-500">
              <ChevronRight size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {myLearningCourses.map((course, index) => (
              <CourseCard key={index} course={course} progress />
            ))}
          </div>
        </div>
      </section>

      {/* Courses You May Like Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Courses You May Like</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.slice(0, 4).map((course, index) => (
              <CourseCard key={index} course={course} />
            ))}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {recommendedCourses.slice(4, 8).map((course, index) => (
              <CourseCard key={index} course={course} />
            ))}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {recommendedCourses.slice(8, 12).map((course, index) => (
              <CourseCard key={index} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-bold mb-4">Company Info</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Career</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">We are hiring</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Career</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">We are hiring</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Features</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Business Marketing</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">User Analytics</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Live Chat</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Unlimited Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">iOS & Android</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Watch a Demo</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Customers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-800">
            <div>
              <h3 className="font-bold mb-4">Get In Touch</h3>
              <div className="flex items-center mb-2">
                <div className="p-2 bg-gray-800 rounded-full mr-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <span>(480) 555-0103</span>
              </div>
              <div className="flex items-center">
                <div className="p-2 bg-gray-800 rounded-full mr-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <span>debra.holt@example.com</span>
              </div>
            </div>
            <div className="flex md:justify-end items-center">
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}



function CourseCard({ course, progress = false }: { course: Course; progress?: boolean }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="relative">
        <img src={course.image} alt={course.title} className="w-full h-40 object-cover" />
        <div className="absolute bottom-2 left-2 flex items-center text-xs">
          <div className="bg-white rounded px-1 py-0.5 flex items-center mr-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
            <span>{course.students} Students</span>
          </div>
          <div className="bg-white rounded px-1 py-0.5 flex items-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{course.duration} Weeks</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-base mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{course.description}</p>
        
        {progress && (
          <div className="mb-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-orange-500 h-1.5 rounded-full" 
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-primary mt-1">{course.progress}% Completed</div>
          </div>
        )}
        
        {course.price !== undefined && (
          <div className="flex items-center justify-between">
            {course.price === 0 ? (
              <span className="text-green-600 font-medium">Free</span>
            ) : (
              <div>
                <span className="text-primary font-medium">₹{course.price}</span>
                {course.originalPrice && (
                  <span className="text-xs text-gray-500 line-through ml-1">₹{course.originalPrice}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Sample Data
const myLearningCourses = [
  {
    id: 1,
    title: "Introduction LearnPress - LMS Plugin",
    description: "A WordPress LMS Plugin to create WordPress Learning Management System.",
    students: 76,
    duration: 10,
    progress: 90,
    image: "/api/placeholder/400/300"
  },
  {
    id: 2,
    title: "Create An LMS Website With WordPress",
    description: "Lorem ipsum dolor sit amet. Qui mollitia dolores non voluptas.",
    students: 25,
    duration: 12,
    progress: 50,
    image: "/api/placeholder/400/300"
  },
  {
    id: 3,
    title: "How To Sell In-Person Course With LearnPress",
    description: "This course is a detailed and easy roadmap to get you all setup and...",
    students: 5,
    duration: 8,
    progress: 30,
    image: "/api/placeholder/400/300"
  },
  {
    id: 4,
    title: "How To Teach An Online Course",
    description: "This tutorial will introduce you to PHP, a server-side scripting...",
    students: 28,
    duration: 10,
    progress: 50,
    image: "/api/placeholder/400/300"
  }
];

const recommendedCourses = [
  {
    id: 1,
    title: "Introduction LearnPress - LMS Plugin",
    description: "A WordPress LMS Plugin to create WordPress Learning Management System.",
    students: 76,
    duration: 10,
    price: 0,
    image: "/api/placeholder/400/300"
  },
  {
    id: 2,
    title: "Create An LMS Website With WordPress",
    description: "Lorem ipsum dolor sit amet. Qui mollitia dolores non voluptas.",
    students: 25,
    duration: 12,
    price: 0,
    image: "/api/placeholder/400/300"
  },
  {
    id: 3,
    title: "How To Sell In-Person Course With LearnPress",
    description: "This course is a detailed and easy roadmap to get you all setup and...",
    students: 5,
    duration: 8,
    price: 129.00,
    image: "/api/placeholder/400/300"
  },
  {
    id: 4,
    title: "How To Teach An Online Course",
    description: "This tutorial will introduce you to PHP, a server-side scripting...",
    students: 28,
    duration: 10,
    price: 79.00,
    image: "/api/placeholder/400/300"
  },
  {
    id: 5,
    title: "How To Create An Online Course",
    description: "The iStudy team knows all about cross-browser issues, and they're...",
    students: 76,
    duration: 10,
    price: 70.00,
    originalPrice: 115.99,
    image: "/api/placeholder/400/300"
  },
  {
    id: 6,
    title: "The Complete Online Teaching Masterclass",
    description: "In this course, We'll learn how to create websites by structuring and...",
    students: 28,
    duration: 12,
    price: 80.00,
    originalPrice: 125.00,
    image: "/api/placeholder/400/300"
  },
  {
    id: 7,
    title: "Online Course Creation Secrets",
    description: "Many of the most powerful, memorable and effective...",
    students: 27,
    duration: 10,
    price: 65.00,
    image: "/api/placeholder/400/300"
  },
  {
    id: 8,
    title: "Launch Your Own Online School And Increase Your Income",
    description: "Photography Masterclass: Your Complete Guide to Photography...",
    students: 81,
    duration: 10,
    price: 50.00,
    image: "/api/placeholder/400/300"
  },
  {
    id: 9,
    title: "How To Teach Online Courses Effectively",
    description: "Build and deploy a live NodeJs, React.JS & Express sites while...",
    students: 45,
    duration: 10,
    price: 0,
    image: "/api/placeholder/400/300"
  },
  {
    id: 10,
    title: "Accelerate Your Course Creation Speed",
    description: "Lorem ipsum is simply dummy text of the printing and typesetting...",
    students: 11,
    duration: 8,
    price: 65.00,
    image: "/api/placeholder/400/300"
  },
  {
    id: 11,
    title: "Instructional Design For Learning And Development",
    description: "This tutorial will introduce you to PHP, a server-side scripting...",
    students: 17,
    duration: 4,
    price: 50.00,
    image: "/api/placeholder/400/300"
  },
  {
    id: 12,
    title: "How To Teach English Online And Get Paid",
    description: "In this course, We'll learn how to create websites by structuring and...",
    students: 14,
    duration: 6,
    price: 39.00,
    image: "/api/placeholder/400/300"
  }
];