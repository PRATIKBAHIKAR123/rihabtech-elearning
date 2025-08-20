
import { useEffect, useRef, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { useFormik } from "formik";
import * as Yup from "yup";
import { saveCourseTitle, getCourseTitle, createNewCourseDraft } from "../../../../utils/firebaseCourseTitle";


const CourseTitle = () => {
   const draftId = useRef<string>(localStorage.getItem("draftId") || "");
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  
  const formik = useFormik({
    initialValues: {
      title: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Course Title is required"),
    }),
    onSubmit: async(values) => {
      setLoading(true);
      await saveCourseTitle(draftId.current, values.title);
      setLoading(false);
      window.location.hash = "#/instructor/course-category";
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    const initializeDraft = async () => {
      setInitializing(true);
      
      // If no draftId exists, create a new course draft
      if (!draftId.current) {
        try {
          const newDraftId = await createNewCourseDraft();
          draftId.current = newDraftId;
          localStorage.setItem("draftId", newDraftId);
        } catch (error) {
          console.error("Failed to create course draft:", error);
          setInitializing(false);
          return;
        }
      }
      
      // Fetch existing title if draft exists
      try {
        const title = await getCourseTitle(draftId.current);
        formik.setFieldValue('title', title);
      } catch (error) {
        console.error("Failed to fetch course title:", error);
      }
      
      setInitializing(false);
      setLoading(false);
    };
    
    initializeDraft();
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
    </form>
  );
};

export default CourseTitle;

