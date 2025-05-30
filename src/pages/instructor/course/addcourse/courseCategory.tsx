import { Button } from "../../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { useFormik } from "formik";
import * as Yup from "yup";

const CourseCategory = () => {
  const formik = useFormik({
    initialValues: {
      category: "",
    },
    validationSchema: Yup.object({
      category: Yup.string().required("Category is required"),
    }),
    onSubmit: (values) => {
      window.location.hash = "#/instructor/course-timespend";
    },
  });

  return (
    <form className="flex flex-col justify-between h-full" onSubmit={formik.handleSubmit} noValidate>
      <div className="p-8">
        <h1 className="ins-heading mb-3">Select your course Category</h1>
        <p className="justify-start text-[#1e1e1e] text-sm font-medium font-['Nunito']">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse laoreet, nulla vitae ultrices iaculis, tortor lorem maximus sem, eu luctus orci dui id sem.
        </p>
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
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="development">Development</SelectItem>
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
        <Button className="rounded-none" type="submit">
          Continue
        </Button>
      </div>
    </form>
  );
};

export default CourseCategory;