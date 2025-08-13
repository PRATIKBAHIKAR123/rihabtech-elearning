import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function InstructorSignupSuccess() {
  const navigate = useNavigate();
  const [applicationStatus, setApplicationStatus] = useState<any>(null);

  useEffect(() => {
    // Get application status from localStorage
    const statusData = localStorage.getItem('instructorApplicationStatus');
    if (statusData) {
      setApplicationStatus(JSON.parse(statusData));
    }
  }, []);

  const getStatusMessage = () => {
    if (!applicationStatus) return 'Your application has been submitted';
    
    switch (applicationStatus.status) {
      case 'pending':
        return 'Your application is under review';
      case 'approved':
        return 'Congratulations! Your application has been approved';
      case 'rejected':
        return 'Your application has been rejected';
      default:
        return 'Your application has been submitted';
    }
  };

  const getStatusColor = () => {
    if (!applicationStatus) return 'text-blue-600';
    
    switch (applicationStatus.status) {
      case 'pending':
        return 'text-orange-600';
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

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
          <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
            {applicationStatus?.status === 'approved' ? 'Application Approved!' : 
             applicationStatus?.status === 'rejected' ? 'Application Update' :
             'Application Submitted!'}
          </h1>
          
          <div className="mb-6">
            <p className={`text-lg font-medium mb-2 ${getStatusColor()}`}>
              {getStatusMessage()}
            </p>
            
            {applicationStatus && (
              <div className="text-sm text-gray-600 space-y-1">
                <p>Application ID: <span className="font-mono text-xs">{applicationStatus.applicationId?.slice(-8) || 'N/A'}</span></p>
                <p>Applied on: {new Date(applicationStatus.appliedAt).toLocaleDateString()}</p>
                <p>Status: <span className={`font-semibold ${getStatusColor()}`}>{applicationStatus.status}</span></p>
              </div>
            )}
          </div>

          {applicationStatus?.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>What's Next?</strong><br/>
                Our admin team is reviewing your application. This usually takes 1-3 business days. 
                You'll be notified once a decision is made.
              </p>
            </div>
          )}

          {applicationStatus?.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">
                <strong>Welcome to our instructor community!</strong><br/>
                You can now start creating and publishing courses. Access your instructor dashboard to get started.
              </p>
            </div>
          )}

          {applicationStatus?.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">
                <strong>Application Not Approved</strong><br/>
                Your application didn't meet our current requirements. You can reapply after addressing any feedback provided.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {applicationStatus?.status === 'approved' ? (
              <>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={() => navigate('/instructor/dashboard')}
                >
                  Go to Instructor Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/')}
                >
                  Go to Homepage
                </Button>
              </>
            ) : (
              <Button 
                className="bg-primary hover:bg-orange-600" 
                onClick={() => navigate('/')}
              >
                Go to Homepage
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 