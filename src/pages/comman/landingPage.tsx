import React from 'react';
import {  List, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import Certifications from './landingPage/certifications';
import Courses from './landingPage/courses';
import TrustAndEducationSections from './landingPage/trustedcustomers';
import BestEducationSections from './landingPage/besteducation';
import NewCourses from './landingPage/new-courses';
import TestimonialsSection from './landingPage/testimonials';
import CareerSkillsSections from './landingPage/skillsForGrowth';

const EducationLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Hero Section */}
      <section className="landing-gradient py-12 md:py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="flex flex-col gap-6 md:w-1/2">
          <p className="banner-section-subtitle">
          Professional & Lifelong Learning
            </p>
            <h1 className="banner-section-title">
              Online Courses With Certificates & Guidance
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="px-6 py-3 rounded-none h-auto text-white hover:bg-blue-700 font-medium">
             <List/> Categories
              </Button>
              <div className='relative w-full'>
              <input placeholder='What do you want to learn?' className='outline outline-1 outline-offset-[-1px] outline-[#ff7700] px-4 py-3 w-full' />
              <Search className='absolute top-1/4 right-4'/>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <img 
                src="Images/Banners/col-md-6.png" 
                alt="Happy student learning" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Top-Rated Courses Section */}
      <Certifications/>
      
      {/* Get Best Education Section */}
      <Courses/>
      
      {/* Trusted Customers */}
      <TrustAndEducationSections/>
      
      {/* Certification Section */}
      <BestEducationSections/>
      
      {/* New Course */}
      <NewCourses/>
      {/* Newsletter Section */}
     <CareerSkillsSections/>

    <TestimonialsSection/>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="font-bold text-white">E</span>
                </div>
                <span className="font-bold text-lg">EduLearn</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                Providing high-quality online education to help you learn new skills and advance your career.
              </p>
              <div className="flex space-x-4">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((social, index) => (
                  <a key={index} href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                    <span className="sr-only">{social}</span>
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </a>
                ))}
              </div>
            </div> */}
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                {['About Us', 'Features', 'Our Pricing', 'Latest News'].map((item, index) => (
                  <li key={index}><a href="#" className="hover:text-white">{item}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                {['FAQ', 'Help Center', 'Contact Us', 'Privacy Policy'].map((item, index) => (
                  <li key={index}><a href="#" className="hover:text-white">{item}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Get In Touch</h3>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start">
                  <span className="mr-3">📍</span>
                  <span>123 Street Name, City, Country</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">📧</span>
                  <span>support@edulearn.com</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">📞</span>
                  <span>+1 234 567 8900</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 Rihab. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EducationLandingPage;