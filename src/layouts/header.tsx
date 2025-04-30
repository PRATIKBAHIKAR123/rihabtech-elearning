import { Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "../components/ui/navigation-menu";
import { cn } from "../lib/utils";
import React from "react";

function Header() {
    const advertiseBanner = document.querySelectorAll('#advertisebanner')[0] as HTMLElement | null;
    const headerStyle = advertiseBanner ? { top: advertiseBanner.offsetHeight } : { top: 0 };
    const components: { title: string; href: string; description: string }[] = [
        {
            title: "Digital Marketing",
            href: "/#/courselist",
            description:
                "A digital marketing course that covers the fundamentals of online marketing, including SEO, social media, and email marketing.",
        },
        {
            title: "UI UX Design",
            href: "/#/courselist",
            description:
                "UI UX design course that teaches the principles of user interface and user experience design, including wireframing, prototyping, and usability testing.",
        },
        {
            title: "Mobile App Development",
            href: "/#/courselist",
            description:
                "A mobile app development course that teaches the fundamentals of building mobile applications for iOS and Android.",
        },
        {
            title: "Animation",
            href: "/#/courselist",
            description:
                "UI UX design course that teaches the principles of user interface and user experience design, including wireframing, prototyping, and usability testing.",
        },
        {
            title: "Graphic Design",
            href: "/#/courselist",
            description:
                "A graphic design course that teaches the principles of design, including typography, color theory, and layout.",
        },
        {
            title: "Photography",
            href: "/#/courselist",
            description:
                "A photography course that covers the basics of composition, lighting, and editing.",
        },
    ]

    // console.log(document.querySelectorAll('#advertisebanner')[0], "advertiseBanner.offsetHeight")
    // console.log(headerStyle, "headerStyle")

    return (
        <header className={`${headerStyle} "sticky z-52 bg-white shadow-sm"`}>
            <div className="mx-auto px-10 py-4 gap-16 flex items-center justify-between">
                <div className="flex items-center space-x-1 cursor-pointer" onClick={() => window.location.href = '/#'}>
                    <img src="Logos/brand-icon.png" alt="Logo" className="h-[36px] w-[48px]" />
                    <img src="Logos/brand-name-img.png" alt="Logo" className="h-[15px] w-[181px] mt-1" />
                </div>

                <nav className="hidden md:flex items-center space-x-6 text-base font-semibold font-['Barlow'] capitalize leading-relaxed">
                    <a href="#" className={`font-medium ${window.location.pathname === '/' ? 'text-primary' : 'text-[#000927]'} hover:text-blue-600`}>Home</a>

                    <NavigationMenu >
                        <NavigationMenuList className="hidden md:flex items-center space-x-6 text-base font-semibold font-['Barlow'] capitalize leading-relaxed">
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="p-0 bg-transparent font-medium text-[#000927] hover:text-blue-600 hover:bg-transparent focus:bg-transparent">Courses</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-3 lg:w-[600px] ">
                                        {components.map((component) => (
                                            <ListItem
                                                key={component.title}
                                                title={component.title}
                                                href={component.href}
                                            >
                                                {/* {component.description} */}
                                            </ListItem>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                           {window.location.hash === '#/learner/homepage' && <NavigationMenuItem>
                             <NavigationMenuTrigger className="p-0 bg-transparent font-medium text-[#000927] hover:text-blue-600 hover:bg-transparent focus:bg-transparent">My Learnings</NavigationMenuTrigger>
                                
                            </NavigationMenuItem>}
                        </NavigationMenuList>
                    </NavigationMenu>
                    <a href="#/pricing" className="font-medium text-[#000927] hover:text-blue-600">Pricing Plan</a>
                    <a href="#" className="font-medium text-[#000927] hover:text-blue-600">Teach With Us</a>
                </nav>

                <div className="hidden md:block relative flex-grow">
                    <Search className="absolute top-1/4 left-4" size={22} />
                    <input type="text" placeholder="Search Something Here" className="bg-neutral-100 border-none rounded-[27px] w-full pl-12 py-2" />
                </div>

                <Search className="flex md:hidden" size={22} />

                <div className="hidden md:flex items-center space-x-4">
                    <Button variant={'outline'} className="hidden border-primary text-primary rounded-none md:block px-4 py-2 text-sm font-medium hover:bg-blue-50" onClick={() => window.location.href = '/#/login'}>Sign In</Button>
                    <Button className="px-4 py-2 text-sm rounded-none font-medium text-white hover:bg-blue-700" onClick={() => window.location.href = '/#/sign-up'}>Sign Up</Button>
                    {/* <Button className="px-4 py-2 text-sm rounded-none font-medium text-white hover:bg-blue-700" onClick={() => window.location.href = '/#/sign-up'}>Teach With Us</Button> */}
                </div>
            </div>
        </header>
    );
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-transparent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
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
    )
})
ListItem.displayName = "ListItem"

export default Header;