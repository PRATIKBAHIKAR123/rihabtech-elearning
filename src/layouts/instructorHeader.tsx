
import { BellIcon, Menu } from "lucide-react";
import { Button } from "../components/ui/button";

type InstructorHeaderProps = {
    onMenuClick: () => void;
  };

function InstructorHeader({ onMenuClick }: InstructorHeaderProps) {


    return (
        <header className={` "top-0 sticky z-52 bg-primary md:bg-white shadow-sm"`}>
              <div className="flex items-center p-2 space-x-1 cursor-pointer md:hidden">
              <button onClick={onMenuClick}>
          <Menu className="text-white" />
        </button>
    </div>
            <div className="hidden mx-auto px-10 py-4 gap-16 md:flex items-center justify-between">
                <div className="flex items-center space-x-1 cursor-pointer" onClick={() => window.location.href = '/#'}>
                    <img src="Logos/brand-icon.png" alt="Logo" className="h-[36px] w-[48px]" />
                    <img src="Logos/brand-name-img.png" alt="Logo" className="h-[15px] w-[181px] mt-1" />
                </div>

                <div className="flex items-center">
                    <Button className="px-4 py-2 text-sm rounded-none font-medium text-white hover:opacity-50" onClick={() => window.location.href = '/#/learner/homepage'}>Student</Button>
                    <div className="ml-4 relative">
                        <button className="relative">
                            <BellIcon />
                        </button>
                    </div>
                    <div className="ml-4">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
                            MA
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}


export default InstructorHeader;