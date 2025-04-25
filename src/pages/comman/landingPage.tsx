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
      
    </div>
  );
};

export default EducationLandingPage;