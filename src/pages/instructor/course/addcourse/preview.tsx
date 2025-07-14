import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { useNavigate } from 'react-router-dom';

const PreviewCourse = () => {
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  // Read course draft from localStorage
  const draft = JSON.parse(localStorage.getItem('courseDraft') || '{}');

  const goToDashboard = () => {
    if (navigate) {
      navigate('/instructor/dashboard');
    } else {
      window.location.hash = '#/instructor/dashboard';
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded relative mt-10 mb-6 w-full max-w-lg text-center">
          <strong className="font-bold">Course submitted for review!</strong>
          <span className="block mt-2">We will notify you once your course is approved.</span>
        </div>
        <Button onClick={goToDashboard}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded shadow mt-8">
      <h1 className="text-3xl font-bold mb-4">Course Preview</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{draft.title || 'Course Title'}</h2>
        <p className="text-gray-700 mt-2">{draft.subtitle || 'Course Subtitle'}</p>
        <p className="text-gray-600 mt-2">{draft.description || 'Course Description'}</p>
        <div className="mt-4">
          <span className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full mr-2">{draft.category || 'Category'}</span>
          <span className="inline-block bg-gray-200 text-gray-800 px-3 py-1 rounded-full">{draft.level || 'Level'}</span>
        </div>
      </div>
      {/* Add more sections as needed, e.g. curriculum, requirements, etc. */}
      <div className="mt-8 flex justify-end">
        <Button className="bg-primary text-white px-6 py-2 rounded" onClick={() => setSubmitted(true)}>
          Submit for Review
        </Button>
      </div>
    </div>
  );
};

export default PreviewCourse; 