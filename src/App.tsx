
import './App.css';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import SignUpPage from './pages/auth/signup';
import LoginPage from './pages/auth/login';
import EducationLandingPage from './pages/comman/landingPage';
import CommanLayout from './pages/comman/layout';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import CourseList from './pages/comman/courses/courseList';
import LearnerRoutes from './pages/learner/LearnerRoutes';
import AboutUs from './pages/comman/aboutUs/about-us';
import Pricing from './pages/comman/pricing/pricing';
import ContactUs from './pages/comman/contactUs/contactUs';
import CourseDetails from './pages/comman/courses/courseDetails';

function App() {
  useEffect(() => {
    AOS.init({
    duration: 1000, // Global animation duration
    once: false, // Only once animation
    offset: 100,
    easing: 'ease-in-out', 
    mirror: true, 
    });
    }, []);
  return (
    <Router>
    <Routes>
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<CommanLayout><EducationLandingPage /></CommanLayout> } />
      <Route path="/aboutUs" element={<CommanLayout><AboutUs /></CommanLayout> } />
      <Route path="/contactUs" element={<CommanLayout><ContactUs /></CommanLayout> } />
      <Route path="/pricing" element={<CommanLayout><Pricing /></CommanLayout> } />
      <Route path="/courselist" element={<CommanLayout><CourseList /></CommanLayout> } />
      <Route path="/courseDetails" element={<CommanLayout><CourseDetails /></CommanLayout> } />
      <Route path="/learner/*" element={<CommanLayout><LearnerRoutes /></CommanLayout>} />

    </Routes>
  </Router>
  );
}

export default App;
