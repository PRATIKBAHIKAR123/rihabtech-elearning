import { useState } from 'react';
import "../../../styles/temp.css";

interface Course {
  id: number;
  title: string;
  description: string;
  students: number;
  duration: number;
  price?: number;
  originalPrice?: number;
  image: string;
}

// Sample wishlist data - replace with actual data from your backend
const sampleWishlist: Course[] = [
  {
    id: 1,
    title: "Introduction LearnPress - LMS Plugin",
    description: "A WordPress LMS Plugin to create WordPress Learning Management System.",
    students: 314,
    duration: 10,
    price: 0,
    image: "Images/courses/Link.jpg"
  },
  {
    id: 2,
    title: "Create An LMS Website With LearnPress",
    description: "Lorem ipsum dolor sit amet. Qui mollitia dolores non voluptas.",
    students: 84,
    duration: 10,
    price: 0,
    image: "Images/courses/create-an-lms-website-with-learnpress 4.jpg"
  },
  {
    id: 3,
    title: "How To Sell In-Person Course With LearnPress",
    description: "This course is a detailed and easy tutorial to get you all setup and going...",
    students: 0,
    duration: 10,
    price: 69.00,
    image: "Images/courses/course-offline-01.jpg"
  },
  {
    id: 4,
    title: "How To Teach An Online Course With Pen & Paper",
    description: "This tutorial will introduce you to PHP, a server-side scripting language you can...",
    students: 28,
    duration: 10,
    price: 69.00,
    image: "Images/courses/eduma-learnpress-lms 4.jpg"
  }
];

// Add a type for category/tag if needed
const tags = [
  "Lorem Ipsum",
  "Lorem Ipsum",
  "Lorem Ipsum",
  "Lorem Ipsum",
  "Lorem Ipsum",
  "Lorem Ipsum",
  "Lorem Ipsum"
];

function CourseCard({ course }: { course: Course }) {
  // For demo, assign categories based on id
  const category = course.id <= 2 ? "3D & Animation" : "Business";
  const isFree = course.price === 0;
  return (

    <div className="wishlist-course-udemy-style">
      <div className="wishlist-image-container">
        <img className="wishlist-course-image" src={course.image} alt={course.title} />
        <div className="wishlist-image-overlay" />
        
        <div className="wishlist-category-label-udemy">{category}</div>
      </div>
      <div className="wishlist-course-details">
        <h3 className="wishlist-course-title">{course.title}</h3>
        <div className="wishlist-meta-udemy" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <img src="/icons/profile.png" alt="students" style={{ width: '18px', height: '18px', verticalAlign: 'middle' }} />
            {course.students} Students
          </span>
          <span className="price-divider" style={{ height: '18px', margin: '0 8px', background: '#e5e7eb', width: '1px', display: 'inline-block' }}></span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <img src="/icons/clock.png" alt="weeks" style={{ width: '24px', height: '18px', verticalAlign: 'middle' }} />
            {course.duration} Weeks
          </span>
        </div>
        <p className="wishlist-course-description">{course.description}</p>
        <div className="wishlist-course-bottom">
          {isFree ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span className="price-free">Free</span>
              <span className="price-divider" style={{ height: '18px', margin: '0 4px', background: '#e5e7eb', width: '1px', display: 'inline-block' }}></span>
              <span className="price-action-label">Start Learning</span>
            </span>
          ) : (
            course.id === 3 ? (
              <span>
                From <span className="course-price">₹{course.price?.toFixed(2)}</span> ph
              </span>
            ) : (
              <span>
                Only <span className="course-price">₹{course.price?.toFixed(2)}</span>
              </span>
            )
          )}
        </div>
        <button className="wishlist-action-btn">
          {isFree ? "Start Learning" : "Purchase Now"}
        </button>
      </div>
    </div>
  );
}

export default function MyWishlist() {
  const [wishlist] = useState<Course[]>(sampleWishlist);
  const [activeTab, setActiveTab] = useState<'learnings' | 'wishlist'>('wishlist');

  return (
    <div className="wishlist-bg">
      <section className="gradient-header">
        <div className="container mx-auto px-6">
          <h1 className="text-white text-4xl font-bold mb-6 text-left">My Account</h1>
          <div className="flex gap-4">
            <button
              className="px-6 py-2 rounded-full text-lg bg-orange-300 text-white font-medium border border-orange-300"
              onClick={() => (window.location.href = '/#/learner/my-learnings')}
            >
              My Learnings
            </button>
            <button
              className={`px-6 py-2 rounded-full text-lg bg-white text-orange-500 font-medium'
                  
                }`}
              onClick={() => setActiveTab('learnings')}
            >
              Wishlist
            </button>
            
          </div>
        </div>
      </section>


      <div className="container mx-auto px-4 py-8">
        {/* Tag/Filter Bar */}
        <h1 className="wishlist-title">My Wishlist</h1>
        <div className="wishlist-tags-bar">
          {tags.map((tag, idx) => (
            <span className="wishlist-tag" key={idx}>{tag}</span>
          ))}
        </div>
        {wishlist.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Your wishlist is empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}