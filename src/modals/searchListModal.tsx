

  import { Search } from "lucide-react";
  import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
  
  export default function SearchWithPopup() {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="hidden md:block relative flex-grow">
            <Search className="absolute top-1/4 left-4" size={22} />
            <input
              type="text"
              placeholder="Search Something Here"
              className="bg-neutral-100 border-none rounded-[27px] w-full pl-12 py-2"
              onClick={() => setIsOpen(true)}
            />
          </div>
        </PopoverTrigger>
  
        <PopoverContent className="w-[500px] bg-white p-4 max-h-96 overflow-auto shadow-xl rounded-xl">
          {mycartlist.map((course, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 border-b border-gray-200"
            >
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-22 h-16 object-cover rounded-md"
              />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">{course.title}</h3>
                <p className="text-[#1e1e1e] text-xs font-medium font-['Nunito'] mt-1">
                  {course.description}
                </p>
              </div>
              <div className="text-[15px] font-medium font-['Kumbh_Sans'] text-primary mt-1">
                {course.price}
              </div>
            </div>
          ))}
        </PopoverContent>
      </Popover>
    );
  }
  
  const mycartlist = [
    {
      title: "Design Course",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam placerat ac augue ac sagittis.",
      imageUrl: "Images/courses/Rectangle 24.png",
      price: "₹186,99",
    },
    {
      title: "Design Course",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam placerat ac augue ac sagittis.",
      imageUrl: "Images/courses/Rectangle 24.png",
      price: "₹186,99",
    },
    {
      title: "Design Course",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam placerat ac augue ac sagittis.",
      imageUrl: "Images/courses/Rectangle 24.png",
      price: "₹186,99",
    },
  ];
  

    