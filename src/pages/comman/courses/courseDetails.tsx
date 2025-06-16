import { Star } from "lucide-react";
import Divider from "../../../components/ui/divider";
import { Tabs, TabsContent, TabsList, TabsTrigger,  } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import SuggestedCourses from "./courses";
import Curriculum from "./coursecurriculam";
import InstructorDetails from "./instructor/instructorShortDetails";
import CourseReviews from "../../learner/playingcourse/reviews";
import CartModal from "../../../modals/cartModal";
import React from "react";
import ReactPlayer from "react-player";

export default function CourseDetails() {
  const [isCartModalOpen, setIsCartModalOpen] = React.useState(false);
  
  const sampleCartItem = {
    id: 1,
    title: "Design Course",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam placerat ac augue ac sagittis.",
    price: 186.99,
    image: "Images/courses/Rectangle 24.png",
    students: 72,
    duration: "12 weeks"
  };
    return (
        <div className="flex flex-col min-h-screen">
            
            <section className="gradient-header">
                <div className="container mx-auto">
                    <div className="w-full md:w-1/2 text-left text-white text-lg md:text-4xl font-bold font-['Spartan'] leading -[30px] md:leading-[50.40px]">Grow Personal Financial
                    Security Thinking & Principles</div>
                    <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mt-2">
                      <div className="flex items-center gap-2">
                        <img src="Images/icons/user-laptop.png" alt="Star" className="w-4 h-4" />
                        <div 
                            className="text-white text-[15px] font-medium font-['Poppins'] leading-relaxed cursor-pointer hover:underline hover:text-gray-300 transition-all duration-200" 
                            onClick={() => { window.location.href = '/#/instructorDetails' }}
                        >
                            By Edward Narton
                            </div>
                        </div>
                        <Divider className="h-0 md:h-4 bg-white" />
                        <div className="flex items-center gap-2">
                        <img src="Images/icons/Icon (1).png" alt="Star" className="w-4 h-4" />
                        <div className="text-white text-[15px] font-medium font-['Poppins'] leading-relaxed">Motivation</div>
                        </div>
                        <Divider className="h-0 md:h-4 bg-white" />
                        <div className="flex items-center gap-2">
                        <div className="flex justify-left">
                                                {[...Array(5)].map((_, i) => (
                                                    <img src="Images/icons/Container (6).png" alt="Star" className="w-4 h-4" />
                                                ))}
                                            </div>
                        <div className="text-white text-[15px] font-medium font-['Poppins'] leading-relaxed">(2 Reviews)</div>
                        </div>
                        </div>
                </div>
            </section>

                 {/* 🔳 Tabs + Sidebar */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left: Tabs Section */}
          <div className="w-full lg:w-2/3">
            <Tabs defaultValue="overview" className="w-full custom-tabs">
              <TabsList className="custom-tabs-list overflow-x-scroll overflow-y-hidden md:overflow-x-auto">
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

              <TabsContent value="curriculum" className="py-4">
                <Curriculum/>

              </TabsContent>

              <TabsContent value="instructor" className="py-4">
              <InstructorDetails
        imageUrl="Images/users/team-18.jpg.jpg"
        name="Edward Narton, Developer and Lead Instructor"
        title="Developer and Lead Instructor"
        rating={4.7}
        reviews={958905}
        students={3143964}
        courses={7}
        shortBio="I'm Angela, a developer with a passion for teaching. I'm the lead instructor at the London App Brewery, London's leading Programming Bootcamp."
        fullBio="I'm Angela, a developer with a passion for teaching. I'm the lead instructor at the London App Brewery, London's leading Programming Bootcamp. I've helped hundreds of thousands of students learn to code and change their lives by becoming a developer. I've been invited by companies such as Twitter, Facebook and Google to teach their employees.

My first foray into programming was when I was just 12 years old, wanting to build my own Space Invader game. Since then, I've made hundreds of websites, apps and games. But most importantly, I realised that my greatest passion is teaching."
      />
              </TabsContent>

              <TabsContent value="reviews" className="py-4">
                <CourseReviews/>

              </TabsContent>

              {/* Add more <TabsContent /> blocks here for other tabs */}
            </Tabs>
          </div>

          {/* Right: Sidebar Card */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-[5px] shadow-[0px_10px_50px_0px_rgba(26,46,85,0.07)] p-4">
              <ReactPlayer controls={true} url={'/courses/video2 - Trim.mp4'} className="rounded-md mb-4 z-999"
              height={'220px'} width={'320px'}/>
              {/* <img src="Images/Banners/Background.png" className="rounded-md mb-4" /> */}
              <div className="p-4">
  <h3 className="details-title mb-4">Course Includes:</h3>
  <ul className="text-[#181818] text-[15px] font-medium font-['Spartan'] leading-relaxed space-y-3 text-left">
    <li className="flex justify-between">
      <span className="flex items-center gap-4">
        <img src="Images/icons/course-Icon.png" className="h-6" /> Price:
      </span>
      <span className="text-primary text-lg font-semibold font-['Poppins'] leading-[34.60px] font-semibold">Included in Subscription</span>
    </li>
    <hr className="w-full bg-[#E5E5E5]" />
    <li className="flex justify-between">
      <span className="flex items-center gap-4">
        <img src="Images/icons/course-Icon-1.png" className="h-6" /> Instructor:
      </span>
      <span className="text-[#181818] text-[15px] font-medium font-['Poppins'] leading-relaxed cursor-pointer" onClick={()=>{window.location.href = '/#/instructorDetails'}}>Edward Narton</span>
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

              <Button className="w-full py-6 text-sm font-normal font-['Spartan'] text-white" onClick={() => {window.location.hash = '#/pricing'}}>
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
      <CartModal 
        isOpen={isCartModalOpen}
        setIsOpen={setIsCartModalOpen}
        cartItem={sampleCartItem}
      />
        </div>
    )
}