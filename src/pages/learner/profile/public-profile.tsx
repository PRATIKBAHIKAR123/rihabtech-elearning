import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';
import '../../../styles/temp.css';

const PublicProfile = () => {
  return (
    <div className="public-profile-root">
      <section className="gradient-header public-profile-banner">
        <div className="container">
          <div className="public-profile-banner-content">
            <div className="public-profile-role">Learner</div>
            <div className="header-title public-profile-name">Manas Agrawal</div>
          </div>
        </div>
      </section>
      <div className="public-profile-content">
        <LearnerProfileSidebar />
        <div className="public-profile-card-wrapper">
          <div className="public-profile-card">
            <div className="public-profile-initials">MA</div>
            <button className="public-profile-edit-btn">Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
