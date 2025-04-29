import { Star } from "lucide-react";
import Divider from "../../../components/ui/divider";
import { Tabs, TabsContent, TabsList, TabsTrigger,  } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import SuggestedCourses from "./courses";

export default function CourseDetails() {
    return (
        <div className="flex flex-col min-h-screen">
            
            <section className="gradient-header">
                <div className="container mx-auto">
                    <div className="w-1/2 text-left text-white text-4xl font-bold font-['Spartan'] leading-[50.40px]">Grow Personal Financial
                    Security Thinking & Principles</div>
                    <div className="flex gap-3 items-center mt-2">
                        <img src="Images/icons/user-laptop.png" alt="Star" className="w-4 h-4" />
                        <div className="text-white text-[15px] font-medium font-['Poppins'] leading-relaxed">By Emilie Bryant</div>
                        <Divider className="h-4 bg-white" />
                        <img src="Images/icons/Icon (1).png" alt="Star" className="w-4 h-4" />
                        <div className="text-white text-[15px] font-medium font-['Poppins'] leading-relaxed">Motivation</div>
                        <Divider className="h-4 bg-white" />
                        <div className="flex justify-left">
                                                {[...Array(5)].map((_, i) => (
                                                    <img src="Images/icons/Container (6).png" alt="Star" className="w-4 h-4" />
                                                ))}
                                            </div>
                        <div className="text-white text-[15px] font-medium font-['Poppins'] leading-relaxed">(2 Reviews)</div>
                        </div>
                </div>
            </section>

                 {/* 🔳 Tabs + Sidebar */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left: Tabs Section */}
          <div className="w-full lg:w-2/3">
            <Tabs defaultValue="overview" className="w-full custom-tabs">
              <TabsList className="custom-tabs-list">
                <TabsTrigger value="overview" className="custom-tab-trigger">Overview</TabsTrigger>
                <TabsTrigger value="curriculum" className="custom-tab-trigger">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor" className="custom-tab-trigger">Instructor</TabsTrigger>
                <TabsTrigger value="reviews" className="custom-tab-trigger">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="py-4">
                <h2 className="details-title mb-4">Course Description</h2>
                <p className="mb-6 details-description">
                Lorem ipsum dolor sit amet consectur adipiscing elit, sed do eiusmod tempor incididunt ut
labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra
maecenas accumsan lacus vel facilisis.
                </p>

                <p className="mb-6 details-description">
                Lorem ipsum dolor sit amet consectur adipiscing elit, sed do eiusmod tempor incididunt ut
labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra
maecenas accumsan lacus vel facilisis.
                </p>

                <h2 className="details-title mb-4">What You’ll Learn From This Course</h2>
                <ul className="list-disc pl-5 mb-6 details-description space-y-2">
                  <li>Neque sodales et etiam sit amet nisl purus</li>
                  <li>Tristique nulla aliquet enim tortor</li>
                  <li>Nam libero justo laoreet sit amet</li>
                  <li>Tempus imperdiet nulla malesuada</li>
                </ul>

                <h2 className="details-title mb-4">Certification</h2>
                <p className="details-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra
maecenas accumsan lacus vel facilisis.
                </p>
              </TabsContent>

              {/* Add more <TabsContent /> blocks here for other tabs */}
            </Tabs>
          </div>

          {/* Right: Sidebar Card */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-[5px] shadow-[0px_10px_50px_0px_rgba(26,46,85,0.07)] p-4">
              <img src="Images/Banners/Background.png" className="rounded-md mb-4" />
              <div className="p-4">
  <h3 className="details-title mb-4">Course Includes:</h3>
  <ul className="text-[#181818] text-[15px] font-medium font-['Spartan'] leading-relaxed space-y-3 text-left">
    <li className="flex justify-between">
      <span className="flex items-center gap-4">
        <img src="Images/icons/course-Icon.png" className="h-6" /> Price:
      </span>
      <span className="text-primary text-xl font-semibold font-['Poppins'] leading-[34.60px] font-semibold">₹49</span>
    </li>
    <hr className="w-full bg-[#E5E5E5]" />
    <li className="flex justify-between">
      <span className="flex items-center gap-4">
        <img src="Images/icons/course-Icon-1.png" className="h-6" /> Instructor:
      </span>
      <span className="text-[#181818] text-[15px] font-medium font-['Poppins'] leading-relaxed">Emilie Bryant</span>
    </li>
    <hr className="w-full bg-[#E5E5E5]" />
    <li className="flex justify-between">
      <span className="flex items-center gap-4">
        <img src="Images/icons/course-Icon-2.png" className="h-6" /> Duration:
      </span>
      <span className="text-[#181818] text-[15px] font-medium font-['Poppins'] leading-relaxed">12 weeks</span>
    </li>
    <hr className="w-full bg-[#E5E5E5]" />
    <li className="flex justify-between">
      <span className="flex items-center gap-4">
        <img src="Images/icons/books.svg.png" className="h-6" /> Lessons:
      </span>
      <span className="text-[#181818] text-[15px] font-medium font-['Poppins'] leading-relaxed">8</span>
    </li>
    <hr className="w-full bg-[#E5E5E5]" />
    <li className="flex justify-between">
      <span className="flex items-center gap-4">
        <img src="Images/icons/course-Icon-3.png" className="h-6" /> Students:
      </span>
      <span className="text-[#181818] text-[15px] font-medium font-['Poppins'] leading-relaxed">72</span>
    </li>
    <hr className="w-full bg-[#E5E5E5]" />
    <li className="flex justify-between">
      <span className="flex items-center gap-4">
        <img src="Images/icons/course-Icon-4.png" className="h-6" /> Language:
      </span>
      <span className="text-[#181818] text-[15px] font-medium font-['Poppins'] leading-relaxed">English</span>
    </li>
    <hr className="w-full bg-[#E5E5E5]" />
    <li className="flex justify-between">
      <span className="flex items-center gap-4">
        <img src="Images/icons/Icon-5.png" className="h-6" /> Certifications:
      </span>
      <span className="text-[#181818] text-[15px] font-medium font-['Poppins'] leading-relaxed">Yes</span>
    </li>
  </ul>
</div>

              <Button className="w-full py-6 text-sm font-normal font-['Spartan'] text-white">
                Buy Now
              </Button>

              <div className="mt-6">
                <p className="details-title mb-2">Share On:</p>
                <div className="flex gap-4">
                  <img src="Images/icons/Item → Link.png" className="h-8" />
                  <img src="Images/icons/Item → Link-1.png" className="h-8" />
                  <img src="Images/icons/Item → Link-2.png" className="h-8" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      <SuggestedCourses/>
        </div>
    )
}