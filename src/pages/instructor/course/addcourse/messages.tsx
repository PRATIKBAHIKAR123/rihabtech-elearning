import { Select, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { SelectContent, SelectItem } from "../../../../components/ui/select";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useRef, useState } from "react";
import { saveCourseMessages, getCourseMessages } from "../../../../utils/firebaseCourseMessages";

// Define the form values interface
interface CourseMessagesForm {
  welcomeMessage: string;
  congratulationsMessage: string;
}


export function CourseMessages() {
  const draftId = useRef<string>(localStorage.getItem('draftId') || '');
  const [loading, setLoading] = useState(true);
  const formik = useFormik<CourseMessagesForm>({
    initialValues: {
      welcomeMessage: "",
      congratulationsMessage: "",
    },
    validationSchema: Yup.object({
      welcomeMessage: Yup.string()
        .min(10, "Welcome message should be at least 10 characters")
        .max(500, "Welcome message cannot exceed 500 characters"),
      congratulationsMessage: Yup.string()
        .min(10, "Congratulations message should be at least 10 characters")
        .max(500, "Congratulations message cannot exceed 500 characters"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await saveCourseMessages({
          draftId: draftId.current,
          welcomeMessage: values.welcomeMessage,
          congratulationsMessage: values.congratulationsMessage,
        });
        // Optionally show a toast or feedback
      } catch (e) {
        alert("Failed to save messages. Please try again.");
      }
      setLoading(false);
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const data = await getCourseMessages(draftId.current);
        formik.setValues({
          welcomeMessage: data.welcomeMessage,
          congratulationsMessage: data.congratulationsMessage,
        });
      } catch (e) {
        // Optionally handle error
      }
      setLoading(false);
    };
    fetchMessages();
    // eslint-disable-next-line
  }, [draftId.current]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <div>
        <div className="mb-3">
          <h2 className="form-title">Course messages</h2>
          <p className="course-sectional-descrption mb-4">
            Write messages to your students (optional) that will be sent
            automatically when they join or complete your course to encourage
            students to engage with course content. If you do not wish to send a
            welcome or congratulations message, leave the text box blank.
          </p>

          <div className="mt-8 gap-2 flex flex-col">
            <label className="ins-label">Welcome Message</label>
            <Textarea
              className={`ins-control-border ${formik.touched.welcomeMessage && formik.errors.welcomeMessage
                  ? "border-red-500"
                  : ""
                }`}
              placeholder="Write a welcome message for your students..."
              {...formik.getFieldProps("welcomeMessage")}
            />
            {formik.touched.welcomeMessage && formik.errors.welcomeMessage && (
              <div className="text-red-500 text-sm">
                {formik.errors.welcomeMessage}
              </div>
            )}
          </div>

          <div className="mt-4 gap-2 flex flex-col">
            <label className="ins-label">Congratulations Message</label>
            <Textarea
              className={`ins-control-border ${formik.touched.congratulationsMessage &&
                  formik.errors.congratulationsMessage
                  ? "border-red-500"
                  : ""
                }`}
              placeholder="Write a congratulations message for course completion..."
              {...formik.getFieldProps("congratulationsMessage")}
            />
            {formik.touched.congratulationsMessage &&
              formik.errors.congratulationsMessage && (
                <div className="text-red-500 text-sm">
                  {formik.errors.congratulationsMessage}
                </div>
              )}
          </div>

          <div className="flex justify-end mt-8">
            <Button type="submit" className="rounded-none" disabled={loading || !formik.dirty || !formik.isValid}>
              {loading ? 'Saving...' : 'Save Messages'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}