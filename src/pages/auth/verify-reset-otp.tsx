// OTP Verification page for forgot password flow
import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import * as Yup from 'yup';
import { useFormik } from "formik";
import { toast } from "sonner";
import { API_BASE_URL } from '../../lib/api';

function getEmailFromHash() {
  const hash = window.location.hash;
  const match = hash.match(/email=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export default function VerifyResetOtpPage() {
  const [loading, setLoading] = useState(false);
  const email = getEmailFromHash();
  const otpSchema = useFormik({
    initialValues: {
      otp: '',
    },
    validationSchema: Yup.object({
      otp: Yup.string().required('OTP is required'),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await fetch(API_BASE_URL + 'verify-reset-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: values.otp,
            email: email,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success('OTP verified. Please reset your password.');
          window.location.hash = `#/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(values.otp)}`;
        } else {
          toast.error(data.message || 'Invalid OTP.');
        }
      } catch (error) {
        toast.error('Failed to verify OTP.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden md:flex md:w-1/2 App-Gradient-Angular flex-col items-center justify-center px-[110px] relative">
        <div className="bg-white rounded-full p-8 w-4/5 aspect-square flex items-center justify-center">
          <img
            src="Images/5243321.png"
            alt="OTP Verification"
            className="max-w-full"
          />
        </div>
        <div className="text-center mt-8 text-white">
          <h2 className="text-white text-[31.25px] font-bold font-['Zen_Kaku_Gothic_Antique'] leading-[37.50px] mb-2">Verify OTP</h2>
          <p className="text-neutral-100 text-base font-normal font-['Zen_Kaku_Gothic_Antique'] leading-7">
            Enter the OTP sent to your email to continue.
          </p>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Verify OTP</h1>
          </div>
          <form onSubmit={otpSchema.handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="otp" className="text-sm text-gray-600 block mb-1">
                OTP
              </label>
              <Input id="otp" type="text"
                value={otpSchema.values.otp}
                onChange={otpSchema.handleChange}
                onBlur={otpSchema.handleBlur} placeholder="Enter OTP" />
              {otpSchema.touched.otp && otpSchema.errors.otp && (
                <p className="text-red-500 text-sm mt-1">{otpSchema.errors.otp}</p>
              )}
            </div>
            <div className="flex items-center justify-between space-x-2 mt-4">
              <Button type="submit" className="px-8 btn-rouded bg-orange-500 hover:bg-orange-600 mt-4" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </div>
            <div className="text-center text-sm mt-6">
              <a href="/#/login" className="text-blue-600 font-medium">Back to Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 