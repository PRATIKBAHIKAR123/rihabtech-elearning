import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import React from 'react';
import GradientHeader from '../../../components/ui/GradientHeader';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const EditProfile: React.FC = () => {
  const formik = useFormik({
    initialValues: {
      name: 'Manas',
      lastName: 'Agrawal',
      email: 'manasuiux@icloud.com',
      phone: '9956333666',
      gender: 'Male',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Full Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: Yup.string()
        .matches(/^\d{10}$/, 'Phone number must be 10 digits')
        .required('Phone number is required'),
      gender: Yup.string().oneOf(['Male', 'Female', 'Other'], 'Select a valid gender').required('Gender is required'),
    }),
    onSubmit: (values) => {
      // Handle form submission (API call, etc.)
      console.log('Profile updated:', values);
    },
  });

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
                  <Input
                    type="text"
                    name="phone"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="profile-input bg-white border border-[#E6E6E6] rounded-md font-bold focus:border-[#ff7700] focus:ring-2 focus:ring-[#ff7700] font-barlow"
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.phone}</div>
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