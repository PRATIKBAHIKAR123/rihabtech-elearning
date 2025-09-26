
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ChevronRight, Search, ShoppingCart, Bell, ChevronDown, List, RefreshCw } from "lucide-react";
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  getLearnerHomeData,
  // getMockEnrolledCourses,
  // getMockRecommendedCourses,
  HomepageCourse
} from '../../utils/learnerHomeService';
import { toast } from 'sonner';

export default function HomePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ Name?: string } | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<HomepageCourse[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<HomepageCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      // Try to get from localStorage first
      const cached = localStorage.getItem('token');
      if (cached) {
        setProfile(JSON.parse(cached));
      } else if (user) {
        setProfile({ Name: user.displayName || user.email || undefined });
      } else {
        setProfile({});
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const loadHomeData = async () => {
      if (!user?.email) {
        // If no user, use mock data
        // setEnrolledCourses(getMockEnrolledCourses());
        // setRecommendedCourses(getMockRecommendedCourses());
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Loading home data for user:', user.email);
        const homeData = await getLearnerHomeData(user.email);
        console.log('Home data loaded:', homeData);

        if (homeData.error) {
          
          // setEnrolledCourses(getMockEnrolledCourses());
          // setRecommendedCourses(getMockRecommendedCourses());
          setError(homeData.error);
          toast.warning('Using sample data. Some features may be limited.');
        } else {
          setEnrolledCourses(homeData.enrolledCourses);
          setRecommendedCourses(homeData.recommendedCourses);
          setError(null);
        }
      } catch (error) {
        console.error('Error loading home data:', error);
        // Fall back to mock data
        // setEnrolledCourses(getMockEnrolledCourses());
        // setRecommendedCourses(getMockRecommendedCourses());
        setError('Failed to load data');
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [user]);

  const handleRefresh = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      setError(null);

      const homeData = await getLearnerHomeData(user.email);

      if (homeData.error) {
        // setEnrolledCourses(getMockEnrolledCourses());
        // setRecommendedCourses(getMockRecommendedCourses());
        setError(homeData.error);
        toast.warning('Failed to load data');
      } else {
        setEnrolledCourses(homeData.enrolledCourses);
        setRecommendedCourses(homeData.recommendedCourses);
        setError(null);
        toast.success('Data refreshed successfully!');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      // setEnrolledCourses(getMockEnrolledCourses());
      // setRecommendedCourses(getMockRecommendedCourses());
      setError('Failed to refresh data');
      toast.error('Failed to refresh data. Using sample data instead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="landing-gradient py-12 md:py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-start">
          <div className="flex flex-col gap-6 md:w-1/2">
            <p className="banner-section-subtitle">
              Professional & Lifelong Learning
            </p>
            <h1 className="banner-section-title">
              Welcome Back, <span className="text-primary">{profile?.Name || user?.displayName || user?.email || 'Learner'}!</span>
            </h1>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="px-6 py-3 rounded-none h-auto text-white hover:bg-blue-700 font-medium">
                <List /> Categories
              </Button>
              <div className='relative w-full'>
                <input placeholder='What do you want to learn?' className='outline outline-1 outline-offset-[-1px] outline-[#ff7700] px-4 py-3 w-full' />
                <Search className='absolute top-1/4 right-4' />
              </div>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <img
                src="Images/Banners/col-md-6.png"
                alt="Happy student learning"
              />
            </div>
          </div>
        </div>
      </section>

      {/* My Learnings Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title">My Learnings</h2>
            <div className="flex items-center gap-2">
              {error && (
                <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  Using sample data
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {enrolledCourses.map((course, index) => (
                <CourseCard key={course.id || index} course={course} progress />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">You haven't enrolled in any courses yet.</p>
              <Button
                onClick={() => window.location.href = '/#/courselist'}
                className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700"
              >
                Browse Courses
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Courses You May Like Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="section-title">Courses You May Like</h2>
            {error && (
              <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                Using sample data
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : recommendedCourses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedCourses.slice(0, 4).map((course, index) => (
                  <CourseCard key={course.id || index} course={course} />
                ))}
              </div>

              {recommendedCourses.length > 4 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                  {recommendedCourses.slice(4, 8).map((course, index) => (
                    <CourseCard key={course.id || index} course={course} />
                  ))}
                </div>
              )}

              {recommendedCourses.length > 8 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                  {recommendedCourses.slice(8, 12).map((course, index) => (
                    <CourseCard key={course.id || index} course={course} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No recommended courses available at the moment.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}



function CourseCard({ course, progress = false }: { course: HomepageCourse; progress?: boolean }) {
  return (
    <div className="course-card overflow-hidden" onClick={() => {
      if (course.progress) {
        window.location.href = `/#/learner/current-course/?courseId='${course.id}`;
      } else {
        window.location.href = `/#/courseDetails/?courseId=${course.id}`;
      }
    }}>
      <div className="relative">
        <img src={course.image} alt={course.title} />

      </div>

      <div className="course-details-section">
        <div className="course-content">
          <div className="course-students">
            <div className=" py-0.5 flex gap-2 items-center">
              {/* <User2 size={16}/> */}
              <span>{course.students} Students</span>
            </div>
            {/* <Divider/> */}
            <div className="py-0.5 flex items-center gap-2">
              {/* <Clock size={16}/> */}
              <span>{course.duration} Weeks</span>
            </div>
          </div>
          <h3 className="course-title">{course.title}</h3>
          <p className="course-desciption">{course.description}</p>

          {progress && (
            <div className="course-progress">
              <div className="course-progress-bar">
                <div
                  className="progress-completed"
                  style={{ width: `${course.progress}%` }}
                ></div><div className="progress-dot" />
              </div>
              <div className="progress-text-completed">{course.progress}% Completed</div>
            </div>
          )}
        </div>

        <div className="course-price-section">
          {course.price ? (
            <span className="badge-free">{course.price}</span>
          ) : (
            <span className="badge-paid">{course.price}</span>
          )}
        </div>
      </div>
    </div>
  );
}