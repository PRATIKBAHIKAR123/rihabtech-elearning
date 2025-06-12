import { useRef, useState, useEffect } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { useFormik } from "formik";
import * as Yup from "yup";

export function CourseLandingPage({ onSubmit }: any) {
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [promoVideo, setPromoVideo] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [promoVideoFile, setPromoVideoFile] = useState<File | null>(null);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const validationSchema = Yup.object({
    title: Yup.string().required("Course title is required"),
    subtitle: Yup.string().required("Course subtitle is required"),
    description: Yup.string().required("Course description is required"),
    language: Yup.string().required("Language is required"),
    level: Yup.string().required("Level is required"),
    category: Yup.string().required("Category is required"),
    subcategory: Yup.string().required("Subcategory is required"),
    primaryTopic: Yup.string().required("Primary topic is required"),
    thumbnail: Yup.mixed().required("Course image is required"),
    promoVideo: Yup.mixed().required("Promotional video is required"),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      subtitle: "",
      description: "",
      language: "",
      level: "",
      category: "",
      subcategory: "",
      primaryTopic: "",
      thumbnail: null,
      promoVideo: null,
    },
    validationSchema,
    onSubmit: (values) => {
      // Save title and category to localStorage draft
      const draft = JSON.parse(localStorage.getItem('courseDraft') || '{}');
      draft.title = values.title;
      draft.category = values.category;
      localStorage.setItem('courseDraft', JSON.stringify(draft));
      // Handle submit (API call, etc.)
      console.log("Form values:", values);
      // You can send thumbnailFile and promoVideoFile to your backend here
      onSubmit(values);
    },
  });

  useEffect(() => {
    // Prefill from localStorage if available
    const draft = JSON.parse(localStorage.getItem('courseDraft') || '{}');
    if (draft.title) formik.setFieldValue('title', draft.title);
    if (draft.category) formik.setFieldValue('category', draft.category);
  }, []);

  // Handlers for file/image/video
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailImage(URL.createObjectURL(e.target.files[0]));
      setThumbnailFile(e.target.files[0]);
      formik.setFieldValue("thumbnail", e.target.files[0]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPromoVideo(URL.createObjectURL(e.target.files[0]));
      setPromoVideoFile(e.target.files[0]);
      formik.setFieldValue("promoVideo", e.target.files[0]);
    }
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="mb-3">
        <h2 className="form-title">Course landing page</h2>

        {/* Course Title */}
        <div className="mt-8 gap-2 flex flex-col">
          <label className="ins-label">Course title</label>
          <Input
            className="ins-control-border"
            placeholder="Photoshop"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.title && formik.errors.title && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.title}</div>
          )}
        </div>

        {/* Course Subtitle */}
        <div className="mt-4 gap-2 flex flex-col">
          <label className="ins-label">Course subtitle</label>
          <Input
            className="ins-control-border"
            placeholder="Insert your course subtitle"
            name="subtitle"
            value={formik.values.subtitle}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.subtitle && formik.errors.subtitle && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.subtitle}</div>
          )}
        </div>

        {/* Course Description */}
        <div className="mt-4 gap-2 flex flex-col">
          <label className="ins-label">Course Description</label>
          <Textarea
            className="ins-control-border"
            placeholder="Insert your course Description"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.description && formik.errors.description && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.description}</div>
          )}
        </div>

        {/* Basic Info */}
        <div className="mt-4 gap-2 flex flex-col">
          <label className="ins-label">Basic Info</label>
          <div className="flex justify-between gap-2">
            <Select
              value={formik.values.language}
              onValueChange={value => formik.setFieldValue("language", value)}
            >
              <SelectTrigger
                className="ins-control-border rounded-none"
                onBlur={() => formik.setFieldTouched("language", true)}
              >
                <SelectValue placeholder="Choose a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={formik.values.level}
              onValueChange={value => formik.setFieldValue("level", value)}
            >
              <SelectTrigger
                className="ins-control-border rounded-none"
                onBlur={() => formik.setFieldTouched("level", true)}
              >
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="begginer">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={formik.values.category}
              onValueChange={value => formik.setFieldValue("category", value)}
            >
              <SelectTrigger
                className="ins-control-border rounded-none"
                onBlur={() => formik.setFieldTouched("category", true)}
              >
                <SelectValue placeholder="Choose a Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cat1">Category 1</SelectItem>
                <SelectItem value="cat2">Category 2</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={formik.values.subcategory}
              onValueChange={value => formik.setFieldValue("subcategory", value)}
            >
              <SelectTrigger
                className="ins-control-border rounded-none"
                onBlur={() => formik.setFieldTouched("subcategory", true)}
              >
                <SelectValue placeholder="Choose a SubCategory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subcat1">Sub Category 1</SelectItem>
                <SelectItem value="subcat2">Sub Category 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Validation errors for selects */}
          <div className="flex flex-wrap gap-2 mt-1">
            {formik.touched.language && formik.errors.language && (
              <div className="text-red-500 text-xs">{formik.errors.language}</div>
            )}
            {formik.touched.level && formik.errors.level && (
              <div className="text-red-500 text-xs">{formik.errors.level}</div>
            )}
            {formik.touched.category && formik.errors.category && (
              <div className="text-red-500 text-xs">{formik.errors.category}</div>
            )}
            {formik.touched.subcategory && formik.errors.subcategory && (
              <div className="text-red-500 text-xs">{formik.errors.subcategory}</div>
            )}
          </div>
        </div>

        {/* Primary Topic */}
        <div className="mt-4 gap-2 flex flex-col">
          <label className="ins-label">What is primarily taught in your course?</label>
          <Input
            className="ins-control-border"
            placeholder="eg Landscape Photography"
            name="primaryTopic"
            value={formik.values.primaryTopic}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.primaryTopic && formik.errors.primaryTopic && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.primaryTopic}</div>
          )}
        </div>

        {/* Course Image */}
        <div className="mt-4 gap-2 flex flex-col">
          <label className="ins-label">Course Image</label>
          <div className="ins-control-border gap-3 items-center justify-center flex flex-col">
            {thumbnailImage ? (
              <img
                src={thumbnailImage}
                alt="Uploaded course"
                className="rounded-lg w-80 h-48 object-cover"
              />
            ) : (
              <img
                src="Images/icons/Rectangle.png"
                alt="Placeholder course"
                className="rounded-lg w-80 h-48"
              />
            )}
            <div className="text-primary text-sm text-center font-medium font-['Nunito']">
              Upload your course image here. It must meet our{' '}
              <a href="#" className="text-blue-500 underline">
                course image quality standards
              </a>{' '}
              to be accepted. Important guidelines: 750x422 pixels; .jpg, .jpeg, .gif, or .png. no text on the image.
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
              id="thumbnail-upload"
              ref={thumbnailInputRef}
            />
            <label htmlFor="thumbnail-upload" className='z-10 rounded-none bg-primary p-2 text-white cursor-pointer hover:opacity-90'>
              Upload File
            </label>
            {formik.touched.thumbnail && formik.errors.thumbnail && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.thumbnail as string}</div>
            )}
          </div>
        </div>

        {/* Promotional Video Upload */}
        <div className="mt-4 gap-2 flex flex-col">
          <label className="ins-label">Promotional Video</label>
          <div className="ins-control-border gap-3 items-center justify-center flex flex-col">
            {promoVideo ? (
              <video
                src={promoVideo}
                controls
                className="rounded-lg w-80 h-48 object-cover"
              />
            ) : (
              <img
                src="Images/icons/Rectangle.png"
                alt="Placeholder promo"
                className="rounded-lg w-80 h-48"
              />
            )}
            <div className="text-primary text-sm text-center font-medium font-['Nunito']">
              Upload your promotional video here. Supported formats: .mp4, .mov, etc. Make sure it's high quality and aligns with guidelines.
            </div>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
              id="video-upload"
              ref={videoInputRef}
            />
            <label htmlFor="video-upload" className='z-10 rounded-none bg-primary p-2 text-white cursor-pointer hover:opacity-90'>
              Upload File
            </label>
            {formik.touched.promoVideo && formik.errors.promoVideo && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.promoVideo as string}</div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button className="rounded-none" type="submit">
            Save & Continue
          </Button>
        </div>
      </div>
    </form>
  );
}