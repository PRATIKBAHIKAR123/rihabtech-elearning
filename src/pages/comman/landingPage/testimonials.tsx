import React from 'react';

// This component contains just the two sections shown in the image
const TestimonialsSection: React.FC = () => {
  return (
    <>
     
      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-16">
            Why Students Love US?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 border border-gray-200 rounded-lg">
            <div className="text-center mb-6 flex justify-center">
            <span className="text-gray-300 text-center font-serif"><img src='Images/icons/SVG.png' alt='"'className='h-[48px] w-[48px]' /></span>
              </div>
              <p className="text-gray-600 text-center mb-8">
                "I have an understanding that, even if the work is not perfect, it's a work in 
                progress. And the reason why I'm on Skillshare is to develop a skill. I feel that 
                it's a safe space."
              </p>
              <div className="flex items-center justify-center">
                <div className="mr-4">
                  <img 
                    src="Images/users/team 2.jpg" 
                    alt="DeVeor R" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold">DeVeor R</h4>
                  <p className="text-gray-500 text-sm">Business course</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-8 border border-gray-200 rounded-lg">
              <div className="text-center mb-6 flex justify-center">
                <span className="text-gray-300 text-center font-serif"><img src='Images/icons/SVG.png' alt='"'className='h-[48px] w-[48px]' /></span>
              </div>
              <p className="text-gray-600 text-center mb-8">
                "I have an understanding that, even if the work is not perfect, it's a work in 
                progress. And the reason why I'm on Skillshare is to develop a skill. I feel that 
                it's a safe space."
              </p>
              <div className="flex items-center justify-center">
                <div className="mr-4">
                  <img 
                    src="Images/users/Container.jpg" 
                    alt="Tony Chester" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold">Tony Chester</h4>
                  <p className="text-gray-500 text-sm">Photography course</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TestimonialsSection;