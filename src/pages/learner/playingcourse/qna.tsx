
import { User } from "lucide-react";
import { useState } from "react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

export default function QNA() {

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

  const [reviews] = useState([
    {
      id: 1,
      name: "Armen Sargsyan",
      initial: "A",
      rating: 5,
      timeAgo: "2 Months Ago",
      comment: "Great, your Doing Nice"
    },
    {
      id: 2,
      name: "Armen Sargsyan",
      initial: "A",
      rating: 5,
      timeAgo: "2 Months Ago",
      comment: "Great"
    },
    {
      id: 3,
      name: "Armen Sargsyan",
      initial: "A",
      rating: 5,
      timeAgo: "2 Months Ago",
      comment: "Great"
    }
  ]);

  return (
    <div className="w-full mx-auto">
       <div className="mb-12">
      
      <h1 className="text-xl font-semibold text-primary mt-4 hover:underline cursor-pointer" onClick={()=>{window.location.href = '/#/instructorDetails'}}>{instructor.name}</h1>
      <p className="text-[#808080] text-[15px] font-normal font-['Poppins'] leading-relaxed mb-4">posted an announcement : 5 years ago</p>
      <h2 className="details-title mb-4">Why practical project based online courses are gold?</h2>
      <p className="details-description mb-4">
  You know I am bursting out with positive energy so I decided why not share this with all the great people out there. So I wrote a Medium Post titled Why we should take practical project based online courses?
      </p>
      <p className="details-description">
        ... you know what you should do. Repeat that course 3 times. No kidding. Programming tutorials are not like movies, you watch it once you got the story. It’s different. You do it the second time, it becomes so much clearer and easier to understand. You do it the third time, you are confident enough to try things a bit differently on your own. Afterwards, you will build a completely different project while keeping the source code aside and taking only the bits you want. You will write the rest on your own ...
      </p>
    </div>
    <div className="flex justify-between items-center mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-800 text-white flex items-center justify-center text-3xl mb-1 font-normal mr-4">
                  B
                </div>
        <Input placeholder="Please Enter Your Comment" className="w-[80%]"/>
        <Button className="ml-4">Submit</Button>
    </div>
      <div className="space-y-5">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-blue-800 text-white flex items-center justify-center text-3xl mb-1 font-normal mr-4">
                  {review.initial}
                </div>
                <div>
                  <h3 className="text-black text-[15px] font-medium font-['Poppins'] mb-2">{review.name}</h3>
                  {/* <div className="flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <img src="Images/icons/Container (6).png" className="h-4 w-4" alt="Star" key={i} />
                       
                    ))}
                  </div> */}
                </div>
              </div>
              <span className="text-[#676767] text-xs font-medium font-['Poppins']">{review.timeAgo}</span>
            </div>
            
            <p className="text-[#3d3d3d] text-sm font-normal font-['Poppins'] mt-3">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}