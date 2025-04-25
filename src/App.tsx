
import './App.css';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import SignUpPage from './pages/auth/signup';
import LoginPage from './pages/auth/login';
import EducationLandingPage from './pages/comman/landingPage';
import CommanLayout from './pages/comman/layout';

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<CommanLayout><EducationLandingPage /></CommanLayout> } />
    </Routes>
  </Router>
  );
}

export default App;
