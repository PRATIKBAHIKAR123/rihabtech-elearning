import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

const InstructorProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string>('');
  const [applicationId, setApplicationId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    experties: '',
    topic: '',
    PANnumber: '',
    adhaarnumber: '',
    aadharImage: 'skipped-for-now',
    panImage: 'skipped-for-now',
  });

  useEffect(() => {
    // Get user data from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = JSON.parse(token);
        setUser(userData);
        if (userData.UserName) {
          checkExistingApplication(userData.UserName);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const checkExistingApplication = async (userEmail: string) => {
    try {
      console.log('Checking for existing applications for:', userEmail);
      
      // Ensure we have a valid email
      if (!userEmail || typeof userEmail !== 'string') {
        console.log('Invalid email provided');
        setLoading(false);
        return;
      }

      // Query Firebase for existing applications with proper error handling
      const instructorRequestsRef = collection(db, 'instructor_requests');
      const q = query(
        instructorRequestsRef,
        where('userEmail', '==', userEmail)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        console.log('Found existing application:', data);
        
        setHasApplied(true);
        setApplicationStatus(data.status || 'pending');
        setApplicationId(doc.id);
      } else {
        console.log('No existing application found');
        setHasApplied(false);
      }
    } catch (error) {
      console.error('Error checking existing applications:', error);
      // Don't show error to user for this check, just log it
      setHasApplied(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.UserName) {
      toast.error('Please log in to apply as an instructor');
      return;
    }

    if (hasApplied) {
      toast.info('You have already applied to become an instructor');
      return;
    }

    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.experties || !formData.topic || !formData.PANnumber || !formData.adhaarnumber) {
        toast.error('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      // Validate PAN format
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(formData.PANnumber)) {
        toast.error('Please enter a valid PAN number (e.g., ABCDE1234F)');
        setSubmitting(false);
        return;
      }

      // Validate Aadhar format
      const aadharRegex = /^[0-9]{12}$/;
      if (!aadharRegex.test(formData.adhaarnumber)) {
        toast.error('Please enter a valid 12-digit Aadhar number');
        setSubmitting(false);
        return;
      }

      // Create instructor request document
      const instructorRequest = {
        userEmail: user.UserName,
        instructorId: user.UserName, // Using email as instructorId for consistency
        userName: user.Name || '',
        experties: formData.experties.trim(),
        topic: formData.topic.trim(),
        PANnumber: formData.PANnumber.toUpperCase().trim(),
        adhaarnumber: formData.adhaarnumber.trim(),
        aadharImage: formData.aadharImage,
        panImage: formData.panImage,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Submitting instructor request:', instructorRequest);

      // Save to Firebase with proper error handling
      const docRef = await addDoc(collection(db, 'instructor_requests'), instructorRequest);
      console.log('Document written with ID: ', docRef.id);

      // Update local state
      setHasApplied(true);
      setApplicationStatus('pending');
      setApplicationId(docRef.id);

      toast.success('Your instructor application has been submitted successfully!');
      
      // Clear form
      setFormData({
        experties: '',
        topic: '',
        PANnumber: '',
        adhaarnumber: '',
        aadharImage: 'skipped-for-now',
        panImage: 'skipped-for-now',
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-sm font-medium ${statusClasses[status as keyof typeof statusClasses] || statusClasses.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to access the instructor profile.</p>
          <button
            onClick={() => window.location.href = '/#/login'}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Instructor Profile</h1>
          <p className="text-gray-600">Welcome, {user.Name}</p>
          <p className="text-sm text-gray-500">{user.UserName}</p>
        </div>

        {/* Application Status */}
        {hasApplied ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Status</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Your instructor application has been submitted.</p>
                <p className="text-sm text-gray-500">Application ID: {applicationId}</p>
              </div>
              <div className="text-right">
                {getStatusBadge(applicationStatus)}
              </div>
            </div>
            
            {applicationStatus === 'pending' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">
                  <strong>Your application is under review.</strong> We'll notify you once it's been processed by our admin team.
                </p>
              </div>
            )}
            
            {applicationStatus === 'approved' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 text-sm">
                  <strong>Congratulations!</strong> Your instructor application has been approved. You can now start creating courses.
                </p>
                <button
                  onClick={() => window.location.href = '/#/instructor/dashboard'}
                  className="mt-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                >
                  Go to Instructor Dashboard
                </button>
              </div>
            )}
            
            {applicationStatus === 'rejected' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">
                  <strong>Application Not Approved.</strong> Unfortunately, your instructor application was not approved at this time. Please contact support for more information.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Application Form */
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Apply to Become an Instructor</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="experties" className="block text-sm font-medium text-gray-700 mb-2">
                    Expertise <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="experties"
                    name="experties"
                    value={formData.experties}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g. Web Development, UI/UX Design"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                    Teaching Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g. React, Figma, JavaScript"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="PANnumber" className="block text-sm font-medium text-gray-700 mb-2">
                    PAN Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="PANnumber"
                    name="PANnumber"
                    value={formData.PANnumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: ABCDE1234F</p>
                </div>

                <div>
                  <label htmlFor="adhaarnumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Aadhar Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="adhaarnumber"
                    name="adhaarnumber"
                    value={formData.adhaarnumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="123456789012"
                    maxLength={12}
                    pattern="[0-9]{12}"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">12-digit Aadhar number</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Document Upload</h3>
                <p className="text-sm text-blue-700">
                  Document upload functionality will be available after initial application approval. 
                  For now, your application will be processed with the provided information.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorProfile;
