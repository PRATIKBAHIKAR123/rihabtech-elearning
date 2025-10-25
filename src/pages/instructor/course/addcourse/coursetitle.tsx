
import { useEffect, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../../context/AuthContext";
import { courseApiService, CourseResponse, UpdateCourseMessageResponse } from "../../../../utils/courseApiService";
import { ReviewFeedbackDialog } from "../../../../components/ui/reviewFeedbackDialog";
import { useCourseData, clearCourseData } from "../../../../hooks/useCourseData";
import { toast } from "sonner";

const CourseTitle = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const { courseData, isLoading, isNewCourse, updateCourseData, refreshCourseData } = useCourseData();

type RejectionBy = {
  name?: string;
  timestamp?: string | number | Date;
  [key: string]: any;
};

type RejectionInfo = {
  rejectionReason?: string;
  rejectionNotes?: string;
  reason?: string;
  rejectedAt?: string | number | Date;
  rejectedBy?: RejectionBy;
  [key: string]: any;
};

const [rejectionInfo, setRejectionInfo] = useState<RejectionInfo | null>(null);
  
  const formik = useFormik({
    initialValues: {
      title: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Course Title is required"),
    }),
    onSubmit: async(values) => {
      setLoading(true);
      
      // Check if user is logged in
      if (!user) {
        toast.error("Please login to create a course");
        setLoading(false);
        return;
      }
      
      try {
        if (isNewCourse || !courseData?.id) {
          // Create new course using API
          const newCourse = await courseApiService.createCourse({
            title: values.title
          });
          
          // Handle the response - API returns just the ID, so we need to create a course object
          const courseId = typeof newCourse === 'number' ? newCourse : newCourse.id;
          
          // Store the course ID for future updates
          localStorage.setItem("courseId", courseId.toString());
          
          // Create a basic course object for state management
          const courseObject: CourseResponse = {
            id: courseId,
            title: values.title,
            // Set other fields as null/undefined for now
            subtitle: null,
            description: null,
            category: null,
            subCategory: null,
            level: null,
            language: null,
            pricing: null,
            thumbnailUrl: null,
            promoVideoUrl: null,
            welcomeMessage: null,
            congratulationsMessage: null
          };
          
          updateCourseData(courseObject);
          
          toast.success("Course created successfully!");
        } else {
          // Comparison logic: Only call update API if title has changed
          if (courseData.title === values.title) {
            //toast.info("No changes detected in course title. Moving to next step.");
            setLoading(false);
            window.location.hash = "#/instructor/course-category";
            return; // Exit early
          }

          // If title has changed, proceed with update
          const updateResponse: UpdateCourseMessageResponse = await courseApiService.updateCourse({
            id: courseData.id,
            title: values.title,
            subtitle: courseData.subtitle ?? null,
            description: courseData.description ?? null,
            category: courseData.category ?? null,
            subCategory: courseData.subCategory ?? null,
            level: courseData.level ?? null,
            language: courseData.language ?? null,
            pricing: courseData.pricing ?? null,
            thumbnailUrl: courseData.thumbnailUrl ?? null,
            promoVideoUrl: courseData.promoVideoUrl ?? null,
            welcomeMessage: courseData.welcomeMessage ?? null,
            congratulationsMessage: courseData.congratulationsMessage ?? null,
            learn: courseData.learn ?? [],
            requirements: courseData.requirements ?? [],
            target: courseData.target ?? []
          });
          
          // After a successful update, update the shared courseData state with the new title
          updateCourseData({ 
            title: values.title,
            subtitle: courseData.subtitle ?? null,
            description: courseData.description ?? null,
            category: courseData.category ?? null,
            subCategory: courseData.subCategory ?? null,
            level: courseData.level ?? null,
            language: courseData.language ?? null,
            pricing: courseData.pricing ?? null,
            thumbnailUrl: courseData.thumbnailUrl ?? null,
            promoVideoUrl: courseData.promoVideoUrl ?? null,
            welcomeMessage: courseData.welcomeMessage ?? null,
            congratulationsMessage: courseData.congratulationsMessage ?? null,
            learn: courseData.learn ?? [],
            requirements: courseData.requirements ?? [],
            target: courseData.target ?? []
          });
          
          
          toast.success(updateResponse.message || "Course updated successfully!");
          
          // Refresh course data from API to ensure all pages have the latest data
          await refreshCourseData();
        }
        
        setLoading(false);
        window.location.hash = "#/instructor/course-category";
      } catch (error: any) {
        console.error("Failed to save course:", error);
        
        // Handle specific error messages
        if (error.message?.includes('Authentication failed')) {
          toast.error("Authentication failed. Please login again.");
        } else if (error.message?.includes('Access forbidden')) {
          toast.error("You don't have permission to perform this action.");
        } else if (error.message?.includes('Server error')) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("Failed to save course. Please try again.");
        }
        
        setLoading(false);
      }
    },
    enableReinitialize: true,
  });


  // Set form values when course data is loaded
  useEffect(() => {
    if (courseData && courseData.title && !isNewCourse) {
      formik.setFieldValue('title', courseData.title);
      
      // Check for rejection info from API
      if (courseData.status === 3 && courseData.rejectionInfo) { // 3 = NEEDS_REVISION
        setRejectionInfo({
          ...courseData.rejectionInfo,
          rejectedAt: courseData.rejectionInfo.rejectedAt ? new Date(courseData.rejectionInfo.rejectedAt) : undefined,
          rejectedBy: {
            ...(typeof courseData.rejectionInfo.rejectedBy === 'object' && courseData.rejectionInfo.rejectedBy !== null ? courseData.rejectionInfo.rejectedBy : {}),
            timestamp:
              typeof courseData.rejectionInfo.rejectedBy === 'object' &&
              courseData.rejectionInfo.rejectedBy !== null &&
              (courseData.rejectionInfo.rejectedBy as { timestamp?: string | number | Date }).timestamp
                ? new Date((courseData.rejectionInfo.rejectedBy as { timestamp?: string | number | Date }).timestamp!)
                : undefined
          }
        });
        setShowRejectionDialog(true);
      }
    }
  }, [courseData]); // Remove formik from dependencies

  // Clear form when it's a new course
  useEffect(() => {
    if (isNewCourse) {
      formik.setFieldValue('title', '');
      setRejectionInfo(null);
    }
  }, [isNewCourse]);

  // Don't render the form while loading course data
  if (isLoading) {
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
    <form
      className="flex flex-col justify-between h-full"
      onSubmit={formik.handleSubmit}
      noValidate
    >
      <div className="p-8">
        {rejectionInfo && (
  <div 
    className="mb-8 text-sm text-red-700 bg-red-50 border border-red-100 rounded px-4 py-3 flex justify-between items-center cursor-pointer"
    onClick={() => setShowRejectionDialog(true)}
  >
    <div>
      <span className="font-medium">Course needs revision: </span>
      {rejectionInfo.rejectionReason}
    </div>
    <span className="text-red-500 hover:text-red-700">View Details →</span>
  </div>
)}
        <h1 className="ins-heading mb-3">What's the Course Tittle?</h1>
        <p className="justify-start text-[#1e1e1e] text-sm font-medium font-['Nunito']">
          Set a title of your course
        </p>
        <div className="mt-8">
          <Input
            className="ins-control-border"
            placeholder="Type Course Title Here"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.title && formik.errors.title && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.title}</div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between w-full items-center rounded-md border border-gray p-4">
        <Button
          variant={"outline"}
          className="rounded-none"
          type="button"
          onClick={() => {
            // Clear course data when going back to course test selection
            clearCourseData();
            window.location.hash = "#/instructor/course-test-selection";
          }}
        >
          Previous
        </Button>
        <Button className="rounded-none" type="submit" disabled={loading || !formik.dirty || !formik.isValid}>
          {loading ? 'Saving...' : (isNewCourse ? 'Create Course' : 'Update Course')}
        </Button>
      </div>
      
<ReviewFeedbackDialog
  open={showRejectionDialog}
  onOpenChange={setShowRejectionDialog}
  rejectionInfo={rejectionInfo ?? undefined}
/>
    </form>
  );
};

export default CourseTitle;

