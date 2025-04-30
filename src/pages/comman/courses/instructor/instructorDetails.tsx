

import { useState } from "react";
import { Facebook, Linkedin, Share2, Star, Twitter, User } from "lucide-react";
import InstructorCourses from "./courses";

export default function InstructorDetails() {
  const [instructor] = useState({
    name: "Edward Narton",
    role: "Developer and Teacher",
    students: 20,
    ratings: 720,
    ratingValue: 5,
    location: "North Helenavile, FV77 8WS",
    email: "info@edublink.com",
    phone: "+01123564"
  });
    return (
        <div className="flex flex-col min-h-screen">
            
            <section className="gradient-header">
                <div className="container mx-auto  w-full flex justify-center">
                    <div className="text-left text-white text-4xl font-bold font-['Spartan'] leading-[50.40px]">Instructor Details</div>
                    
                </div>
            </section>

            <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="flex flex-col md:flex-row gap-20">
        {/* Left column - Profile Image */}
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <div className="rounded-full overflow-hidden w-[330px] h-[330px] mb-6">
            <img 
              src="Images/users/team-18.jpg.jpg" 
              alt="Edward Narton" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex gap-3 items-center justify-center mt-4">
            <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50">
              <Share2 size={18} />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50">
              <Facebook size={18} />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50">
              <Twitter size={18} />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 text-gray-500 hover:bg-gray-50">
              <Linkedin size={18} />
            </button>
          </div>
        </div>
        
        {/* Right column - Instructor details */}
        <div className="w-full md:w-2/3">
          <div className="mb-12">
            <div className="text-primary text-[15px] font-medium font-['Poppins'] leading-[15px] mb-4">INSTRUCTOR</div>
            <h1 className="text-[#181818] text-[28px] font-bold font-['Spartan'] leading-7 mb-2">{instructor.name}</h1>
            <p className="text-[#808080] text-[15px] font-normal font-['Poppins'] leading-relaxed mb-4">{instructor.role}</p>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <User size={18} className="text-gray-500" />
                <span className="text-[#181818] text-[12px] md:text-[15px] font-normal font-['Poppins'] leading-relaxed">{instructor.students} Students</span>
              </div>
              
              <div className="flex items-center gap-1">
                {[...Array(instructor.ratingValue)].map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                ))}
                <span className=" text-[#181818] text-[12px] md:text-sm font-medium font-['Poppins'] leading-[14px] ml-1">({instructor.ratings} Ratings)</span>
              </div>
            </div>
          </div>
          
          {/* About Me Section */}
          <div className="mb-12">
            <h2 className="details-title mb-4">About Me</h2>
            <p className="details-description mb-4">
              Lorem ipsum dolor sit amet, consectetur elit sed do eius mod tempor incidid labore dolore magna
              aliqua. enim ad minim eniam quis nostrud exercitation ullamco laboris nisi aliquip ex commodo
              consequat. duis aute irure dolor in repreed ut perspiciatis unde omnis iste natus error sit voluptat em
              acus antium.
            </p>
            <p className="details-description">
              doloremque laudantium totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
              arch itecto beatae vitae dicta sunt explicabo.
            </p>
          </div>
          
          {/* Contact Information */}
          <div>
            <h2 className="details-title mb-4">Contact Me</h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                <span className="text-[#181818] text-[15px] font-semibold font-['Spartan'] leading-9">Address:</span>
                <span className="text-[#808080] text-[15px] font-normal font-['Poppins'] leading-9">{instructor.location}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#181818] text-[15px] font-semibold font-['Spartan'] leading-9">Email:</span>
                <span className="text-[#808080] text-[15px] font-normal font-['Poppins'] leading-9">{instructor.email}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#181818] text-[15px] font-semibold font-['Spartan'] leading-9">Phone:</span>
                <span className="text-[#808080] text-[15px] font-normal font-['Poppins'] leading-9">{instructor.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      <InstructorCourses/>
        </div>
    )
}