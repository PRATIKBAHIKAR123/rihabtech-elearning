import { useState, useEffect } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { toast } from "sonner";
import { setDoc, doc, getDocs, query, where, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';
// import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

export default function InstructorSignupPage() {
  const [aadharImage, setAadharImage] = useState<string | null>(null);
  const [panImage, setPanImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const navigate = useNavigate();
  // const storage = getStorage();

  // Check if user is logged in and if they already applied
  useEffect(() => {
    const checkUserAndApplicationStatus = async () => {
      try {
        // Get user info from localStorage
        const tokenData = localStorage.getItem('token');
        if (!tokenData) {
          toast.error('Please login first to apply as instructor');
          navigate('/login');
          return;
        }

        const userData = JSON.parse(tokenData);
        console.log('User data found:', userData);
        setUserInfo(userData);

        // Check if user already applied
        const userEmail = userData.UserName || userData.email;
        console.log('Checking for existing applications with email:', userEmail);
        
        if (userEmail) {
          // Check both possible field names (userEmail and instructorId)
          const q1 = query(
            collection(db, 'instructor_requests'), 
            where('userEmail', '==', userEmail)
          );
          const q2 = query(
            collection(db, 'instructor_requests'), 
            where('instructorId', '==', userEmail)
          );
          
          const [querySnapshot1, querySnapshot2] = await Promise.all([
            getDocs(q1),
            getDocs(q2)
          ]);
          
          console.log('Query results:', {
            userEmailQuery: querySnapshot1.size,
            instructorIdQuery: querySnapshot2.size
          });
          
          if (!querySnapshot1.empty || !querySnapshot2.empty) {
            // User already applied, redirect to success page
            const existingApplication = (!querySnapshot1.empty 
              ? querySnapshot1.docs[0].data() 
              : querySnapshot2.docs[0].data());
            
            console.log('Existing application found:', existingApplication);
            
            // Store application status in localStorage
            localStorage.setItem('instructorApplicationStatus', JSON.stringify({
              status: existingApplication.status,
              appliedAt: existingApplication.createdAt,
              email: userEmail,
              applicationId: existingApplication.applicationId || 'unknown'
            }));
            
            toast.info('You have already applied to become an instructor');
            setTimeout(() => {
              navigate('/instructor-signup-success');
            }, 1000);
            return;
          }
        }
        
        console.log('No existing application found, showing signup form');
      } catch (error) {
        console.error('Error checking application status:', error);
        toast.error('Error checking application status');
      }
    };

    checkUserAndApplicationStatus();
  }, [navigate]);

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

      if (!userInfo) {
        toast.error('User information not found. Please login again.');
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const userEmail = userInfo.UserName || userInfo.email;
        const userName = userInfo.Name || userInfo.name || 'Unknown User';
        
        // Create request ID using user email and timestamp
        const requestId = `${userEmail.replace('@', '_').replace('.', '_')}_${Date.now()}`;
        
        // Store instructor request with user information
        await setDoc(doc(db, 'instructor_requests', requestId), {
          // User Information
          userEmail: userEmail,
          userName: userName,
          userToken: userInfo.AccessToken || '',
          instructorId: userEmail, // Add instructorId field for admin panel compatibility
          
          // Application Data
          experties: values.experties,
          topic: values.topic,
          adhaarnumber: values.adhaarnumber,
          PANnumber: values.PANnumber,
          aadharImage: 'skipped-for-now', // TODO: Implement file upload
          panImage: 'skipped-for-now', // TODO: Implement file upload
          
          // Status and Metadata
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          
          // Additional fields for admin reference
          role: 'instructor',
          applicationId: requestId
        });

        // Store application status in localStorage
        localStorage.setItem('instructorApplicationStatus', JSON.stringify({
          status: 'pending',
          appliedAt: new Date().toISOString(),
          email: userEmail,
          applicationId: requestId
        }));

        toast.success('Your request has been sent to admin.');
        navigate('/instructor-signup-success');
      } catch (error: any) {
        console.error('Submission error:', error);
        toast.error(error.message || 'Submission failed. Please try again.');
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  // Show loading if user info is not loaded yet
  if (!userInfo) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

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
            <p className="text-sm text-gray-600 mt-2">
              Welcome, <strong>{userInfo.Name}</strong>! Complete your instructor application below.
            </p>
            <p className="text-sm text-gray-600 mt-1">Fields marked (<span className="text-[#ff0000]">*</span>) are mandatory.</p>
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
                  <div className="relative mt-2">
                    <div className="w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={aadharImage}
                        alt="Aadhaar Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                      onClick={() => setAadharImage(null)}
                      title="Remove Image"
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
                  <div className="relative mt-2">
                    <div className="w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={panImage}
                        alt="PAN Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                      onClick={() => setPanImage(null)}
                      title="Remove Image"
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