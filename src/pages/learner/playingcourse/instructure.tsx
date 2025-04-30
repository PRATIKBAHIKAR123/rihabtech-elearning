import { Star, User } from "lucide-react";
import { useState } from "react";

export default function Instructor() {
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
    <div className="w-full">
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
  );
}