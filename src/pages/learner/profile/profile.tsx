import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import React, { useEffect, useState } from 'react';
import GradientHeader from '../../../components/ui/GradientHeader';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PhoneInput from 'react-phone-input-2';
import { API_BASE_URL } from '../../../lib/api';
import { toast } from 'sonner';
import axiosClient from '../../../utils/axiosClient';

const EditProfile: React.FC = () => {
  const [phoneCountry, setPhoneCountry] = useState('IN');
  const formik = useFormik({
    initialValues: {
      id:null,
      name: '',
      email: '',
      phone: '',
      gender: 'Male',
      address: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Full Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: Yup.string().required('Phone No. is Required'),
      address: Yup.string().required('Address is Required'),
      gender: Yup.string().oneOf(['Male', 'Female', 'Other'], 'Select a valid gender').required('Gender is required'),
    }),
    onSubmit: async (values) => {
        try {
    const response = await axiosClient.post('/update-profile', {
      name: values.name,
      emailId: values.email,
      phoneNumber: values.phone,
      gender: values.gender,
      address: values.address
    });

    const data = response.data;
    toast.success('Profile updated successfully');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Profile update failed');
  }
    },
  });

    useEffect(() => {
      const cached = localStorage.getItem('token');
      if (cached) {
        try {
          const userData = JSON.parse(cached);
          if (userData && userData.Name) {
            formik.setFieldValue('name', userData.Name);
          }
          if (userData && userData.UserName) {
            formik.setFieldValue('email', userData.UserName);
          }
          if (userData && userData.phone) {
            formik.setFieldValue('phone', userData.phone);
          }
          if (userData && userData.gender) {
            formik.setFieldValue('gender', userData.gender);
          }
        } catch (e) {
          // handle parse error if needed
        }
      }
    }, []);

  return (
    
          <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm px-0 py-0 mt-[32px] mb-2">
            <form className="px-8 py-8 flex flex-col gap-8" onSubmit={formik.handleSubmit} noValidate>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-xl font-bold text-[#ff7700] font-barlow">Edit Profile</span>
                </div>
                <div className="flex-1 border-b-2 border-[#ff7700] rounded" style={{ height: 3, minWidth: 60 }}></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-[#888] mb-1 font-barlow">Full Name</label>
                  <Input
                    type="text"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="profile-input bg-white border border-[#E6E6E6] rounded-md focus:border-[#ff7700] focus:ring-2 focus:ring-[#ff7700] font-barlow"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
                  )}
                </div>
               
                <div>
                  <label className="block text-base font-medium text-[#888] mb-1 font-barlow">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    readOnly
                    className="profile-input bg-white border border-[#E6E6E6] rounded-md font-bold focus:border-[#ff7700] focus:ring-2 focus:ring-[#ff7700] font-barlow"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
                  )}
                </div>
                <div>
                  <label className="block text-base font-medium text-[#888] mb-1 font-barlow">Phone No.</label>
                  {/* <Input
                    type="text"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="profile-input bg-white border border-[#E6E6E6] rounded-md font-bold focus:border-[#ff7700] focus:ring-2 focus:ring-[#ff7700] font-barlow"
                  /> */}
                  {/* <div className="relative"> */}
                <PhoneInput
                  country={'in'}
                  value={formik.values.phone}
                  onChange={(value, country) => {
                    formik.setFieldValue('phone', value);
                    const c = country as { iso2?: string };
                    if (c && c.iso2) {
                      setPhoneCountry(c.iso2.toUpperCase());
                    }
                  }}
                  inputClass="profile-input bg-white border border-[#E6E6E6] rounded-md font-bold focus:border-[#ff7700] focus:ring-2 focus:ring-[#ff7700] font-barlow"
                  buttonClass="!border !border-gray-300 !rounded-l-md !rounded-r-none"
                  containerClass="!w-full"
                  inputProps={{
                    name: 'phone',
                    required: true,
                    autoFocus: false,
                    placeholder: false,
                  }}
                  enableSearch={true}
                  searchPlaceholder="Search country..."
                  searchNotFound="No country found"
                />
                
              
                  {formik.touched.phone && formik.errors.phone && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.phone}</div>
                  )}
                </div>
                <div>
                  <label className="block text-base font-medium text-[#888] mb-1 font-barlow">Address</label>
                  <Input
                    type="text"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="profile-input bg-white border border-[#E6E6E6] rounded-md focus:border-[#ff7700] focus:ring-2 focus:ring-[#ff7700] font-barlow"
                  />
                  {formik.touched.address && formik.errors.address && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.address}</div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 md:w-1/2">
                <div>
                  <label className="block text-base font-medium text-[#888] mb-1 font-barlow">Gender</label>
                  <Select
                    value={formik.values.gender}
                    onValueChange={value => formik.setFieldValue('gender', value)}
                  >
                    <SelectTrigger
                      className="profile-input bg-white border border-[#E6E6E6] rounded-md focus:border-[#ff7700] focus:ring-2 focus:ring-[#ff7700] font-barlow"
                      onBlur={() => formik.setFieldTouched('gender', true)}
                    >
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.gender && formik.errors.gender && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.gender}</div>
                  )}
                </div>
              </div>
              <div className="flex">
                <Button
                  type="submit"
                  className="w-full bg-[#ff7700] hover:bg-[#e55e00] text-white font-barlow font-semibold text-lg py-3  shadow-md transition"
                >
                  Update Profile Changes
                </Button>
              </div>
            </form>
          </div>
  );
};

export default EditProfile;