import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Video, FileText, Play, X } from 'lucide-react';
import { Course } from '../../../utils/firebaseCourses';
import ReactPlayer from 'react-player';

interface Lecture {
  title: string;
  type: 'video' | 'file';
  duration: string;
  preview?: boolean;
  videoUrl?: string;
  contentFiles?: any[];
}

interface Section {
  title: string;
  lectures: Lecture[];
  totalDuration: string;
}

interface CurriculumProps {
  course: Course;
}

export default function Curriculum({ course }: CurriculumProps) {
  const [openSections, setOpenSections] = useState<number[]>([0]);
  const [selectedVideo, setSelectedVideo] = useState<Lecture | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const toggleSection = (index: number) => {
    setOpenSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleVideoClick = (lecture: Lecture) => {
    if (lecture.type === 'video' && lecture.videoUrl) {
      setSelectedVideo(lecture);
      setIsVideoModalOpen(true);
      setIsVideoLoading(true);
      setVideoError(null);
    }
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
    setIsVideoLoading(false);
    setVideoError(null);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVideoModalOpen) {
        closeVideoModal();
      }
    };

    if (isVideoModalOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVideoModalOpen]);

  // Transform Firebase curriculum data to match the expected format
  const transformCurriculumData = (): Section[] => {
    if (!course.curriculum?.sections || course.curriculum.sections.length === 0) {
      // Return default sections if no curriculum data
      return [
        {
          title: 'Course Content',
          totalDuration: '0min',
          lectures: [
            { title: 'No curriculum available yet', type: 'file' as const, duration: '00:00' }
          ],
        }
      ];
    }

    return course.curriculum.sections.map((section, index) => {
      // Calculate total duration for this section
      let totalDurationSeconds = 0;
      if (section.items) {
        section.items.forEach(item => {
          if (item.contentFiles && item.contentFiles[0]?.duration) {
            totalDurationSeconds += Math.round(item.contentFiles[0].duration); // Round each duration
          }
        });
      }
      
      const totalDuration = totalDurationSeconds > 0 
        ? Math.round(totalDurationSeconds / 60) + 'min'
        : '0min';

      // Transform items to lectures
      const lectures: Lecture[] = section.items ? section.items.map(item => {
        const contentType = item.contentType === 'video' ? 'video' : 'file';
        let duration = '00:00';
        let videoUrl = '';
        
        if (item.contentFiles && item.contentFiles[0]?.duration) {
          const totalSeconds = Math.round(item.contentFiles[0].duration); // Round to nearest second
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          duration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // Get video URL from content files - improved extraction
        if (item.contentFiles && item.contentFiles.length > 0) {
          // Debug: Log the content files to see what's available
          console.log('Content files for lecture:', item.lectureName, item.contentFiles);
          
          // First try to find a video file
          const videoFile = item.contentFiles.find(file => 
            (file as any).type?.startsWith('video/') || 
            (file as any).name?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i) ||
            file.url?.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)
          );
          
          if (videoFile) {
            // Try multiple possible URL properties
            videoUrl = videoFile.url || 
                      (videoFile as any).downloadURL || 
                      (videoFile as any).cloudinaryUrl || 
                      (videoFile as any).publicUrl || 
                      '';
            console.log('Found video file:', videoFile, 'URL:', videoUrl);
          } else {
            // If no specific video file found, try to get any file with a URL
            const anyFile = item.contentFiles.find(file => file.url || (file as any).downloadURL);
            if (anyFile) {
              videoUrl = anyFile.url || (anyFile as any).downloadURL || '';
              console.log('Found any file with URL:', anyFile, 'URL:', videoUrl);
            }
          }
        }

        // Also check if the item itself has a video URL
        if (!videoUrl && (item as any).contentUrl && item.contentType === 'video') {
          videoUrl = (item as any).contentUrl;
        }
        
        // Fallback: If this is a video lecture but no URL found, use course promo video
        if (!videoUrl && item.contentType === 'video' && course.promoVideoUrl) {
          videoUrl = course.promoVideoUrl;
          console.log('Using course promo video as fallback:', videoUrl);
        }
        
        return {
          title: item.lectureName || 'Untitled Lecture',
          type: contentType,
          duration: duration,
          preview: item.published || false,
          videoUrl: videoUrl,
          contentFiles: item.contentFiles
        };
      }) : [];

      return {
        title: section.name || `Section ${index + 1}`,
        lectures: lectures,
        totalDuration: totalDuration
      };
    });
  };

  const courseSections = transformCurriculumData();

  // Debug: Log the transformed curriculum data
  console.log('Transformed curriculum data:', courseSections);

  return (
    <>
      {/* Video Summary */}
      {/* <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Course Content Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {courseSections.reduce((total, section) => total + section.lectures.length, 0)}
            </div>
            <div className="text-blue-700">Total Lectures</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {courseSections.reduce((total, section) => 
                total + section.lectures.filter(l => l.type === 'video' && l.videoUrl).length, 0
              )}
            </div>
            <div className="text-green-700">Preview Videos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {courseSections.reduce((total, section) => 
                total + section.lectures.filter(l => l.type === 'video' && !l.videoUrl).length, 0
              )}
            </div>
            <div className="text-orange-700">Full Access Only</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {courseSections.reduce((total, section) => 
                total + section.lectures.filter(l => l.type === 'file').length, 0
              )}
            </div>
            <div className="text-purple-700">Documents</div>
          </div>
        </div>
      </div> */}

      <div className="w-full max-w-3xl mx-auto text-sm">
        {courseSections.map((section, index) => {
          const isOpen = openSections.includes(index);
          return (
            <div key={index} className="border-b border-gray-200">
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex items-center justify-between bg-primary/10 text-primary px-4 py-3 font-semibold text-left hover:bg-primary/20 transition-all"
              >
                <div>
                  {section.title} <span className="ml-2 text-xs font-normal text-gray-500">{section.lectures.length} lectures • {section.totalDuration}</span>
                </div>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {isOpen && (
                <ul className="bg-white divide-y">
                  {section.lectures.map((lecture, i) => (
                    <li key={i} className="flex items-center justify-between px-6 py-3">
                      <div className="flex items-center gap-2">
                        {lecture.type === 'video' ? <Video size={16} /> : <FileText size={16} />}
                        <span 
                          className={`flex items-center gap-2 ${
                            lecture.type === 'video' && lecture.videoUrl 
                              ? 'text-primary hover:text-primary/80 cursor-pointer' 
                              : lecture.type === 'video' 
                                ? 'text-gray-500 cursor-not-allowed' 
                                : 'text-gray-800'
                          }`}
                          onClick={() => lecture.type === 'video' && lecture.videoUrl ? handleVideoClick(lecture) : null}
                        >
                          {lecture.title}
                          {lecture.type === 'video' && lecture.videoUrl && (
                            <Play size={14} className="text-primary" />
                          )}
                          {lecture.type === 'video' && !lecture.videoUrl && (
                            <span className="text-xs text-gray-400">(No preview)</span>
                          )}
                        </span>
                        {lecture.preview && (
                          <span className="ml-2 text-xs text-primary font-medium">Preview</span>
                        )}
                      </div>
                      <span className="text-gray-500 text-xs font-medium">{lecture.duration}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && selectedVideo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeVideoModal}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedVideo.title}
              </h3>
              <button
                onClick={closeVideoModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4">
              {selectedVideo.videoUrl ? (
                <div className="relative">
                  {isVideoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                        <p className="text-gray-600">Loading video...</p>
                      </div>
                    </div>
                  )}
                  
                  {videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
                      <div className="text-center text-red-600">
                        <p className="mb-2">Error loading video</p>
                        <p className="text-sm">{videoError}</p>
                        <button 
                          onClick={() => {
                            setIsVideoLoading(true);
                            setVideoError(null);
                          }}
                          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <ReactPlayer
                    url={selectedVideo.videoUrl}
                    controls={true}
                    width="100%"
                    height="400px"
                    className="rounded-lg"
                    onReady={() => setIsVideoLoading(false)}
                    onError={(error) => {
                      setIsVideoLoading(false);
                      setVideoError('Failed to load video. Please try again.');
                      console.error('Video error:', error);
                    }}
                    config={{
                      file: {
                        attributes: {
                          controlsList: 'nodownload',
                          onContextMenu: (e: any) => e.preventDefault()
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video size={24} className="text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Video Not Available</h4>
                    <p className="text-gray-600 mb-4">
                      This video is not available for preview. Enroll in the course to access all lectures and materials.
                    </p>
                    <button
                      onClick={() => {
                        // Close modal and scroll to enrollment button
                        closeVideoModal();
                        const enrollButton = document.querySelector('[data-enroll-button]');
                        if (enrollButton) {
                          enrollButton.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Lecture Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Title:</strong> {selectedVideo.title}</p>
                  <p><strong>Duration:</strong> {selectedVideo.duration}</p>
                  <p><strong>Type:</strong> {selectedVideo.type}</p>
                  {selectedVideo.preview && (
                    <p><strong>Status:</strong> <span className="text-primary">Preview Available</span></p>
                  )}
                  <p><strong>Video Source:</strong> {selectedVideo.videoUrl}</p>
                </div>
                
                {selectedVideo.preview ? (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Preview Mode:</strong> This is a free preview of the course content. 
                      Enroll in the course to access all lectures and materials.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Full Access:</strong> You have access to this lecture as part of your enrollment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
