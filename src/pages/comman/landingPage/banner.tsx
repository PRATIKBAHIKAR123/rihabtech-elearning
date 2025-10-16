import { useState, useEffect } from "react";
import { Search, List } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Button } from "../../../components/ui/button";
import { Course, getAllCourses } from "../../../utils/firebaseCourses";
import { courseApiService, Category } from "../../../utils/courseApiService";

export default function BannerSection() {
  const [searchTxt, setSearchTxt] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<{ id: string; title: string }[]>([]);

  // fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      const data = await getAllCourses();
      setCourses(data);
      setFilteredCourses(data);
    };
    fetchCourses();
  }, []);

  // fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await courseApiService.getAllCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // filter courses when typing
  useEffect(() => {
    if (!searchTxt.trim()) {
      setFilteredCourses(courses);
    } else {
      const lower = searchTxt.toLowerCase();
      setFilteredCourses(
        courses.filter(
          (c) =>
            c.title?.toLowerCase().includes(lower) ||
            c.category?.toLowerCase().includes(lower) ||
            c.subcategory?.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchTxt, courses]);

  return (
    <section className="bg-gradient-to-b from-white to-[#f1f1fb] py-12 md:py-16">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        {/* Left side */}
        <div className="flex flex-col gap-6 md:w-1/2">
          <p className="banner-section-subtitle">Professional & Lifelong Learning</p>
          <h1 className="banner-section-title">
            Online Courses With Certificates & Guidance
          </h1>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Categories Popover */}
            <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
              <PopoverTrigger asChild>
                <Button className="px-6 py-3 rounded-none h-auto text-white hover:bg-blue-700 font-medium">
                  <List /> Categories
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 bg-white shadow-xl rounded-xl p-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 rounded"
                    onClick={() => {
                      window.location.href = `/courselist/${cat.id}`;
                      setIsCategoryOpen(false);
                    }}
                  >
                    {cat.title}
                  </div>
                ))}
              </PopoverContent>
            </Popover>

            {/* Search Popover */}
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <div className="relative w-full">
                  <input
                    placeholder="What do you want to learn?"
                    className="outline outline-1 outline-offset-[-1px] outline-[#ff7700] px-4 py-3 w-full"
                    value={searchTxt}
                    // onFocus={() => setIsSearchOpen(true)}
                    onChange={(e) => setSearchTxt(e.target.value)}
                  />
                  <Search className="absolute top-1/4 right-4" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[500px] bg-white p-4 max-h-96 overflow-auto shadow-xl rounded-xl">
                {filteredCourses.length === 0 ? (
                  <p className="text-gray-500 text-sm">No courses found</p>
                ) : (
                  filteredCourses.map((course, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        window.location.href = `/courseDetails/${course.id}`;
                        setIsSearchOpen(false);
                      }}
                    >
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-24 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-xs text-gray-600 w-64 truncate mt-1">
                          {course.description}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-primary mt-1">
                        {course.pricing}
                      </div>
                    </div>
                  ))
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Right side */}
        <div className="md:w-1/2 flex justify-center">
          <div className="relative">
            <img
              src="Images/Banners/col-md-6.png"
              alt="Happy student learning"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
