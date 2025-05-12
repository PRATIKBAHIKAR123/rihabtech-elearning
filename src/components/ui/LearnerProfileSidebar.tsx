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
    <aside style={{ minWidth: 330 }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #eee',
          overflow: 'hidden',
        }}
      >
        <nav>
          {sidebarItems.map((item, index) => (
            <Link
              key={item.label}
              to={item.path}
              style={{
                display: 'block',
                padding: '16px 20px',
                color: location.pathname === item.path ? '#ff7700' : '#222',
                fontWeight: location.pathname === item.path ? 700 : 500,
                fontFamily: 'Poppins, sans-serif',
                fontSize: 16,
                textDecoration: 'none',
                borderBottom:
                  index !== sidebarItems.length - 1 ? '1px solid #eee' : 'none',
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/learner/profile/logout"
            style={{
              display: 'block',
              padding: '16px 20px',
              color: '#C30000',
              fontWeight: 700,
              fontFamily: 'Barlow, sans-serif',
              fontSize: 16,
              textDecoration: 'none',
            }}
          >
            Logout
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default LearnerProfileSidebar;
