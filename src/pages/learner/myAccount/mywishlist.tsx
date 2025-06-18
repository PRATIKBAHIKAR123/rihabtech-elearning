import { useState } from 'react';
import "../../../styles/temp.css";
import Divider from '../../../components/ui/divider';
import { Clock, User2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';

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
    price: 69.00,
    image: "Images/courses/Link.jpg"
  },
  {
    id: 2,
    title: "Create An LMS Website With LearnPress",
    description: "Lorem ipsum dolor sit amet. Qui mollitia dolores non voluptas.",
    students: 84,
    duration: 10,
    price: 69.00,
    image: "Images/courses/create-an-lms-website-with-learnpress 4.jpg"
  },
  {
    id: 3,
    title: "How To Sell In-Person Course With LearnPress",
    description: "This course is a detailed and easy tutorial to get you all setup and going... ",
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

const coursecategories = [{'id':1,'title':'Data Science',},{'id':2,'title':'IT Certifications',},{'id':3,'title':'Communication',},{'id':4,'title':'Deep Learning',},{'id':5,'title':'Chat GPT',},{'id':6,'title':'Development',},{'id':7,'title':'Cloude Computing',},{'id':8,'title':'Mathematics',},]

function CourseCard({ course }: { course: Course }) {
  // For demo, assign categories based on id
  const category = course.id <= 2 ? "3D & Animation" : "Business";
  const isFree = course.price === 0;
  return (

    <div
  className="course-card-alt"
  onClick={() => {
    window.location.href = '/#/courseDetails';
  }}
>
  <div className="relative">
    <img src={course.image} alt={course.title} />
  </div>
  <div className="course-body">
    <h3 className="course-title">{course.title}</h3>
    <div className="course-meta">
      <div className="flex items-center gap-2">
        <User2 size={16} />
        <span>{course.students} Students</span>
      </div>
      <Divider />
      <div className="flex items-center gap-2">
        <Clock size={16} />
        <span>{course.duration} Hrs</span>
      </div>
    </div>
    <p className="course-description">{course.description}</p>

    {course.price !== undefined && (
      <div className="course-pricing flex-col gap-2">
        {!course.price ? (
          <span className="course-free">
            Free 
            {/* <Divider /> <a className="course-cta">Start learning</a> */}
          </span>
        ) : (
          <div className="course-paid">
            <div className="flex items-start gap-2">
              {/* <span className="course-price-label">From</span> */}
              <span className="course-price-value">Included in Subscription</span>
            </div>
            {/* <Divider /> <a className="course-cta">Start learning</a> */}
          </div>
        )}
        <Button className='rounded-none w-full'>Start learning</Button>
      </div>
    )}
  </div>
</div>
  );
}

export default function MyWishlist() {
  const [wishlist] = useState<Course[]>(sampleWishlist);
  const [activeTab, setActiveTab] = useState<'learnings' | 'wishlist'>('wishlist');
  const [selectedCategory, setSelectedCategory] = useState(1);

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
        <div className="grid grid-cols-3 md:grid-cols-8 gap-2 justify-start mb-8">
          {coursecategories.map((category,index)=>(
      <div key={index} className={`"bg-white rounded-[35px] px-2 md:px-4 flex items-center justify-center" ${selectedCategory === category.id ? 'bg-primary text-white ' : 'bg-white text-primary '} cursor-pointer`} onClick={() => setSelectedCategory(category.id)}>
        <h2 className="flex flex-row justify-center text-center text-sm md:text-md font-medium font-['Archivo'] capitalize">{category.title}</h2>
        </div>
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