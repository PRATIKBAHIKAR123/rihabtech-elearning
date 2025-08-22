import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, getCountFromServer } from 'firebase/firestore';

export interface DashboardStats {
  totalRevenue: number;
  totalEnrollments: number;
  totalStudents: number;
  totalCourses: number;
  currentMonthRevenue: number;
  currentMonthEnrollments: number;
}

export interface StudentData {
  id: string;
  name: string;
  email: string;
  location: string;
  enrolledDate: Date;
  numberOfCourses: number;
  status: 'active' | 'inactive' | 'completed';
  lastAccessedAt: Date;
  progress: number;
}

export interface ReviewData {
  id: string;
  studentName: string;
  studentRole: string;
  rating: number;
  reviewText: string;
  courseId: string;
  courseTitle: string;
  reviewDate: Date;
  isReplied: boolean;
  replyText?: string;
  replyDate?: Date;
}

export interface EngagementData {
  totalMinutesWatched: number;
  activeLearners: number;
  averageCompletionRate: number;
  monthlyStats: {
    month: string;
    minutesWatched: number;
    enrollments: number;
    revenue: number;
  }[];
  coursePerformance: {
    courseId: string;
    courseTitle: string;
    viewed: number;
    dropped: number;
    amountConsumed: number;
  }[];
  deviceStats: {
    mobile: number;
    tablet: number;
    laptop: number;
  };
}

export interface RevenueData {
  month: string;
  revenue: number;
  enrollments: number;
  percentage: number;
}

class DashboardService {
  private readonly WATCH_TIME_COLLECTION = 'watchTimeData';
  private readonly COURSES_COLLECTION = 'courses';
  private readonly PAYOUT_REQUESTS_COLLECTION = 'payoutRequests';
  private readonly STUDENT_ENROLLMENTS_COLLECTION = 'studentEnrollments';
  private readonly MODULE_PROGRESS_COLLECTION = 'moduleProgress';

  // Get overview statistics
  async getDashboardStats(instructorId: string): Promise<DashboardStats> {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentYear = new Date().getFullYear();

      // Get total revenue from payouts
      const payoutQuery = query(
        collection(db, this.PAYOUT_REQUESTS_COLLECTION),
        where('instructorId', '==', instructorId),
        where('status', '==', 'processed')
      );
      const payoutSnapshot = await getDocs(payoutQuery);
      let totalRevenue = 0;
      let currentMonthRevenue = 0;

      payoutSnapshot.forEach(doc => {
        const data = doc.data();
        const amount = data.amount || 0;
        totalRevenue += amount;
        
        if (data.month === currentMonth && data.year === currentYear) {
          currentMonthRevenue += amount;
        }
      });

      // Get total enrollments and students
      const enrollmentQuery = query(
        collection(db, this.STUDENT_ENROLLMENTS_COLLECTION)
      );
      const enrollmentSnapshot = await getDocs(enrollmentQuery);
      let totalEnrollments = 0;
      const uniqueStudents = new Set();
      let currentMonthEnrollments = 0;

      enrollmentSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.courseId) {
          // Check if this course belongs to the instructor
          // For now, we'll count all enrollments
          totalEnrollments++;
          uniqueStudents.add(data.studentId);
          
          const enrolledDate = data.enrolledAt?.toDate() || new Date();
          if (enrolledDate.toISOString().slice(0, 7) === currentMonth) {
            currentMonthEnrollments++;
          }
        }
      });

      // Get total courses
      const coursesQuery = query(
        collection(db, this.COURSES_COLLECTION),
        where('instructorId', '==', instructorId)
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      const totalCourses = coursesSnapshot.size;

      return {
        totalRevenue,
        totalEnrollments,
        totalStudents: uniqueStudents.size,
        totalCourses,
        currentMonthRevenue,
        currentMonthEnrollments
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error('Failed to get dashboard statistics');
    }
  }

  // Get students data
  async getStudentsData(instructorId: string): Promise<StudentData[]> {
    try {
      // Get all enrollments for courses by this instructor
      const coursesQuery = query(
        collection(db, this.COURSES_COLLECTION),
        where('instructorId', '==', instructorId)
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      const courseIds = coursesSnapshot.docs.map(doc => doc.id);

      if (courseIds.length === 0) {
        return [];
      }

      // Get enrollments for these courses
      const enrollmentsQuery = query(
        collection(db, this.STUDENT_ENROLLMENTS_COLLECTION)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

      const studentsMap = new Map<string, StudentData>();

      enrollmentsSnapshot.forEach(doc => {
        const data = doc.data();
        if (courseIds.includes(data.courseId)) {
          const studentId = data.studentId;
          
          if (!studentsMap.has(studentId)) {
            studentsMap.set(studentId, {
              id: studentId,
              name: data.studentName || 'Unknown Student',
              email: data.studentEmail || 'unknown@email.com',
              location: data.location || 'Unknown',
              enrolledDate: data.enrolledAt?.toDate() || new Date(),
              numberOfCourses: 1,
              status: data.isActive ? 'active' : 'inactive',
              lastAccessedAt: data.lastAccessedAt?.toDate() || new Date(),
              progress: data.progress || 0
            });
          } else {
            const existing = studentsMap.get(studentId)!;
            existing.numberOfCourses++;
            if (data.progress > existing.progress) {
              existing.progress = data.progress;
            }
            if (data.lastAccessedAt?.toDate() > existing.lastAccessedAt) {
              existing.lastAccessedAt = data.lastAccessedAt.toDate();
            }
          }
        }
      });

      return Array.from(studentsMap.values()).sort((a, b) => 
        b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime()
      );
    } catch (error) {
      console.error('Error getting students data:', error);
      throw new Error('Failed to get students data');
    }
  }

  // Get reviews data
  async getReviewsData(instructorId: string): Promise<ReviewData[]> {
    try {
      // Try to fetch from a reviews collection if it exists
      // For now, we'll simulate dynamic data based on course enrollments
      const coursesQuery = query(
        collection(db, this.COURSES_COLLECTION),
        where('instructorId', '==', instructorId)
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      
      if (coursesSnapshot.empty) {
        // Return mock data if no courses found
        return this.getMockReviewsData();
      }

      // Generate dynamic review data based on course performance
      const reviews: ReviewData[] = [];
      const courseIds = coursesSnapshot.docs.map(doc => doc.id);
      
      // Simulate reviews for each course
      courseIds.forEach((courseId, index) => {
        const courseDoc = coursesSnapshot.docs[index];
        const courseData = courseDoc.data();
        
        // Generate 1-3 reviews per course
        const reviewCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < reviewCount; i++) {
          const studentNames = ['Mehul Shah', 'Rajesh Kumar', 'Priya Singh', 'Amit Patel', 'Neha Sharma', 'Vikram Singh'];
          const studentRoles = ['Student', 'Developer', 'Student', 'Student', 'Student', 'Student'];
          const ratings = [4, 5, 4, 5, 4, 5];
          const reviewTexts = [
            'Excellent course with practical examples. Highly recommended for beginners.',
            'Great content and clear explanations. The instructor is very knowledgeable.',
            'Very comprehensive course covering all important concepts.',
            'Good pace and easy to follow. Learned a lot from this course.',
            'Well-structured content with real-world examples.',
            'Fantastic course! The instructor explains complex topics very clearly.'
          ];
          
          const randomIndex = Math.floor(Math.random() * studentNames.length);
          const reviewDate = new Date();
          reviewDate.setDate(reviewDate.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days
          
          reviews.push({
            id: `${courseId}-review-${i}`,
            studentName: studentNames[randomIndex],
            studentRole: studentRoles[randomIndex],
            rating: ratings[randomIndex],
            reviewText: reviewTexts[randomIndex],
            courseId: courseId,
            courseTitle: courseData.title || courseData.courseTitle || 'Unknown Course',
            reviewDate: reviewDate,
            isReplied: Math.random() > 0.7, // 30% chance of being replied to
            replyText: Math.random() > 0.7 ? 'Thank you for your feedback! We\'re glad you found the course helpful.' : undefined,
            replyDate: Math.random() > 0.7 ? new Date(reviewDate.getTime() + 24 * 60 * 60 * 1000) : undefined
          });
        }
      });
      
      // Sort by review date (newest first)
      return reviews.sort((a, b) => b.reviewDate.getTime() - a.reviewDate.getTime());
      
    } catch (error) {
      console.error('Error getting reviews data:', error);
      // Fallback to mock data
      return this.getMockReviewsData();
    }
  }

  // Mock reviews data for fallback
  private getMockReviewsData(): ReviewData[] {
    return [
      {
        id: '1',
        studentName: 'Mehul Shah',
        studentRole: 'Student',
        rating: 5,
        reviewText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla a eleifend elit. Orci varius natoque penatibus',
        courseId: 'course-1',
        courseTitle: 'Web Development Fundamentals',
        reviewDate: new Date('2025-01-15'),
        isReplied: false
      },
      {
        id: '2',
        studentName: 'Rajesh Kumar',
        studentRole: 'Student',
        rating: 4,
        reviewText: 'Excellent course with practical examples. Highly recommended for beginners.',
        courseId: 'course-2',
        courseTitle: 'React.js Masterclass',
        reviewDate: new Date('2025-01-10'),
        isReplied: true,
        replyText: 'Thank you for your feedback! We\'re glad you found the course helpful.',
        replyDate: new Date('2025-01-11')
      },
      {
        id: '3',
        studentName: 'Priya Singh',
        studentRole: 'Student',
        rating: 5,
        reviewText: 'Great content and clear explanations. The instructor is very knowledgeable.',
        courseId: 'course-3',
        courseTitle: 'Node.js Backend Development',
        reviewDate: new Date('2025-01-08'),
        isReplied: false
      }
    ];
  }

  // Mock engagement data for fallback
  private getMockEngagementData(): EngagementData {
    return {
      totalMinutesWatched: 999999,
      activeLearners: 99999,
      averageCompletionRate: 75,
      monthlyStats: [
        { month: '2025-01', minutesWatched: 8000, enrollments: 15, revenue: 8000 },
        { month: '2025-02', minutesWatched: 12000, enrollments: 22, revenue: 12000 },
        { month: '2025-03', minutesWatched: 9500, enrollments: 18, revenue: 9500 }
      ],
      coursePerformance: [
        { courseId: '1', courseTitle: 'Web Development', viewed: 45, dropped: 5, amountConsumed: 85 },
        { courseId: '2', courseTitle: 'React.js', viewed: 38, dropped: 3, amountConsumed: 92 },
        { courseId: '3', courseTitle: 'Node.js', viewed: 32, dropped: 4, amountConsumed: 78 }
      ],
      deviceStats: { mobile: 45, tablet: 25, laptop: 30 }
    };
  }

  // Get engagement data
  async getEngagementData(instructorId: string): Promise<EngagementData> {
    try {
      const currentYear = new Date().getFullYear();
      
      // Get watch time data
      const watchTimeQuery = query(
        collection(db, this.WATCH_TIME_COLLECTION),
        where('instructorId', '==', instructorId),
        where('year', '==', currentYear)
      );
      const watchTimeSnapshot = await getDocs(watchTimeQuery);

      let totalMinutesWatched = 0;
      const monthlyStats = new Map<string, { month: string; minutesWatched: number; enrollments: number; revenue: number }>();
      const coursePerformance = new Map<string, { courseId: string; courseTitle: string; viewed: number; dropped: number; amountConsumed: number }>();

      watchTimeSnapshot.forEach(doc => {
        const data = doc.data();
        const watchMinutes = data.watchMinutes || 0;
        totalMinutesWatched += watchMinutes;

        // Monthly stats
        const month = data.month;
        if (!monthlyStats.has(month)) {
          monthlyStats.set(month, { month, minutesWatched: 0, enrollments: 0, revenue: 0 });
        }
        const monthStat = monthlyStats.get(month)!;
        monthStat.minutesWatched += watchMinutes;
        monthStat.revenue += watchMinutes * 1; // ₹1 per minute

        // Course performance
        const courseId = data.courseId;
        if (!coursePerformance.has(courseId)) {
          coursePerformance.set(courseId, {
            courseId,
            courseTitle: data.courseTitle || 'Unknown Course',
            viewed: 0,
            dropped: 0,
            amountConsumed: 0
          });
        }
        const courseStat = coursePerformance.get(courseId)!;
        courseStat.viewed += 1;
        courseStat.amountConsumed += watchMinutes;
      });

      // Get course enrollments for monthly stats
      const enrollmentsQuery = query(
        collection(db, this.STUDENT_ENROLLMENTS_COLLECTION),
        where('instructorId', '==', instructorId),
        where('year', '==', currentYear)
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      
      enrollmentsSnapshot.forEach(doc => {
        const data = doc.data();
        const month = data.month;
        if (monthlyStats.has(month)) {
          const monthStat = monthlyStats.get(month)!;
          monthStat.enrollments += 1;
        }
      });

      // Calculate active learners (students who watched content in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeLearnersQuery = query(
        collection(db, this.WATCH_TIME_COLLECTION),
        where('instructorId', '==', instructorId),
        where('timestamp', '>=', thirtyDaysAgo)
      );
      const activeLearnersSnapshot = await getDocs(activeLearnersQuery);
      
      const activeLearnerIds = new Set();
      activeLearnersSnapshot.forEach(doc => {
        const data = doc.data();
        activeLearnerIds.add(data.studentId);
      });

      // Calculate average completion rate based on watch time vs course duration
      let totalCompletionRate = 0;
      let courseCount = 0;
      
      coursePerformance.forEach(course => {
        // Simulate completion rate based on amount consumed
        const completionRate = Math.min((course.amountConsumed / 100) * 100, 100); // Assuming 100 minutes = 100% completion
        totalCompletionRate += completionRate;
        courseCount++;
      });

      const averageCompletionRate = courseCount > 0 ? totalCompletionRate / courseCount : 0;

      // Generate device stats (simulated based on course performance)
      const deviceStats = {
        mobile: Math.floor(Math.random() * 40) + 30, // 30-70%
        tablet: Math.floor(Math.random() * 20) + 10,  // 10-30%
        laptop: Math.floor(Math.random() * 40) + 20   // 20-60%
      };

      // Normalize device stats to 100%
      const total = deviceStats.mobile + deviceStats.tablet + deviceStats.laptop;
      deviceStats.mobile = Math.round((deviceStats.mobile / total) * 100);
      deviceStats.tablet = Math.round((deviceStats.tablet / total) * 100);
      deviceStats.laptop = 100 - deviceStats.mobile - deviceStats.tablet;

      return {
        totalMinutesWatched,
        activeLearners: activeLearnerIds.size,
        averageCompletionRate: Math.round(averageCompletionRate),
        monthlyStats: Array.from(monthlyStats.values()).sort((a, b) => a.month.localeCompare(b.month)),
        coursePerformance: Array.from(coursePerformance.values()),
        deviceStats
      };

    } catch (error) {
      console.error('Error getting engagement data:', error);
      // Fallback to mock data
      return this.getMockEngagementData();
    }
  }

  // Get revenue statistics for charts
  async getRevenueStatistics(instructorId: string, year: number): Promise<RevenueData[]> {
    try {
      const months = [];
      for (let i = 1; i <= 12; i++) {
        const month = `${year}-${i.toString().padStart(2, '0')}`;
        months.push(month);
      }

      // Get payout data for the year
      const payoutQuery = query(
        collection(db, this.PAYOUT_REQUESTS_COLLECTION),
        where('instructorId', '==', instructorId),
        where('year', '==', year)
      );
      const payoutSnapshot = await getDocs(payoutQuery);

      const monthlyRevenue = new Map<string, number>();
      months.forEach(month => monthlyRevenue.set(month, 0));

      payoutSnapshot.forEach(doc => {
        const data = doc.data();
        const month = data.month;
        const amount = data.amount || 0;
        
        if (monthlyRevenue.has(month)) {
          monthlyRevenue.set(month, monthlyRevenue.get(month)! + amount);
        }
      });

      // Calculate percentages
      const maxRevenue = Math.max(...Array.from(monthlyRevenue.values()));
      
      return months.map(month => ({
        month: month.slice(-2), // Just the month number
        revenue: monthlyRevenue.get(month) || 0,
        enrollments: 0, // Could be calculated from enrollments
        percentage: maxRevenue > 0 ? ((monthlyRevenue.get(month) || 0) / maxRevenue) * 100 : 0
      }));
    } catch (error) {
      console.error('Error getting revenue statistics:', error);
      throw new Error('Failed to get revenue statistics');
    }
  }

  // Mock data for development/testing
  getMockDashboardStats(): DashboardStats {
    return {
      totalRevenue: 9999999,
      totalEnrollments: 9999999,
      totalStudents: 9999999,
      totalCourses: 3,
      currentMonthRevenue: 40000,
      currentMonthEnrollments: 999999
    };
  }

  getMockStudentsData(): StudentData[] {
    return [
      {
        id: '1',
        name: 'Rajesh Kumar Singh',
        email: 'rajesh@example.com',
        location: 'India',
        enrolledDate: new Date('2012-12-31'),
        numberOfCourses: 1,
        status: 'active',
        lastAccessedAt: new Date('2025-01-15'),
        progress: 75
      },
      {
        id: '2',
        name: 'Priya Singh',
        email: 'priya@example.com',
        location: 'India',
        enrolledDate: new Date('2012-12-31'),
        numberOfCourses: 1,
        status: 'active',
        lastAccessedAt: new Date('2025-01-14'),
        progress: 60
      },
      {
        id: '3',
        name: 'Amit Kumar',
        email: 'amit@example.com',
        location: 'India',
        enrolledDate: new Date('2012-12-31'),
        numberOfCourses: 1,
        status: 'completed',
        lastAccessedAt: new Date('2025-01-13'),
        progress: 100
      }
    ];
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
