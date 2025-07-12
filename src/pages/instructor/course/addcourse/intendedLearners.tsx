import { Delete, PlusIcon, Trash2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";

export function IntendentLearners({ onSubmit }: any) {
  const initialValues = {
    learn: ["", ""],
    requirements: [""],
    target: [""],
  };

  const validationSchema = Yup.object({
    learn: Yup.array()
      .of(Yup.string().trim().required("This field is required"))
      .min(1, "At least one item is required"),
    requirements: Yup.array()
      .of(Yup.string().trim().required("This field is required"))
      .min(1, "At least one item is required"),
    target: Yup.array()
      .of(Yup.string().trim().required("This field is required"))
      .min(1, "At least one item is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      // Handle submit (API call, etc.)
      console.log("Form values:", values);
      onSubmit(values);
    },
  });

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        {/* What will students learn */}
        <div className="mb-3">
          <h3 className="course-sectional-question mb-2">What will students learn in your course?<span className="text-[#ff0000]"> *</span></h3>
          <p className="course-sectional-descrption mb-4">
            The following descriptions will be publicly visible on your Course Landing Page and will have a direct impact on your course performance. These descriptions will help learners decide if your course is right for them.
          </p>
          <FieldArray name="learn">
            {({ push, remove }) => (
              <div className="mt-8 gap-2 flex flex-col">
                {formik.values.learn.map((val, idx) => (
                  <div
                    key={idx}
                    className={`relative flex items-center${Array.isArray(formik.touched.learn) && formik.touched.learn[idx] && formik.errors.learn && (formik.errors.learn as any)[idx] ? " mb-6" : ""}`}
                  >
                    <Input
                      className="ins-control-border"
                      placeholder="Example: Define Roles and Responsibility of a Project Manager"
                      name={`learn[${idx}]`}
                      value={val}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.values.learn.length > 1 && (
                      <Button
                        variant="outline"
                        className="rounded-none border-primary absolute right-3"
                        type="button"
                        onClick={() => remove(idx)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                    {Array.isArray(formik.touched.learn) && formik.touched.learn[idx] && formik.errors.learn && (formik.errors.learn as any)[idx] && (
                      <div className="text-red-500 text-xs absolute left-0 -bottom-5">{(formik.errors.learn as any)[idx]}</div>
                    )}
                  </div>
                ))}
                <Button
                  variant="link"
                  type="button"
                  onClick={() => push("")}
                  className="mt-2 w-fit"
                >
                  <PlusIcon /> Add More
                </Button>
                {typeof formik.errors.learn === "string" && (
                  <div className="text-red-500 text-xs mt-1">{formik.errors.learn}</div>
                )}
              </div>
            )}
          </FieldArray>
        </div>

        {/* Requirements */}
        <div className="mb-3">
          <h3 className="course-sectional-question mb-2">Are there any course requirements or prerequisites?<span className="text-[#ff0000]"> *</span></h3>
          <p className="course-sectional-descrption mb-4">
            List any required skills, experience, tools or equipment learners should have prior to taking your course.
          </p>
          <FieldArray name="requirements">
            {({ push, remove }) => (
              <div className="mt-8 gap-2 flex flex-col">
                {formik.values.requirements.map((val, idx) => (
                  <div
                    key={idx}
                    className={`relative flex items-center${Array.isArray(formik.touched.requirements) && formik.touched.requirements[idx] && formik.errors.requirements && (formik.errors.requirements as any)[idx] ? " mb-6" : ""}`}
                  >
                    <Input
                      className="ins-control-border"
                      placeholder="Example: No experience needed. You will learn everything you need to know"
                      name={`requirements[${idx}]`}
                      value={val}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.values.requirements.length > 1 && (
                      <Button
                        variant="outline"
                        className="rounded-none border-primary absolute right-3"
                        type="button"
                        onClick={() => remove(idx)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                    {Array.isArray(formik.touched.requirements) && formik.touched.requirements[idx] && formik.errors.requirements && (formik.errors.requirements as any)[idx] && (
                      <div className="text-red-500 text-xs absolute left-0 -bottom-5">{(formik.errors.requirements as any)[idx]}</div>
                    )}
                  </div>
                ))}
                <Button
                  variant="link"
                  type="button"
                  onClick={() => push("")}
                  className="mt-2 w-fit"
                >
                  <PlusIcon /> Add More
                </Button>
                {typeof formik.errors.requirements === "string" && (
                  <div className="text-red-500 text-xs mt-1">{formik.errors.requirements}</div>
                )}
              </div>
            )}
          </FieldArray>
        </div>

        {/* Target Learners */}
        <div className="mb-3">
          <h3 className="course-sectional-question mb-2">Who is this course for?<span className="text-[#ff0000]"> *</span></h3>
          <p className="course-sectional-descrption mb-4">
            Write a clear description of the intended learners for your course.
          </p>
          <FieldArray name="target">
            {({ push, remove }) => (
              <div className="mt-8 gap-2 flex flex-col">
                {formik.values.target.map((val, idx) => (
<div
  key={idx}
  className={`relative flex items-center${Array.isArray(formik.touched.target) && formik.touched.target[idx] && formik.errors.target && (formik.errors.target as any)[idx] ? " mb-6" : ""}`}
>
                    <Input
                      className="ins-control-border"
                      placeholder="Example: Beginners, Project Managers, etc."
                      name={`target[${idx}]`}
                      value={val}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.values.target.length > 1 && (
                      <Button
                        variant="outline"
                        className="rounded-none border-primary absolute right-3"
                        type="button"
                        onClick={() => remove(idx)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                    {Array.isArray(formik.touched.target) && formik.touched.target[idx] && formik.errors.target && (formik.errors.target as any)[idx] && (
                      <div className="text-red-500 text-xs absolute left-0 -bottom-5">{(formik.errors.target as any)[idx]}</div>
                    )}
                  </div>
                ))}
                <Button
                  variant="link"
                  type="button"
                  onClick={() => push("")}
                  className="mt-2 w-fit"
                >
                  <PlusIcon /> Add More
                </Button>
                {typeof formik.errors.target === "string" && (
                  <div className="text-red-500 text-xs mt-1">{formik.errors.target}</div>
                )}
              </div>
            )}
          </FieldArray>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="rounded-none">
            Save & Continue
          </Button>
        </div>
      </form>
    </FormikProvider>
  );
}