import { Route, Routes } from "react-router-dom";
import CourseList from "./course/courseList";
import CourseSelection from "./course/addcourse/courseSelection";
import CourseTitle from "./course/addcourse/coursetitle";

export default function InstructorRoutes() {
    return (
      <Routes>
        <Route path="courses" element={<CourseList />} />
        <Route path="course-test-selection" element={<CourseSelection />} />
        <Route path="course-title" element={<CourseTitle />} />
      </Routes>
    );
  }