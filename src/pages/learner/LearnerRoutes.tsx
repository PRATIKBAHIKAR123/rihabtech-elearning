import { Routes, Route } from 'react-router-dom';
import HomePage from './homepage';
import MyLearnings from './myAccount/myLearnings';
import MyWishlist from './myAccount/mywishlist';
import PaymentMethod from './payment-mode/payment';
import ShoppingCart from './shopping-cart/shopping';
import CourseDetailsPage from './playingcourse/currentCourseDetails';

export default function LearnerRoutes() {
  return (
    <Routes>
      <Route path="homepage" element={<HomePage />} />
      <Route path="my-learnings" element={<MyLearnings />} />
      <Route path="my-wishlist" element={<MyWishlist />} />
      <Route path="payment" element={<PaymentMethod />} />
      <Route path="current-course" element={<CourseDetailsPage />} />
      <Route path="shopping-cart" element={<ShoppingCart />} />
    </Routes>
  );
}
