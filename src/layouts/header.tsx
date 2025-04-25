import { Button } from "../components/ui/button";

function Header() {
    const advertiseBanner = document.getElementById('advertisebanner');
    const headerStyle = advertiseBanner ? { top: advertiseBanner.offsetHeight } : { top: 0 };
    return (
        <header className={`${headerStyle} "sticky z-52 bg-white shadow-sm"`}>
        <div className="container mx-auto px-2 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-1">
          <img src="Logos/brand-icon.png" alt="Logo" className="h-[36px] w-[48px]" />
            <img src="Logos/brand-name-img.png" alt="Logo" className="h-[15px] w-[181px] mt-1" />
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="font-medium text-gray-900 hover:text-blue-600">Home</a>
            <a href="#" className="font-medium text-gray-500 hover:text-blue-600">Courses</a>
            <a href="#" className="font-medium text-gray-500 hover:text-blue-600">Teachers</a>
            <a href="#" className="font-medium text-gray-500 hover:text-blue-600">Pricing</a>
            <a href="#" className="font-medium text-gray-500 hover:text-blue-600">Blog</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant={'outline'} className="hidden border-primary text-primary rounded-none md:block px-4 py-2 text-sm font-medium hover:bg-blue-50">Log In</Button>
            <Button className="px-4 py-2 text-sm rounded-none font-medium text-white hover:bg-blue-700">Sign Up</Button>
          </div>
        </div>
      </header>
    );
  }
  
  export default Header;