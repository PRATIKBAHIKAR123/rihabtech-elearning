import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

// Setup demo student enrollment data
export const setupDemoEnrollment = async () => {
  try {
    // Demo student enrollment
    const enrollmentData = {
      studentId: "demo-student-123",
      courseId: "demo-course-123",
      enrolledAt: new Date(),
      isActive: true,
      lastAccessedAt: new Date(),
      progress: 25, // 25% complete
      totalWatchTime: 1800, // 30 minutes
      completedModules: ["module-1", "module-2"], // First two modules completed
      currentModuleId: "module-3",
      currentPosition: 0
    };

    // Create enrollment document
    await setDoc(
      doc(db, "studentEnrollments", "demo-student-123_demo-course-123"),
      enrollmentData
    );

    console.log("✅ Demo enrollment created successfully");

    // Create some module progress data
    const moduleProgressData = [
      {
        studentId: "demo-student-123",
        courseId: "demo-course-123",
        moduleId: "module-1",
        moduleType: "video",
        isCompleted: true,
        completedAt: new Date(),
        watchTime: 900, // 15 minutes
        lastPosition: 900,
        attempts: 1
      },
      {
        studentId: "demo-student-123",
        courseId: "demo-course-123",
        moduleId: "module-2",
        moduleType: "video",
        isCompleted: true,
        completedAt: new Date(),
        watchTime: 900, // 15 minutes
        lastPosition: 900,
        attempts: 1
      },
      {
        studentId: "demo-student-123",
        courseId: "demo-course-123",
        moduleId: "module-3",
        moduleType: "video",
        isCompleted: false,
        watchTime: 0,
        lastPosition: 0,
        attempts: 0
      }
    ];

    // Create module progress documents
    for (const progress of moduleProgressData) {
      await setDoc(
        doc(db, "moduleProgress", `${progress.studentId}_${progress.courseId}_${progress.moduleId}`),
        progress
      );
    }

    console.log("✅ Demo module progress created successfully");

    // Create a demo course if it doesn't exist
    const demoCourseData = {
      title: "Complete UX Research Masterclass",
      subtitle: "Learn the fundamentals of UX research and user-centered design",
      description: "A comprehensive course covering all aspects of UX research methodology, from planning to execution to analysis.",
      thumbnailUrl: "Images/Banners/Person.jpg",
      promoVideoUrl: "https://youtu.be/4z9bvgTlxKw?si=xEmNVS7qFBcX9Kvf",
      featured: true,
      isPublished: true,
      status: "approved",
      category: "Design",
      level: "Beginner",
      language: "English",
      pricing: "Free",
      submittedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      curriculum: {
        sections: [
          {
            id: "section-1",
            name: "Introduction to UX Research",
            published: true,
            items: [
              {
                id: "module-1",
                contentType: "video",
                lectureName: "Emily - The power of UX research",
                description: "Understanding the fundamentals of UX research and its impact on product design.",
                published: true,
                contentFiles: [
                  {
                    duration: 900, // 15 minutes
                    name: "Introduction Video",
                    url: "https://youtu.be/4z9bvgTlxKw?si=xEmNVS7qFBcX9Kvf"
                  }
                ]
              },
              {
                id: "module-2",
                contentType: "video",
                lectureName: "Research Methods Overview",
                description: "Comprehensive overview of qualitative and quantitative research methods.",
                published: true,
                contentFiles: [
                  {
                    duration: 900, // 15 minutes
                    name: "Methods Overview",
                    url: "https://example.com/video2"
                  }
                ]
              },
              {
                id: "module-3",
                contentType: "quiz",
                lectureName: "Knowledge Check: Research Basics",
                description: "Test your understanding of basic UX research concepts.",
                published: true
              }
            ]
          },
          {
            id: "section-2",
            name: "User Interview Techniques",
            published: true,
            items: [
              {
                id: "module-4",
                contentType: "document",
                lectureName: "Interview Planning Template",
                description: "Downloadable template for planning effective user interviews.",
                published: true
              },
              {
                id: "module-5",
                contentType: "video",
                lectureName: "Conducting User Interviews",
                description: "Best practices for conducting insightful user interviews.",
                published: true,
                contentFiles: [
                  {
                    duration: 1695, // 28:15
                    name: "Interview Techniques",
                    url: "https://example.com/video3"
                  }
                ]
              }
            ]
          }
        ]
      },
      members: [
        {
          id: "instructor-1",
          email: "emilie.bryant@example.com",
          role: "instructor"
        },
        {
          id: "demo-student-123",
          email: "demo@example.com",
          role: "student"
        }
      ]
    };

    await setDoc(
      doc(db, "courseDrafts", "demo-course-123"),
      demoCourseData
    );

    console.log("✅ Demo course created successfully");
    console.log("🎉 Demo data setup complete! You can now test the current course page.");

  } catch (error) {
    console.error("❌ Error setting up demo data:", error);
  }
};

// Call this function to set up demo data
// setupDemoEnrollment();
