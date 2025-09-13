import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface RevenueTransaction {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  watchTimeMinutes: number;
  courseCount: number;
  month: string;
  year: number;
  platformFee: number;
  instructorShare: number;
  taxAmount: number;
  totalEarnings: number;
  processedDate?: Timestamp | Date;
  requestDate: Timestamp | Date;
  instructorId: string;
  notes?: string;
  courseId?: string;
  courseTitle?: string;
}

export interface CourseRevenueData {
  courseId: string;
  courseTitle: string;
  totalRevenue: number;
  totalStudents: number;
  totalWatchTime: number;
  averageRevenue: number;
  completionRate: number;
  lastActivity: Date;
  monthlyRevenue: { month: string; revenue: number }[];
  enrollments: number;
  price: number;
}

export interface MonthlyTrend {
  month: string;
  revenue: number;
  students: number;
  courses: number;
  watchTime: number;
  growth: number;
  enrollments: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  totalPending: number;
  totalProcessed: number;
  totalWatchTime: number;
  totalStudents: number;
  totalCourses: number;
  averageRevenuePerStudent: number;
  averageWatchTimePerStudent: number;
  completionRate: number;
  monthlyGrowth: number;
}

class RevenueReportService {
  private PAYOUT_REQUESTS_COLLECTION = 'payoutRequests';
  private STUDENT_ENROLLMENTS_COLLECTION = 'studentEnrollments';
  private WATCH_TIME_DATA_COLLECTION = 'watchTimeData';
  private COURSES_COLLECTION = 'courseDrafts';
  private USERS_COLLECTION = 'users';

  async getRevenueTransactions(
    instructorId: string, 
    period: number = 12, 
    status?: string,
    courseId?: string
  ): Promise<RevenueTransaction[]> {
    try {
      console.log('Fetching revenue transactions for instructor:', instructorId);
      
      // Start with a simple query without date filtering to get all data
      let q = query(
        collection(db, this.PAYOUT_REQUESTS_COLLECTION),
        where('instructorId', '==', instructorId)
      );

      if (status && status !== 'all') {
        q = query(q, where('status', '==', status));
      }

      if (courseId && courseId !== 'all') {
        q = query(q, where('courseId', '==', courseId));
      }

      const snapshot = await getDocs(q);
      const transactions: RevenueTransaction[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data() as any;
        
        // Handle Firebase Timestamps properly
        let processedDate = data.processedDate;
        let requestDate = data.requestDate;
        
        if (processedDate && processedDate.toDate) {
          processedDate = processedDate.toDate();
        } else if (processedDate && processedDate._seconds) {
          processedDate = new Date(processedDate._seconds * 1000);
        }
        
        if (requestDate && requestDate.toDate) {
          requestDate = requestDate.toDate();
        } else if (requestDate && requestDate._seconds) {
          requestDate = new Date(requestDate._seconds * 1000);
        }
        
        transactions.push({
          id: doc.id,
          amount: data.amount || 0,
          status: data.status || 'pending',
          watchTimeMinutes: data.watchTimeMinutes || 0,
          courseCount: data.courseCount || 0,
          month: data.month || '',
          year: data.year || new Date().getFullYear(),
          platformFee: data.platformFee || 0,
          instructorShare: data.instructorShare || 0,
          taxAmount: data.taxAmount || 0,
          totalEarnings: data.totalEarnings || 0,
          processedDate: processedDate,
          requestDate: requestDate,
          instructorId: data.instructorId || instructorId,
          notes: data.notes || '',
          courseId: data.courseId,
          courseTitle: data.courseTitle
        });
      }

      console.log(`Found ${transactions.length} revenue transactions for instructor ${instructorId}`);
      console.log('Sample transaction:', transactions[0]);
      return transactions;
    } catch (error) {
      console.error('Error fetching revenue transactions:', error);
      console.error('Error details:', error);
      return [];
    }
  }

  async getCourseRevenueData(instructorId: string): Promise<CourseRevenueData[]> {
    try {
      console.log('Fetching course revenue data for instructor:', instructorId);
      
      // Get instructor's courses
      const coursesQuery = query(
        collection(db, this.COURSES_COLLECTION),
        where('instructorId', '==', instructorId)
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      
      console.log(`Found ${coursesSnapshot.docs.length} courses for instructor ${instructorId}`);
      
      const courseRevenueData: CourseRevenueData[] = [];

      for (const courseDoc of coursesSnapshot.docs) {
        const courseData = courseDoc.data() as any;
        const courseId = courseDoc.id;

        // Get enrollments for this course
        const enrollmentsQuery = query(
          collection(db, this.STUDENT_ENROLLMENTS_COLLECTION),
          where('courseId', '==', courseId)
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

        // Get watch time data for this course
        const watchTimeQuery = query(
          collection(db, this.WATCH_TIME_DATA_COLLECTION),
          where('courseId', '==', courseId),
          where('instructorId', '==', instructorId)
        );
        const watchTimeSnapshot = await getDocs(watchTimeQuery);

        // Get revenue data for this course
        const revenueQuery = query(
          collection(db, this.PAYOUT_REQUESTS_COLLECTION),
          where('instructorId', '==', instructorId),
          where('courseId', '==', courseId)
        );
        const revenueSnapshot = await getDocs(revenueQuery);

        let totalRevenue = 0;
        let totalWatchTime = 0;
        let totalStudents = enrollmentsSnapshot.docs.length;
        let lastActivity = new Date(0);
        const monthlyRevenue: { month: string; revenue: number }[] = [];

        // Process revenue data
        for (const revenueDoc of revenueSnapshot.docs) {
          const revenueData = revenueDoc.data() as any;
          totalRevenue += revenueData.instructorShare || 0;
          
          const month = revenueData.month || '';
          if (month) {
            const existingMonth = monthlyRevenue.find(m => m.month === month);
            if (existingMonth) {
              existingMonth.revenue += revenueData.instructorShare || 0;
            } else {
              monthlyRevenue.push({
                month,
                revenue: revenueData.instructorShare || 0
              });
            }
          }
        }

        // Process watch time data
        for (const watchDoc of watchTimeSnapshot.docs) {
          const watchData = watchDoc.data() as any;
          totalWatchTime += watchData.watchMinutes || 0;
          
          const timestamp = watchData.timestamp?.toDate() || new Date(0);
          if (timestamp > lastActivity) {
            lastActivity = timestamp;
          }
        }

        // Process enrollments for completion rate
        let completedStudents = 0;
        for (const enrollmentDoc of enrollmentsSnapshot.docs) {
          const enrollmentData = enrollmentDoc.data() as any;
          if (enrollmentData.progress >= 100) {
            completedStudents++;
          }
          
          const lastAccessed = enrollmentData.lastAccessedAt?.toDate() || new Date(0);
          if (lastAccessed > lastActivity) {
            lastActivity = lastAccessed;
          }
        }

        const completionRate = totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0;
        const averageRevenue = totalStudents > 0 ? totalRevenue / totalStudents : 0;

        courseRevenueData.push({
          courseId,
          courseTitle: courseData.title || courseData.courseTitle || 'Unknown Course',
          totalRevenue,
          totalStudents,
          totalWatchTime,
          averageRevenue,
          completionRate,
          lastActivity,
          monthlyRevenue: monthlyRevenue.sort((a, b) => a.month.localeCompare(b.month)),
          enrollments: totalStudents,
          price: courseData.price || 0
        });
      }

      console.log(`Found ${courseRevenueData.length} courses with revenue data`);
      return courseRevenueData;
    } catch (error) {
      console.error('Error fetching course revenue data:', error);
      return [];
    }
  }

  async getMonthlyTrends(instructorId: string, period: number = 12): Promise<MonthlyTrend[]> {
    try {
      console.log('Fetching monthly trends for instructor:', instructorId);
      
      const trends: MonthlyTrend[] = [];
      const currentDate = new Date();
      
      for (let i = period - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const month = date.toISOString().slice(0, 7); // YYYY-MM format
        const year = date.getFullYear();
        
        // Get revenue data for this month
        const revenueQuery = query(
          collection(db, this.PAYOUT_REQUESTS_COLLECTION),
          where('instructorId', '==', instructorId),
          where('month', '==', month)
        );
        const revenueSnapshot = await getDocs(revenueQuery);
        
        let revenue = 0;
        let watchTime = 0;
        let courses = 0;
        const courseIds = new Set<string>();
        
      for (const doc of revenueSnapshot.docs) {
        const data = doc.data() as any;
        revenue += data.instructorShare || 0;
        watchTime += data.watchTimeMinutes || 0;
        if (data.courseId) {
          courseIds.add(data.courseId);
        }
      }
        
        courses = courseIds.size;
        
        // Get student count for this month
        const startOfMonth = new Date(year, date.getMonth(), 1);
        const endOfMonth = new Date(year, date.getMonth() + 1, 0);
        
        const enrollmentsQuery = query(
          collection(db, this.STUDENT_ENROLLMENTS_COLLECTION),
          where('instructorId', '==', instructorId),
          where('enrolledAt', '>=', startOfMonth),
          where('enrolledAt', '<=', endOfMonth)
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const students = enrollmentsSnapshot.docs.length;
        
        // Calculate growth compared to previous month
        let growth = 0;
        if (i < period - 1) {
          const prevMonth = trends[trends.length - 1];
          if (prevMonth.revenue > 0) {
            growth = ((revenue - prevMonth.revenue) / prevMonth.revenue) * 100;
          }
        }
        
        trends.push({
          month,
          revenue,
          students,
          courses,
          watchTime,
          growth,
          enrollments: students
        });
      }
      
      console.log(`Generated ${trends.length} monthly trends`);
      return trends;
    } catch (error) {
      console.error('Error fetching monthly trends:', error);
      return [];
    }
  }

  async getRevenueAnalytics(instructorId: string, period: number = 12): Promise<RevenueAnalytics> {
    try {
      console.log('Fetching revenue analytics for instructor:', instructorId);
      
      const transactions = await this.getRevenueTransactions(instructorId, period);
      const courseData = await this.getCourseRevenueData(instructorId);
      const trends = await this.getMonthlyTrends(instructorId, period);
      
      const totalRevenue = transactions.reduce((sum, t) => sum + t.totalEarnings, 0);
      const totalPending = transactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + t.totalEarnings, 0);
      const totalProcessed = transactions
        .filter(t => t.status === 'processed')
        .reduce((sum, t) => sum + t.totalEarnings, 0);
      const totalWatchTime = transactions.reduce((sum, t) => sum + t.watchTimeMinutes, 0);
      const totalStudents = courseData.reduce((sum, c) => sum + c.totalStudents, 0);
      const totalCourses = courseData.length;
      
      const averageRevenuePerStudent = totalStudents > 0 ? totalRevenue / totalStudents : 0;
      const averageWatchTimePerStudent = totalStudents > 0 ? totalWatchTime / totalStudents : 0;
      const completionRate = courseData.length > 0 
        ? courseData.reduce((sum, c) => sum + c.completionRate, 0) / courseData.length 
        : 0;
      
      // Calculate monthly growth
      let monthlyGrowth = 0;
      if (trends.length >= 2) {
        const currentMonth = trends[trends.length - 1];
        const previousMonth = trends[trends.length - 2];
        if (previousMonth.revenue > 0) {
          monthlyGrowth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
        }
      }
      
      return {
        totalRevenue,
        totalPending,
        totalProcessed,
        totalWatchTime,
        totalStudents,
        totalCourses,
        averageRevenuePerStudent,
        averageWatchTimePerStudent,
        completionRate,
        monthlyGrowth
      };
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      return {
        totalRevenue: 0,
        totalPending: 0,
        totalProcessed: 0,
        totalWatchTime: 0,
        totalStudents: 0,
        totalCourses: 0,
        averageRevenuePerStudent: 0,
        averageWatchTimePerStudent: 0,
        completionRate: 0,
        monthlyGrowth: 0
      };
    }
  }

  // Mock data for testing when Firebase is not available
  getMockRevenueTransactions(): RevenueTransaction[] {
    return [
      {
        id: "FM8CWWUxnWTu7nJ9ghUw",
        amount: 1200,
        status: "processed",
        watchTimeMinutes: 1450,
        courseCount: 3,
        month: "2025-01",
        year: 2025,
        platformFee: 580,
        instructorShare: 870,
        taxAmount: 216,
        totalEarnings: 1416,
        processedDate: new Date(2025, 1, 15),
        requestDate: new Date(2025, 0, 15),
        instructorId: "abdulquader152@gmail.com",
        notes: "Successfully processed",
        courseId: "course-1",
        courseTitle: "Web Development Fundamentals"
      },
      {
        id: "Ja3lXjHVzqPyVq8qvh8k",
        amount: 750,
        status: "approved",
        watchTimeMinutes: 900,
        courseCount: 2,
        month: "2025-03",
        year: 2025,
        platformFee: 360,
        instructorShare: 540,
        taxAmount: 135,
        totalEarnings: 885,
        requestDate: new Date(2025, 2, 15),
        instructorId: "abdulquader152@gmail.com",
        notes: "Approved, processing payment",
        courseId: "course-2",
        courseTitle: "React.js Masterclass"
      },
      {
        id: "UMl9pZRIZZpPi0mMy79g",
        amount: 980,
        status: "pending",
        watchTimeMinutes: 1380,
        courseCount: 3,
        month: "2025-02",
        year: 2025,
        platformFee: 470,
        instructorShare: 710,
        taxAmount: 176,
        totalEarnings: 1156,
        requestDate: new Date(2025, 1, 15),
        instructorId: "abdulquader152@gmail.com",
        notes: "Pending review",
        courseId: "course-1",
        courseTitle: "Web Development Fundamentals"
      }
    ];
  }

  getMockCourseRevenueData(): CourseRevenueData[] {
    return [
      {
        courseId: "course-1",
        courseTitle: "Web Development Fundamentals",
        totalRevenue: 2400,
        totalStudents: 12,
        totalWatchTime: 2880,
        averageRevenue: 200,
        completionRate: 75,
        lastActivity: new Date(2025, 2, 20),
        monthlyRevenue: [
          { month: "2025-01", revenue: 800 },
          { month: "2025-02", revenue: 900 },
          { month: "2025-03", revenue: 700 }
        ],
        enrollments: 12,
        price: 2999
      },
      {
        courseId: "course-2",
        courseTitle: "React.js Masterclass",
        totalRevenue: 3600,
        totalStudents: 18,
        totalWatchTime: 4320,
        averageRevenue: 200,
        completionRate: 85,
        lastActivity: new Date(2025, 2, 22),
        monthlyRevenue: [
          { month: "2025-01", revenue: 1200 },
          { month: "2025-02", revenue: 1300 },
          { month: "2025-03", revenue: 1100 }
        ],
        enrollments: 18,
        price: 4999
      }
    ];
  }

  getMockMonthlyTrends(): MonthlyTrend[] {
    return [
      { month: "2025-01", revenue: 2000, students: 15, courses: 2, watchTime: 3600, growth: 15.5, enrollments: 15 },
      { month: "2025-02", revenue: 2200, students: 18, courses: 2, watchTime: 4200, growth: 10.0, enrollments: 18 },
      { month: "2025-03", revenue: 1800, students: 16, courses: 2, watchTime: 3800, growth: -18.2, enrollments: 16 }
    ];
  }
}

const revenueReportService = new RevenueReportService();
export default revenueReportService;
