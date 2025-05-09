
import { HoverCard,  HoverCardContent, HoverCardTrigger } from "../components/ui/hover-card";

export const ProfileMenu: React.FC = () => {
    return (

              <HoverCard>
              <HoverCardTrigger>
              <div className="ml-4">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
                            MA
                        </div>
                    </div>
              </HoverCardTrigger>
              <HoverCardContent className="hover-card">
              <div className=" text-[#677489] text-sm font-medium font-['Urbanist'] uppercase leading-[21px]">Lorem ipsum dolor sit amet</div>
      {profilemenuList.map((course, idx) => (
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
            </div>
        </div>
      ))}
              </HoverCardContent>
            </HoverCard>
    );
  };
  
  const profilemenuList = [
      {
        title: 'Lorem Ipsum',
        description: 'Lorem ipsum dolor sit amet',
        imageUrl: 'Images/icons/menu-icons/Vector.png',
      },
      {
        title: 'Lorem Ipsum',
        description: 'Lorem ipsum dolor sit amet',
        imageUrl: 'Images/icons/menu-icons/Vector.png',
      },
      {
        title: 'Lorem Ipsum',
        description: 'Lorem ipsum dolor sit amet',
        imageUrl: 'Images/icons/menu-icons/Vector.png',
      },
    ];

    