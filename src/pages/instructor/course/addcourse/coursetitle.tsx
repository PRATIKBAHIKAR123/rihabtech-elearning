
import { useEffect, useRef, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { useFormik } from "formik";
import * as Yup from "yup";
import { saveCourseTitle, getCourseTitle, createNewCourseDraft } from "../../../../utils/firebaseCourseTitle";
import { useAuth } from "../../../../context/AuthContext";
import { getFullCourseData } from "../../../../utils/firebaseCoursePreview";
import { ReviewFeedbackDialog } from "../../../../components/ui/reviewFeedbackDialog";
import { COURSE_STATUS } from "../../../../utils/firebaseCourses";
import { courseApiService, CourseResponse, UpdateCourseMessageResponse } from "../../../../utils/courseApiService";
import { toast } from "sonner";

const CourseTitle = () => {
  const draftId = useRef<string>(localStorage.getItem("draftId") || "");
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { user } = useAuth();
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [courseData, setCourseData] = useState<CourseResponse | null>(null);
  const [isNewCourse, setIsNewCourse] = useState(true);
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
          
          // Store the course ID for future updates
          localStorage.setItem("courseId", newCourse.id.toString());
          setCourseData(newCourse);
          setIsNewCourse(false);
          
                 // Also create Firebase draft for backward compatibility
                 try {
                   const newDraftId = await createNewCourseDraft(values.title, user?.UserName);
                   draftId.current = newDraftId;
                   localStorage.setItem("draftId", newDraftId);
                 } catch (firebaseError) {
                   console.warn("Firebase draft creation failed (non-critical):", firebaseError);
                   // Don't throw error - this is just for backward compatibility
                 }

                 toast.success("Course created successfully!");
        } else {
          // Comparison logic: Only call update API if title has changed
          if (courseData.title === values.title) {
            toast.info("No changes detected in course title. Moving to next step.");
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
            congratulationsMessage: courseData.congratulationsMessage ?? null
          });
          
          // After a successful update, update the local courseData state with the new title
          setCourseData(prev => prev ? { ...prev, title: values.title } : null);
          
          // Also update Firebase draft for backward compatibility (only if draftId exists)
          if (draftId.current && draftId.current.trim() !== "") {
            try {
              await saveCourseTitle(draftId.current, values.title, user?.UserName);
            } catch (firebaseError) {
              console.warn("Firebase draft update failed (non-critical):", firebaseError);
              // Don't throw error - this is just for backward compatibility
            }
          }
          
          toast.success(updateResponse.message || "Course updated successfully!");
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
        const existingDraftId = localStorage.getItem("draftId");
        
        if (existingCourseId) {
          // Fetch existing course from API
          try {
            const apiCourseData = await courseApiService.getCourseById(parseInt(existingCourseId));
            setCourseData(apiCourseData);
            setIsNewCourse(false);
            formik.setFieldValue('title', apiCourseData.title);
            console.log("Loaded existing course from API:", apiCourseData);
          } catch (apiError) {
            console.warn("Failed to fetch course from API, falling back to Firebase:", apiError);
            // Fallback to Firebase if API fails
            if (existingDraftId) {
              const title = await getCourseTitle(existingDraftId);
              formik.setFieldValue('title', title);
            }
          }
        } else if (existingDraftId && existingDraftId.trim() !== "") {
          // Fallback to Firebase draft system
          console.log("Using existing Firebase draftId:", existingDraftId);
          
          // Fetch existing title if draft exists
          const [title, firebaseCourseData] = await Promise.all([
            getCourseTitle(existingDraftId),
            getFullCourseData(existingDraftId)
          ]);

          formik.setFieldValue('title', title);

          // Check for rejection info and show dialog
          if (firebaseCourseData?.rejectionInfo && firebaseCourseData.status === COURSE_STATUS.NEEDS_REVISION) {
            setRejectionInfo({
              ...firebaseCourseData.rejectionInfo,
              rejectedAt: firebaseCourseData.rejectionInfo.rejectedAt ? new Date(firebaseCourseData.rejectionInfo.rejectedAt) : undefined,
              rejectedBy: {
                ...(typeof firebaseCourseData.rejectionInfo.rejectedBy === 'object' && firebaseCourseData.rejectionInfo.rejectedBy !== null ? firebaseCourseData.rejectionInfo.rejectedBy : {}),
                timestamp:
                  typeof firebaseCourseData.rejectionInfo.rejectedBy === 'object' &&
                  firebaseCourseData.rejectionInfo.rejectedBy !== null &&
                  (firebaseCourseData.rejectionInfo.rejectedBy as { timestamp?: string | number | Date }).timestamp
                    ? new Date((firebaseCourseData.rejectionInfo.rejectedBy as { timestamp?: string | number | Date }).timestamp!)
                    : undefined
              }
            });
            setShowRejectionDialog(true);
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
          <p className="text-gray-600">Initializing course draft...</p>
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

