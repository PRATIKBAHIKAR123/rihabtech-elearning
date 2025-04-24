import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

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
          <h2 className="text-white text-[31.25px] font-bold font-['Zen_Kaku_Gothic_Antique'] leading-[37.50px] mb-2">Ready to Learn Something New?</h2>
          <p className="text-neutral-100 text-base font-normal font-['Zen_Kaku_Gothic_Antique'] leading-7">
            Join a platform where learning is fun, flexible, and pressure-free.
          </p>
        </div>
      </div>

      {/* Right Column - Sign Up Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Sign Up. Dive In. Learn Freely.</h1>
          </div>

          <div className="flex gap-2 mb-6">
            <Button className="btn-rouded flex-1 hover:bg-orange-600">
              Signup As Learner
            </Button>
            <Button variant={'secondary'} className="btn-rouded flex-1">
              Signup As Instructor
            </Button>
          </div>

          <div className="space-y-4">
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
              <Input id="email" type="email" placeholder="johndoe@email.com" />
            </div>

            <div>
              <label htmlFor="address" className="text-sm text-gray-600 block mb-1">
                Address
              </label>
              <div className="relative">
                <Input id="address" placeholder="Mumbai, India" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-sm text-gray-600 block mb-1">
                Password
              </label>
              <div className="relative">
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                />
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
            <div className="flex items-center justify-between space-x-2 mt-4">
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox id="terms" className="data-[state=checked]:bg-orange-500 border-gray-300" />
              <label htmlFor="terms" className="text-xs text-gray-600">
                I accept the terms & conditions
              </label>
            </div>

            <Button className="px-8 btn-rouded bg-orange-500 hover:bg-orange-600 mt-4">
              SIGN UP
            </Button>
            </div>

            <div className="text-center text-sm mt-6">
              Own an Account? <a href="/#/login" className="text-blue-600 font-medium">JUMP RIGHT IN</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}