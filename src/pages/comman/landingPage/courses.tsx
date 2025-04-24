import { Clock, User, User2 } from "lucide-react";
import Divider from "../../../components/ui/divider";

export default function Courses() {
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
      return(
  <section className="py-16 landing-gradient">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12">
              {courses.map((course,index)=>(
                <div key={index} className="overflow-hidden">
                <div className="relative">
                  <img src={course.image} alt={course.title} className="w-full h-40 object-cover" />
                  
                </div>
                <div className="py-4 flex flex-col gap-2">
                  <h3 className="text-[#000927] text-lg font-bold font-['Archivo'] capitalize leading-normal mb-2">{course.title}</h3>
                  <div className="flex gap-3 items-center text-[#666666] text-sm font-normal font-['Barlow'] leading-snug">
                    <div className=" px-1 py-0.5 flex gap-2 items-center">
                      <User2 size={16}/>
                      <span>{course.students} Students</span>
                    </div>
                    <span>|</span>
                    <div className="px-1 py-0.5 flex items-center gap-2">
                      <Clock size={16}/>
                      <span>{course.duration} Weeks</span>
                    </div>
                  </div>
                  <p className=" text-[#666666] text-base font-normal font-['Barlow'] leading-relaxed mb-3 max-lines-2">{course.description}</p>
                
                  
                  {course.price !== undefined && (
                    <div className="flex items-center justify-between">
                      {course.price === 0 ? (
                        <span className="text-green-600 flex font-medium">Free <Divider/> <a className="text-orange-500">Start learning</a></span>
                      ) : (
                        <div>
                          <span className="text-orange-500 font-medium">₹{course.price}</span>
                          
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
            
           
          </div>
        </section>
  )
  }