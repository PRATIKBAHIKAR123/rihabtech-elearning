
import React, { useState, useEffect, useRef } from 'react';
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
      setLoading(false);
    };
    fetchData();
  }, [draftId.current]);

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
      <div className="mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2"><BookOpen className="inline-block text-orange-500" /> Course Title</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-xl font-semibold">{course.title || 'Course Title'}</span>
            {course.category && (
              <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full ml-4 text-sm">{course.category}</span>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400">Course ID</span>
            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{draftId.current}</span>
          </div>
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
                  {section.published && <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 rounded text-xs">Published</span>}
                </div>
                {section.description && <div className="mb-2 text-gray-600">{section.description}</div>}
                <div className="ml-4">
                  {section.items && section.items.length > 0 ? (
                    <ul className="list-disc ml-4">
                      {section.items.map((item: any, itemIdx: number) => (
                        <li key={itemIdx} className="mb-2">
                          <div className="font-semibold text-gray-800 capitalize">{item.type === 'lecture' ? 'Lecture' : item.type === 'quiz' ? 'Quiz' : item.type === 'assignment' ? 'Assignment' : 'Item'}: {item.lectureName || item.quizTitle || item.title || ''}</div>
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
          (course.title || course.subtitle || course.description || course.language || course.level || course.category || course.subcategory || course.thumbnailUrl || course.promoVideoUrl) ? (
            <div className="bg-gray-50 border rounded p-4">
              {course.title && <div className="mb-2"><span className="font-semibold">Title:</span> <span className="text-gray-700">{course.title}</span></div>}
              {course.subtitle && <div className="mb-2"><span className="font-semibold">Subtitle:</span> <span className="text-gray-700">{course.subtitle}</span></div>}
              {course.description && <div className="mb-2"><span className="font-semibold">Description:</span> <span className="text-gray-700">{course.description}</span></div>}
              {course.language && <div className="mb-2"><span className="font-semibold">Language:</span> <span className="text-gray-700">{course.language}</span></div>}
              {course.level && <div className="mb-2"><span className="font-semibold">Level:</span> <span className="text-gray-700">{course.level}</span></div>}
              {course.category && <div className="mb-2"><span className="font-semibold">Category:</span> <span className="text-gray-700">{course.category}</span></div>}
              {course.subcategory && <div className="mb-2"><span className="font-semibold">Subcategory:</span> <span className="text-gray-700">{course.subcategory}</span></div>}
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