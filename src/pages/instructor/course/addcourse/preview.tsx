
import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Button } from '../../../../components/ui/button';
import LoadingIcon from '../../../../components/ui/LoadingIcon';
import { getFullCourseData } from '../../../../utils/firebaseCoursePreview';
import {
  getCourseCurriculum,
  getCourseLandingPage,
  getCourseIntendedLearners,
  getCourseStructure
} from '../../../../utils/firebaseCoursePreviewHelpers';
import { getCategories, getSubCategories } from '../../../../utils/firebaseCategory';
import { BookOpen, Users, Info, DollarSign, MessageSquare, Eye } from 'lucide-react';

const PreviewCourse = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [landingPage, setLandingPage] = useState<any>({});
  const [intendedLearners, setIntendedLearners] = useState<any[]>([]);
  const [structure, setStructure] = useState<any[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [categoryName, setCategoryName] = useState<string>('');
  const [subcategoryName, setSubcategoryName] = useState<string>('');
  const draftId = useRef<string>(localStorage.getItem('draftId') || '');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getFullCourseData(draftId.current);
      setCourse(data);
      setCurriculum(await getCourseCurriculum(draftId.current));
      setLandingPage(await getCourseLandingPage(draftId.current));
      setIntendedLearners(await getCourseIntendedLearners(draftId.current));
      setStructure(await getCourseStructure(draftId.current));
      
      // Fetch category and subcategory names
      if (data && (data.category || data.subcategory)) {
        const [categories, subcategories] = await Promise.all([
          getCategories(),
          getSubCategories()
        ]);
        
        if (data.category) {
          const category = categories.find((cat: any) => cat.id === data.category);
          setCategoryName((category as any)?.name || data.category);
        }
        
        if (data.subcategory) {
          const subcategory = subcategories.find((sub: any) => sub.id === data.subcategory);
          setSubcategoryName((subcategory as any)?.name || data.subcategory);
        }
      }
      
      setLoading(false);
    };
    fetchData();
  }, []);


  const goToDashboard = () => {
    window.location.hash = '#/instructor/course-test-selection';
  };

  // Submit for Review handler
  const handleSubmitForReview = async () => {
    if (!draftId.current) return;
    const draftRef = doc(db, 'courseDrafts', draftId.current);
    await updateDoc(draftRef, { submittedForReview: true, submittedAt: new Date().toISOString() });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="bg-gradient-to-br from-green-200 via-green-100 to-white border border-green-400 text-green-800 px-8 py-8 rounded-2xl shadow-lg mt-16 mb-8 w-full max-w-xl text-center animate-fade-in">
          <svg className="mx-auto mb-4" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2l4-4"/></svg>
          <h2 className="text-2xl font-bold mb-2">Course Submitted for Review!</h2>
          <p className="mb-4 text-lg">Thank you for submitting your course. Our admin team will review your course soon.</p>
          <div className="mb-4 text-green-700 bg-green-50 border border-green-200 rounded p-3">
            <span className="font-semibold">What happens next?</span>
            <ul className="list-disc ml-6 mt-2 text-left text-green-800">
              <li>You will receive a notification and email once your course is approved or if any changes are required.</li>
              <li>While under review, you can still edit your course but cannot publish it until approved.</li>
            </ul>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow" onClick={goToDashboard}>
            Go to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingIcon /></div>;
  }

  if (!course) {
    return <div className="text-center py-16 text-lg text-red-500">Course not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded shadow mt-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Course Preview</h1>
      {/* Course Title & Category */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2"><BookOpen className="inline-block text-orange-500" /> Course Title</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xl font-semibold">{course.title || 'Course Title'}</span>
            {categoryName && (
              <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full ml-4 text-sm">{categoryName}</span>
            )}
          </div>
          {/* <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400">Course ID</span>
            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{draftId.current}</span>
          </div> */}
        </div>
      </div>

      {/* Intended Learners */}
      <div className="mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><Users className="inline-block text-blue-500" /> Intended Learners</h3>
        {(course.learn && Array.isArray(course.learn) && course.learn.length > 0) || (course.requirements && Array.isArray(course.requirements) && course.requirements.length > 0) || (course.target && Array.isArray(course.target) && course.target.length > 0) ? (
          <div>
            {course.learn && course.learn.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold">What will students learn in your course?</div>
                <ul className="list-disc ml-6 text-gray-700">
                  {course.learn.map((l: any, i: number) => <li key={i}>{l}</li>)}
                </ul>
              </div>
            )}
            {course.requirements && course.requirements.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold">Course Requirements / Prerequisites</div>
                <ul className="list-disc ml-6 text-gray-700">
                  {course.requirements.map((r: any, i: number) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            {course.target && course.target.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold">Who is this course for?</div>
                <ul className="list-disc ml-6 text-gray-700">
                  {course.target.map((t: any, i: number) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            )}
          </div>
        ) : <div className="text-gray-400">No intended learners specified.</div>}
      </div>



      {/* Curriculum */}
      <div className="mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><Info className="inline-block text-purple-500" /> Curriculum</h3>
        {course.curriculum && course.curriculum.sections && course.curriculum.sections.length > 0 ? (
          <div className="space-y-6">
            {course.curriculum.sections.map((section: any, sectionIdx: number) => (
              <div key={sectionIdx} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-lg text-primary">Section {sectionIdx + 1}:</span>
                  <span className="font-semibold text-gray-700">{section.name}</span>
                  {section.published ? (
                    <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 rounded text-xs">Published</span>
                  ) : (
                    <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">Unpublished</span>
                  )}
                </div>
                {section.description && <div className="mb-2 text-gray-600">{section.description}</div>}
                <div className="ml-4">
                  {section.items && section.items.length > 0 ? (
                    <ul className="list-disc ml-4">
                      {section.items.map((item: any, itemIdx: number) => (
                        <li key={itemIdx} className="mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-semibold text-gray-800 capitalize">{item.type === 'lecture' ? 'Lecture' : item.type === 'quiz' ? 'Quiz' : item.type === 'assignment' ? 'Assignment' : 'Item'}: {item.lectureName || item.quizTitle || item.title || ''}</div>
                            {item.published ? (
                              <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">Published</span>
                            ) : (
                              <span className="px-2 py-1 bg-orange-200 text-orange-700 rounded text-xs">Unpublished</span>
                            )}
                            {item.type === 'lecture' && item.contentType === 'video' && item.isPromotional && (
                              <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">Free Preview</span>
                            )}
                          </div>
                          {item.type === 'lecture' && (
                            <div className="text-gray-600">
                              {item.description && <div>Description: {item.description}</div>}
                              {item.contentType && <div>Type: {item.contentType}</div>}
                              {item.duration && <div>Duration: {Math.round(item.duration)} sec</div>}
                              {item.contentFiles && item.contentFiles.length > 0 && (
                                <div className="mt-2">
                                  <div className="font-semibold">Files:</div>
                                  <ul className="ml-4">
                                    {item.contentFiles.map((f: any, i: number) => (
                                      <li key={i} className="mb-2">
                                        {f.contentType === 'video' || item.contentType === 'video' ? (
                                          <video controls width={320} src={f.url || item.url} poster={item.thumbnailUrl || ''} style={{ maxWidth: 320, maxHeight: 180 }}>
                                            Your browser does not support the video tag.
                                          </video>
                                        ) : null}
                                        {f.contentType === 'article' || item.contentType === 'article' || f.name?.toLowerCase().endsWith('.pdf') ? (
                                          <a href={f.url || item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-2">
                                            <span role="img" aria-label="document">📄</span> {f.name || 'Document'}
                                          </a>
                                        ) : null}
                                        {!f.contentType && !f.name?.toLowerCase().endsWith('.pdf') && !f.url?.endsWith('.pdf') && !f.url?.endsWith('.mp4') && (
                                          <span>{f.name || f.url || 'File'}</span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                          {item.type === 'quiz' && (
                            <div className="text-gray-600">
                              {item.quizDescription && <div>Description: {item.quizDescription}</div>}
                              {item.questions && item.questions.length > 0 && (
                                <div>
                                  <div>Questions:</div>
                                  <ol className="list-decimal ml-6">
                                    {item.questions.map((q: any, qIdx: number) => (
                                      <li key={qIdx} className="mb-1">
                                        <div>Q: {q.question}</div>
                                        <div>Options: {q.options && q.options.join(', ')}</div>
                                        <div>Correct: {Array.isArray(q.correctOption) ? q.correctOption.map((idx: number) => q.options[idx]).join(', ') : q.options[q.correctOption]}</div>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                            </div>
                          )}
                          {item.type === 'assignment' && (
                            <div className="text-gray-600">
                              {item.description && <div>Description: {item.description}</div>}
                              {item.duration && <div>Duration: {item.duration} min</div>}
                              {item.totalMarks && <div>Total Marks: {item.totalMarks}</div>}
                              {item.questions && item.questions.length > 0 && (
                                <div>
                                  <div>Questions:</div>
                                  <ol className="list-decimal ml-6">
                                    {item.questions.map((q: any, qIdx: number) => (
                                      <li key={qIdx} className="mb-1">
                                        <div>Q: {q.question}</div>
                                        <div>Marks: {q.marks}</div>
                                        {q.answer && <div>Answer: {q.answer}</div>}
                                        {q.maxWordLimit && <div>Word Limit: {q.maxWordLimit}</div>}
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : <div className="text-gray-400 ml-4">No items in this section.</div>}
                </div>
              </div>
            ))}
          </div>
        ) : <div className="text-gray-400">No curriculum specified.</div>}
      </div>

      {/* Course Landing Page */}
      <div className="mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><Info className="inline-block text-pink-500" /> Course Landing Page</h3>
        {(course.landingPage && Object.keys(course.landingPage).length > 0) ? (
          <div className="bg-gray-50 border rounded p-4">
            {Object.entries(course.landingPage).map(([key, value]) => (
              <div key={key} className="mb-2"><span className="font-semibold capitalize">{key}:</span> <span className="text-gray-700">{String(value)}</span></div>
            ))}
          </div>
        ) : (
          // Fallback: Show top-level fields if landingPage is empty
          (course.title || course.subtitle || course.description || course.language || course.level || categoryName || subcategoryName || course.thumbnailUrl || course.promoVideoUrl) ? (
            <div className="bg-gray-50 border rounded p-4">
              {course.title && <div className="mb-2"><span className="font-semibold">Title:</span> <span className="text-gray-700">{course.title}</span></div>}
              {course.subtitle && <div className="mb-2"><span className="font-semibold">Subtitle:</span> <span className="text-gray-700">{course.subtitle}</span></div>}
              {course.description && <div className="mb-2"><span className="font-semibold">Description:</span> <span className="text-gray-700">{course.description}</span></div>}
              {course.language && <div className="mb-2"><span className="font-semibold">Language:</span> <span className="text-gray-700">{course.language}</span></div>}
              {course.level && <div className="mb-2"><span className="font-semibold">Level:</span> <span className="text-gray-700">{course.level}</span></div>}
              {categoryName && <div className="mb-2"><span className="font-semibold">Category:</span> <span className="text-gray-700">{categoryName}</span></div>}
              {subcategoryName && <div className="mb-2"><span className="font-semibold">Subcategory:</span> <span className="text-gray-700">{subcategoryName}</span></div>}
              {course.thumbnailUrl && (
                <div className="mb-2">
                  <span className="font-semibold">Course Image:</span><br />
                  <img src={course.thumbnailUrl} alt="Course Thumbnail" style={{ maxWidth: 200, marginTop: 4 }} />
                </div>
              )}
              {course.promoVideoUrl && (
                <div className="mb-2">
                  <span className="font-semibold">Promotional Video:</span><br />
                  <video controls width={320} src={course.promoVideoUrl} style={{ maxWidth: 320, maxHeight: 180, marginTop: 4 }}>
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>
          ) : <div className="text-gray-400">No landing page data.</div>
        )}
      </div>

      {/* Pricing & Access */}
      <div className="mb-8">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2"><div className="inline-block text-yellow-500" >₹</div> Pricing & Access</h3>
        <div className="mb-2"><strong>Pricing:</strong> {course.pricing ? course.pricing.charAt(0).toUpperCase() + course.pricing.slice(1) : 'N/A'}</div>
        <div className="mb-2">
          <strong>Access Platforms:</strong>
          <ul className="list-disc ml-6">
            {course.access?.website && <li>Website</li>}
            {/* {course.access?.app && <li>Mobile App</li>} */}
            {course.access?.private && <li>Private (Members Only)</li>}
          </ul>
        </div>
        {course.members && course.members.length > 0 && (
          <div className="mb-2">
            <strong>Private Members:</strong>
            <div className="flex items-center gap-2">
              <span>{course.members.length} member{course.members.length > 1 ? 's' : ''}</span>
              <button
                onClick={() => setShowMembersModal(true)}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                title="View members"
              >
                <Eye size={16} className="text-gray-600" />
              </button>
            </div>
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
        <Button className="bg-primary text-white px-6 py-2 rounded shadow-lg" onClick={handleSubmitForReview}>
          Submit for Review
        </Button>
      </div>

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Private Members</h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {course.members?.map((m: any) => (
                <div key={m.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{m.email}</span>
                  <span className="text-sm text-gray-600 capitalize px-2 py-1 bg-gray-200 rounded">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewCourse;