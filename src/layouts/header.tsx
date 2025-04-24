import { Button } from "../components/ui/button";

function Header() {
    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-md"></div>
            <span className="font-bold text-lg">Rihab Logo</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="font-medium text-gray-900 hover:text-blue-600">Home</a>
            <a href="#" className="font-medium text-gray-500 hover:text-blue-600">Courses</a>
            <a href="#" className="font-medium text-gray-500 hover:text-blue-600">Teachers</a>
            <a href="#" className="font-medium text-gray-500 hover:text-blue-600">Pricing</a>
            <a href="#" className="font-medium text-gray-500 hover:text-blue-600">Blog</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant={'outline'} className="hidden rounded-none md:block px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">Log In</Button>
            <Button className="px-4 py-2 text-sm rounded-none font-medium text-white hover:bg-blue-700">Sign Up</Button>
          </div>
        </div>
      </header>
    );
  }
  
  export default Header;