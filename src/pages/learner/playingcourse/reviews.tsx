import { Star } from "lucide-react";
import { useState } from "react";

export default function CourseReviews() {
  const [reviews] = useState([
    {
      id: 1,
      name: "Armen Sargsyan",
      initial: "A",
      rating: 5,
      timeAgo: "2 Months Ago",
      comment: "This course is very helpfull and nice. From this course I learn many different kind tools use. I am happy to learn this course."
    },
    {
      id: 2,
      name: "Armen Sargsyan",
      initial: "A",
      rating: 5,
      timeAgo: "2 Months Ago",
      comment: "This course is very helpfull and nice. From this course I learn many different kind tools use. I am happy to learn this course."
    },
    {
      id: 3,
      name: "Armen Sargsyan",
      initial: "A",
      rating: 5,
      timeAgo: "2 Months Ago",
      comment: "This course is very helpfull and nice. From this course I learn many different kind tools use. I am happy to learn this course."
    }
  ]);

  return (
    <div className="w-full mx-auto">
      
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-blue-800 text-white flex items-center justify-center text-3xl mb-1 font-normal mr-4">
                  {review.initial}
                </div>
                <div>
                  <h3 className="text-black text-[15px] font-medium font-['Poppins'] mb-2">{review.name}</h3>
                  <div className="flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <img src="Images/icons/Container (6).png" className="h-4 w-4" alt="Star" key={i} />
                       
                    ))}
                  </div>
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