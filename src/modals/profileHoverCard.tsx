import { useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../components/ui/hover-card";
import { BarChart3, LayoutGrid, User, Settings, FileText } from "lucide-react";

const profileMenuList = [
  {
    title: "Profile",
    description: "Learner's Profile",
    icon: <User className="w-6 h-6 text-orange-500" />,
    path: "/#/learner/profile/public-profile",
  },
  {
    title: "Terms",
    description: "View terms and conditions",
    icon: <FileText className="w-6 h-6 text-orange-500" />,
    path: "/#/terms-of-use",
  },

  {
    title: "Privacy Policy",
    description: "Read our privacy policy",
    icon: <FileText className="w-6 h-6 text-orange-500" />,
    path: "/#/privacy-policy",
  },
  {
    title: "Refund Policy",
    description: "Read our privacy policy",
    icon: <FileText className="w-6 h-6 text-orange-500" />,
    path: "/#/refund-policy",
  },
  {
    title: "Analytics",
    description: "Your analytics dashboard",
    icon: <BarChart3 className="w-6 h-6 text-orange-500" />,
    path: "/#/learner/analytics",
  },
  {
    title: "Courses",
    description: "View all enrolled courses",
    icon: <LayoutGrid className="w-6 h-6 text-orange-500" />,
    path: "#/learner/my-learnings",
  },
  {
    title: "Settings",
    description: "Manage your account settings",
    icon: <Settings className="w-6 h-6 text-orange-500" />,
    path: "/#/learner/settings",
  },

];

export const ProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (path: string) => {
    setIsOpen(false); // close popover
    setTimeout(() => {
      window.location.href = path;
    }, 100); // slight delay for smoother UX
  };

  return (
    <HoverCard open={isOpen} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>
        <div className="ml-0 md:ml-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="w-7 md:w-10 h-7 md:h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
            MA
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="hover-card bg-white rounded-2xl shadow-xl p-6 w-96">
        <div className="flex flex-col gap-2">
          {profileMenuList.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleItemClick(item.path)}
              className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
            >
              <div>{item.icon}</div>
              <div>
                <div className="font-semibold text-lg text-[#1e1e1e]">{item.title}</div>
                <div className="text-[#677489] text-sm font-medium">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
