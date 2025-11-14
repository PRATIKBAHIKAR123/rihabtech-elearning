import { Clock, User2 } from "lucide-react";
import Divider from "../../../components/ui/divider";
import { Button } from "../../../components/ui/button";
import { Course } from "../../../utils/firebaseCourses";

interface SuggestedCoursesProps {
  courses: Course[];
  currentCourseId: string;
}

export default function SuggestedCourses({ courses, currentCourseId }: SuggestedCoursesProps) {
    // Filter out the current course from suggestions
    const suggestedCourses = courses.filter(course => course.id !== currentCourseId).slice(0, 4);

    // If no courses available, show a message
    if (suggestedCourses.length === 0) {
      return (
        <section className="py-16 bg-[#F2F2FB]">
          <div className="container mx-auto px-4">
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No other courses available at the moment.</p>
            </div>
          </div>
        </section>
      );
    }

    return(
  <section className="py-16 bg-[#F2F2FB]">
    
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-12">
              {suggestedCourses.map((course,index)=>(
                <div key={course.id} className="overflow-hidden cursor-pointer hover:opacity-50" onClick={() => {
                  // Navigate to the selected course
                  window.location.hash = `#/courseDetails?courseId=${course.id}`;
                  window.location.reload();
                }}>
                <div className="relative">
                  <img src={course.thumbnailUrl || "/Logos/brand-icon.png"} alt={course.title} className="w-full h-40 object-cover" />
                  
                </div>
                <div className="py-4 flex flex-col gap-2">
                  <h3 className="text-[#000927] text-lg font-bold font-['Archivo'] capitalize leading-normal mb-2">{course.title}</h3>
                  <div className="flex gap-3 items-center text-[#666666] text-sm font-normal font-['Barlow'] leading-snug">
                    <div className=" px-1 py-0.5 flex gap-2 items-center">
                      <User2 size={16}/>
                      <span>{course.members ? course.members.filter(m => m.role === 'student').length : 0} Students</span>
                    </div>
                    <Divider/>
                    <div className="px-1 py-0.5 flex items-center gap-2">
                      <Clock size={16}/>
                      <span>{course.curriculum?.sections ? course.curriculum.sections.length : 0} Sections</span>
                    </div>
                  </div>
                  <p className=" text-[#666666] text-base font-normal font-['Barlow'] leading-relaxed max-lines-2">{course.description}</p>
                
                  
                  {course.pricing !== undefined && (
                    <div className="flex flex-col gap-2">
                      {course.pricing === "Free" ? (
                        <span className="badge-free">Free</span>
                      ) : (
                        <span className="badge-paid">Paid</span>
                      )}
                      <Button className="w-full rounded-none">Start learning</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
            <div className="text-center">
              <Button className="bg-primary text-white hover:bg-primary/90">
                View All Courses
              </Button>
            </div>
          </div>
        </section>
      );
}