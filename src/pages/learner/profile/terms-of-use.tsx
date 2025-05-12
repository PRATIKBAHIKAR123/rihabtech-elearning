import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';

const TermsOfUse = () => {
  return (
    <div style={{display: 'flex', maxWidth: 1200, margin: '0 auto', padding: '40px 24px 0 24px', minHeight: 400}}>
      <LearnerProfileSidebar />
      <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start'}}>
        <div style={{background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', width: 520, marginLeft: 40, padding: '32px 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: 24}}>
          <div style={{fontWeight: 700, color: '#ff7700', fontFamily: 'Barlow, sans-serif', fontSize: 18, marginBottom: 16, borderBottom: '2px solid #ff7700', paddingBottom: 4, width: 'fit-content'}}>Terms Of Use</div>
          {/* Add your terms content here */}
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
