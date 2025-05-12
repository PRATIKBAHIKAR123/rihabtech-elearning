import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import React, { useState } from 'react';

const Profile = () => {
  const [firstName, setFirstName] = useState('Manas');
  const [lastName, setLastName] = useState('Agrawal');
  const [email, setEmail] = useState('manasuiux@icloud.com');
  const [phone, setPhone] = useState('9956333666');
  const [gender, setGender] = useState('Male');

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Orange angled header */}
      <div className="relative w-full h-[180px] bg-gradient-to-tr from-[#ff7700] to-[#ffb366] flex items-end">
        <div className="absolute inset-0" style={{clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)', background: 'linear-gradient(90deg, #ff7700 60%, #ffb366 100%)'}}></div>
        <div className="relative z-10 px-10 pb-8">
          <div className="text-white text-sm font-medium opacity-90 mb-2 font-barlow">My Profile / Learner</div>
          <div className="text-4xl font-extrabold font-barlow text-white">{firstName} {lastName}</div>
        </div>
      </div>
      {/* Main content */}
      <div className="flex max-w-[1200px] mx-auto pt-10 px-6 min-h-[400px] gap-10 -mt-20">
        <LearnerProfileSidebar />
        <form className="bg-white rounded-lg shadow-lg w-[520px] ml-0 p-8 flex flex-col gap-6 border border-[#eee]">
          <div className="font-bold text-[#ff7700] font-barlow text-lg mb-4 border-b-2 border-[#ff7700] pb-1 w-fit">Edit Profile</div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-barlow font-medium text-base text-[#222]">First Name</label>
              <Input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1" />
            </div>
            <div className="flex-1">
              <label className="font-barlow font-medium text-base text-[#222]">Last Name</label>
              <Input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <label className="font-barlow font-medium text-base text-[#222]">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 font-bold" />
          </div>
          <div>
            <label className="font-barlow font-medium text-base text-[#222]">Phone No.</label>
            <Input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-barlow font-medium text-base text-[#222]">Gender</label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1"></div>
          </div>
          <Button type="button" className="mt-3 bg-[#ff7700] text-white font-barlow font-semibold text-lg py-3 rounded">Update Profile Changes</Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
