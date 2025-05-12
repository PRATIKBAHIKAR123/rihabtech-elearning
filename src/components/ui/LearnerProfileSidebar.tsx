import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const sidebarItems = [
  { label: 'Public Profile', path: '/learner/profile/public-profile' },
  { label: 'Profile', path: '/learner/profile' },
  { label: 'Profile Photo', path: '/learner/profile/profile-photo' },
  { label: 'Account & Security', path: '/learner/profile/account&security' },
  { label: 'Payment Method', path: '/learner/profile/payment-method' },
  { label: 'Terms Of Use', path: '/learner/profile/terms-of-use' },
];

const LearnerProfileSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-full md:w-80 max-w-xs">
      <div className="bg-white rounded-xl border border-[#E6E6E6] shadow-sm overflow-hidden">
        <nav>
          {sidebarItems.map((item, index) => (
            <Link
              key={item.label}
              to={item.path}
              className={`block px-6 py-4 text-base font-barlow transition-colors duration-150 ${
                location.pathname === item.path
                  ? 'text-[#ff7700] font-bold bg-[#fff7ef]'
                  : 'text-[#222] font-medium hover:bg-[#f8f8f8]'
              } ${index !== sidebarItems.length - 1 ? 'border-b border-[#eee]' : ''}`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/learner/profile/logout"
            className="block px-6 py-4 text-base font-barlow font-bold text-[#C30000] hover:bg-[#fff7ef]"
          >
            Logout
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default LearnerProfileSidebar;
