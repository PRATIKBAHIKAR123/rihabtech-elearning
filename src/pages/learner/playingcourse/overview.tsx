import React from 'react';
import { CourseDetails } from '../../../utils/firebaseCoursePreview';

interface OverviewProps {
  courseData?: CourseDetails | null;
  loading?: boolean;
}

export default function Overview({ courseData, loading = false }: OverviewProps) {
  if (loading) {
    return (
      <div className="container mx-auto px-2 py-2">
        <div className="flex flex-col items-left justify-left gap-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="container mx-auto px-2 py-2">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <p className="text-gray-500 text-center">No course data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-2">
      <div className="flex flex-col items-left justify-left gap-6">
        {/* Course Description */}
        <div>
        <h1 className="details-title">Course Description</h1>
          <div className="space-y-4">
            {courseData.description ? (
              <p className="details-description">{courseData.description}</p>
            ) : (
              <p className="details-description text-gray-500 italic">No description available for this course.</p>
            )}
            
            {courseData.subtitle && (
              <p className="details-description text-gray-600 font-medium">{courseData.subtitle}</p>
            )}
          </div>
        </div>

        {/* What You'll Learn */}
        {courseData.learn && courseData.learn.length > 0 && (
          <div>
            <h1 className="details-title">What You'll Learn From This Course</h1>
            <ul className="list-disc pl-5 mb-6 details-description space-y-3">
              {courseData.learn.map((item, index) => (
                <li key={index}>
                  <p className="details-description">{item}</p>
        </li>
              ))}
            </ul>
          </div>
        )}

        {/* Course Requirements */}
        {courseData.requirements && courseData.requirements.length > 0 && (
          <div>
            <h1 className="details-title">Requirements</h1>
            <ul className="list-disc pl-5 mb-6 details-description space-y-3">
              {courseData.requirements.map((requirement, index) => (
                <li key={index}>
                  <p className="details-description">{requirement}</p>
    </li>
              ))}
</ul>
          </div>
        )}

        {/* Course Level and Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courseData.level && (
            <div>
              <h3 className="details-title text-lg">Course Level</h3>
              <p className="details-description capitalize">{courseData.level}</p>
            </div>
          )}
          
          {courseData.language && (
            <div>
              <h3 className="details-title text-lg">Language</h3>
              <p className="details-description capitalize">{courseData.language}</p>
            </div>
          )}
        </div>

        {/* Course Pricing */}
        {courseData.pricing && (
          <div>
            <h3 className="details-title text-lg">Pricing</h3>
            <p className="details-description capitalize font-medium">
              {courseData.pricing === 'free' ? 'Free Course' : `$${courseData.pricing}`}
            </p>
          </div>
        )}

        {/* Welcome Message */}
        {/* {courseData.welcomeMessage && (
          <div>
            <h1 className="details-title">Welcome Message</h1>
            <p className="details-description">{courseData.welcomeMessage}</p>
          </div>
        )} */}

        {/* Certification */}
        {/* <div>
<h1 className="details-title">Certification</h1>
          {courseData.congratulationsMessage ? (
            <p className="details-description">{courseData.congratulationsMessage}</p>
          ) : (
            <p className="details-description">
              Upon successful completion of this course, you will receive a certificate of completion. 
              This certificate demonstrates your understanding of the course material and can be used 
              to showcase your skills to potential employers or clients.
            </p>
          )}
        </div> */}

        {/* Course Statistics */}
        {/* <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="details-title text-lg mb-3">Course Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {courseData.curriculum?.sections && (
              <div>
                <span className="font-medium">Sections:</span>
                <span className="ml-2">{courseData.curriculum.sections.length}</span>
              </div>
            )}
            
            {courseData.members && (
              <div>
                <span className="font-medium">Students:</span>
                <span className="ml-2">{courseData.members.length}</span>
              </div>
            )}
            
            <div>
              <span className="font-medium">Status:</span>
              <span className="ml-2 capitalize">{courseData.status}</span>
            </div>
            
            <div>
              <span className="font-medium">Published:</span>
              <span className="ml-2">{courseData.isPublished ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}