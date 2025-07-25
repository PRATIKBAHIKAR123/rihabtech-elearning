import { useRef, useEffect, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getCategories } from "../../../../utils/firebaseCategory";
import { saveCourseCategory, getCourseCategory } from "../../../../utils/firebaseCourseCategory";

const CourseCategory = () => {
  
    const draftId = useRef<string>(localStorage.getItem('draftId') || '');
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  useEffect(() => {
    getCategories().then((data) => {
      // Map to ensure each category has id and name
      setCategories(data.map((cat: any) => ({ id: cat.id, name: cat.name ?? "" }))); 
    });
  }, []);

  const [loading, setLoading] = useState(true);
  const formik = useFormik({
    initialValues: {
      category: "",
    },
    validationSchema: Yup.object({
      category: Yup.string().required("Category is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      await saveCourseCategory(draftId.current, values.category);
      setLoading(false);
      window.location.hash = "#/instructor/course-sections";
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      const cat = await getCourseCategory(draftId.current);
      formik.setFieldValue('category', cat);
      setLoading(false);
    };
    fetchCategory();
    // eslint-disable-next-line
  }, [draftId.current]);

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
        <Button className="rounded-none" type="submit" disabled={loading || !formik.dirty || !formik.isValid}>
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </form>
  );
};

export default CourseCategory;