
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

// Global flag to prevent double initialization
let isInitializing = false;


const CourseTitle = () => {
   const draftId = useRef<string>(localStorage.getItem("draftId") || "");
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const { user } = useAuth();
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
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
      
      // Create draft if it doesn't exist yet
      if (!draftId.current) {
        try {
          const newDraftId = await createNewCourseDraft(values.title, user?.UserName);
          draftId.current = newDraftId;
          localStorage.setItem("draftId", newDraftId);
          console.log("Created new draft with ID:", newDraftId);
        } catch (error) {
          console.error("Failed to create course draft:", error);
          setLoading(false);
          return;
        }
      } else {
        // Update existing draft
        await saveCourseTitle(draftId.current, values.title, user?.UserName);
      }
      
      setLoading(false);
      window.location.hash = "#/instructor/course-category";
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    const initializeDraft = async () => {
      // Prevent double initialization
      if (isInitializing) {
        console.log("Initialization already in progress, skipping...");
        return;
      }
      
      isInitializing = true;
      setInitializing(true);
      
      // Check if we already have a draftId and it's not empty
      const existingDraftId = localStorage.getItem("draftId");
      if (existingDraftId && existingDraftId.trim() !== "") {
        draftId.current = existingDraftId;
        console.log("Using existing draftId:", existingDraftId);
        
        // Fetch existing title if draft exists
        try {
  // Fetch both title and full course data for rejection info
  const [title, courseData] = await Promise.all([
    getCourseTitle(draftId.current),
    getFullCourseData(draftId.current)
  ]);

  formik.setFieldValue('title', title);

  // Check for rejection info and show dialog
  if (courseData?.rejectionInfo && courseData.status === COURSE_STATUS.NEEDS_REVISION) {
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
} catch (error) {
  console.error("Failed to fetch course data:", error);
}
finally {
  setInitializing(false);
  setLoading(false);
  isInitializing = false;
}
      
      setInitializing(false);
      setLoading(false);
      isInitializing = false;
    };
  }
    
    initializeDraft();
    setInitializing(false);
      setLoading(false);
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
          {loading ? 'Saving...' : 'Continue'}
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

