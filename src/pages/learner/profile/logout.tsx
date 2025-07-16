import React, { useState } from 'react';
import GradientHeader from '../../../components/ui/GradientHeader';
import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../context/AuthContext';

const Logout = () => {
  const { logout } = useAuth();
  // Hardcoded user info for consistency
  const [firstName] = useState('Manas');
  const [lastName] = useState('Agrawal');

  return (
    
          <div className="bg-white rounded-xl px-8 py-8 w-full ">
            <div className=" text-3xl mb-2 border-[#ff3b3b]  w-fit mb-[24px] font-Kumbh Sans">Logout Your Account</div>
            <div className="flex flex-col gap-6 ">
              <div>
                <div className="font-semibold text-lg mb-2">1. Terms</div>
                <p className=" font-medium">Warning: If you close your account, you will be unsubscribed from all 0 of your courses and will lose access to your account and data associated with your account forever, even if you choose to create a new account using the same email address in the future.</p>
                <p className="mt-2">Please note, if you want to reinstate your account after submitting a deletion request, you will have 14 days after the initial submission date to reach out to privacy@help.com to cancel this request.</p>
              </div>
              <Button variant={'outline'} className="mt-4 px-8 py-2 border border-primary text-primary  font-semibold hover:bg-primary hover:text-white self-start transition-colors w-fit" onClick={() => {
                localStorage.setItem('logoutSuccess', 'true');
                logout();
                setTimeout(() => {
                  window.location.replace('/#/');
                }, 100);
              }}>Logout</Button>
            </div>
          </div>
  );
};

export default Logout;
