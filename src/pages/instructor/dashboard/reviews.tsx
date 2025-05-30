
import { User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";

interface Testimonial {
    name: string;
    role: string;
    message: string;
    rating: number;
  }
  
  const testimonials: Testimonial[] = [
    {
      name: "Mehul Shah",
      role: "Student",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla a eleifend elit. Orci varius natoque penatibus",
      rating: 5,
    },
    {
      name: "Mehul Shah",
      role: "Student",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla a eleifend elit. Orci varius natoque penatibus",
      rating: 5,
    },
    {
      name: "Mehul Shah",
      role: "Student",
      message:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla a eleifend elit. Orci varius natoque penatibus",
      rating: 5,
    },
  ];

export default function Reviews()  {
    return (
        <>
             
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
          <h1 className="form-title mr-6">Student Reviews</h1>
          <div>
          <Select defaultValue="all">
                            <SelectTrigger className="rounded-none text-primary border border-primary">
                                <SelectValue placeholder="Choose a Currency" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="all">All Courses</SelectItem>
                                <SelectItem value="development">Development</SelectItem>

                            </SelectContent>
                        </Select>
                        </div>
          </div>
          
        </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10)] shadow-md p-6 text-left border border-gray-100"
          >
            <div className="flex flex-col items-center">
            <div className="flex items-center justify-start w-full gap-3">
              <div className="w-12 h-12 bg-[#c9c9c9] rounded-full flex items-center justify-center text-gray-500 text-lg">
                <User/>
              </div>
              <div>
              <h3 className="mt-2  text-[#1e2532] text-lg font-semibold font-['Inter'] leading-7">{testimonial.name}</h3>
              <p className=" text-[#495565] text-sm font-normal font-['Inter'] leading-tight">{testimonial.role}</p>
              </div>
              </div>
              <div className="flex justify-left text-yellow-500 w-full mt-2">
              {[...Array(testimonial.rating)].map((_, i) => (
                      <img src="Images/icons/Container (6).png" className="h-4 w-4" alt="Star" key={i} />
                       
                    ))}
              </div>
              <p className="text-[#354152] text-sm font-normal font-['Inter'] leading-[21px] mt-3">{testimonial.message}</p>
              <Button variant={'outline'} className="rounded-none w-full border border-primary text-primary mt-4">
                Reply
              </Button>
            </div>
          </div>
        ))}
      </div>
      </>
    );
  };