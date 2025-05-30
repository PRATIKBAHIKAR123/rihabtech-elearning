import { Search, Star } from "lucide-react";
import { Button } from "../../../components/ui/button";

export default function CourseList() {
    return (
        <div className="flex flex-col min-h-screen p-4 md:p-8">
            <div className="ins-heading">
                Courses
            </div>
            <div className="rounded-[15px] border border-gray p-6" >
                <div className="text-[#393939] text-lg font-semibold font-['Raleway'] flex items-center gap-2">
                    <Button className="rounded-none">New</Button> New Payout Available!
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between mt-4 gap-4">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-1/2">
          <div className="relative flex-grow">
            <Search className="absolute top-1/2 left-4 transform -translate-y-1/2" size={22} />
            <input
              type="text"
              placeholder="Search Course"
              className="bg-neutral-100 border-none rounded-[27px] w-full pl-12 py-2"
            />
          </div>
          <Button
            variant="outline"
            className="rounded-none border-primary text-primary w-full md:w-auto"
          >
            Newest
          </Button>
        </div>
        <Button
          className="rounded-none w-full md:w-auto"
          onClick={() => (window.location.href = "/#/instructor/course-test-selection")}
        >
          Add New Course
        </Button>
      </div>
            <div className="flex flex-col gap-2 mt-4">
                {[...Array(3)].map((_,index)=>(<div key={index} className="bg-white rounded-[15px] shadow-md p-2 flex flex-col md:flex-row items-left md:items-center justify-between hover:shadow-lg  cursor-pointer">
                    <div className="flex gap-2 items-center">
                        <img src="Images/4860253.png" className="w-20 h-[82.29px] rounded-lg" />
                        <div>
                            <div className="text-[#1e1e1e] text-lg font-medium font-['Poppins']">Design Course</div>
                            <div className="text-[#1e1e1e] text-sm font-medium font-['Nunito'] flex gap-2 items-center"><span className="size-[11px] bg-[#3ab500] rounded-full" ></span>Live</div>
                        </div>
                    </div>
                    <div>
                        <div className="text-[#1e1e1e] text-lg font-medium font-['Poppins']">INR 1000.00</div>
                        <div className="text-[#1e1e1e] text-sm font-medium font-['Nunito'] flex gap-2 items-center">Earned This Month</div>
                    </div>
                    <div>
                        <div className="text-[#1e1e1e] text-lg font-medium font-['Poppins']">78</div>
                        <div className="text-[#1e1e1e] text-sm font-medium font-['Nunito'] flex gap-2 items-center">Enrollments this month</div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                            ))}

                        </div>
                        <span className=" text-[#181818] text-[12px] md:text-sm font-medium font-['Poppins'] leading-[14px] ml-1">(720 Ratings)</span>
                    </div>
                </div>))}
            </div>
        </div>
    );
}
