import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { toast } from "sonner";
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';
// import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

export default function InstructorSignupPage() {
  const [aadharImage, setAadharImage] = useState<string | null>(null);
  const [panImage, setPanImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const storage = getStorage();

  // const uploadImageAndGetUrl = async (fileString: string, path: string) => {
  //   const storageRef = ref(storage, path);
  //   await uploadString(storageRef, fileString, 'data_url');
  //   return await getDownloadURL(storageRef);
  // };

  const signupSchema = useFormik({
    initialValues: {
      experties: '',
      topic: '',
      adhaarnumber: '',
      PANnumber: '',
    },
    validationSchema: Yup.object({
      experties: Yup.string().required('Area of Expertise is required'),
      topic: Yup.string().required('Teaching Topics are required'),
      adhaarnumber: Yup.string()
        .matches(/^\d{12}$/, 'Aadhaar Number must be 12 digits')
        .required('Aadhaar Number is required'),
      PANnumber: Yup.string()
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN Number must be 10 characters (e.g. ABCDE1234F)')
        .required('PAN Number is required'),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      if (!aadharImage || !panImage) {
        const errors: Record<string, string> = {};
        if (!aadharImage) errors.aadharImage = "Aadhaar Card Image is required";
        if (!panImage) errors.panImage = "PAN Card Image is required";
        setErrors(errors);
        setSubmitting(false);
        return;
      }
      setLoading(true);
      try {
        // Skip file upload, just store a placeholder string for now
        const requestId = `${values.adhaarnumber}_${Date.now()}`;
        await setDoc(doc(db, 'instructor_requests', requestId), {
          experties: values.experties,
          topic: values.topic,
          adhaarnumber: values.adhaarnumber,
          PANnumber: values.PANnumber,
          aadharImage: 'skipped-for-now',
          panImage: 'skipped-for-now',
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
        toast.success('Your request has been sent to admin.');
        navigate('/instructor-signup-success');
      } catch (error: any) {
        toast.error(error.message || 'Submission failed. Please try again.');
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Column - Orange Background with Illustration */}
      <div className="hidden md:flex md:w-1/2 App-Gradient-Angular flex-col items-center justify-center px-[110px] relative">
        <div className="bg-white rounded-full p-8 w-4/5 aspect-square flex items-center justify-center">
          <img
            src="Images/5243321.png"
            alt="Woman logging in securely"
            className="max-w-full"
          />
        </div>
        <div className="text-center mt-8 text-white">
          <h2 className="text-white text-[31.25px] font-bold font-['Zen_Kaku_Gothic_Antique'] leading-[37.50px] mb-2">
            Share What You Love. Help Others Grow.
          </h2>
          <p className="text-neutral-100 text-base font-normal font-['Zen_Kaku_Gothic_Antique'] leading-7">
            Turn your passion into purpose by teaching online with ZK Tutorials.
          </p>
        </div>
      </div>

      {/* Right Column - Sign Up Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Create. Teach. Connect.</h1>
            <h1 className="text-2xl font-bold">as a Instructor</h1>
            <p className="text-sm text-gray-600 mt-2">Fields marked (<span className="text-[#ff0000]">*</span>) are mandatory.</p>
          </div>

          <form onSubmit={signupSchema.handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-between gap-2">
              <div>
                <label htmlFor="experties" className="text-sm text-gray-600 block mb-1">
                  Area Of Expertise<span className="text-[#ff0000]"> *</span>
                </label>
                <Input
                  id="experties"
                  name="experties"
                  type="text"
                  placeholder="e.g. Design"
                  value={signupSchema.values.experties}
                  onChange={signupSchema.handleChange}
                  onBlur={signupSchema.handleBlur}
                />
                {signupSchema.touched.experties && signupSchema.errors.experties && (
                  <div className="text-red-500 text-xs mt-1">{signupSchema.errors.experties}</div>
                )}
              </div>
              <div>
                <label htmlFor="topic" className="text-sm text-gray-600 block mb-1">
                  Teaching Topics<span className="text-[#ff0000]"> *</span>
                </label>
                <Input
                  id="topic"
                  name="topic"
                  type="text"
                  placeholder="e.g. Photoshop"
                  value={signupSchema.values.topic}
                  onChange={signupSchema.handleChange}
                  onBlur={signupSchema.handleBlur}
                />
                {signupSchema.touched.topic && signupSchema.errors.topic && (
                  <div className="text-red-500 text-xs mt-1">{signupSchema.errors.topic}</div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-between gap-2">
              <div>
                <label htmlFor="aadharImage" className="text-sm text-gray-600 block mb-1">
                  Aadhaar Card Image<span className="text-[#ff0000]"> *</span>
                </label>
                {!aadharImage ? (
                  <div>
                    <input
                      id="aadharImage"
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => setAadharImage(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      placeholder="Upload Your Aadhaar Card For KYC"
                    />
                    {(signupSchema.errors as any).aadharImage && (
                      <div className="text-red-500 text-xs mt-1">{(signupSchema.errors as any).aadharImage}</div>
                    )}
                  </div>
                ) : (
                  <div className="relative inline-block mt-2">
                    <img
                      src={aadharImage}
                      alt="Aadhaar Preview"
                      className="max-h-32 rounded border"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      onClick={() => setAadharImage(null)}
                      title="Remove"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="panImage" className="text-sm text-gray-600 block mb-1">
                  PAN Card Image<span className="text-[#ff0000]"> *</span>
                </label>
                {!panImage ? (
                  <div>
                    <input
                      id="panImage"
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      placeholder="Upload Your PAN Card For KYC"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => setPanImage(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {(signupSchema.errors as any).panImage && (
                      <div className="text-red-500 text-xs mt-1">{(signupSchema.errors as any).panImage}</div>
                    )}
                  </div>
                ) : (
                  <div className="relative inline-block mt-2">
                    <img
                      src={panImage}
                      alt="PAN Preview"
                      className="max-h-32 rounded border"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      onClick={() => setPanImage(null)}
                      title="Remove"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-between gap-2">
              <div>
                <label htmlFor="adhaarnumber" className="text-sm text-gray-600 block mb-1">
                  Enter Your Aadhaar Card Number<span className="text-[#ff0000]"> *</span>
                </label>
                <Input
                  id="adhaarnumber"
                  name="adhaarnumber"
                  type="text"
                  placeholder="e.g. 123456789012"
                  value={signupSchema.values.adhaarnumber}
                  onChange={signupSchema.handleChange}
                  onBlur={signupSchema.handleBlur}
                />
                {signupSchema.touched.adhaarnumber && signupSchema.errors.adhaarnumber && (
                  <div className="text-red-500 text-xs mt-1">{signupSchema.errors.adhaarnumber}</div>
                )}
              </div>
              <div>
                <label htmlFor="PANnumber" className="text-sm text-gray-600 block mb-1">
                  Enter Your PAN Card Number<span className="text-[#ff0000]"> *</span>
                </label>
                <Input
                  id="PANnumber"
                  name="PANnumber"
                  type="text"
                  placeholder="e.g. ABCDE1234F"
                  value={signupSchema.values.PANnumber}
                  onChange={signupSchema.handleChange}
                  onBlur={signupSchema.handleBlur}
                />
                {signupSchema.touched.PANnumber && signupSchema.errors.PANnumber && (
                  <div className="text-red-500 text-xs mt-1">{signupSchema.errors.PANnumber}</div>
                )}
              </div>
            </div>
            <Button
              className="px-8 btn-rouded bg-primary hover:bg-orange-600 mt-4"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}