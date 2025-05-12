import { useState } from 'react';
import GradientHeader from '../../../components/ui/GradientHeader';
import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';

const AccountSecurity = () => {
  const [firstName] = useState('Manas');
  const [lastName] = useState('Agrawal');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('manasuiux@icloud.com');

  return (
    <div className="public-profile-root min-h-screen">
      <GradientHeader subtitle="My Profile / Learner" title={`${firstName} ${lastName}`} />
      <div className="container flex flex-col md:flex-row">
        <div className="public-profile-content">
          <LearnerProfileSidebar />
        </div>
        <div className="flex flex-col flex-1 gap-4 mt-[32px] items-center w-full">
          {/* Password Card */}
          <div className="w-full">
            <div className="bg-white border border-[#E6E6E6] shadow-md flex flex-col gap-6 py-4 px-8">
              <div className="font-semibold text-[#ff7700] text-lg mb-2 border-b-2 border-[#ff7700] pb-1 w-fit mb-[24px]">Change Password</div>
              <div className="flex flex-col md:flex-row gap-4 mb-2">
                <input
                  type="password"
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="profile-input"
                />
                <input
                  type="password"
                  placeholder="Enter Confirmed Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="profile-input"
                />
              </div>
              <button className="bg-[#ff7700] text-white py-2 px-8 font-semibold text-base hover:bg-[#e55e00] transition-colors self-start">Change Password</button>
            </div>
          </div>
          {/* Email Card */}
          <div className="w-full">
            <div className="bg-white border border-[#E6E6E6] shadow-md flex flex-col gap-6 py-4 px-8">
              <div className="font-semibold text-[#ff7700] text-lg mb-2 border-b-2 border-[#ff7700] pb-1 w-fit mb-[24px]">Change Email</div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="profile-input mb-4"
              />
              <button className="bg-[#ff7700] text-white py-2 px-8 font-semibold text-base hover:bg-[#e55e00] transition-colors self-start">Change Email</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSecurity;
