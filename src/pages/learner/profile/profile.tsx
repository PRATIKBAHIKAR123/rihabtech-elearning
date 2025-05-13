import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import React, { useState } from 'react';
import GradientHeader from '../../../components/ui/GradientHeader';

const Profile = () => {
  const [firstName, setFirstName] = useState('Manas');
  const [lastName, setLastName] = useState('Agrawal');
  const [email, setEmail] = useState('manasuiux@icloud.com');
  const [phone, setPhone] = useState('9956333666');
  const [gender, setGender] = useState('Male');

  return (
    <div className="public-profile-root min-h-screen bg-white">
      <GradientHeader subtitle="My Profile / Learner" title={`${firstName} ${lastName}`} />
      <div className="container flex flex-col md:flex-row">
        {/* Sidebar */}
        {/* <div className="flex-shrink-0 w-full md:w-[340px]"> */}
        <div className="public-profile-content">
          <LearnerProfileSidebar />
        </div>
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm px-0 py-0 mt-[32px]">
            <form className="px-8 py-8 flex flex-col gap-8">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-xl font-bold text-[#ff7700] font-barlow">Edit Profile</span>
                </div>
                  <div className="flex-1 border-b-2 border-[#ff7700] rounded" style={{ height: 3, minWidth: 60 }}></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-[#888] mb-1 font-barlow">First Name</label>
                  <Input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="profile-input bg-white border border-[#E6E6E6] rounded-md focus:border-[#ff7700] focus:ring-2 focus:ring-[#ff7700] font-barlow" />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#888] mb-1 font-barlow">Last Name</label>
                  <Input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="profile-input bg-white border border-[#E6E6E6] rounded-md focus:border-[#ff7700] focus:ring-2 focus:ring-[#ff7700] font-barlow" />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#888] mb-1 font-barlow">Email</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="profile-input bg-white border border-[#E6E6E6] rounded-md font-bold focus:border-[#ff7700] focus:ring-2 focus:ring-[#ff7700] font-barlow" />
                </div>
                <div>
                  <label className="block text-base font-medium text-[#888] mb-1 font-barlow">Phone No.</label>
                  <Input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="profile-input bg-white border border-[#E6E6E6] rounded-md font-bold focus:border-[#ff7700] focus:ring-2 focus:ring-[#ff7700] font-barlow" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:w-1/2">
                <div>
                  <label className="block text-base font-medium text-[#888] mb-1 font-barlow">Gender</label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="profile-input bg-white border border-[#E6E6E6] rounded-md focus:border-[#ff7700] focus:ring-2 focus:ring-[#ff7700] font-barlow">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex">
                <Button type="button" className="w-full bg-[#ff7700] hover:bg-[#e55e00] text-white font-barlow font-semibold text-lg py-3  shadow-md transition">Update Profile Changes</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
