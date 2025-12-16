import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Clock,
  Star,
  Play,
  CheckCircle,
  Calendar,
  Award,
  Users,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAuth } from "../../../context/AuthContext";
import LoadingIcon from "../../../components/ui/LoadingIcon";
import { getEnrolledCourses } from "../../../utils/firebaseEnrolledCourses";
import {
  Course,
  calculateCourseDuration,
} from "../../../utils/firebaseCourses";
import { StudentEnrollment } from "../../../utils/firebaseStudentProgress";

interface EnrolledCourseDisplay {
  id: string;
  courseId: string;
  courseName: string;
  instructorName: string;
  thumbnail: string;
  category: string;
  enrolledAt: Date;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed: Date;
  status: "active" | "completed" | "paused";
  duration: string;
  rating: number;
  totalStudents: number;
}

interface EnrolledCoursesProps {
  profile: any;
}

const EnrolledCourses: React.FC<EnrolledCoursesProps> = ({ profile }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourseDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEnrolledCourses = useCallback(async () => {
    if (!user?.email) return;

    setLoading(true);
    setError("");

    try {
      // Get enrolled courses from Firebase using email as studentId
      console.log("Loading enrolled courses for user:", user.email);
      const enrolledCourses = await getEnrolledCourses(user.email);
      console.log("Found enrolled courses:", enrolledCourses);

      // Transform the data to match the display interface
      const transformedCourses: EnrolledCourseDisplay[] = enrolledCourses.map(
        (enrolledCourse) => {
          const course = enrolledCourse as Course;
          const enrollment = enrolledCourse.enrollment as StudentEnrollment;

          // Convert Firestore timestamps to JavaScript Date objects
          const convertTimestamp = (timestamp: any): Date => {
            if (timestamp instanceof Date) {
              return timestamp;
            }
            if (timestamp && typeof timestamp.toDate === "function") {
              return timestamp.toDate();
            }
            return new Date(timestamp);
          };

          const enrolledAt = convertTimestamp(enrollment.enrolledAt);
          const lastAccessed = convertTimestamp(enrollment.lastAccessedAt);

          // Calculate course duration in hours
          const courseDurationHours = calculateCourseDuration(course);
          const durationText =
            courseDurationHours > 0
              ? `${courseDurationHours} hours`
              : `${enrolledCourse.courseProgress.estimatedTimeRemaining} minutes`;

          return {
            id: course.id,
            courseId: course.id,
            courseName: course.title,
            instructorName: course.members?.[0]?.email || "Unknown Instructor",
            thumbnail:
              course.thumbnailUrl || "/Images/courses/default-course.jpg",
            category: course.category || "General",
            enrolledAt: enrolledAt,
            progress: enrollment.progress,
            totalLessons: enrolledCourse.courseProgress.totalModules,
            completedLessons: enrolledCourse.courseProgress.completedModules,
            lastAccessed: lastAccessed,
            status: enrollment.isActive
              ? enrollment.progress === 100
                ? "completed"
                : "active"
              : "paused",
            duration: durationText,
            rating: 4.5, // Default rating - you can add this to your course data
            totalStudents: 100, // Default - you can add this to your course data
          };
        }
      );

      setCourses(transformedCourses);
    } catch (err) {
      console.error("Error loading enrolled courses:", err);
      setError("Failed to load enrolled courses");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadEnrolledCourses();
  }, [loadEnrolledCourses]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Play className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Paused
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getDaysSinceEnrollment = (enrolledAt: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - enrolledAt.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm p-8 mt-8">
        <div className="flex items-center justify-center">
          <LoadingIcon className="inline-block" />
          <span className="ml-2 text-gray-600">
            Loading enrolled courses...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm p-8 mt-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#ff7700]">Enrolled Courses</h2>
          <div className="text-sm text-gray-600">
            {courses.length} Course{courses.length !== 1 ? "s" : ""} Enrolled
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {courses.length}
                </div>
                <div className="text-sm text-blue-700">Total Courses</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-green-900">
                  {courses.filter((c) => c.status === "completed").length}
                </div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-orange-900">
                  {Math.round(
                    courses.reduce((acc, c) => acc + c.progress, 0) /
                      courses.length
                  ) || 0}
                  %
                </div>
                <div className="text-sm text-orange-700">Avg. Progress</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-purple-900">
                  {courses.reduce((acc, c) => acc + c.completedLessons, 0)}
                </div>
                <div className="text-sm text-purple-700">Lessons Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm p-8">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Enrolled Courses
            </h3>
            <p className="text-gray-600 mb-4">
              You haven't enrolled in any courses yet.
            </p>
            <Button 
              className="bg-[#ff7700] hover:bg-[#e55e00] text-white"
              onClick={() => window.location.href = '/#/courselist'}
            >
              Browse Courses
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm p-6"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Course Thumbnail */}
                <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="w-full h-full object-cover"
                    // onError={(e) => {
                    //   (e.target as HTMLImageElement).src =
                    //     "/Images/courses/default-course.jpg";
                    // }}
                  />
                </div>

                {/* Course Details */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {course.courseName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        by {course.instructorName}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Enrolled {formatDate(course.enrolledAt)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {0} {course.duration}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {course.totalStudents} students
                        </span>
                        <span className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          {course.rating}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0">
                      {getStatusBadge(course.status)}
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progress
                      </span>
                      <span className="text-sm text-gray-600">
                        {course.completedLessons}/{course.totalLessons} lessons
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#ff7700] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {course.progress}% complete
                      </span>
                      <span className="text-xs text-gray-500">
                        Last accessed{" "}
                        {getDaysSinceEnrollment(course.lastAccessed)} days ago
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button className="bg-[#ff7700] hover:bg-[#e55e00] text-white text-sm">
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                    <Button variant="outline" className="text-sm">
                      View Details
                    </Button>
                    {course.status === "completed" && (
                      <Button variant="outline" className="text-sm">
                        <Award className="w-4 h-4 mr-2" />
                        View Certificate
                      </Button>
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
};

export default EnrolledCourses;
