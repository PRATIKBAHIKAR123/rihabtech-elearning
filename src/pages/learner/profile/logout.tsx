import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';

const Logout = () => {
  return (
    <div style={{display: 'flex', maxWidth: 1200, margin: '0 auto', padding: '40px 24px 0 24px', minHeight: 400}}>
      <LearnerProfileSidebar />
      <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', width: 420, marginLeft: 40, padding: '48px 0 32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{fontWeight: 700, color: '#ff3b3b', fontFamily: 'Barlow, sans-serif', fontSize: 18, marginBottom: 16}}>You have been logged out.</div>
        </div>
      </div>
    </div>
  );
};

export default Logout;
