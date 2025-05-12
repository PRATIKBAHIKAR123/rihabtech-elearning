import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';
import GradientHeader from '../../../components/ui/GradientHeader';
import { useRef, useState } from 'react';

const ProfilePhoto = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhoto(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="public-profile-root min-h-screen">
      <GradientHeader subtitle="My Profile / Learner" title="Manas Agrawal" />
      <div className="container flex flex-col md:flex-row">
        <div className="public-profile-content">
          <LearnerProfileSidebar />
        </div>
        <div className="flex flex-col flex-1 gap-8 items-center w-full">
          {/* Profile Card */}
          <div className="w-full">
            <div className="bg-white  border border-[#E6E6E6] shadow-xl mt-[32px] flex flex-col items-center ">
              <div className="public-profile-initials">
                {photo ? <img src={photo} alt="Profile" className="w-full object-cover rounded-full " /> : 'MA'}
              </div>
              <button className=" border border-[#ff7700] text-[#ff7700] bg-white py-2 px-4 font-medium text-base mb-4 hover:bg-[#fff7ef] transition-colors">Edit Profile</button>
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoChange} />
            </div>
          </div>
          {/* Password Card */}
          <div className="w-full">
            <div className="bg-white border border-[#E6E6E6] shadow-sm flex flex-col gap-6 py-8 px-8">
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
              <button className="bg-[#ff7700] text-white  py-2 font-semibold text-base hover:bg-[#e55e00] transition-colors">Change Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhoto;
