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
    <div className="public-profile-root">
      <GradientHeader subtitle="My Profile / Learner" title="Manas Agrawal" />
      <div className="public-profile-content">
        <LearnerProfileSidebar />
        <div className="public-profile-card-wrapper">
          <div className="public-profile-card">
            <div className="public-profile-initials">
              {photo ? <img src={photo} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} /> : 'MA'}
            </div>
            <button className="public-profile-edit-btn" style={{marginBottom: 24}}>Edit Profile</button>
            <input type="file" accept="image/*" ref={fileInputRef} style={{display: 'none'}} onChange={handlePhotoChange} />
            <button onClick={() => fileInputRef.current?.click()} className="public-profile-edit-btn" style={{marginBottom: 12}}>Change Photo</button>
            <button style={{background: '#ff7700', color: '#fff', border: 'none', borderRadius: 2, padding: '10px 32px', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginBottom: 32}}>Save Photo</button>
            <div style={{width: '100%', borderTop: '1px solid #eee', paddingTop: 32, marginTop: 8}}>
              <div style={{fontWeight: 600, fontSize: 16, color: '#ff7700', fontFamily: 'Barlow, sans-serif', marginBottom: 16}}>Change Password</div>
              <div style={{display: 'flex', gap: 12, marginBottom: 16}}>
                <input
                  type="password"
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="profile-input"
                  style={{flex: 1}}
                />
                <input
                  type="password"
                  placeholder="Enter Confirmed Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="profile-input"
                  style={{flex: 1}}
                />
              </div>
              <button style={{width: '100%', background: '#ff7700', color: '#fff', border: 'none', borderRadius: 2, padding: '12px 0', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 16, cursor: 'pointer'}}>Change Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhoto;
