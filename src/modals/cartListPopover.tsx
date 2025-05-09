import { ShoppingCart } from "lucide-react";
import { HoverCard,  HoverCardContent, HoverCardTrigger } from "../components/ui/hover-card";

export const MyCartMenu: React.FC = () => {
    return (

              <HoverCard>
              <HoverCardTrigger>
              <div className="ml-4 relative">
                          <button className="relative">
                              <ShoppingCart />
                          </button>
                      </div>
              </HoverCardTrigger>
              <HoverCardContent className="grid w-[500px] gap-2 p-4 md:grid-cols-1 bg-white rounded-lg shadow-xl p-4">
      {mycartlist.map((course, idx) => (
        <div
          key={idx}
          className="flex items-start gap-4 p-4 border-b border-gray-200 bg-white"
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
          <div>
              
              <div className="text-[15px] font-medium font-['Kumbh_Sans'] leading-[30px] text-primary mt-1">
                {course.price}
              </div>
            </div>
        </div>
      ))}
              </HoverCardContent>
            </HoverCard>
    );
  };
  
  const mycartlist = [
      {
        title: 'Design Course',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam placerat ac augue ac sagittis.',
        imageUrl: 'Images/courses/Rectangle 24.png',
        price: '₹186,99',
      },
      {
        title: 'Design Course',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam placerat ac augue ac sagittis.',
        imageUrl: 'Images/courses/Rectangle 24.png',
        price: '₹186,99',
      },
      {
        title: 'Design Course',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam placerat ac augue ac sagittis.',
        imageUrl: 'Images/courses/Rectangle 24.png',
        price: '₹186,99',
      },
    ];

    