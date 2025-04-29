import { useState } from 'react';
import { BookOpen, User2 } from "lucide-react";
// const [courses] = useState<Course[]>(myLearningCourses);


interface Course {
  id: number;
  title: string;
  description: string;
  students: number;
  duration: number;
  progress?: number;
  price?: number;
  originalPrice?: number;
  image: string;
}

// Sample data for my learnings
const myLearningCourses: Course[] = [
  {
    id: 1,
    title: "Introduction LearnPress - LMS Plugin",
    description: "A WordPress LMS Plugin to create WordPress Learning Management System.",
    students: 314,
    duration: 10,
    progress: 50,
    price: 0,
    image: "Images/courses/Link.jpg"
  },
  {
    id: 2,
    title: "Create An LMS Website With LearnPress",
    description: "Lorem ipsum dolor sit amet. Qui mollitia dolores non voluptas.",
    students: 84,
    duration: 10,
    progress: 50,
    price: 0,
    image: "Images/courses/create-an-lms-website-with-learnpress 4.jpg"
  },
  {
    id: 3,
    title: "How To Sell In-Person Course With LearnPress",
    description: "This course is a detailed and easy tutorial to get you all setup and...",
    students: 0,
    duration: 10,
    progress: 50,
    price: 0,
    image: "Images/courses/course-offline-01.jpg"
  },
  {
    id: 4,
    title: "How To Teach An Online Course",
    description: "This tutorial will introduce you to PHP, a server-side scripting...",
    students: 28,
    duration: 10,
    progress: 50,
    price: 79.00,
    image: "Images/courses/eduma-learnpress-lms 4.jpg"
  }
];

function CourseCard({ course }: { course: Course }) {

  return (
    <div className="course-card overflow-hidden">
      <div className="relative">
        <img src={course.image} alt={course.title} />
      </div>

      <div className="course-details-section">
        <div className="course-students">
          <div className="py-0.5 flex gap-2 items-center">
            <span>{course.students} Students</span>
          </div>
          <div className="py-0.5 flex items-center gap-2">
            <span>{course.duration} Weeks</span>
          </div>
        </div>
        <h3 className="course-title">{course.title}</h3>
        <p className="course-desciption">{course.description}</p>

        {course.progress !== undefined && (
          <div className="course-progress">
            <div className="course-progress-bar">
              <div
                className="progress-completed"
                style={{ width: `${course.progress}%` }}
              ></div>
              <div className="progress-dot" />
            </div>
            <div className="progress-text-completed">{course.progress}% Completed</div>
          </div>
        )}

        {course.price !== undefined && (
          <div className="course-price-section">
            {course.price === 0 ? (
              <span className="price-free"></span>
            ) : (
              <div>
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

export default function MyLearnings() {

  const [courses] = useState<Course[]>(myLearningCourses);
  const [activeTab, setActiveTab] = useState<'learnings' | 'wishlist'>('wishlist');

  return (
    <div>
      <section className="gradient-header">
        <div className="container mx-auto px-6">
          <h1 className="text-white text-4xl font-bold mb-6 text-left">My Account</h1>
          <div className="flex gap-4">
            <button
              className={`px-6 py-2 rounded-full text-lg bg-white text-orange-500 font-medium'
                  
                }`}
              onClick={() => setActiveTab('learnings')}
            >
              My Learnings
            </button>
            <button
              className="px-6 py-2 rounded-full text-lg bg-orange-300 text-white font-medium border border-orange-300"
              onClick={() => (window.location.href = '/#/learner/my-wishlist')}
            >
              Wishlist
            </button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <h1 className="wishlist-title">My Learnings</h1>

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

        <p className="text-[#666666] text-base font-normal font-['Barlow'] leading-relaxed mb-8">
          Embark on a journey of knowledge and skill development with our online course marketplace. Discover a diverse array of expert-led courses designed to empower and enrich your learning experience. From professional development to personal growth, explore our curated selection of online courses that cater to your unique aspirations.
        </p>

        {courses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">You haven't enrolled in any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




