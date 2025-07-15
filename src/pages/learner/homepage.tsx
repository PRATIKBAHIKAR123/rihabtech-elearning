
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ChevronRight, Search, ShoppingCart, Bell, ChevronDown, List } from "lucide-react";
import { Course } from "../../types/course";
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function HomePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        // Try to get from localStorage first
        const cached = localStorage.getItem('profile');
        if (cached) {
          setProfile(JSON.parse(cached));
        } else {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data());
            localStorage.setItem('profile', JSON.stringify(docSnap.data()));
          }
        }
      }
    };
    fetchProfile();
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen">
     
{/* Hero Section */}
<section className="landing-gradient py-12 md:py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-start">
          <div className="flex flex-col gap-6 md:w-1/2">
          <p className="banner-section-subtitle">
          Professional & Lifelong Learning
            </p>
            <h1 className="banner-section-title">
            Welcome Back, <span className="text-primary">{profile?.name || user?.displayName || user?.email || 'Learner'}!</span>
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="px-6 py-3 rounded-none h-auto text-white hover:bg-blue-700 font-medium">
             <List/> Categories
              </Button>
              <div className='relative w-full'>
              <input placeholder='What do you want to learn?' className='outline outline-1 outline-offset-[-1px] outline-[#ff7700] px-4 py-3 w-full' />
              <Search className='absolute top-1/4 right-4'/>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <img 
                src="Images/Banners/col-md-6.png" 
                alt="Happy student learning" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* My Learnings Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title">My Learnings</h2>
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
          <h2 className="section-title mb-6">Courses You May Like</h2>
          
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

    </div>
  );
}



function CourseCard({ course, progress = false }: { course: Course; progress?: boolean }) {
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

// Sample Data
const myLearningCourses = [
  {
    id: 1,
    title: "Introduction LearnPress - LMS Plugin",
    description: "A WordPress LMS Plugin to create WordPress Learning Management System.",
    students: 76,
    duration: 10,
    progress: 90,
    image: "Images/courses/Link.jpg"
  },
  {
    id: 2,
    title: "Create An LMS Website With WordPress",
    description: "Lorem ipsum dolor sit amet. Qui mollitia dolores non voluptas.",
    students: 25,
    duration: 12,
    progress: 50,
    image: "Images/courses/create-an-lms-website-with-learnpress 4.jpg"
  },
  {
    id: 3,
    title: "How To Sell In-Person Course With LearnPress",
    description: "This course is a detailed and easy roadmap to get you all setup and...",
    students: 5,
    duration: 8,
    progress: 30,
    image: "Images/courses/course-offline-01.jpg"
  },
  {
    id: 4,
    title: "How To Teach An Online Course",
    description: "This tutorial will introduce you to PHP, a server-side scripting...",
    students: 28,
    duration: 10,
    progress: 50,
    image: "Images/courses/eduma-learnpress-lms 4.jpg"
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