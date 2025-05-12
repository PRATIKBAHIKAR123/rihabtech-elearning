import { HoverCard, HoverCardContent, HoverCardTrigger } from "../components/ui/hover-card";
import { BarChart3, LayoutGrid, User, Settings, FileText, Shield, Lock } from "lucide-react";

const profileMenuList = [
  {
    title: "Profile",
    description: "Lerners Profile",
    icon: <User className="w-6 h-6 text-orange-500" />,
  },
  {
    title: "Lorem Ipsum",
    description: "Lorem ipsum dolor sit amet",
    icon: <BarChart3 className="w-6 h-6 text-orange-500" />,
  },
  {
    title: "Lorem Ipsum",
    description: "Lorem ipsum dolor sit amet",
    icon: <LayoutGrid className="w-6 h-6 text-orange-500" />,
  },
  
  {
    title: "Lorem Ipsum",
    description: "Lorem ipsum dolor sit amet",
    icon: <Settings className="w-6 h-6 text-orange-500" />,
  },
  {
    title: "Lorem Ipsum",
    description: "Lorem ipsum dolor sit amet",
    icon: <FileText className="w-6 h-6 text-orange-500" />,
  },
  {
    title: "Lorem Ipsum",
    description: "Lorem ipsum dolor sit amet",
    icon: <FileText className="w-6 h-6 text-orange-500" />,
  },
  
];

export const ProfileMenu: React.FC = () => {
  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className="ml-4 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
            MA
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="hover-card bg-white rounded-2xl shadow-xl p-6 w-96">
        {/* <div className="text-[#677489] text-sm font-medium font-['Urbanist'] uppercase leading-[21px] mb-4">
          LOREM IPSUM DOLOR SIT AMET
        </div> */}
        <div className="flex flex-col gap-2">
          {profileMenuList.map((item, idx) => {
            if (idx === 0) {
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => window.location.href = '/#/learner/profile/public-profile'}
                >
                  <div>{item.icon}</div>
                  <div>
                    <div className="font-semibold text-lg text-[#1e1e1e]">{item.title}</div>
                    <div className="text-[#677489] text-sm font-medium">{item.description}</div>
                  </div>
                </div>
              );
            }
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                <div>{item.icon}</div>
                <div>
                  <div className="font-semibold text-lg text-[#1e1e1e]">{item.title}</div>
                  <div className="text-[#677489] text-sm font-medium">{item.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

    