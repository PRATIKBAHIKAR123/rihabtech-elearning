import { Clock, User2 } from "lucide-react";
import Divider from "../../../components/ui/divider";
import { Button } from "../../../components/ui/button";
import { useState } from "react";

export default function Courses() {
    const [activeTab, setActiveTab] = useState(1);
    const  courses = [
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
          image: "/Images/courses/course-offline-01.jpg"
        },
        {
          id: 4,
          title: "How To Teach An Online Course With Pen & Paper",
          description: "This tutorial will introduce you to PHP, a server-side scripting...",
          students: 28,
          duration: 10,
          price: 79.00,
          image: "Images/courses/eduma-learnpress-lms 4.jpg"
        },
      ];

     const coursecategories = [{'id':1,'title':'Data Science',},{'id':2,'title':'IT Certifications',},{'id':3,'title':'Communication',},{'id':4,'title':'Deep Learning',},{'id':5,'title':'Chat GPT',},{'id':6,'title':'Development',},{'id':7,'title':'Cloude Computing',},{'id':8,'title':'Mathematics',},]
      return(
  <section className="py-16 bg-[#F2F2FB]">
    
          <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 md:grid-cols-8 gap-2 justify-start mb-8">
          {coursecategories.map((category,index)=>(
      <div key={index} className={`"bg-white rounded-[35px] px-2 md:px-4 flex items-center justify-center" ${activeTab === category.id ? 'bg-primary text-white ' : 'bg-white text-primary '} cursor-pointer`} onClick={() => setActiveTab(category.id)}>
        <h2 className="flex flex-row justify-center text-center text-sm md:text-md font-medium font-['Archivo'] capitalize">{category.title}</h2>
        </div>
        ))}
        </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-12">
              {courses.map((course,index)=>(  
                <div
  key={index}
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
        <span>{course.duration} Weeks</span>
      </div>
    </div>
    <p className="course-description">{course.description}</p>

    {course.price !== undefined && (
      <div className="course-pricing">
        {course.price === 0 ? (
          <span className="course-free">
            Free <Divider /> <a className="course-cta">Start learning</a>
          </span>
        ) : (
          <div className="course-paid">
            <div className="flex items-center gap-2">
              <span className="course-price-label">From</span>
              <span className="course-price-value">₹{course.price}</span>
            </div>
            <Divider /> <a className="course-cta">Start learning</a>
          </div>
        )}
      </div>
    )}
  </div>
</div>
            ))}
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