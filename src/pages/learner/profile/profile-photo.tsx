import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';
import { useRef, useState } from 'react';

const ProfilePhoto = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhoto(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div style={{display: 'flex', maxWidth: 1200, margin: '0 auto', padding: '40px 24px 0 24px', minHeight: 400}}>
      <LearnerProfileSidebar />
      <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start'}}>
        <div style={{background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', width: 420, marginLeft: 40, padding: '48px 0 32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{width: 140, height: 140, borderRadius: '50%', background: '#ff7700', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 48, fontWeight: 600, fontFamily: 'Barlow, sans-serif', marginBottom: 24, boxShadow: '0 2px 12px rgba(255,119,0,0.10)', overflow: 'hidden'}}>
            {photo ? <img src={photo} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : 'MA'}
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} style={{display: 'none'}} onChange={handlePhotoChange} />
          <button onClick={() => fileInputRef.current?.click()} style={{border: '1px solid #ff7700', color: '#ff7700', background: 'none', borderRadius: 2, padding: '6px 32px', fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: 15, cursor: 'pointer', marginBottom: 16}}>Change Photo</button>
          <button style={{background: '#ff7700', color: '#fff', border: 'none', borderRadius: 2, padding: '10px 32px', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 16, cursor: 'pointer'}}>Save Photo</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhoto;
