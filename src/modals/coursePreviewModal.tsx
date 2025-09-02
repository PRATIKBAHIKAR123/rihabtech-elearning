import React, { useState, useEffect } from 'react';
import { X, Play, Video, Clock, User, Globe, Award } from 'lucide-react';
import ReactPlayer from 'react-player';
import { Course } from '../utils/firebaseCourses';

interface PreviewVideo {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description?: string;
}

interface CoursePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
}

export default function CoursePreviewModal({ isOpen, onClose, course }: CoursePreviewModalProps) {
  const [selectedVideo, setSelectedVideo] = useState<PreviewVideo | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [previewVideos, setPreviewVideos] = useState<PreviewVideo[]>([]);

  // Extract preview videos from course curriculum
  useEffect(() => {
    if (course?.curriculum?.sections) {
      console.log('Processing curriculum for preview videos:', course.curriculum);
      const videos: PreviewVideo[] = [];
      
      course.curriculum.sections.forEach(section => {
        console.log('Processing section:', section.name, section);
        if (section.items) {
          section.items.forEach(item => {
            console.log('Processing item:', item);
            // Check if this is a video item that should be available for preview
            // For free preview, we show videos regardless of published status
            if (item.contentType === 'video') {
              // Look for video files
              if (item.contentFiles && item.contentFiles.length > 0) {
                console.log('Content files found:', item.contentFiles);
                const videoFile = item.contentFiles.find(file => {
                  // Check if it's a video file by URL or name
                  const isVideo = file.url && (
                    file.url.toLowerCase().includes('.mp4') ||
                    file.url.toLowerCase().includes('.mov') ||
                    file.url.toLowerCase().includes('.avi') ||
                    file.name?.toLowerCase().includes('.mp4') || 
                    file.name?.toLowerCase().includes('.mov') ||
                    file.name?.toLowerCase().includes('.avi')
                  );
                  console.log('Checking file:', file, 'isVideo:', isVideo);
                  return isVideo;
                });
                
                if (videoFile) {
                  videos.push({
                    id: item.id || `${section.name}-${item.lectureName}`,
                    title: item.lectureName || 'Untitled Video',
                    duration: videoFile.duration ? formatDuration(videoFile.duration) : '00:00',
                    videoUrl: videoFile.url,
                    description: item.description
                  });
                  console.log('Added preview video:', {
                    title: item.lectureName,
                    duration: videoFile.duration,
                    url: videoFile.url
                  });
                }
              }
              
              // Check if item has direct contentUrl for video
              if (!videos.find(v => v.id === item.id) && (item as any).contentUrl) {
                videos.push({
                  id: item.id || `${section.name}-${item.lectureName}`,
                  title: item.lectureName || 'Untitled Video',
                  duration: (item as any).duration ? formatDuration((item as any).duration) : '00:00',
                  videoUrl: (item as any).contentUrl,
                  description: item.description
                });
              }
            }
          });
        }
      });

      // If no preview videos found, use course promo video as fallback
      if (videos.length === 0 && course.promoVideoUrl) {
        videos.push({
          id: 'promo-video',
          title: 'Course Introduction',
          duration: '02:00',
          videoUrl: course.promoVideoUrl,
          description: 'Get a quick overview of what you\'ll learn in this course'
        });
      }

      // If still no videos, add a sample video for testing
      if (videos.length === 0) {
        videos.push({
          id: 'sample-video',
          title: 'Sample Lecture',
          duration: '01:30',
          videoUrl: '/courses/video2 - Trim.mp4',
          description: 'This is a sample video for demonstration purposes'
        });
      }

      console.log('Final preview videos array:', videos);
      setPreviewVideos(videos);
      
      // Set first video as selected by default
      if (videos.length > 0 && !selectedVideo) {
        console.log('Setting first video as selected:', videos[0]);
        setSelectedVideo(videos[0]);
      }
    }
  }, [course, selectedVideo]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVideoSelect = (video: PreviewVideo) => {
    setSelectedVideo(video);
    setIsVideoLoading(true);
    setVideoError(null);
  };

  const handleVideoReady = () => {
    setIsVideoLoading(false);
    setVideoError(null);
  };

  const handleVideoError = (error: any) => {
    setIsVideoLoading(false);
    setVideoError('Failed to load video. Please try again.');
    console.error('Video error:', error);
  };

  const handleRetry = () => {
    if (selectedVideo) {
      setIsVideoLoading(true);
      setVideoError(null);
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Course Preview</h2>
            <p className="text-gray-600 mt-1">{course.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-200 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex h-[calc(95vh-120px)]">
          {/* Left: Main Video Player */}
          <div className="flex-1 p-6">
            {selectedVideo ? (
              <div className="h-full flex flex-col">
                {/* Video Player */}
                <div className="relative bg-gray-900 rounded-lg overflow-hidden flex-1">
                  {isVideoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                      <div className="text-center text-white">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                        <p className="text-lg">Loading video...</p>
                      </div>
                    </div>
                  )}
                  
                  {videoError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                      <div className="text-center text-white">
                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Video size={32} />
                        </div>
                        <p className="mb-2 text-lg">Error loading video</p>
                        <p className="text-sm mb-4 text-gray-300">{videoError}</p>
                        <button 
                          onClick={handleRetry}
                          className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
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
                    height="100%"
                    className="rounded-lg"
                    onReady={handleVideoReady}
                    onError={handleVideoError}
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
                
                {/* Video Info */}
                <div className="mt-4">
                  <h3 className="text-xl font-semibold text-gray-800">{selectedVideo.title}</h3>
                  {selectedVideo.description && (
                    <p className="text-gray-600 mt-2">{selectedVideo.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{selectedVideo.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Video size={16} />
                      <span>Preview Video</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Video size={48} className="mx-auto mb-4" />
                  <p className="text-lg">Select a video to preview</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Free Sample Videos & Course Info */}
          <div className="w-96 border-l border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-6">
              {/* Free Sample Videos */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Free Sample Videos</h3>
                
                {previewVideos.length > 0 ? (
                  <div className="space-y-3">
                    {previewVideos.map((video) => (
                      <div 
                        key={video.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedVideo?.id === video.id 
                            ? 'bg-primary text-white shadow-md' 
                            : 'bg-white hover:bg-gray-100 border border-gray-200'
                        }`}
                        onClick={() => handleVideoSelect(video)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            selectedVideo?.id === video.id 
                              ? 'bg-white/20' 
                              : 'bg-primary/10'
                          }`}>
                            <Play size={16} className={selectedVideo?.id === video.id ? 'text-white' : 'text-primary'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm line-clamp-2 ${
                              selectedVideo?.id === video.id ? 'text-white' : 'text-gray-800'
                            }`}>
                              {video.title}
                            </h4>
                            <p className={`text-xs mt-1 ${
                              selectedVideo?.id === video.id ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              {video.duration}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Video size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No preview videos available</p>
                  </div>
                )}
              </div>
              
              {/* Course Information */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Course Information</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-primary" />
                    <span>Level: <span className="font-medium">{course.level || 'Beginner'}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-primary" />
                    <span>Language: <span className="font-medium">{course.language || 'English'}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <span>Duration: <span className="font-medium">
                      {course.curriculum?.sections ? 
                        `${course.curriculum.sections.length} sections` : 
                        'Not specified'
                      }
                    </span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    <span>Instructor: <span className="font-medium">
                      {course.members?.find(m => m.role === 'teacher')?.email?.split('@')[0] || 'Unknown'}
                    </span></span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    onClose();
                    // Scroll to enroll button
                    const enrollButton = document.querySelector('[data-enroll-button]');
                    if (enrollButton) {
                      enrollButton.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full mt-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
