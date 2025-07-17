import { useEffect, useRef } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { useFormik } from "formik";
import { v4 as uuidv4 } from 'uuid';
import * as Yup from "yup";
import { saveCourseDraft } from "../../../../fakeAPI/course";

const CourseTitle = () => {
  const draftId = useRef<string>(localStorage.getItem("draftId") || uuidv4() || "");

  useEffect(() => {
    if (draftId.current) {
      localStorage.setItem("draftId", draftId.current);
    }
  }, []);

  
  const formik = useFormik({
    initialValues: {
      title: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Course Title is required"),
    }),
    onSubmit: async(values) => {
        await saveCourseDraft(draftId.current, {
        title: values.title,
        progress: 2, // You can decide how much this step is worth
      });
      window.location.hash = "#/instructor/course-category";
    },
  });

  return (
    <form
      className="flex flex-col justify-between h-full"
      onSubmit={formik.handleSubmit}
      noValidate
    >
      <div className="p-8">
        <h1 className="ins-heading mb-3">What’s the Course Tittle?</h1>
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
        <Button className="rounded-none" type="submit">
          Continue
        </Button>
      </div>
    </form>
  );
};

export default CourseTitle;

