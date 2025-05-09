import { Input } from "../../../../components/ui/input";

const CourseTitle = () => {
    return (
      <div>
        <h1 className="ins-heading mb-3">What’s the Course Tittle</h1>
        <p className="justify-start text-[#1e1e1e] text-sm font-medium font-['Nunito']">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse laoreet, nulla vitae ultrices iaculis, tortor lorem maximus sem, eu luctus orci dui id sem.</p>
        <div className="mt-8">
            <Input className="ins-control-border" placeholder="Type Course Title Here"></Input>
        </div>
      </div>
    );
  };


  export default CourseTitle