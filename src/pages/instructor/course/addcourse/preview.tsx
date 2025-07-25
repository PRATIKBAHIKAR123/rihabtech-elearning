
import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { getFullCourseData } from '../../../../utils/firebaseCoursePreview';
import {
  getCourseCurriculum,
  getCourseLandingPage,
  getCourseIntendedLearners,
  getCourseStructure
} from '../../../../utils/firebaseCoursePreviewHelpers';
import { BookOpen, Users, Layers, Info, DollarSign, MessageSquare } from 'lucide-react';

const PreviewCourse = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [landingPage, setLandingPage] = useState<any>({});
  const [intendedLearners, setIntendedLearners] = useState<any[]>([]);
  const [structure, setStructure] = useState<any[]>([]);
  const courseId = localStorage.getItem('courseId') || 'test-course-id';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getFullCourseData(courseId);
      setCourse(data);
      setCurriculum(await getCourseCurriculum(courseId));
      setLandingPage(await getCourseLandingPage(courseId));
      setIntendedLearners(await getCourseIntendedLearners(courseId));
      setStructure(await getCourseStructure(courseId));
      setLoading(false);
    };
    fetchData();
  }, [courseId]);

  const goToDashboard = () => {
    window.location.hash = '#/instructor/dashboard';
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

  if (loading) {
    return <div className="text-center py-16 text-lg">Loading course preview...</div>;
  }

  if (!course) {
    return <div className="text-center py-16 text-lg text-red-500">Course not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded shadow mt-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Course Preview</h1>
      {/* Course Title & Category */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2"><BookOpen className="inline-block text-orange-500" /> {course.title || 'Course Title'}</h2>
          {course.category && (
            <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full mr-2 mt-2 text-sm">{course.category}</span>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-400">Course ID</span>
          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{courseId}</span>
        </div>
      </div>

      {/* Intended Learners */}
      <div className="mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><Users className="inline-block text-blue-500" /> Intended Learners</h3>
        {intendedLearners.length > 0 ? (
          <ul className="list-disc ml-6 text-gray-700">
            {intendedLearners.map((l: any, i: number) => <li key={i}>{l}</li>)}
          </ul>
        ) : <div className="text-gray-400">No intended learners specified.</div>}
      </div>

      {/* Course Structure */}
      <div className="mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><Layers className="inline-block text-green-500" /> Course Structure</h3>
        {structure.length > 0 ? (
          <ul className="list-disc ml-6 text-gray-700">
            {structure.map((s: any, i: number) => <li key={i}>{s}</li>)}
          </ul>
        ) : <div className="text-gray-400">No structure specified.</div>}
      </div>

      {/* Curriculum */}
      <div className="mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><Info className="inline-block text-purple-500" /> Curriculum</h3>
        {curriculum.length > 0 ? (
          <ul className="list-disc ml-6 text-gray-700">
            {curriculum.map((c: any, i: number) => <li key={i}>{c}</li>)}
          </ul>
        ) : <div className="text-gray-400">No curriculum specified.</div>}
      </div>

      {/* Course Landing Page */}
      <div className="mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><Info className="inline-block text-pink-500" /> Course Landing Page</h3>
        {landingPage && Object.keys(landingPage).length > 0 ? (
          <div className="bg-gray-50 border rounded p-4">
            {Object.entries(landingPage).map(([key, value]) => (
              <div key={key} className="mb-2"><span className="font-semibold capitalize">{key}:</span> <span className="text-gray-700">{String(value)}</span></div>
            ))}
          </div>
        ) : <div className="text-gray-400">No landing page data.</div>}
      </div>

      {/* Pricing & Access */}
      <div className="mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><DollarSign className="inline-block text-yellow-500" /> Pricing & Access</h3>
        <div className="mb-2"><strong>Pricing:</strong> {course.pricing ? course.pricing.charAt(0).toUpperCase() + course.pricing.slice(1) : 'N/A'}</div>
        <div className="mb-2">
          <strong>Access Platforms:</strong>
          <ul className="list-disc ml-6">
            {course.access?.website && <li>Website</li>}
            {course.access?.app && <li>Mobile App</li>}
            {course.access?.private && <li>Private (Members Only)</li>}
          </ul>
        </div>
        {course.members && course.members.length > 0 && (
          <div className="mb-2">
            <strong>Private Members:</strong>
            <ul className="list-disc ml-6">
              {course.members.map((m: any) => (
                <li key={m.id}>{m.email} ({m.role})</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Course Messages */}
      <div className="mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><MessageSquare className="inline-block text-indigo-500" /> Course Messages</h3>
        {course.welcomeMessage && (
          <div className="mb-2">
            <strong>Welcome Message:</strong>
            <div className="bg-gray-50 border rounded p-2 mt-1">{course.welcomeMessage}</div>
          </div>
        )}
        {course.congratulationsMessage && (
          <div className="mb-2">
            <strong>Congratulations Message:</strong>
            <div className="bg-gray-50 border rounded p-2 mt-1">{course.congratulationsMessage}</div>
          </div>
        )}
        {(!course.welcomeMessage && !course.congratulationsMessage) && <div className="text-gray-400">No course messages.</div>}
      </div>

      <div className="mt-8 flex justify-end">
        <Button className="bg-primary text-white px-6 py-2 rounded" onClick={() => setSubmitted(true)}>
          Submit for Review
        </Button>
      </div>
    </div>
  );
};

export default PreviewCourse;