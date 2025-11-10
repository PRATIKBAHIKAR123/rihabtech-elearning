import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';
import GradientHeader from '../../../components/ui/GradientHeader';
import { useEffect, useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../../context/AuthContext';
import axiosClient from '../../../utils/axiosClient';
import { API_BASE_URL_IMG } from '../../../lib/api';

const ProfilePhoto = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { logout, user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhoto(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

    useEffect(() => {
      const fetchProfile = async () => {
        setLoading(true);
        setError("");
        try {
          const res = await axiosClient.get("/user-profile");
          setProfile(res.data);
            // if profile has image path, set preview
            if (res.data?.profileImage) {
              setPhoto(API_BASE_URL_IMG+res.data.profileImage);
            }
        } catch (err) {
          setError("Failed to load profile");
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }, []);

  // compute initials from profile (userName, name or email)
  const getInitials = () => {
    const name = profile?.userName || profile?.name || profile?.email || '';
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleUpload = async (file?: File) => {
    setUploadError(null);
    if (!file) return;
    try {
      setUploading(true);
      const form = new FormData();
      // API expects field name 'profileImageFile' with binary string
      form.append('profileImageFile', file);

      const res = await axiosClient.post('/upload-profile-photo', form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // assume response has new image path in res.data.profileImage
      const newImage = res.data?.profileImage || res.data?.path || null;
      if (newImage) {
        setPhoto(newImage);
        // update local profile object so other UI reads new value
        setProfile((prev: any) => ({ ...(prev || {}), profileImage: newImage }));
      }
    } catch (err: any) {
      console.error('Upload error', err);
      setUploadError(err?.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    
            <div className="bg-white  border border-[#E6E6E6] shadow-xl mt-[32px] flex flex-col items-center ">
              <div className="public-profile-initials w-28 h-28 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 text-2xl font-semibold text-gray-700">
                {photo ? (
                  // show remote image or local data URL preview
                  <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials()}</span>
                )}
              </div>
              <button
                className="border border-[#ff7700] text-[#ff7700] bg-white py-2 px-4 font-medium text-base mb-4 hover:bg-[#fff7ef] transition-colors"
                onClick={() => fileInputRef.current?.click()}
                type="button"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Edit Profile'}
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  handlePhotoChange(e);
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
              />
              {uploadError && <div className="text-sm text-red-600 mt-2">{uploadError}</div>}
            </div>
          
  );
};

export default ProfilePhoto;