import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "../../../../components/ui/select";

const CourseCategory = () => {
    return (
      <div>
        <h1 className="ins-heading mb-3">Select your course Category</h1>
        <p className="justify-start text-[#1e1e1e] text-sm font-medium font-['Nunito']">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse laoreet, nulla vitae ultrices iaculis, tortor lorem maximus sem, eu luctus orci dui id sem.</p>
        <div className="mt-8">
        {/* <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        
      </SelectContent>
    </Select> */}
        </div>
      </div>
    );
  };


  export default CourseCategory