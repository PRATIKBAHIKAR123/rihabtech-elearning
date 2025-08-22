import { Route, Routes } from "react-router-dom";
import CourseList from "./course/courseList";
import CourseSelection from "./course/addcourse/courseSelection";
import CourseTitle from "./course/addcourse/coursetitle";
import CourseCategory from "./course/addcourse/courseCategory";
import CourseSpend from "./course/addcourse/timeSpend";
import CourseContent from "./course/addcourse/courseContent";
import ChatInterface from "./chat/chat";
import Dashboard from "./dashboard/dashboard";
import { LearnerProfile } from "./dashboard/learnerProfile";
import { MonthlyReports } from "./dashboard/monthWiseRevenue";
import Profile from "../learner/profile/page";
import PreviewCourse from './course/addcourse/preview';
import InstructorProfile from './profile/instructorProfile';
import InstructorPayment from './payment/payment';

export default function InstructorRoutes() {
    return (
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="courses" element={<CourseList />} />
        <Route path="course-test-selection" element={<CourseSelection />} />
        <Route path="course-title" element={<CourseTitle />} />
        <Route path="course-category" element={<CourseCategory />} />
        <Route path="course-timespend" element={<CourseSpend />} />
        <Route path="course-sections" element={<CourseContent />} />
        <Route path="learner-profile" element={<LearnerProfile />} />
        <Route path="monthly-revenue" element={<MonthlyReports />} />
        <Route path="chat" element={<ChatInterface />} />
        <Route path="profile" element={<InstructorProfile />} />
        <Route path="course-preview" element={<PreviewCourse />} />
        <Route path="payment" element={<InstructorPayment />} />
      </Routes>
    );
  }