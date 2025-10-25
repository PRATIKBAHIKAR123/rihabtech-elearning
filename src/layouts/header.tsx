import { Menu, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "../components/ui/navigation-menu";
import { cn } from "../lib/utils";
import React, { useEffect, useState, useRef } from "react";
import { MyCartMenu } from "../modals/cartListPopover";
import SearchWithPopup from "../modals/searchListModal";
import { ProfileMenu } from "../modals/profileHoverCard";
import NotificationsDialog from "../modals/notifications";
import { useAuth } from '../context/AuthContext';
import { courseApiService, Category, SubCategory } from "../utils/courseApiService";
import { LearnerCourse, learnerService } from "../utils/learnerService";
import { getAllUserActiveSubscriptions, Subscription } from "../utils/subscriptionService";
import { toast } from "sonner";
import { instructorApiService } from "../utils/instructorApiService";

type HeaderProps = {
  onMenuClick: () => void;
};

function Header({ onMenuClick }: HeaderProps) {
  const advertiseBanner = document.querySelectorAll('#advertisebanner')[0] as HTMLElement | null;
  const headerStyle = advertiseBanner ? { top: advertiseBanner.offsetHeight } : { top: 0 };

  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAuthenticated = !!user || !!token;
  const [activePlans, setActivePlans] = useState<Subscription[]>([]);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const planDetailsRef = useRef<HTMLDivElement>(null);

  // Function to handle Teach With Us click
  const handleTeachWithUsClick = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first to apply as instructor");
      window.location.href = '/#/login';
      return;
    }

    try {
      // Check current instructor status
      const response = await instructorApiService.getCurrentStatus();

      if (response && response.currStatus !== undefined) {
        const status = response.currStatus;

        if (status === null || status === undefined) {
          // No application found, redirect to instructor signup
          window.location.href = '/#/instructor-signup';
        } else {
          // Get status information from constants
          // const statusInfo = EN_INSTRUCTOR_STATUS.find(s => s.id === status);

          if (status === 1) {
            // Pending - already applied
            toast.info("You have already applied to become an instructor. Your application is pending review.");
            window.location.href = '/#/instructor-signup-success';
          } else if (status === 2) {
            // Approved - update user role and redirect to instructor dashboard
            const tokenData = localStorage.getItem('token');
            if (tokenData) {
              const userData = JSON.parse(tokenData);
              if (userData.Role !== 5) {
                userData.Role = 5; // Update role to instructor
                localStorage.setItem('token', JSON.stringify(userData));
              }
              //toast.success("Congratulations! Your instructor application has been approved.");
              window.location.href = '/#/instructor/course-test-selection';
            }
          } else if (status === 3) {
            // Rejected
            toast.error("Your instructor application was rejected. Please contact support for more information.");
            window.location.href = '/#/instructor-signup-success';
          } else if (status === 4) {
            // On Hold
            toast.info("Your instructor application is on hold for further review. Please wait for updates.");
            window.location.href = '/#/instructor-signup-success';
          }
        }
      }
    } catch (error: any) {
      console.error('Error checking instructor status:', error);

      // If user is already an instructor (Role = 5), redirect directly
      const tokenData = localStorage.getItem('token');
      if (tokenData) {
        const userData = JSON.parse(tokenData);
        if (userData.Role === 5) {
          window.location.href = '/#/instructor/course-test-selection';
          return;
        }
      }

      // Fallback: check if user has already applied (Firebase check)
      if (user?.UserName || user?.email) {
        window.location.href = '/#/instructor-signup';
      } else {
        toast.error("Unable to check instructor status. Please try again.");
      }
    }
  };


  useEffect(() => {
    const getSubscriptions = async () => {
      if (user) {
        try {
          const subscriptions = await getAllUserActiveSubscriptions(user.email || user.uid);
          setActivePlans(subscriptions);
        } catch (error) {
          console.error('Error fetching subscriptions:', error);
          setActivePlans([]);
        }
      }
    };
    getSubscriptions();
  }, [user]);

  // Close plan details when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (planDetailsRef.current && !planDetailsRef.current.contains(event.target as Node)) {
        setShowPlanDetails(false);
      }
    };

    if (showPlanDetails) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPlanDetails]);

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
      <div className="hidden md:flex mx-auto py-4 gap-2 items-center justify-between" style={{ maxWidth: '83rem' }}>
        <div className="flex items-center space-x-1 cursor-pointer" onClick={() => window.location.href = '/#'}>
          <img src="Logos/brand-icon.png" alt="Logo" className="h-[36px] w-[48px]" />
          <img src="Logos/brand-name-img.png" alt="Logo" className="h-[18px] w-[181px] mt-1" />
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-base font-semibold font-['Barlow'] capitalize leading-relaxed">
          <MainNavigationMenu />
          <a href="#/pricing" className="font-medium text-[#000927] hover:text-blue-600">Pricing Plan</a>
          {isAuthenticated && (
            <button onClick={handleTeachWithUsClick} className="font-medium text-[#000927] hover:text-blue-600 bg-transparent border-none cursor-pointer">Teach With Us</button>
          )}
        </nav>


        <div className="hidden md:block relative flex-grow max-w-md mx-4">
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
          <div className="flex items-center space-x-3">
            {activePlans.length > 0 && (
              <div className="hidden md:flex items-center relative" ref={planDetailsRef}>
                {/* Attractive minimal display */}
                <div
                  className="group flex items-center px-3 py-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl text-xs font-semibold text-orange-800 hover:from-orange-100 hover:to-amber-100 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300 cursor-pointer transform hover:scale-105 relative overflow-hidden"
                  onClick={() => setShowPlanDetails(!showPlanDetails)}
                >
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="truncate max-w-[140px] font-medium">
                      {activePlans.length > 1
                        ? `${activePlans[0].planName} (+${activePlans.length - 1})`
                        : activePlans[0].planName
                      }
                    </span>
                    <div className="flex items-center">
                      <span className={`text-orange-600 transition-transform duration-300 ${showPlanDetails ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>
                </div>

                {/* Beautiful expanded details */}
                {showPlanDetails && (
                  <div className="absolute top-full left-0 mt-2 px-0 py-3 bg-white border border-gray-200 rounded-2xl shadow-2xl text-xs z-50 min-w-[280px] max-h-[350px] overflow-y-auto animate-in slide-in-from-top-2 duration-300 backdrop-blur-sm">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-t-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                          <span className="font-bold text-sm">Active Plans</span>
                        </div>
                        <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-bold">
                          {activePlans.length}
                        </span>
                      </div>
                    </div>

                    {/* Plans List */}
                    <div className="px-4 py-2">
                      {activePlans.map((plan, index) => (
                        <div key={plan.id} className="group relative p-3 mb-2 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border border-gray-100 hover:from-orange-50 hover:to-amber-50 hover:border-orange-200 hover:shadow-md hover:shadow-orange-100/50 transition-all duration-300 transform hover:scale-[1.02] animate-in fade-in-0 slide-in-from-left-2" style={{ animationDelay: `${index * 100}ms` }}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="font-semibold text-gray-900 text-sm">{plan.planName}</span>
                              </div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-gray-500 text-xs font-medium">Valid till</span>
                                <span className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm hover:shadow-md hover:shadow-orange-500/25 transition-all duration-200 transform hover:scale-105 animate-pulse">
                                  {plan.endDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="text-gray-400 text-xs">
                              #{index + 1}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                      <div className="text-center">
                        <span className="text-gray-500 text-xs">Click outside to close</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center space-x-2">
              <MyCartMenu />
              <NotificationsDialog />
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
// interface BaseMenuItem {
//   title: string;
//   href: string;
// }

// Interface for menu items with icons
// interface IconMenuItem extends BaseMenuItem {
//   icon: React.ReactNode;
//   description?: string;
//   image?: string;
// }

// Interface for menu items with children
// interface MenuItemWithChildren extends BaseMenuItem {
//   description?: string;
//   children?: IconMenuItem[];
// }

// Interface for section headings
// interface SectionHeading {
//   title: string;
//   items: IconMenuItem[];
// }

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
            {image && <img src={image} alt={title || "Course image"} />}
          </div>
          <div>
            {!title ? <p className="text-[#677489] text-sm font-medium leading-snug text-muted-foreground mt-1">
              No Courses Available
            </p> :
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  useEffect(() => {
    courseApiService.getAllCategories().then((data) => {
      setCategories(data);
    });
    courseApiService.getAllSubCategories().then((data) => {
      setSubCategories(data);
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
                  {category.title}
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

      {courses.length ? <NavigationMenuContent className="grid w-[400px] gap-2 p-4 md:w-[4] md:grid-cols-1 bg-white rounded-lg shadow-xl p-4">
        {courses.map((course, idx) => (
          <div
            key={idx}
            className="flex items-start gap-4 p-4 border-b border-gray-200 bg-white cursor-pointer hover:opacity-50"
            onClick={() => { window.location.hash = '#/learner/my-learnings' }}
          >
            <img
              src={course.image}
              alt={course.title}
              className="w-24 h-16 object-cover rounded-md"
            />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">{course.title}</h3>
              <div className="text-[#1e1e1e] text-xs font-medium font-['Nunito'] mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: course.description }}>
              </div>

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
      </NavigationMenuContent> : <NavigationMenuContent className="bg-white rounded-lg shadow-xl p-4"><div className="w-full text-gray-500 text-center">No Enrollments Found</div>
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