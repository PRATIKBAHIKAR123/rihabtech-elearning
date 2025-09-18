import React, { useState, useRef, useEffect } from 'react';
import { Play, Star, User, Globe, Bell, ShoppingCart, Search, Plus, Pause, SkipBack, SkipForward, Fullscreen, HelpCircle, FileText, CheckCircle, LockKeyhole, Clock, LockIcon, FastForwardIcon, Rewind } from "lucide-react";
import Divider from "../../../components/ui/divider";
import Overview from './overview';
import Notes from './notes';
import Instructor from './instructure';
import CourseReviews from './reviews';
import LearningTools from './learningtools';
import Announcements from './announcements';
import ReactPlayer from 'react-player';
import QNA from './qna';
import { getFullCourseData, CourseDetails, extractQuizData } from '../../../utils/firebaseCoursePreview';

export default function CourseDetailsPage() {
  const [activeTab, setActiveTab] = useState("Notes");
  const [courseData, setCourseData] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [courseModules] = useState([
    { 
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui.",
      completed: true
    },
    { 
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui.",
      completed: true
    },
    { 
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui.",
      completed: true
    },
    { 
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui.",
      completed: false
    },
    { 
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui.",
      completed: false
    },
    { 
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui.",
      completed: false
    },
    { 
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui.",
      completed: false
    },
    { 
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed euismod justo, sit amet efficitur dui.",
      completed: false
    }
  ]);

  // Get course ID from URL params or use a default for testing
  // In a real app, you'd get this from React Router or props
  const courseId = "8NjLqdGGeNuJKtjLFzxo"; // Using the ID from your Firebase data

  // Fetch course data from Firebase
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getFullCourseData(courseId);
        if (data) {
          setCourseData(data);
        } else {
          setError("Course not found");
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Set active module when course data is loaded
  useEffect(() => {
    if (courseData?.curriculum?.sections?.[0]?.items?.[0]) {
      const firstModule = courseData.curriculum.sections[0].items[0];
      console.log('Setting active module:', firstModule);
      setActiveModule(firstModule);
    }
  }, [courseData]);
  
     const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
    const [activeModule, setActiveModule] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  // Watch time tracking states
  const [totalWatched, setTotalWatched] = useState(0); // in seconds
  type WatchSession = {
    start: number;
    startedAt: string;
    end?: number;
    endedAt?: string;
    duration?: number;
  };
  const [watchSessions, setWatchSessions] = useState<WatchSession[]>([]); // track all watch sessions
  type WatchedSegment = { start: number; end: number };
  const [watchedSegments, setWatchedSegments] = useState<WatchedSegment[]>([]); // track watched video segments
const playerContainerRef = useRef<HTMLDivElement>(null);  
  // Refs for tracking
  const playerRef = useRef<ReactPlayer>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lastPlayTimeRef = useRef<number | null>(null);
  const watchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastReportTimeRef = useRef(0);
  const [playbackRate, setPlaybackRate] = useState(1);


    // Course info (for demonstration)
  const instructorId = courseData?.instructorId || "instructor-456";
  const studentId = "student-789";
  
  // Debug logging
  console.log("Course data:", courseData);
  console.log("Instructor ID from course:", instructorId);



  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const selectModule = (module: any) => {
    setActiveModule(module);
    // Reset video state when switching modules
    if (module.contentType === 'video' || module.contentType === 'lecture') {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  // Format time to MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Initialize watch session tracking
  useEffect(() => {
    // Load any previously saved watch data from localStorage or your backend
    const savedWatchTime = localStorage.getItem(`watchTime-${courseId}-${studentId}`);
    if (savedWatchTime) {
      setTotalWatched(parseFloat(savedWatchTime));
    }
    
    // Set up periodic reporting of watch time
    const reportInterval = setInterval(() => {
      reportWatchTimeToServer();
    }, 60000); // Report every minute
    
    return () => {
      clearInterval(reportInterval);
      // Save watch time when component unmounts
      saveWatchTime();
    };
  }, []);

  // Save watch time to localStorage and potentially to your server
  const saveWatchTime = () => {
    // Save to localStorage as a backup
    localStorage.setItem(`watchTime-${courseId}-${studentId}`, totalWatched.toString());
    
    // Report final time to server
    reportWatchTimeToServer(true);
  };

  // Report watch time to server
  const reportWatchTimeToServer = (isFinal = false) => {
    // Only report if there's new watch time to report
    if (totalWatched > lastReportTimeRef.current) {
      console.log(`Reporting watch time: ${formatTime(totalWatched)} ${isFinal ? '(final report)' : ''}`);
      
      // Here you would make an API call to your backend
      const watchTimeData = {
        courseId,
        instructorId,
        studentId,
        watchTime: totalWatched,
        watchedSegments: watchedSegments,
        completionPercentage: (totalWatched / duration) * 100,
        timestamp: new Date().toISOString(),
        isFinal
      };
      
      // Example API call (replace with your actual implementation)
      // fetch('your-api-endpoint/report-watch-time', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(watchTimeData)
      // });
      
      console.log("Watch data to send:", watchTimeData);
      
      // Update last report time
      lastReportTimeRef.current = totalWatched;
    }
  };

  // Track which segments of the video have been watched
  const addWatchedSegment = (start: number, end: number) => {
    if (end <= start) return; // Prevent invalid segments
    
    const newSegment = { start, end };
    
    setWatchedSegments(prev => {
      // Merge overlapping segments for efficiency
      const merged = [...prev];
      let added = false;
      
      for (let i = 0; i < merged.length; i++) {
        const segment = merged[i];
        
        // Check for overlap
        if (newSegment.start <= segment.end && newSegment.end >= segment.start) {
          // Merge segments
          segment.start = Math.min(segment.start, newSegment.start);
          segment.end = Math.max(segment.end, newSegment.end);
          added = true;
          break;
        }
      }
      
      if (!added) {
        merged.push(newSegment);
      }
      
      return merged;
    });
  };

  // Start tracking watch time with precision
  const startWatchTimeTracking = () => {
    if (watchIntervalRef.current) return; // Prevent multiple intervals
    
    const startTime = playerRef.current?.getCurrentTime() || 0;
    lastPlayTimeRef.current = startTime;
    
    // Record start of a new watch session
    const newSession = {
      start: startTime,
      startedAt: new Date().toISOString()
    };
    
    setWatchSessions(prev => [...prev, newSession]);
    
    // Update every second while playing
    watchIntervalRef.current = setInterval(() => {
      if (!playerRef.current) return;
      
      const currentPosition = playerRef.current.getCurrentTime();
      
      // Add to watched segments (for analytics on which parts were watched)
      if (lastPlayTimeRef.current !== null) {
        addWatchedSegment(lastPlayTimeRef.current, currentPosition);
      }
      
      // Update total watched time
      setTotalWatched(prev => prev + 1); // Add one second
      lastPlayTimeRef.current = currentPosition;
    }, 1000);
  };

  // Stop tracking watch time
  const stopWatchTimeTracking = () => {
    if (!watchIntervalRef.current) return;
    
    clearInterval(watchIntervalRef.current);
    watchIntervalRef.current = null;
    
    // Complete the current watch session
    if (lastPlayTimeRef.current !== null) {
      const currentPosition = playerRef.current?.getCurrentTime() || lastPlayTimeRef.current;
      
      setWatchSessions(prev => {
        const sessions = [...prev];
        const lastSession = sessions[sessions.length - 1];
        if (lastSession && !lastSession.end) {
          lastSession.end = currentPosition;
          lastSession.endedAt = new Date().toISOString();
          lastSession.duration = currentPosition - lastSession.start;
        }
        return sessions;
      });
      // Add final segment for this session
    }
  };



  // Handle play/pause
  const handlePlay = () => {
    setIsPlaying(true);
    startWatchTimeTracking();
  };

  const handlePause = () => {
    setIsPlaying(false);
    stopWatchTimeTracking();
  };

  const handleEnded = () => {
    setIsPlaying(false);
    stopWatchTimeTracking();
    
    // Report completion to server
    const completionData = {
      courseId,
      studentId,
      completed: true,
      watchTime: totalWatched,
      completionPercentage: 100,
      timestamp: new Date().toISOString()
    };
    
    console.log("Video completed:", completionData);
    // Here you would send this data to your server
  };

  const handleSeek = (seconds:number) => {
    if (isPlaying) {
      // If seeking while playing, stop current tracking and start a new session
      stopWatchTimeTracking();
      
      // Small delay to ensure the player has actually moved to the new position
      setTimeout(() => {
        if (isPlaying) {
          startWatchTimeTracking();
        }
      }, 100);
    }
    
    // Update current time for UI
    setCurrentTime(seconds);
  };

  // Handle seeking on progress bar click
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const seekTo = clickPosition * duration;
    
    playerRef.current?.seekTo(seekTo, 'seconds');
    handleSeek(seekTo);
  };

  const handleFullscreen = () => {
  const elem = playerContainerRef.current;
  if (!elem) return;
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    elem.requestFullscreen();
  }
};

    const seekForward = () => {
        playerRef!.current!.seekTo(playerRef!.current!.getCurrentTime() + 10);
    };

    const seekBackward = () => {
        playerRef!.current!.seekTo(playerRef!.current!.getCurrentTime() - 10);
    };

         const increaseSpeed = () => {
    setPlaybackRate(prev => Math.min(prev + 0.25, 2)); // max speed 2x
  };

  const decreaseSpeed = () => {
    setPlaybackRate(prev => Math.max(prev - 0.25, 0.25)); // min speed 0.25x
  };

  // Generate watch time analytics

    
    // return {
    //   totalWatchTime: totalWatched,
    //   uniqueSecondsWatched,
    //   completionPercentage: duration > 0 ? (uniqueSecondsWatched / duration) * 100 : 0,
    //   watchSessions: watchSessions.length,
    //   averageSessionLength: watchSessions.length > 0 
    //     ? watchSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / watchSessions.length 
    //     : 0,
    //   watchedSegments: mergedSegments
    // };
  // Format analytics times to MM:SS
  const formatSegment = (segment: WatchedSegment) => ({
    play: formatTime(segment.start),
    pause: formatTime(segment.end),
    duration: formatTime(segment.end - segment.start),
  });

    const renderVideoPlayer = (module:any) => (
    <div className="relative overflow-hidden mb-6 border-b rounded-lg pb-4"
              onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}>
              <div   ref={playerContainerRef}
  className={`relative h-[450px]`}>
                  <ReactPlayer
            ref={playerRef}
            url={module.contentFiles?.[0]?.url || "https://youtu.be/4z9bvgTlxKw?si=xEmNVS7qFBcX9Kvf"}
            playing={isPlaying}
            playbackRate={playbackRate}
            controls={false}
            width="100%"
            height={document.fullscreenEnabled ? "100%" : "450px"} // Fullscreen height if enabled
            volume={volume}
            onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
            onDuration={setDuration}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={(seconds) => handleSeek(seconds)}
            onEnded={handleEnded}
            light={courseData?.thumbnailUrl || "Images/Banners/Person.jpg"}
            playIcon={
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div
                  className="bg-white bg-opacity-80 rounded-full p-3 cursor-pointer pointer-events-auto"
                  onClick={handlePlay}
                >
                  <Play size={32} className="text-primary" />
                </div>
              </div>
            }
            style={{ borderRadius: '8px', overflow: 'hidden' }}
          />
        {/* Video Controls Overlay */}
       {isHovered && ( <div className="absolute bottom-0 left-0 right-0 rounded-lg bg-black bg-opacity-60 p-4 text-white">
          {/* Progress Bar */}
          <div 
                ref={progressBarRef}
                className="w-full h-2 bg-white rounded-full mb-2 cursor-pointer"
                onClick={handleProgressBarClick}
              >
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
                
                {/* Watched segments indicator */}
                <div className="relative h-full w-full -mt-2">
                  {watchedSegments.map((segment, idx) => (
                    <div 
                      key={idx}
                      className="absolute h-full bg-primary rounded-full"
                      style={{ 
                        left: `${(segment.start / duration) * 100}%`,
                        width: `${((segment.end - segment.start) / duration) * 100}%`
                      }}
                    />
                  ))}
                </div>
              </div>
          {/* <div 
            ref={progressBarRef}
            className="w-full h-2 bg-gray-700 rounded-full mb-2 cursor-pointer"
            onClick={handleProgressBarClick}
          >
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div> */}

          <div className="flex justify-between items-center">
            {/* Controls */}
            <div className="flex items-center space-x-4">
              <button
    onClick={seekBackward}
    className="focus:outline-none ml-2"
    title="Backword 10s"
  >
    {/* Fast Forward Icon */}
    <SkipBack size={24} />
  </button>
  {/* <button
    onClick={decreaseSpeed}
    className="focus:outline-none ml-2"
    title="Fast Forward 10s"
  >
    <Rewind size={24} />
  </button> */}
              <button 
                onClick={isPlaying ? handlePause : handlePlay}
                className="focus:outline-none"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              {/* <button
    onClick={increaseSpeed}
    className="focus:outline-none ml-2"
    title="Forward 10s"
  >
    <FastForwardIcon size={24} />
  </button> */}
              <button
    onClick={seekForward}
    className="focus:outline-none ml-2"
    title="Forward 10s"
  >
    {/* Fast Forward Icon */}
    <SkipForward size={24} />
  </button>
              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <select value={playbackRate} onChange={(e) => setPlaybackRate(parseFloat(e.target.value))} className="bg-gray-700 text-white rounded px-2 py-1">
                <option value="0.25">0.25x</option>
                <option value="0.5">0.5x</option>
                <option value="1" selected>1x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
              {/* <span>{playbackRate}x</span> */}
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <span className="text-sm">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value))
                }}
                className="w-24"
              />
              <button
  onClick={handleFullscreen}
  className="focus:outline-none ml-2"
  title="Fullscreen"
>
  <Fullscreen size={24} />
</button>
            </div>
          </div>
        </div>)}
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center">
                  <span className="mr-1">●</span> {formatTime(playerRef.current?.getCurrentTime()??0)}
                </div>
                {(isPlaying && isHovered) && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div
                      className="bg-white bg-opacity-80 rounded-full p-3 cursor-pointer pointer-events-auto"
                      onClick={handlePause}
                    >
                      <Pause size={32} className="text-primary" />
                    </div>
                  </div>
                )}
              </div>
              {/* Watch Time Stats (for demonstration) */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="font-semibold mb-2">Watch Time Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-3 rounded">
              <p className="text-sm text-gray-600">Total Watch Time</p>
              <p className="font-bold text-lg">{formatTime(totalWatched)}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded">
              <p className="text-sm text-gray-600">Completion</p>
              <p className="font-bold text-lg">
                {duration > 0 ? Math.round((totalWatched / duration) * 100) : 0}%
              </p>
            </div>
          </div>
          
          {/* <div className="mt-4">
            <button 
              onClick={downloadAnalytics}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Download Watch Analytics
            </button>
          </div> */}
        </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between">
                <h1 className="text-[#181818] text-2xl font-medium font-['Kumbh_Sans'] leading-[30px]">
                  {module.lectureName || courseData?.title || "Loading..."}
                </h1>
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <img src="/Images/icons/Container (6).png" key={i} className="h-4" />
                    ))}
                  </div>
                  <span className="ml-2 text-primary text-[15px] font-medium font-['Poppins'] leading-relaxed">(2 Reviews)</span>
                </div>
                </div>
                
                <div className="flex items-center mt-4 space-x-6">
                  <div className="flex gap-3 cursor-pointer items-center text-primary text-[15px] font-medium font-['Poppins'] leading-relaxed" 
                  onClick={() => setActiveTab('Instructor')}>
                    <img src="Images/icons/orange-user-laptop.png" className="h-[20px]" />
                    <span>By {courseData?.instructorId || "Instructor"}</span>
                  </div>
                  <Divider className="h-4 bg-[#DBDBDB]" />
                  <div className="flex gap-3 cursor-pointer items-center text-primary text-[15px] font-medium font-['Poppins'] leading-relaxed">
                  <img src="Images/icons/orange-world.png" className="h-[20px]" />
                    <span>{courseData?.level || "Course"}</span>
                  </div>
                </div>
              </div>
            </div>
  );

  const renderQuiz = (module: any) => {
    console.log('renderQuiz called with module:', module);
    
    // Extract quiz data from the module using helper function
    const quizData = extractQuizData(module);
    
    console.log('Extracted quiz data:', quizData);
    
    if (!quizData) {
      console.log('No quiz data extracted, showing error');
      return (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Invalid quiz data</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <HelpCircle className="text-blue-500 mr-3" size={32} />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{quizData.quizTitle}</h2>
            <p className="text-gray-600 text-sm">{quizData.quizDescription}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-blue-600">Questions</p>
            <p className="font-bold text-lg">{quizData.questions.length}</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-sm text-green-600">Time Limit</p>
            <p className="font-bold text-lg">{quizData.duration} minutes</p>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <p className="text-sm text-purple-600">Passing Score</p>
            <p className="font-bold text-lg">80%</p>
          </div>
        </div>

        <button 
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors" 
          onClick={() => {
            console.log('Start Quiz button clicked, quiz data:', quizData);
            const encodedData = encodeURIComponent(JSON.stringify(quizData));
            console.log('Encoded data:', encodedData);
            const url = `#/learner/quiz?data=${encodedData}`;
            console.log('Navigating to:', url);
            // Navigate to quiz page with quiz data
            window.location.hash = url;
          }}
        >
          {module.published ? `Retake ${quizData.isAssignment ? 'Assignment' : 'Quiz'}` : `Start ${quizData.isAssignment ? 'Assignment' : 'Quiz'}`}
        </button>
      </div>
    );
  };

  const renderDocument = (module:any) => (
    <div className="bg-white border rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <FileText className="text-green-500 mr-3" size={32} />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{module.title}</h2>
          <p className="text-gray-600 text-sm">{module.description}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">File Type</p>
          <p className="font-bold text-lg">{module.fileType}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">File Size</p>
          <p className="font-bold text-lg">{module.fileSize}</p>
        </div>
      </div>

      <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
        Download Resource
      </button>
    </div>
  );

  const renderModuleContent = () => {
    if (!activeModule) {
      return (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="text-center py-8">
            <p className="text-gray-500">Select a module to view content</p>
          </div>
        </div>
      );
    }

    console.log('Rendering module content for:', activeModule);

    // Check if this module has questions (for assignments with questions)
    const hasQuestions = (activeModule as any).questions && (activeModule as any).questions.length > 0;
    const isQuiz = activeModule.contentType === 'quiz' || (activeModule as any).type === 'quiz';
    const isAssignment = activeModule.contentType === 'assignment' || (activeModule as any).type === 'assignment';
    
    console.log('Module analysis:', { hasQuestions, isQuiz, isAssignment, contentType: activeModule.contentType, type: (activeModule as any).type });

    switch (activeModule.contentType) {
      case 'video':
      case 'lecture':
        return renderVideoPlayer(activeModule);
      case 'quiz':
        return renderQuiz(activeModule);
      case 'document':
        return renderDocument(activeModule);
      case 'assignment':
        // If assignment has questions, render as quiz, otherwise as document
        if (hasQuestions) {
          return renderQuiz(activeModule);
        } else {
          return renderDocument(activeModule);
        }
      default:
        // Check if it's an unsupported type but has questions
        if (hasQuestions) {
          return renderQuiz(activeModule);
        }
        return (
          <div className="bg-white border rounded-lg p-6 mb-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Unsupported module type: {activeModule.contentType}</p>
            </div>
          </div>
        );
    }
  };

  const getModuleIcon = (type: any, completed: any, module: any = null) => {
    const iconProps = { size: 12, className: `${completed ? 'text-white' : 'text-orange-500'} ml-0.5` };
    
    // Check if this module has questions (for assignments with questions)
    const hasQuestions = module && module.questions && module.questions.length > 0;
    const moduleType = module?.type || type;
    
    switch (moduleType) {
      case 'video':
      case 'lecture':
        return <Play {...iconProps} />;
      case 'quiz':
        return <HelpCircle {...iconProps} />;
      case 'document':
        return <FileText {...iconProps} />;
      case 'assignment':
        // If assignment has questions, show quiz icon, otherwise document icon
        return hasQuestions ? <HelpCircle {...iconProps} /> : <FileText {...iconProps} />;
      default:
        // If it's an unsupported type but has questions, show quiz icon
        return hasQuestions ? <HelpCircle {...iconProps} /> : <Play {...iconProps} />;
    }
  };

    const renderCourseContent = () => (
    <div className="space-y-4">
      {courseData?.curriculum?.sections?.map((section, sectionIndex) => {
        const sectionId = section.id || sectionIndex.toString();
        return (
        <div key={sectionId} className="mb-4">
          <button
            onClick={() => toggleSection(sectionId)}
            className="w-full flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-800">{section.name}</span>
            <span className="text-gray-500">
              {expandedSections[sectionId] ? '−' : '+'}
            </span>
          </button>

          {expandedSections[sectionId] && (
            <div className="mt-2 space-y-2">
              {section.items?.map((module) => (
                <div
                  key={module.id}
                  onClick={() => selectModule(module)}
                  className={`relative pl-10 p-3 rounded-lg cursor-pointer transition-colors ${
                    activeModule.id === module.id ? 'bg-orange-50 border-l-4 border-orange-500' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Module icon */}
                  <div className="absolute left-2 top-4 w-6 h-6 rounded-full flex items-center justify-center border-2 border-orange-500">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      module.published ? 'bg-orange-500' : 'bg-white'
                    }`}>
                      {getModuleIcon(module.contentType, module.published, module)}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 text-sm mb-1">
                      {(module as any).title || (module as any).quizTitle || 'Untitled Module'}
                    </h4>
                    <p className="text-gray-600 text-xs mb-2">{module.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="capitalize">
                        {(() => {
                          const moduleType = (module as any).type || module.contentType;
                          const hasQuestions = (module as any).questions && (module as any).questions.length > 0;
                          
                          if (moduleType === 'assignment' && hasQuestions) {
                            return 'Assignment';
                          } else if (moduleType === 'quiz') {
                            return 'Quiz';
                          } else {
                            return moduleType;
                          }
                        })()}
                      </span>
                      <div className="flex items-center space-x-2">
                        {module.contentFiles?.[0]?.duration && (
                          <span className="flex items-center">
                            <Clock size={10} className="mr-1" />
                            {typeof module.contentFiles[0].duration === 'number' 
                              ? `${Math.floor(module.contentFiles[0].duration / 60)}:${Math.floor(module.contentFiles[0].duration % 60).toString().padStart(2, '0')}`
                              : module.contentFiles[0].duration
                            }
                          </span>
                        )}
                        {module.published ? (
                          <CheckCircle size={12} className="text-green-500" />
                        ) : (
                          <LockIcon size={10} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );

    const renderTabContent = () => {
    switch (activeTab) {
      case 'Course Content':
        return renderCourseContent();
      case 'Overview':
        return (
          <Overview courseData={courseData} loading={loading} />
        );
      case 'Notes':
        return (
          <Notes courseId={courseId} loading={loading} />
        );
      case 'Instructor':
        return (
          <Instructor instructorId={courseData?.instructorId} loading={loading} />
        );
      case 'Reviews':
        return (
          <CourseReviews/>
        );
      case 'Learning Tools':
        return (
          <LearningTools courseId={courseId} instructorId={courseData?.instructorId}/>
        );
      case 'Announcements':
        return (
          <Announcements courseId={courseId} loading={loading}/>
        );
      case 'QNA':
        return (
      <QNA/>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

    const generateWatchTimeAnalytics = () => {
    // Calculate unique seconds watched (accounting for rewatching segments)
    let uniqueSecondsWatched = 0;
    const sortedSegments = [...watchedSegments].sort((a, b) => a.start - b.start);
    
    // Merge overlapping segments
    const mergedSegments = [];
    let currentSegment = null;
    
    for (const segment of sortedSegments) {
      if (!currentSegment) {
        currentSegment = {...segment};
        continue;
      }
      
      if (segment.start <= currentSegment.end) {
        // Segments overlap, merge them
        currentSegment.end = Math.max(currentSegment.end, segment.end);
      } else {
        // No overlap, add current segment and start a new one
        mergedSegments.push(currentSegment);
        uniqueSecondsWatched += currentSegment.end - currentSegment.start;
        currentSegment = {...segment};
      }
    }
    
    // Add the last segment
    if (currentSegment) {
      mergedSegments.push(currentSegment);
      uniqueSecondsWatched += currentSegment.end - currentSegment.start;
    }

  return {
    totalWatchTime: formatTime(totalWatched),
    uniqueSecondsWatched: formatTime(uniqueSecondsWatched),
    completionPercentage: duration > 0 ? (uniqueSecondsWatched / duration) * 100 : 0,
    watchSessions: watchSessions.length,
    averageSessionLength: formatTime(
    watchSessions.length > 0
      ? watchSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / watchSessions.length
      : 0
    ),
    watchedSegments: mergedSegments.map(formatSegment),
  };
}

  // Example of downloading analytics (for testing)
  const downloadAnalytics = () => {
    const analytics = generateWatchTimeAnalytics();
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `watch-analytics-${courseId}-${studentId}.json`);
    linkElement.click();
  };



  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Video/Content Section */}
            {renderModuleContent()}
            
            {/* Tabs - Mobile: includes Course Content, Desktop: excludes it */}
            <div className="mb-6">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {/* Mobile tabs (includes Course Content) */}
                <div className="lg:hidden flex space-x-2">
                  {["Course Content", "Overview", "Notes", "Instructor", "Reviews", "Learning Tools", "Announcements", "QNA"].map((tab) => (
                    <button
                      key={tab}
                      className={`px-4 py-2 text-sm font-medium rounded-full shadow-sm border whitespace-nowrap ${
                        activeTab === tab
                          ? "bg-orange-500 text-white border-orange-500"
                          : "text-gray-600 border-orange-500 bg-white hover:bg-orange-50"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                
                {/* Desktop tabs (excludes Course Content) */}
                <div className="hidden lg:flex space-x-2">
                  {["Overview", "Notes", "Instructor", "Reviews", "Learning Tools", "Announcements", "QNA"].map((tab) => (
                    <button
                      key={tab}
                      className={`px-4 py-2 text-sm font-medium rounded-full shadow-sm border whitespace-nowrap ${
                        activeTab === tab
                          ? "bg-orange-500 text-white border-orange-500"
                          : "text-gray-600 border-orange-500 bg-white hover:bg-orange-50"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="mb-6">
              {renderTabContent()}
            </div>
          </div>
          
          {/* Fixed Sidebar - Desktop Only */}
          <div className="hidden lg:block">
            <div className="fixed top-8 right-8 w-80 bg-white rounded-lg shadow-lg h-[calc(100vh-4rem)] flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Course Content</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {renderCourseContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}