import { useRef, useState, useEffect } from 'react';
import { getCategories, getSubCategories } from '../../../../utils/firebaseCategory';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { useFormik } from "formik";
import * as Yup from "yup";
import { saveCourseDraft } from '../../../../fakeAPI/course';
import { storage } from '../../../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// NOTE: Set your Cloudinary credentials here:
const CLOUDINARY_CLOUD_NAME = 'dg9yh82rf'; // <-- Replace with your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = 'rihaab'; // <-- Replace with your unsigned upload preset

// Helper to upload image to Cloudinary
async function uploadToCloudinaryImage(file: File) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(url, { method: 'POST', body: formData });
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message || 'Image upload failed');
  return data.secure_url;
}
// Helper to upload video to Cloudinary
async function uploadToCloudinaryVideo(file: File) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(url, { method: 'POST', body: formData });
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message || 'Video upload failed');
  return data.secure_url;
}

export function CourseLandingPage({ onSubmit }: any) {
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [promoVideo, setPromoVideo] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [promoVideoFile, setPromoVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const draftId = useRef<string>(localStorage.getItem('draftId') || '');

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
    primaryTopic: Yup.string(),
    thumbnail: Yup.mixed().test(
      "thumbnail-required",
      "Course image is required",
      function (value) {
        // If a file is uploaded or a Cloudinary URL exists, pass
        return !!value || !!this.parent.thumbnailUrl;
      }
    ),
    promoVideo: Yup.mixed().test(
      "promoVideo-required",
      "Promotional video is required",
      function (value) {
        return !!value || !!this.parent.promoVideoUrl;
      }
    ),
  });

  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [subCategories, setSubCategories] = useState<{id: string, name: string, categoryId: string}[]>([]);

  // Helper functions to get display names for selected values
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  };

  const getSubCategoryName = (subcategoryId: string) => {
    const subcategory = subCategories.find(sub => sub.id === subcategoryId);
    return subcategory ? subcategory.name : '';
  };

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data.map((cat: any) => ({ id: cat.id, name: cat.name ?? "" })));
    });
    getSubCategories().then((data) => {
      setSubCategories(data.map((sub: any) => ({ id: sub.id, name: sub.name ?? "", categoryId: sub.categoryId ?? "" })));
    });
  }, []);

  const formik = useFormik({
    initialValues: {
      title: "",
      subtitle: "",
      description: "",
      language: "",
      level: "",
      category: localStorage.getItem('selectedCategory') || "",
      subcategory: "",
      primaryTopic: "",
      thumbnail: undefined,
      promoVideo: undefined,
    },
    validationSchema,
    onSubmit: async (values) => {
      setUploading(true);
      setUploadError(null);
      try {
        // Upload thumbnail to Cloudinary
        let thumbnailUrl = thumbnailImage;
        if (thumbnailFile) {
          thumbnailUrl = await uploadToCloudinaryImage(thumbnailFile);
        }
        // Upload promo video to Cloudinary
        let promoVideoUrl = promoVideo;
        if (promoVideoFile) {
          promoVideoUrl = await uploadToCloudinaryVideo(promoVideoFile);
        }
        // Save to Firestore
        await saveCourseDraft(draftId.current, {
          title: values.title,
          subtitle: values.subtitle,
          description: values.description,
          language: values.language,
          level: values.level,
          category: values.category,
          subcategory: values.subcategory,
          progress: 40, // or whatever step this is
          thumbnailUrl: thumbnailUrl === null ? undefined : thumbnailUrl,
          promoVideoUrl: promoVideoUrl === null ? undefined : promoVideoUrl,
        });
        setUploading(false);
        onSubmit({ ...values, thumbnail: thumbnailUrl, promoVideo: promoVideoUrl });
      } catch (err: any) {
        setUploadError(err.message || 'Upload failed');
        setUploading(false);
      }
    },
  });

  useEffect(() => {
    // Prefill from Firestore if available
    const draftIdLS = localStorage.getItem('draftId') || '';
    if (draftIdLS) {
      import('../../../../fakeAPI/course').then(api => {
        api.getCourseDraft(draftIdLS).then(draft => {
          if (draft) {
            if (draft.title) formik.setFieldValue('title', draft.title);
            if (draft.subtitle) formik.setFieldValue('subtitle', draft.subtitle);
            if (draft.description) formik.setFieldValue('description', draft.description);
            if (draft.language) formik.setFieldValue('language', draft.language);
            if (draft.level) formik.setFieldValue('level', draft.level);
            // Set category first, then subcategory after a short delay to ensure options are loaded
            if (draft.category) {
              formik.setFieldValue('category', draft.category);
              setTimeout(() => {
                if (draft.subcategory) formik.setFieldValue('subcategory', draft.subcategory);
              }, 0);
            } else if (draft.subcategory) {
              formik.setFieldValue('subcategory', draft.subcategory);
            }
            if (draft.thumbnailUrl) {
              setThumbnailImage(draft.thumbnailUrl);
              formik.setFieldValue('thumbnail', draft.thumbnailUrl);
            }
            if (draft.promoVideoUrl) {
              setPromoVideo(draft.promoVideoUrl);
              formik.setFieldValue('promoVideo', draft.promoVideoUrl);
            }
          }
        });
      });
    }
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
          <label className="ins-label">Course title<span className="text-[#ff0000]"> *</span></label>
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
          <label className="ins-label">Course subtitle<span className="text-[#ff0000]"> *</span></label>
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
          <label className="ins-label">Course Description<span className="text-[#ff0000]"> *</span></label>
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
          <label className="ins-label">Basic Info<span className="text-[#ff0000]"> *</span></label>
          <div className="flex flex-col md:flex-row justify-between gap-2">
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
              onValueChange={value => {
                formik.setFieldValue("category", value);
                // Reset subcategory when category changes
                formik.setFieldValue("subcategory", "");
              }}
            >
              <SelectTrigger
                className="ins-control-border rounded-none"
                onBlur={() => formik.setFieldTouched("category", true)}
              >
                <SelectValue placeholder="Choose a Category">
                  {formik.values.category ? getCategoryName(formik.values.category) : ''}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
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
                <SelectValue placeholder="Choose a SubCategory">
                  {formik.values.subcategory ? getSubCategoryName(formik.values.subcategory) : ''}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {subCategories
                  .filter(sub => sub.categoryId === formik.values.category)
                  .map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                  ))}
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
        {/* <div className="mt-4 gap-2 flex flex-col">
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
        </div> */}

        {/* Course Image */}
        <div className="mt-4 gap-2 flex flex-col">
          <label className="ins-label">Course Image<span className="text-[#ff0000]"> *</span></label>
          <div className="ins-control-border gap-3 items-center justify-center flex flex-col">
            {thumbnailImage ? (
              <img
                src={thumbnailImage}
                alt="Uploaded course"
                className="rounded-lg w-80 h-48 object-cover"
              />
            ) : (
              <img
                src="/Images/image_3748512.png"
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
          <label className="ins-label">Promotional Video<span className="text-[#ff0000]"> *</span></label>
          <div className="ins-control-border gap-3 items-center justify-center flex flex-col">
            {promoVideo ? (
              <video
                src={promoVideo}
                controls
                className="rounded-lg w-80 h-48 object-cover"
              />
            ) : (
              <img
                src="/Images/multimedia.png"
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
          <Button className="rounded-none" type="submit" disabled={uploading}>
            {uploading ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
        {uploadError && <div className="text-red-500 text-xs mt-2">{uploadError}</div>}
      </div>
    </form>
  );
}