import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function InstructorSignupSuccess() {
  const navigate = useNavigate();
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

      {/* Right Column - Success Message */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-green-600">Request Submitted!</h1>
          <p className="mb-6 text-gray-700">
            Your request has been sent to admin.<br/>
            Once approved, you will be notified and able to add courses.
          </p>
          <Button className="bg-primary hover:bg-orange-600" onClick={() => navigate('/')}>Go to Homepage</Button>
        </div>
      </div>
    </div>
  );
} 