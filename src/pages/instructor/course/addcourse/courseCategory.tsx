import { useRef, useEffect, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { saveCourseDraft } from "../../../../fakeAPI/course";
import { getCategories } from "../../../../utils/firebaseCategory";

const CourseCategory = () => {
  
    const draftId = useRef<string>(
    localStorage.getItem("draftId") || ""
  );
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  useEffect(() => {
    getCategories().then((data) => {
      // Map to ensure each category has id and name
      setCategories(data.map((cat: any) => ({ id: cat.id, name: cat.name ?? "" }))); 
    });
  }, []);

  const formik = useFormik({
    initialValues: {
      category: "",
    },
    validationSchema: Yup.object({
      category: Yup.string().required("Category is required"),
    }),
    onSubmit: async (values) => {
      await saveCourseDraft(draftId.current, {
        category: values.category,
        progress: 2,
      });
      // Also save to localStorage for prefill on next page
      localStorage.setItem('selectedCategory', values.category);
      window.location.hash = "#/instructor/course-sections";
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
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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
        <Button className="rounded-none" type="submit">
          Continue
        </Button>
      </div>
    </form>
  );
};

export default CourseCategory;