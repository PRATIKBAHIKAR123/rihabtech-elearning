import { File, MonitorIcon } from "lucide-react";
import { Button } from "../../../../components/ui/button";

const CourseSelection = () => {
    return (
      <div>
        <h1 className="ins-heading mb-6">Add New Course</h1>
        
        <div className="grid grid-cols-2 gap-6">
          <CourseCard 
            title="Course"
            icon={'Images/icons/Display 1.png'}
            buttonText="Create Course"
          />
          <CourseCard 
            title="Practice Test"
            icon={'Images/icons/Document Align Left 8.png'}
            buttonText="Create Test"
          />
        </div>
      </div>
    );
  };

  interface CourseCardProps {
    title: string;
    icon: string;
    buttonText: string;
  }

  const CourseCard = ({ title, icon, buttonText }: CourseCardProps) => {
    return (
      <div className="bg-white p-6 border border-gray-200 flex flex-col items-center text-center justify-center">
        <img src={icon} className="h-6"/>
        <h2 className="text-[#393939] text-[22px] font-semibold font-['Raleway'] leading-snug mt-4 mb-2">{title}</h2>
        <p className="text-[#1e1e1e] text-sm font-medium font-['Nunito'] mb-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse laoreet, nulla vitae ultrices iaculis, tortor lorem maximus sem, eu luctus orci dui id sem.
        </p>
        <Button className="rounded-none transition-colors" onClick={()=>{window.location.hash='#/instructor/course-title'}}>
          {buttonText}
        </Button>
      </div>
    );
  };

  export default CourseSelection