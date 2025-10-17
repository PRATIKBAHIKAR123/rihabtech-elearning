import { useEffect, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { courseApiService, Category, CourseResponse, UpdateCourseMessageResponse } from "../../../../utils/courseApiService";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "sonner";

const CourseCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { user } = useAuth();
  const [courseData, setCourseData] = useState<CourseResponse | null>(null);
  const [isNewCourse, setIsNewCourse] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await courseApiService.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Failed to load categories. Please try again.");
      }
    };
    
    fetchCategories();
  }, []);
  const formik = useFormik({
    initialValues: {
      category: "",
    },
    validationSchema: Yup.object({
      category: Yup.string().required("Category is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      
      // Check if user is logged in
      if (!user) {
        toast.error("Please login to update course");
        setLoading(false);
        return;
      }
      
      try {
        if (isNewCourse || !courseData?.id) {
          // For new courses, we need to create the course first
          toast.error("Please create a course first by setting the title");
          setLoading(false);
          return;
        }

        // Comparison logic: Only call update API if category has changed
        const currentCategoryId = courseData.category ? courseData.category.toString() : "";
        if (currentCategoryId === values.category) {
          //toast.info("No changes detected in course category. Moving to next step.");
          setLoading(false);
          window.location.hash = "#/instructor/course-sections";
          return; // Exit early
        }

        // If category has changed, proceed with update
        const updateResponse: UpdateCourseMessageResponse = await courseApiService.updateCourse({
          id: courseData.id,
          title: courseData.title,
          subtitle: courseData.subtitle ?? null,
          description: courseData.description ?? null,
          category: parseInt(values.category),
          subCategory: courseData.subCategory ?? null,
          level: courseData.level ?? null,
          language: courseData.language ?? null,
          pricing: courseData.pricing ?? null,
          thumbnailUrl: courseData.thumbnailUrl ?? null,
          promoVideoUrl: courseData.promoVideoUrl ?? null,
          welcomeMessage: courseData.welcomeMessage ?? null,
          congratulationsMessage: courseData.congratulationsMessage ?? null
        });
        
        // After a successful update, update the local courseData state with the new category
        setCourseData(prev => prev ? { ...prev, category: parseInt(values.category) } : null);
        
        
        toast.success(updateResponse.message || "Course category updated successfully!");
        
        setLoading(false);
        window.location.hash = "#/instructor/course-sections";
      } catch (error: any) {
        console.error("Failed to save course category:", error);
        
        // Handle specific error messages
        if (error.message?.includes('Authentication failed')) {
          toast.error("Authentication failed. Please login again.");
        } else if (error.message?.includes('Access forbidden')) {
          toast.error("You don't have permission to perform this action.");
        } else if (error.message?.includes('Server error')) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("Failed to save course category. Please try again.");
        }
        
        setLoading(false);
      }
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    const initializeCourse = async () => {
      // Prevent double initialization
      if (initialized || initializing) {
        console.log("Already initialized or initializing, skipping...");
        return;
      }
      
      setInitializing(true);
      
      try {
        // Check if we have an existing course ID
        const existingCourseId = localStorage.getItem("courseId");
        
        if (existingCourseId) {
          // Fetch existing course from API
          try {
            const apiCourseData = await courseApiService.getCourseById(parseInt(existingCourseId));
            setCourseData(apiCourseData);
            setIsNewCourse(false);
            
            // Set the category value if it exists
            if (apiCourseData.category) {
              formik.setFieldValue('category', apiCourseData.category.toString());
            }
            console.log("Loaded existing course from API:", apiCourseData);
          } catch (apiError) {
            console.warn("Failed to fetch course from API:", apiError);
            toast.error("Failed to load course data. Please try again.");
          }
        } else {
          // New course - no existing data
          setIsNewCourse(true);
          console.log("Initializing new course");
        }
      } catch (error: any) {
        console.error("Failed to initialize course:", error);
        
        // Handle specific error messages
        if (error.message?.includes('Authentication failed')) {
          toast.error("Authentication failed. Please login again.");
        } else if (error.message?.includes('Access forbidden')) {
          toast.error("You don't have permission to access course data.");
        } else if (error.message?.includes('Server error')) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("Failed to load course data");
        }
      } finally {
        setInitializing(false);
        setLoading(false);
        setInitialized(true);
      }
    };
    
    // Only initialize if we haven't already done so
    if (!initialized && !initializing) {
      initializeCourse();
    }
    // eslint-disable-next-line
  }, []);

  // Don't render the form while initializing
  if (initializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <form className="flex flex-col justify-between h-full" onSubmit={formik.handleSubmit} noValidate>
      <div className="p-8">
        <h1 className="ins-heading mb-3">Select your course Category</h1>
        <div className="mt-8">
          <Select
            value={formik.values.category}
            onValueChange={value => formik.setFieldValue("category", value)}
          >
            <SelectTrigger
              className="ins-control-border rounded-none"
              onBlur={() => formik.setFieldTouched("category", true)}
            >
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.category && formik.errors.category && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.category}</div>
          )}
        </div>
      </div>
      <div className="flex justify-between w-full items-center rounded-md border border-gray p-4">
        <Button
          variant={"outline"}
          className="rounded-none"
          type="button"
          onClick={() => {
            window.location.hash = "#/instructor/course-title";
          }}
        >
          Previous
        </Button>
        <Button className="rounded-none" type="submit" disabled={loading || !formik.dirty || !formik.isValid}>
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </form>
  );
};

export default CourseCategory;