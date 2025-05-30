import { Routes, Route } from 'react-router-dom';
import HomePage from './homepage';
import MyLearnings from './myAccount/myLearnings';
import MyWishlist from './myAccount/mywishlist';
import PaymentMethod from './payment-mode/payment';
import ShoppingCart from './shopping-cart/shopping';
import CourseDetailsPage from './playingcourse/currentCourseDetails';
import ChatInterface from './chatscreen/chatscreen';
import PublicProfile from './profile/public-profile';
import AccountSecurity from './profile/account&security';
import Logout from './profile/logout';
import ProfilePhoto from './profile/profile-photo';
import TermsOfUse from './profile/terms-of-use';
import ProfilePaymentMethod from './profile/payment-method';
import Profile from './profile/page';

export default function LearnerRoutes() {
  return (
    <Routes>
      <Route path="homepage" element={<HomePage />} />
      <Route path="my-learnings" element={<MyLearnings />} />
      <Route path="my-wishlist" element={<MyWishlist />} />
      <Route path="payment" element={<PaymentMethod />} />
      <Route path="current-course" element={<CourseDetailsPage />} />
      <Route path="shopping-cart" element={<ShoppingCart />} />
      <Route path="chat" element={<ChatInterface />} />
      <Route path="profile/account&security" element={<AccountSecurity />} />
      <Route path="profile/logout" element={<Logout />} />
      <Route path="profile/payment-method" element={<ProfilePaymentMethod />} />
      <Route path="profile/public-profile" element={<PublicProfile />} />
      <Route path="Profile" element={<Profile />} />
      <Route path="profile/profile-photo" element={<ProfilePhoto />} />
      <Route path="profile/terms-of-use" element={<TermsOfUse />} />
    </Routes>
  );
}
