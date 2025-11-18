import { Clock, User2 } from "lucide-react";
import Divider from "../../../components/ui/divider";
import { Button } from "../../../components/ui/button";
import { Course } from "../../../utils/firebaseCourses";
import { CourseCard } from "./courseList";

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
                <CourseCard key={course.id} course={course} />
            ))}
            </div>
            <div className="text-center">
              <Button className="bg-primary text-white hover:bg-primary/90" onClick={()=>window.location.href='#/courselist'}>
                View All Courses
              </Button>
            </div>
          </div>
        </section>
      );
}