import React, { useState, useRef, useEffect } from 'react';
import { Play, Star, User, Globe, Bell, ShoppingCart, Search, Plus, Pause } from "lucide-react";
import Divider from "../../../components/ui/divider";
import Overview from './overview';
import Notes from './notes';
import Instructor from './instructure';
import CourseReviews from './reviews';
import LearningTools from './learningtools';
import ReactPlayer from 'react-player';

export default function CourseDetailsPage() {
  const [activeTab, setActiveTab] = useState("Notes");
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
  
     const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  
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
  
  // Refs for tracking
  const playerRef = useRef<ReactPlayer>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lastPlayTimeRef = useRef<number | null>(null);
  const watchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastReportTimeRef = useRef(0);


    // Course info (for demonstration)
  const courseId = "course-123";
  const instructorId = "instructor-456";
  const studentId = "student-789";


  // Course sessions data
  const [sessions, setSessions] = useState([
    { id: 1, title: "Introduction to the Course", start: 0, end: 120, completed: false },
    { id: 2, title: "Core Concepts & Fundamentals", start: 120, end: 160, completed: false },
    { id: 3, title: "Advanced Techniques", start: 220, end: 280, completed: false },
    { id: 4, title: "Practical Application", start: 310, end: 360, completed: false },
    { id: 5, title: "Conclusion & Next Steps", start: 420, end: 444, completed: false }
  ]);

  //   const playerRef = useRef<ReactPlayer>(null);
  // const progressBarRef = useRef<HTMLDivElement>(null);

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

  // Generate watch time analytics
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



  return (
    <div className="min-h-screen bg-gray-50">
      
      
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Video and Course Info */}
          <div className="md:col-span-2">
            {/* Video Section */}
            <div className="relative overflow-hidden mb-6 border-b rounded-lg pb-4"
              onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}>
              <div className="relative">
                  <ReactPlayer
            ref={playerRef}
            url="https://youtu.be/4z9bvgTlxKw?si=xEmNVS7qFBcX9Kvf" // Replace with your video URL
            playing={isPlaying}
            controls={false}
            width="100%"
            height="455px"
            volume={volume}
            onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
            onDuration={setDuration}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={(seconds) => handleSeek(seconds)}
            onEnded={handleEnded}
            light="Images/Banners/Person.jpg" // Replace with your thumbnail
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
                onClick={isPlaying ? handlePause : handlePlay}
                className="focus:outline-none"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
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
                <h1 className="text-[#181818] text-2xl font-medium font-['Kumbh_Sans'] leading-[30px]">Emily - The power of UX research</h1>
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
                    <span>By Emilie Bryant</span>
                  </div>
                  <Divider className="h-4 bg-[#DBDBDB]" />
                  <div className="flex gap-3 cursor-pointer items-center text-primary text-[15px] font-medium font-['Poppins'] leading-relaxed">
                  <img src="Images/icons/orange-world.png" className="h-[20px]" />
                    <span>Motivation</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="mb-6">
              <div className="flex space-x-2 ">
                {["Overview", "Notes", "Instructor", "Reviews", "Learning Tools"].map((tab) => (
                  <button
                    key={tab}
                    className={`px-4 py-2 text-[15px] font-medium font-['Archivo'] rounded-[35px] shadow-[0px_1px_1.600000023841858px_0px_rgba(0,0,0,0.25)] border border-primary ${
                      activeTab === tab
                        ? "bg-primary text-white"
                        : "text-gray-600 border border-primary border-b-0"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            {/* Tab Content */}
            {activeTab=='Overview'&&<Overview />}
            {activeTab === 'Notes' && <Notes />}
            {activeTab === 'Instructor' && <Instructor />}
            {activeTab === 'Reviews' && <CourseReviews />}
            {activeTab === 'Learning Tools' && <LearningTools />}

            
          </div>
          
          {/* Course Content Sidebar */}
          <div className="bg-[#fcf3ec] rounded-tl-[15px] p-6">
      <h2 className="details-title mb-8">Course Content</h2>
      
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-orange-200"></div>
        
        <div className="space-y-8">
          {courseModules.map((module, index) => (
            <div key={index} className="relative pl-10">
              {/* Play button circle - filled for completed, outline for incomplete */}
              <div className='absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-primary'>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center
                ${module.completed ? 'bg-primary' : 'bg-white'}`}>
                <Play 
                  size={12} 
                  className={`${module.completed ? 'text-white' : 'text-primary'} ml-0.5`} 
                />
              </div>
              </div>
              <div>
                <p className="text-gray-700 mb-4">{module.text}</p>
                {index < courseModules.length - 1 && (
                  <div className="border-b border-gray-200 mt-4"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
        </div>
      </div>
    </div>
  );
}