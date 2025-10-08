import { BarChart3, BellIcon, Calendar, CheckCircle2Icon, FileText, GraduationCap, LayoutGrid, Menu, PlayCircle, Search, Settings, ShoppingCart, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "../components/ui/navigation-menu";
import { cn } from "../lib/utils";
import React, { useEffect, useMemo, useState } from "react";
import { MyCartMenu } from "../modals/cartListPopover";
import SearchWithPopup from "../modals/searchListModal";
import { ProfileMenu } from "../modals/profileHoverCard";
import { useCountdown } from "../utils/countdown_subscribtion";
import NotificationsDialog from "../modals/notifications";
import { useAuth } from '../context/AuthContext';
import { getCategories, getSubCategories } from "../utils/firebaseCategory";
import { LearnerCourse, learnerService } from "../utils/learnerService";
import { getUserActiveSubscription, Subscription } from "../utils/subscriptionService";

type HeaderProps = {
    onMenuClick: () => void;
  };

function Header({ onMenuClick }: HeaderProps) {
  const [isSearchPopupOpen, setSearchPopupIsOpen] = useState(false);
  const advertiseBanner = document.querySelectorAll('#advertisebanner')[0] as HTMLElement | null;
  const headerStyle = advertiseBanner ? { top: advertiseBanner.offsetHeight } : { top: 0 };
  const isLearnerPath = window.location.hash.includes("learner");
  const isHomePath = window.location.pathname === '/';
const subscriptionEndTimestamp = useMemo(() => {
  return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).getTime();
}, []);

const countdown = useCountdown(subscriptionEndTimestamp);
const { user } = useAuth();
const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const isAuthenticated = !!user || !!token;
const [activePlan, setActivePlan] = useState<Subscription | null>(null);


useEffect(() => {
  

  const getSubcription= async () => {
  if (user) {
    const data = getUserActiveSubscription(user.email||user.uid);
    data.then((sub) => {
      setActivePlan(sub);
    });
  }
};
  getSubcription();

}, [user]);

  return (
    <header className={`${headerStyle} "sticky z-52 bg-white shadow-sm"`}>
      <div className="flex items-center justify-between p-2 space-x-1 cursor-pointer md:hidden">
              <button onClick={onMenuClick}>
          <Menu className="text-primary" />
        </button>
        <div className="flex items-center space-x-1 cursor-pointer" onClick={() => window.location.href = '/#'}>
          <img src="Logos/brand-icon.png" alt="Logo" className="h-[36px] w-[38px]" />
          <img src="Logos/brand-name-img.png" alt="Logo" className="h-[15px] w-[170px] mt-1" />
        </div>
        
        <div className="flex items-center gap-2">
        <Search size={22} />
<MyCartMenu />
{/* <div className="relative">
  <button className="relative">
    <BellIcon size={22}/>
  </button>
</div>
<ProfileMenu /> */}
{!isAuthenticated && (
  <>
    <Button
      variant="outline"
      className="border-primary text-primary rounded-none px-2 py-1 text-xs font-medium hover:bg-blue-50"
      onClick={() => window.location.href = '/#/login'}
    >
      Sign In
    </Button>
    <Button
      className="px-2 py-1 text-xs rounded-none font-medium text-white hover:bg-blue-700"
      onClick={() => window.location.href = '/#/sign-up'}
    >
      Sign Up
    </Button>
  </>
)}
{isAuthenticated && (
  <>
    <NotificationsDialog />
    <ProfileMenu />
  </>
)}
</div>
    </div>
      <div className="hidden md:flex mx-auto px-5 py-4 gap-12 items-center justify-between">
        <div className="flex items-center space-x-1 cursor-pointer" onClick={() => window.location.href = '/#'}>
          <img src="Logos/brand-icon.png" alt="Logo" className="h-[36px] w-[48px]" />
          <img src="Logos/brand-name-img.png" alt="Logo" className="h-[18px] w-[181px] mt-1" />
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-base font-semibold font-['Barlow'] capitalize leading-relaxed">
          <a href="#" className={`font-medium ${window.location.pathname === '/' ? 'text-primary' : 'text-[#000927]'} hover:text-blue-600`}>Home</a>

          <MainNavigationMenu />
          <a href="#/pricing" className="font-medium text-[#000927] hover:text-blue-600">Pricing Plan</a>
          {isAuthenticated && (
            <a href="#/instructor/course-test-selection" className="font-medium text-[#000927] hover:text-blue-600">Teach With Us</a>
          )}
        </nav>
        

        <div className="hidden md:block relative flex-grow">
          {/* <Search className="absolute top-1/4 left-4" size={22} />
                    <input type="text" placeholder="Search Something Here" className="bg-neutral-100 border-none rounded-[27px] w-full pl-12 py-2"
                     onClick={()=> setSearchPopupIsOpen(true)} /> */}
          <SearchWithPopup />
        </div>

        <Search className="flex md:hidden" size={22} />

        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? null : (
            <>
              <Button
                variant="outline"
                className="hidden border-primary text-primary rounded-none md:block px-4 py-2 text-sm font-medium hover:bg-blue-50"
                onClick={() => window.location.href = '/#/login'}
              >
                Sign In
              </Button>
              <Button
                className="px-4 py-2 text-sm rounded-none font-medium text-white hover:bg-blue-700"
                onClick={() => window.location.href = '/#/sign-up'}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
        {isAuthenticated && (
          <div className="flex items-center space-x-2">
            {activePlan && (
    <div className="hidden md:flex flex-col items-center px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700">
      <span className="mr-2"> {activePlan.planName}</span>
      <span className="text-gray-600">
        valid till {activePlan.endDate.toDateString()}
      </span>
    </div>
  )}
          <div className="flex items-center">
            <MyCartMenu />
            <NotificationsDialog/>
            <ProfileMenu />
          </div>
          </div>
        )}

      </div>
      {/* <SearchWithPopup open={isSearchPopupOpen} setOpen={setSearchPopupIsOpen}/> */}
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
    </li>
  )
})
ListItem.displayName = "ListItem"

export default Header;





// Base interface for all menu items
interface BaseMenuItem {
  title: string;
  href: string;
}

// Interface for menu items with icons
interface IconMenuItem extends BaseMenuItem {
  icon: React.ReactNode;
  description?: string;
  image?: string;
}

// Interface for menu items with children
interface MenuItemWithChildren extends BaseMenuItem {
  description?: string;
  children?: IconMenuItem[];
}

// Interface for section headings
interface SectionHeading {
  title: string;
  items: IconMenuItem[];
}

// Course menu items
// const courseMenuItems: SectionHeading[] = [
//   {
//     title: "Design",
//     items: [
//       {
//         title: "UI UX",
//         href: "/#/courselist",
//         icon: <BarChart3 className="h-5 w-5 text-primary" />,
//         description: "Lorem ipsum dolor sit amet",
//       },
//       {
//         title: "Web Design",
//         href: "/#/courselist",
//         icon: <PlayCircle className="h-5 w-5 text-primary" />,
//         description: "Lorem ipsum dolor sit amet",
//       },
//       {
//         title: "Photoshop",
//         href: "/#/courselist",
//         icon: <LayoutGrid className="h-5 w-5 text-primary" />,
//         description: "Lorem ipsum dolor sit amet",
//       },
//       {
//         title: "Figma",
//         href: "/#/courselist",
//         icon: <User className="h-5 w-5 text-primary" />,
//         description: "Lorem ipsum dolor sit amet",
//       },
//       {
//         title: "Adobe",
//         href: "/#/courselist",
//         icon: <Calendar className="h-5 w-5 text-primary" />,
//         description: "Lorem ipsum dolor sit amet",
//       },
//       {
//         title: "Game Design",
//         href: "/#/courselist",
//         icon: <GraduationCap className="h-5 w-5 text-primary" />,
//         description: "Lorem ipsum dolor sit amet",
//       },
//     ],
//   },
//   {
//     title: "DEVELOPMENT",
//     items: [
//       {
//         title: "Web Development",
//         href: "/#/courselist",
//         icon: <Settings className="h-5 w-5 text-primary" />,
//         description: "Lorem ipsum dolor sit amet",
//       },
//       {
//         title: "App Development",
//         href: "/#/courselist",
//         icon: <FileText className="h-5 w-5 text-primary" />,
//         description: "Lorem ipsum dolor sit amet",
//       },
//       {
//         title: "Programming",
//         href: "/#/courselist",
//         icon: <LayoutGrid className="h-5 w-5 text-primary" />,
//         description: "Lorem ipsum dolor sit amet",
//       },
//     ],
//   },
//   {
//     title: "ALWAYS IMPROVING",
//     items: [
//       {
//         image: 'Images/courses/Illustration Components.png',
//         icon: undefined,
//         title: "",
//         href: ""
//       },
//       {
//         title: "Lorem ipsum dolor sit amet",
//         href: "/#/courselist",
//         icon: <CheckCircle2Icon className="h-5 w-5 text-primary" />,
//       },
//       {
//         title: "Lorem ipsum dolor sit amet",
//         href: "/#/courselist",
//         icon: <CheckCircle2Icon className="h-5 w-5 text-primary" />,
//       },
//     ],
//   },
// ];


// List Item component for courses
const CourseListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
CourseListItem.displayName = "CourseListItem";

// List Item component with icons
const IconListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon: React.ReactNode; image?: string }
>(({ className, title, children, image, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "flex items-start gap-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 focus:bg-accent focus:text-accent-foreground w-full",
            className
          )}
          {...props}
        >
          <div className="flex-shrink-0 mt-1">{icon}</div>
          <div className="w-auto h-38 relative rounded-xl overflow-hidden">
            {image && <img src={image} />}
          </div>
          <div>
            {!title?<p className="text-[#677489] text-sm font-medium leading-snug text-muted-foreground mt-1">
              No Courses Available
            </p>:
            <div className="text-sm font-medium leading-none">{title}</div>}
            {/* <p className="text-[#677489] text-sm font-medium leading-snug text-muted-foreground mt-1">
              {children}
            </p> */}
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
IconListItem.displayName = "IconListItem";

// Courses Navigation Menu Component
export const CoursesMenu: React.FC = () => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [subCategories, setSubCategories] = useState<
    { id: string; name: string; categoryId: string }[]
  >([]);

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data.map((cat: any) => ({ id: cat.id, name: cat.name ?? "" })));
    });
    getSubCategories().then((data) => {
      setSubCategories(
        data.map((sub: any) => ({
          id: sub.id,
          name: sub.name ?? "",
          categoryId: sub.categoryId ?? "",
        }))
      );
    });
  }, []);

  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="p-0 text-base font-semibold font-['Barlow'] capitalize leading-relaxed bg-transparent font-medium text-[#000927] hover:text-blue-600 hover:text-primary hover:bg-transparent focus:bg-transparent">
        Courses
      </NavigationMenuTrigger>
      <NavigationMenuContent className="bg-white shadow-lg rounded-md w-full">
        <div className="grid w-[400px] gap-6 p-6 md:w-[600px] md:grid-cols-2">
          {/* Loop through categories */}
          {categories.map((category) => {
            const relatedSubs = subCategories.filter(
              (sub) => sub.categoryId === category.id
            );

            return (
              <div key={category.id} className="col-span-1 space-y-6">
                <div className="text-[#677489] text-xs font-medium font-['Urbanist'] uppercase leading-[21px] mb-3">
                  {category.name}
                </div>
                <ul className="space-y-1">
                  {relatedSubs.map((sub) => (
                    <IconListItem
                      key={sub.id}
                      title={sub.name}
                      href={`#/courselist/${category.id}`} // 🔑 update route as needed
                      icon={null} // or your icon
                      //image={null} // if you have images
                    >
                      {sub.name}
                    </IconListItem>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
};


// My Learnings Navigation Menu Component
export const MyLearningsMenu: React.FC = () => {
    const [courses, setCourses] = useState<LearnerCourse[]>([]);
      const { user } = useAuth();
    
      useEffect(() => {
        const fetchLearnerData = async () => {
          
          if (!user?.uid) {
            console.log('❌ No user UID found, returning early');
            return;
          }
          
          //setLoading(true);
          try {
            // Get email directly from localStorage since that's what the service expects
            const userData = localStorage.getItem('key');
            let userEmail = user.email || '';
            
            if (userData) {
              try {
                const parsedUser = JSON.parse(userData);
                userEmail = parsedUser.UserName || user.email || '';
              } catch (e) {
                console.log('Could not parse user data from localStorage');
              }
            }
            
            if (!userEmail) {
              console.error('❌ No valid email found');
              return;
            }
            
            const learningCourses = await 
              learnerService.getMyLearnings(userEmail);
            
            setCourses(learningCourses);
          } catch (error) {
            console.error('❌ Error fetching learner data:', error);
          } finally {
            //setLoading(false);
          }
        };
    
        fetchLearnerData();
      }, [user]);
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="p-0 bg-transparent font-medium text-base font-medium text-[#000927] font-['Barlow'] capitalize leading-relaxed text-[#000927] hover:text-primary hover:bg-transparent focus:bg-transparent">
        My Learnings
      </NavigationMenuTrigger>

      {courses.length?<NavigationMenuContent className="grid w-[400px] gap-2 p-4 md:w-[4] md:grid-cols-1 bg-white rounded-lg shadow-xl p-4">
        {courses.map((course, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 p-4 border-b border-gray-200 bg-white cursor-pointer hover:opacity-50"
            onClick={()=>{window.location.hash = '#/learner/my-learnings'}}
          >
            <img
              src={course.image}
              alt={course.title}
              className="w-24 h-16 object-cover rounded-md"
            />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">{course.title}</h3>
              <p className="text-[#1e1e1e] text-xs font-medium font-['Nunito'] mt-1 line-clamp-2">
                {course.description}
              </p>

              <div className="mt-3">
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute top-0 left-0 h-2 bg-primary rounded-full"
                    style={{ width: `${course?.completionPercentage}%` }}
                  >

                  </div>
                </div>
                <div className="text-right text-xs font-semibold text-primary mt-1">
                  {course?.progress}% Completed
                </div>
              </div>
            </div>
          </div>
        ))}
      </NavigationMenuContent>:<NavigationMenuContent className="bg-white rounded-lg shadow-xl p-4"><div className="w-full text-gray-500 text-center">No Enrollments Found</div>
      <Button variant={'link'}>Browse Courses</Button></NavigationMenuContent>}
    </NavigationMenuItem>
  );
};







// Combined navigation menu component for easy import
export const MainNavigationMenu: React.FC = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList className="hidden md:flex items-center space-x-6 text-base font-semibold font-['Barlow'] capitalize leading-relaxed">
        <CoursesMenu />
        <MyLearningsMenu />
      </NavigationMenuList>
    </NavigationMenu>
  );
};