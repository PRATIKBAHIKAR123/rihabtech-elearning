import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';
import GradientHeader from '../../../components/ui/GradientHeader';
import PublicProfile from './public-profile';
import EditProfile from './profile';
import { useState } from 'react';
import ProfilePhoto from './profile-photo';
import AccountSecurity from './account&security';
import ProfilePaymentMethod from './payment-method';
// import TermsOfUse from './terms-of-use';
import { Logs } from 'lucide-react';
import Logout from './logout';
import PrivacyPolicy from '../../comman/privacy-policy/privacy-policy';
import RefundPolicy from '../../comman/refund-policy/refund-policy';
import TermsOfUse from '../../comman/terms-and-condition/terms-of-use';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "../../../components/ui/dialog"; // adjust import path if needed
import { Button } from '../../../components/ui/button';

const Profile = () => {

    const [activeTab, setActiveTab] = useState('profile');

    const sidebarItems = [
  //{ label: 'Public Profile', tab: 'public-Profile' },
  { label: 'Profile', tab: 'profile' },
  { label: 'Profile Photo', tab: 'profile-photo' },
  { label: 'Account & Security', tab: 'account&security' },
  // { label: 'Payment Method', tab: 'payment-method' },
  // { label: 'Terms Of Use', tab: 'terms-of-use' },
  //   { label: 'Privacy Policy', tab: 'privacy-policy' },
  //   { label: 'Refund Policy', tab: 'refund-policy' },
  // { label: 'Logout', tab: 'logout' },
];


  return (
    <div className="public-profile-root min-h-screen">
      <GradientHeader subtitle="My Profile / Learner" title="Manas Agrawal" />
      <div className="container flex flex-col md:flex-row">
        <div className="public-profile-content">
          <aside className="w-full md:w-80 max-w-xs mb-2">
      <div className="bg-white rounded-none md:rounded-xl border border-[#E6E6E6] shadow-sm">
        <nav
          className="
            flex w-full
            flex-row md:flex-col
            overflow-x-auto md:overflow-x-hidden
            overflow-y-hidden md:overflow-y-auto
            scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
          "
        >
          {sidebarItems.map((item, index) => (
            <a
              key={item.label}
              onClick={() => setActiveTab(item.tab)}
              className={`
                flex-shrink-0
                px-4 md:px-6 py-3 md:py-4
                text-base font-barlow transition-colors duration-150
                ${activeTab === item.tab
                  ? 'text-primary font-bold bg-[#fff7ef]'
                  : 'text-[#222] font-medium hover:bg-[#f8f8f8]'}
                ${index !== sidebarItems.length - 1 ? 'md:border-b md:border-[#eee]' : ''}
                ${index !== sidebarItems.length - 1 ? 'border-r border-[#eee] md:border-r-0' : ''}
                text-center md:text-left
                min-w-[140px] md:min-w-0
                cursor-pointer
              `}
            >
              {item.label}
            </a>
          ))}
          <Dialog>
            <DialogTrigger asChild>
              <a
                className={`
                  flex-shrink-0
                  px-4 md:px-6 py-3 md:py-4
                  text-base font-barlow transition-colors duration-150
                  text-[#222] font-medium hover:bg-[#f8f8f8]
                  border-r border-[#eee] md:border-r-0
                  text-center md:text-left
                  min-w-[140px] md:min-w-0
                  cursor-pointer
                `}
              >
                Log Out
              </a>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogDescription>
                  Are you sure you want to log out?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  className="btn btn-primary"
                  onClick={() => setActiveTab('logout')}
                >
                  Yes, Log Out
                </Button>
                <Button className="btn btn-secondary" type="button">
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
        </nav>
      </div>
    </aside>
        </div>
        <div className="flex flex-col flex-1 gap-2 items-center w-full mb-2 relative">
            {activeTab=='public-Profile'&&<PublicProfile/>}
          {/* Profile Card */}
          <div className='w-full'>
          {activeTab=='profile'&&<EditProfile/>}
          {activeTab=='profile-photo'&&<ProfilePhoto/>}
          {activeTab=='account&security'&&<AccountSecurity/>}
          {activeTab=='payment-method'&&<ProfilePaymentMethod/>}
          {activeTab=='terms-of-use'&&<TermsOfUse/>}
          {activeTab=='privacy-policy'&&<PrivacyPolicy/>}
          {activeTab=='refund-policy'&&<RefundPolicy/>}
          {activeTab=='logout'&&<Logout/>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;