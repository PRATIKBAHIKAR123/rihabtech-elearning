import React from 'react';
import { ChevronRight, Star, Users, Clock, BookOpen, List, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import Certifications from './landingPage/certifications';
import Courses from './landingPage/courses';

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
      
      {/* Student Reviews */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">What Our Students Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                <div className="flex items-center text-yellow-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">
                  "The courses were comprehensive and well-structured. I've learned skills that I'm now using daily in my job. The instructors were knowledgeable and supportive."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 mr-4">
                    <img 
                      src="/api/placeholder/48/48" 
                      alt="Student" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">Alex Thompson</h4>
                    <p className="text-sm text-gray-500">Web Developer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Certification Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-12">Courses Aligned For Industry-Ready Skills Improvement</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
            {[
              {
                title: "Certified Programs",
                icon: "BookOpen",
                description: "Industry recognized certification"
              },
              {
                title: "Expert Instructors",
                icon: "Users",
                description: "Learn from professionals"
              },
              {
                title: "Flexible Learning",
                icon: "Clock",
                description: "Study at your own pace"
              },
              {
                title: "Career Support",
                icon: "Star",
                description: "Job placement assistance"
              }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated With EduLearn</h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            Subscribe to our newsletter for the latest course updates, learning tips, and special offers.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full md:flex-1 px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="w-full md:w-auto px-6 py-3 bg-white text-blue-600 rounded-md hover:bg-blue-50 font-medium">
              Subscribe
            </button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
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
            </div>
            
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
            <p>© 2025 EduLearn. All rights reserved.</p>
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