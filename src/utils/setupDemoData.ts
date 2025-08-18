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

// Setup demo payment and enrollment data for testing
export const setupDemoPaymentData = async () => {
  try {
    // Demo paid course
    const paidCourseData = {
      title: "Advanced React Development",
      subtitle: "Master modern React with hooks, context, and advanced patterns",
      description: "A comprehensive course covering advanced React concepts including hooks, context API, performance optimization, and modern development patterns.",
      thumbnailUrl: "Images/courses/react course 14.jpg",
      promoVideoUrl: "/courses/video2 - Trim.mp4",
      featured: true,
      isPublished: true,
      status: "approved",
      category: "Development",
      level: "Advanced",
      language: "English",
      pricing: "2999", // ₹2999
      submittedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      learn: [
        "Master React Hooks and custom hook patterns",
        "Understand Context API and state management",
        "Learn performance optimization techniques",
        "Build real-world applications with React",
        "Implement testing strategies for React apps"
      ],
      requirements: [
        "Basic knowledge of JavaScript ES6+",
        "Familiarity with React fundamentals",
        "Understanding of HTML and CSS",
        "Node.js installed on your machine"
      ],
      target: [
        "React developers looking to advance their skills",
        "Frontend developers wanting to learn modern React",
        "JavaScript developers transitioning to React",
        "Anyone interested in building professional React applications"
      ],
      curriculum: {
        sections: [
          {
            id: "section-1",
            name: "Advanced Hooks",
            published: true,
            items: [
              {
                id: "module-1",
                contentType: "video",
                lectureName: "useState and useEffect Deep Dive",
                description: "Advanced patterns and best practices for React hooks",
                published: true,
                contentFiles: [
                  {
                    duration: 1800, // 30 minutes
                    name: "Hooks Deep Dive",
                    url: "/courses/video2 - Trim.mp4"
                  }
                ]
              },
              {
                id: "module-2",
                contentType: "video",
                lectureName: "Custom Hooks Development",
                description: "Creating reusable custom hooks for common patterns",
                published: true,
                contentFiles: [
                  {
                    duration: 2100, // 35 minutes
                    name: "Custom Hooks",
                    url: "/courses/video2 - Trim.mp4"
                  }
                ]
              }
            ]
          },
          {
            id: "section-2",
            name: "Performance Optimization",
            published: true,
            items: [
              {
                id: "module-3",
                contentType: "video",
                lectureName: "React.memo and useMemo",
                description: "Optimizing component rendering and expensive calculations",
                published: true,
                contentFiles: [
                  {
                    duration: 1500, // 25 minutes
                    name: "Performance Optimization",
                    url: "/courses/video2 - Trim.mp4"
                  }
                ]
              }
            ]
          }
        ]
      },
      members: [
        {
          id: "instructor-react",
          email: "john.doe@example.com",
          role: "teacher"
        }
      ]
    };

    await setDoc(
      doc(db, "courseDrafts", "react-advanced-course"),
      paidCourseData
    );

    // Demo free course
    const freeCourseData = {
      title: "Introduction to Web Development",
      subtitle: "Start your journey in web development",
      description: "Learn the basics of HTML, CSS, and JavaScript to build your first website.",
      thumbnailUrl: "Images/courses/course 4.jpg",
      promoVideoUrl: "/courses/video2 - Trim.mp4",
      featured: false,
      isPublished: true,
      status: "approved",
      category: "Development",
      level: "Beginner",
      language: "English",
      pricing: "Free",
      submittedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      learn: [
        "HTML fundamentals and semantic markup",
        "CSS styling and layout techniques",
        "JavaScript basics and DOM manipulation",
        "Building responsive websites",
        "Best practices for web development"
      ],
      requirements: [
        "No prior programming experience required",
        "A computer with internet access",
        "Willingness to learn and practice"
      ],
      target: [
        "Complete beginners to web development",
        "Anyone interested in learning to code",
        "Students looking to start a career in tech",
        "Professionals wanting to understand web basics"
      ],
      curriculum: {
        sections: [
          {
            id: "section-1",
            name: "HTML Basics",
            published: true,
            items: [
              {
                id: "module-1",
                contentType: "video",
                lectureName: "Introduction to HTML",
                description: "Learn the structure and syntax of HTML",
                published: true,
                contentFiles: [
                  {
                    duration: 1200, // 20 minutes
                    name: "HTML Introduction",
                    url: "/courses/video2 - Trim.mp4"
                  }
                ]
              }
            ]
          }
        ]
      },
      members: [
        {
          id: "instructor-web",
          email: "jane.smith@example.com",
          role: "teacher"
        }
      ]
    };

    await setDoc(
      doc(db, "courseDrafts", "web-dev-intro"),
      freeCourseData
    );

    console.log("✅ Demo courses with pricing created successfully");
    console.log("🎉 Payment demo data setup complete!");

  } catch (error) {
    console.error("❌ Error setting up payment demo data:", error);
  }
};

// Setup specific course for the demo (course_003)
export const setupCourse003 = async () => {
  try {
    const course003Data = {
      title: "UI/UX Design Masterclass",
      subtitle: "Learn the fundamentals of UX research and user-centered design",
      description: "Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      thumbnailUrl: "Images/Banners/Person.jpg",
      promoVideoUrl: "/courses/video2 - Trim.mp4",
      featured: true,
      isPublished: true,
      status: "approved",
      category: "Design",
      level: "beginner",
      language: "english",
      pricing: "paid", // This indicates it's a paid course that requires subscription
      submittedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      learn: [
        "What will students learn in your course?",
        "The following descriptions will be publicly visible on your Course Landing Page and will have a direct impact on your course performance. These descriptions will help learners decide if your course is right for them."
      ],
      requirements: [
        "Are there any course requirements or prerequisites?",
        "List any required skills, experience, tools or equipment learners should have prior to taking your course."
      ],
      target: [
        "Who is this course for?",
        "Write a clear description of the intended learners for your course.",
        "MORE EXAMPLE"
      ],
      welcomeMessage: "Welcome Message Welcome Message",
      curriculum: {
        sections: [
          {
            id: "section-1",
            name: "Introduction to UX Design",
            published: true,
            items: [
              {
                id: "module-1",
                contentType: "video",
                lectureName: "Emily - The power of UX design",
                description: "Understanding the fundamentals of UX design and its impact on product development.",
                published: true,
                contentFiles: [
                  {
                    duration: 900, // 15 minutes
                    name: "Introduction Video",
                    url: "/courses/video2 - Trim.mp4"
                  }
                ]
              },
              {
                id: "module-2",
                contentType: "video",
                lectureName: "Design Principles Overview",
                description: "Comprehensive overview of core design principles and methodologies.",
                published: true,
                contentFiles: [
                  {
                    duration: 720, // 12 minutes
                    name: "Design Principles",
                    url: "/courses/video2 - Trim.mp4"
                  }
                ]
              }
            ]
          }
        ]
      },
      members: [
        {
          id: "instructor-ui",
          email: "moahmmed@example.com",
          role: "teacher"
        }
      ]
    };

    await setDoc(
      doc(db, "courseDrafts", "course_003"),
      course003Data
    );

    console.log("✅ Course_003 created successfully");

  } catch (error) {
    console.error("❌ Error setting up course_003:", error);
  }
};

// Call this function to set up demo data
// setupDemoEnrollment();
// setupDemoPaymentData();
// setupCourse003();
