import { Routes, Route } from 'react-router-dom';
import HomePage from './homepage';

export default function LearnerRoutes() {
  return (
    <Routes>
      <Route path="homepage" element={<HomePage />} />
    </Routes>
  );
}
