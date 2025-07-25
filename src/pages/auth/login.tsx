import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { toast } from "sonner";
import { API_BASE_URL } from '../../lib/api';


export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const loginSchema = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is Required'),
      password: Yup.string().required('Password is Required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await fetch(API_BASE_URL + 'login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: values.email,
            password: values.password,
          }),
        });
        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
        if (response.ok && data) {
          // If data is a string, parse it (API may return object or stringified object)
          let userObj = typeof data === 'string' ? JSON.parse(data) : data;
          localStorage.setItem('token', JSON.stringify(userObj));
          toast.success('Login Successfully');
          window.location.hash = '/learner/homepage';
          window.location.reload();
        } else {
          const errorMsg = typeof data === 'string'
            ? data
            : data.message || data.error || data.msg || 'Login failed. Please try again.';
          toast.error(errorMsg);
        }
      } catch (error) {
        console.log('error', error);
        toast.error('Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Column - Orange Background with Illustration */}
      <div className="hidden md:flex md:w-1/2 App-Gradient-Angular flex-col items-center justify-center px-[110px] relative">
        <div className="bg-white rounded-full p-8 w-4/5 aspect-square flex items-center justify-center">
          <img
            src="Images/4860253.png"
            alt="Woman logging in securely"
            className="max-w-full"
          />
        </div>
        <div className="text-center mt-8 text-white">
          <h2 className="text-white text-[31.25px] font-bold font-['Zen_Kaku_Gothic_Antique'] leading-[37.50px] mb-2">An Online Learning Community for Curious Minds?</h2>
          <p className="text-neutral-100 text-base font-normal font-['Zen_Kaku_Gothic_Antique'] leading-7">
          Explore engaging online courses led by expert instructors — no certificates, just pure learning.
          </p>
        </div>
      </div>

      {/* Right Column - Sign Up Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">The Space Where Learners & Teachers Connect</h1>
          </div>

          {/* <div className="flex gap-2 mb-6">
            <Button className="btn-rouded flex-1 hover:bg-orange-600">
              Login As Learner
            </Button>
            <Button variant={'secondary'} className="btn-rouded flex-1">
             Login As Instructor
            </Button>
          </div> */}

          <form onSubmit={loginSchema.handleSubmit} className="space-y-4">
            {/* <div>
              <label htmlFor="username" className="text-sm text-gray-600 block mb-1">
                Username
              </label>
              <Input id="username" placeholder="johndoe" />
            </div> */}

            <div>
              <label htmlFor="email" className="text-sm text-gray-600 block mb-1">
                Email
              </label>
              <Input id="email" type="email"
              value={loginSchema.values.email}
          onChange={loginSchema.handleChange}
          onBlur={loginSchema.handleBlur}
               placeholder="johndoe@email.com" />
               {loginSchema.touched.email && loginSchema.errors.email && (
          <p className="text-red-500 text-sm mt-1">{loginSchema.errors.email}</p>
        )}
            </div>


            <div>
              <label htmlFor="password" className="text-sm text-gray-600 block mb-1">
                Password
              </label>
              <div className="relative">
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={loginSchema.values.password}
          onChange={loginSchema.handleChange}
                  placeholder="••••••••••••"
                />
                 {loginSchema.touched.password && loginSchema.errors.password && (
          <p className="text-red-500 text-sm mt-1">{loginSchema.errors.password}</p>
        )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOffIcon size={16} />
                  ) : (
                    <EyeIcon size={16} />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 mt-4">
            {/* <div className="flex items-center space-x-2 mt-4">
              <Checkbox id="terms" className="data-[state=checked]:bg-orange-500 border-gray-300" />
              <label htmlFor="terms" className="text-xs text-gray-600">
                I accept the terms & conditions
              </label>
            </div> */}

            <Button type="submit" className="px-8 btn-rouded bg-primary hover:bg-orange-600 mt-4" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
            </Button>
            </div>

            <div className="text-center text-sm flex mt-6 justify-between">
            <span>Don’t Own an Account? <a href="/#/sign-up" className="text-blue-600 font-medium">Sign Up</a></span>
            <a href="#/forgot-password" className="text-primary font-bold">Forgot Password</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}