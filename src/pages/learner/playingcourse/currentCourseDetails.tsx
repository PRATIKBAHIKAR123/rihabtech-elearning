import React, { useState, useRef, useEffect } from 'react';
import { Play, Star, User, Globe, Bell, ShoppingCart, Search, Plus, Pause } from "lucide-react";
import Divider from "../../../components/ui/divider";
import Overview from './overview';
import Notes from './notes';
import Instructor from './instructure';
import CourseReviews from './reviews';
import LearningTools from './learningtools';

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

  // Course sessions data
  const [sessions, setSessions] = useState([
    { id: 1, title: "Introduction to the Course", start: 0, end: 120, completed: false },
    { id: 2, title: "Core Concepts & Fundamentals", start: 120, end: 160, completed: false },
    { id: 3, title: "Advanced Techniques", start: 220, end: 280, completed: false },
    { id: 4, title: "Practical Application", start: 310, end: 360, completed: false },
    { id: 5, title: "Conclusion & Next Steps", start: 420, end: 444, completed: false }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Format time to MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      videoRef?.current?.pause();
    } else {
      videoRef?.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Jump to specific session
  const jumpToSession = (session: { start: number; }) => {
    if (videoRef.current) {
      videoRef.current.currentTime = session.start;
    }
    if (!isPlaying) {
      videoRef?.current?.play();
      setIsPlaying(true);
    }
  };

  // Update progress bar as video plays
  useEffect(() => {
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef?.current?.currentTime);
          }
      
      // Check if current session is completed
      const updatedSessions = sessions.map(session => {
        if (!session.completed && 
            videoRef.current && videoRef.current.currentTime >= session.end) {
          return { ...session, completed: true };
        }
        return session;
      });
      
      // If sessions changed, update state
      if (JSON.stringify(updatedSessions) !== JSON.stringify(sessions)) {
        setSessions(updatedSessions);
      }
    };

    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
      }
    };

    const video = videoRef.current;
    video!.addEventListener('timeupdate', handleTimeUpdate);
    video!.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video!.removeEventListener('timeupdate', handleTimeUpdate);
      video!.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [sessions]);

  // Handle seeking on progress bar click
  const handleProgressBarClick = (e: { clientX: number; }) => {
    const progressBar = progressBarRef.current;
    const rect = progressBar!.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = clickPosition * duration;
    }
  };

  // Calculate overall completion percentage
  const calculateCompletionPercentage = () => {
    const completedSessions = sessions.filter(session => session.completed).length;
    return Math.round((completedSessions / sessions.length) * 100);
  };

  // Get current active session
  const getCurrentSession = () => {
    return sessions.find(session => 
      currentTime >= session.start && currentTime < session.end
    ) || sessions[0];
  };

  const currentSession = getCurrentSession();

  return (
    <div className="min-h-screen bg-gray-50">
      
      
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Video and Course Info */}
          <div className="md:col-span-2">
            {/* Video Section */}
            <div className="relative overflow-hidden mb-6 border-b rounded-lg pb-4">
              <div className="relative">
                {/* <img 
                  src="Images/Banners/Person.jpg" 
                  alt="Course video thumbnail" 
                  className="w-full h-auto rounded-lg"
                /> */}
                        <video
          ref={videoRef}
          className="w-full h-auto rounded-md"
          src="courses/video2 - Trim.mp4"
          poster="Images/Banners/Person.jpg"
        >
          Your browser does not support the video tag.
        </video>
        {/* Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 rounded-lg bg-black bg-opacity-60 p-4 text-white">
          {/* Progress Bar */}
          <div 
            ref={progressBarRef}
            className="w-full h-2 bg-gray-700 rounded-full mb-2 cursor-pointer"
            onClick={handleProgressBarClick}
          >
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center">
            {/* Controls */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={togglePlay}
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
                  const newVolume = parseFloat(e.target.value);
                  setVolume(newVolume);
                  if (videoRef.current) {
                    videoRef.current.volume = newVolume;
                  }
                }}
                className="w-24"
              />
            </div>
          </div>
        </div>
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center">
                  <span className="mr-1">●</span> 12:32
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white bg-opacity-80 rounded-full p-3 cursor-pointer">
                    <Play onClick={togglePlay} size={32} className="text-gray-700" />
                  </div>
                </div>
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