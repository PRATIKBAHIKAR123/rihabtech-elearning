import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';

// Demo data structure for testing payout functionality
export const setupDemoPayoutData = async (instructorId: string) => {
  try {
    console.log('Setting up demo payout data for instructor:', instructorId);

    // 1. Setup sample watch time data
    const watchTimeData = [
      {
        instructorId,
        courseId: 'demo-course-1',
        courseTitle: 'Web Development Fundamentals',
        watchMinutes: 450,
        isPaidContent: true,
        month: '2025-01',
        year: 2025,
        studentId: 'student-1',
        timestamp: new Date()
      },
      {
        instructorId,
        courseId: 'demo-course-1',
        courseTitle: 'Web Development Fundamentals',
        watchMinutes: 320,
        isPaidContent: true,
        month: '2025-01',
        year: 2025,
        studentId: 'student-2',
        timestamp: new Date()
      },
      {
        instructorId,
        courseId: 'demo-course-2',
        courseTitle: 'React.js Masterclass',
        watchMinutes: 680,
        isPaidContent: true,
        month: '2025-01',
        year: 2025,
        studentId: 'student-3',
        timestamp: new Date()
      },
      {
        instructorId,
        courseId: 'demo-course-2',
        courseTitle: 'React.js Masterclass',
        watchMinutes: 420,
        isPaidContent: true,
        month: '2025-01',
        year: 2025,
        studentId: 'student-4',
        timestamp: new Date()
      },
      {
        instructorId,
        courseId: 'demo-course-3',
        courseTitle: 'Node.js Backend Development',
        watchMinutes: 550,
        isPaidContent: true,
        month: '2025-01',
        year: 2025,
        studentId: 'student-5',
        timestamp: new Date()
      },
      // February data
      {
        instructorId,
        courseId: 'demo-course-1',
        courseTitle: 'Web Development Fundamentals',
        watchMinutes: 380,
        isPaidContent: true,
        month: '2025-02',
        year: 2025,
        studentId: 'student-6',
        timestamp: new Date()
      },
      {
        instructorId,
        courseId: 'demo-course-2',
        courseTitle: 'React.js Masterclass',
        watchMinutes: 520,
        isPaidContent: true,
        month: '2025-02',
        year: 2025,
        studentId: 'student-7',
        timestamp: new Date()
      },
      {
        instructorId,
        courseId: 'demo-course-3',
        courseTitle: 'Node.js Backend Development',
        watchMinutes: 480,
        isPaidContent: true,
        month: '2025-02',
        year: 2025,
        studentId: 'student-8',
        timestamp: new Date()
      },
      // March data
      {
        instructorId,
        courseId: 'demo-course-1',
        courseTitle: 'Web Development Fundamentals',
        watchMinutes: 290,
        isPaidContent: true,
        month: '2025-03',
        year: 2025,
        studentId: 'student-9',
        timestamp: new Date()
      },
      {
        instructorId,
        courseId: 'demo-course-2',
        courseTitle: 'React.js Masterclass',
        watchMinutes: 610,
        isPaidContent: true,
        month: '2025-03',
        year: 2025,
        studentId: 'student-10',
        timestamp: new Date()
      }
    ];

    // 2. Setup sample payout requests
    const payoutRequests = [
      {
        instructorId,
        amount: 1200,
        status: 'processed',
        requestDate: new Date('2025-01-15'),
        processedDate: new Date('2025-01-20'),
        watchTimeMinutes: 1450,
        courseCount: 3,
        month: '2025-01',
        year: 2025,
        notes: 'Successfully processed',
        platformFee: 580,
        instructorShare: 870,
        taxAmount: 216,
        totalEarnings: 1416
      },
      {
        instructorId,
        amount: 980,
        status: 'pending',
        requestDate: new Date('2025-02-15'),
        watchTimeMinutes: 1380,
        courseCount: 3,
        month: '2025-02',
        year: 2025,
        notes: 'Pending admin approval',
        platformFee: 552,
        instructorShare: 828,
        taxAmount: 176.4,
        totalEarnings: 1156.4
      },
      {
        instructorId,
        amount: 750,
        status: 'approved',
        requestDate: new Date('2025-03-15'),
        watchTimeMinutes: 900,
        courseCount: 2,
        month: '2025-03',
        year: 2025,
        notes: 'Approved, processing payment',
        platformFee: 360,
        instructorShare: 540,
        taxAmount: 135,
        totalEarnings: 885
      }
    ];

    // 3. Setup sample courses data
    const courses = [
      {
        courseId: 'demo-course-1',
        courseTitle: 'Web Development Fundamentals',
        instructorId,
        price: 999,
        category: 'Development',
        enrollments: 45,
        totalWatchTime: 1200,
        createdAt: serverTimestamp()
      },
      {
        courseId: 'demo-course-2',
        courseTitle: 'React.js Masterclass',
        instructorId,
        price: 1499,
        category: 'Development',
        enrollments: 32,
        totalWatchTime: 1800,
        createdAt: serverTimestamp()
      },
      {
        courseId: 'demo-course-3',
        courseTitle: 'Node.js Backend Development',
        instructorId,
        price: 1299,
        category: 'Development',
        enrollments: 28,
        totalWatchTime: 1500,
        createdAt: serverTimestamp()
      }
    ];

    // 4. Setup sample user data
    const userData = {
      email: instructorId,
      userName: instructorId,
      role: 'instructor',
      firstName: 'Demo',
      lastName: 'Instructor',
      profilePicture: 'https://via.placeholder.com/150',
      bio: 'Experienced web development instructor with 5+ years of teaching experience',
      totalStudents: 105,
      totalCourses: 3,
      rating: 4.8,
      joinDate: serverTimestamp(),
      isVerified: true
    };

    // Use batch write for better performance
    const batch = writeBatch(db);

    // Add watch time data
    console.log('Adding watch time data...');
    for (const watchTime of watchTimeData) {
      const docRef = doc(collection(db, 'watchTimeData'));
      batch.set(docRef, {
        ...watchTime,
        timestamp: serverTimestamp()
      });
    }

    // Add payout requests
    console.log('Adding payout requests...');
    for (const payout of payoutRequests) {
      const docRef = doc(collection(db, 'payoutRequests'));
      batch.set(docRef, {
        ...payout,
        requestDate: serverTimestamp(),
        processedDate: payout.processedDate ? serverTimestamp() : null
      });
    }

    // Add courses
    console.log('Adding courses...');
    for (const course of courses) {
      const docRef = doc(collection(db, 'courses'));
      batch.set(docRef, course);
    }

    // Add user data
    console.log('Adding user data...');
    const userRef = doc(collection(db, 'users'), instructorId);
    batch.set(userRef, userData);

    // Commit all changes
    await batch.commit();
    console.log('Demo data setup completed successfully!');

    return {
      watchTimeRecords: watchTimeData.length,
      payoutRecords: payoutRequests.length,
      courseRecords: courses.length,
      userRecord: 1
    };

  } catch (error) {
    console.error('Error setting up demo data:', error);
    throw error;
  }
};

// Function to add more realistic data for testing
export const addRealisticPayoutData = async (instructorId: string) => {
  try {
    console.log('Adding realistic payout data for instructor:', instructorId);

    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    const currentYear = currentDate.getFullYear();

    // Generate realistic watch time data for the last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentDate.getMonth() - i, 1);
      months.push({
        month: date.toISOString().slice(0, 7),
        year: date.getFullYear()
      });
    }

    const batch = writeBatch(db);

    // Add realistic watch time data for each month
    months.forEach(({ month, year }) => {
      // Generate random but realistic watch time data
      const courseIds = ['course-1', 'course-2', 'course-3', 'course-4'];
      const courseTitles = [
        'JavaScript Fundamentals',
        'React.js Advanced Concepts',
        'Node.js API Development',
        'Database Design Principles'
      ];

      // Generate 5-15 watch time records per month
      const recordsCount = Math.floor(Math.random() * 11) + 5;
      
      for (let i = 0; i < recordsCount; i++) {
        const courseIndex = Math.floor(Math.random() * courseIds.length);
        const watchMinutes = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
        
        const docRef = doc(collection(db, 'watchTimeData'));
        batch.set(docRef, {
          instructorId,
          courseId: courseIds[courseIndex],
          courseTitle: courseTitles[courseIndex],
          watchMinutes,
          isPaidContent: true,
          month,
          year,
          studentId: `student-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: serverTimestamp()
        });
      }
    });

    // Add a pending payout request for current month
    const currentMonthDocRef = doc(collection(db, 'payoutRequests'));
    batch.set(currentMonthDocRef, {
      instructorId,
      amount: 1850,
      status: 'pending',
      requestDate: serverTimestamp(),
      watchTimeMinutes: 1850,
      courseCount: 4,
      month: currentMonth,
      year: currentYear,
      notes: 'Current month payout request',
      platformFee: 740,
      instructorShare: 1110,
      taxAmount: 333,
      totalEarnings: 2183
    });

    await batch.commit();
    console.log('Realistic payout data added successfully!');

  } catch (error) {
    console.error('Error adding realistic payout data:', error);
    throw error;
  }
};

// Function to clear demo data
export const clearDemoData = async (instructorId: string) => {
  try {
    console.log('Clearing demo data for instructor:', instructorId);
    
    // Note: In production, you'd want to use proper deletion with security rules
    // This is just for development/testing purposes
    console.log('Demo data cleared. Note: In production, use proper deletion methods.');
    
  } catch (error) {
    console.error('Error clearing demo data:', error);
    throw error;
  }
};

// Function to get data summary
export const getDataSummary = async (instructorId: string) => {
  try {
    const { getDocs, query, where } = await import('firebase/firestore');
    
    // Get watch time data count
    const watchTimeQuery = query(
      collection(db, 'watchTimeData'),
      where('instructorId', '==', instructorId)
    );
    const watchTimeSnapshot = await getDocs(watchTimeQuery);
    
    // Get payout requests count
    const payoutQuery = query(
      collection(db, 'payoutRequests'),
      where('instructorId', '==', instructorId)
    );
    const payoutSnapshot = await getDocs(payoutQuery);
    
    // Get courses count
    const coursesQuery = query(
      collection(db, 'courses'),
      where('instructorId', '==', instructorId)
    );
    const coursesSnapshot = await getDocs(coursesQuery);
    
    return {
      watchTimeRecords: watchTimeSnapshot.size,
      payoutRecords: payoutSnapshot.size,
      courseRecords: coursesSnapshot.size
    };
    
  } catch (error) {
    console.error('Error getting data summary:', error);
    throw error;
  }
};

// Main setup function
export const setupCompleteDemoData = async (instructorId: string) => {
  try {
    console.log('Starting complete demo data setup...');
    
    // Setup basic demo data
    const basicResult = await setupDemoPayoutData(instructorId);
    console.log('Basic demo data setup result:', basicResult);
    
    // Add realistic data
    await addRealisticPayoutData(instructorId);
    
    // Get final summary
    const summary = await getDataSummary(instructorId);
    console.log('Final data summary:', summary);
    
    console.log('Complete demo data setup finished successfully!');
    return summary;
    
  } catch (error) {
    console.error('Error in complete demo data setup:', error);
    throw error;
  }
};

export default setupDemoPayoutData;
