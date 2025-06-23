import { BellIcon } from 'lucide-react';
import React from 'react';
import GradientHeader from '../../../components/ui/GradientHeader';

type Notification = {
  id: string;
  source: 'instructor' | 'zk';
  title: string;
  message: string;
  timestamp: string;
  courseName?: string;
  isRead: boolean;
};

const notifications: Notification[] = [
  {
    id: '1',
    source: 'instructor',
    title: 'New Lesson Added',
    message: 'Your instructor has added a new lesson in “Guitar Basics”.',
    timestamp: '2 hours ago',
    courseName: 'Guitar Basics',
    isRead: false
  },
  {
    id: '2',
    source: 'zk',
    title: 'Welcome to ZK Tutorials!',
    message: 'Thanks for joining. Explore courses and begin learning today.',
    timestamp: '1 day ago',
    isRead: true
  },
];

export default function NotificationList() {
  return (
    
            <div className="public-profile-root min-h-screen">
      <GradientHeader subtitle="Learner" title="Notifications" />
      
<div className="max-w-[80%] mx-auto my-10 bg-white rounded-lg shadow-md border border-gray-200">
      <ul className="divide-y divide-gray-100">
        {notifications.map((notif) => (
          <li
            key={notif.id}
            className={`px-4 py-3 hover:bg-gray-50 ${
              notif.isRead ? 'bg-white' : 'bg-gray-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-md font-medium text-gray-900">
                  {notif.source === 'zk' ? 'ZK Tutorials' : 'Your Instructor'}
                </p>
                <p className="text-md text-gray-700">{notif.title}</p>
                <p className="text-xs text-gray-500">{notif.message}</p>
                {notif.courseName && (
                  <p className="text-xs text-gray-600 mt-1 italic">
                    Course: {notif.courseName}
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-400">{notif.timestamp}</span>
            </div>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}