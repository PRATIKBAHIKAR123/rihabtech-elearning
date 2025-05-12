import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';

const AccountSecurity = () => {
  return (
    <div style={{display: 'flex', maxWidth: 1200, margin: '0 auto', padding: '40px 24px 0 24px', minHeight: 400}}>
      <LearnerProfileSidebar />
      <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start'}}>
        <div style={{width: '100%', maxWidth: 520, marginLeft: 40, display: 'flex', flexDirection: 'column', gap: 32}}>
          <div style={{background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: '32px 32px 24px 32px'}}>
            <div style={{fontWeight: 700, color: '#ff7700', fontFamily: 'Barlow, sans-serif', fontSize: 18, marginBottom: 16, borderBottom: '2px solid #ff7700', paddingBottom: 4, width: 'fit-content'}}>Change Password</div>
            <div style={{display: 'flex', gap: 16, marginBottom: 18}}>
              <input type="password" placeholder="Enter New Password" style={{flex: 1, padding: '10px 12px', border: '1px solid #eee', borderRadius: 4, fontSize: 15, fontFamily: 'Barlow, sans-serif'}} />
              <input type="password" placeholder="Enter Confirmed Password" style={{flex: 1, padding: '10px 12px', border: '1px solid #eee', borderRadius: 4, fontSize: 15, fontFamily: 'Barlow, sans-serif'}} />
            </div>
            <button style={{background: '#ff7700', color: '#fff', border: 'none', borderRadius: 2, padding: '12px 0', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 17, cursor: 'pointer', width: '100%'}}>Change Password</button>
          </div>
          <div style={{background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: '32px 32px 24px 32px'}}>
            <div style={{fontWeight: 700, color: '#ff7700', fontFamily: 'Barlow, sans-serif', fontSize: 18, marginBottom: 16, borderBottom: '2px solid #ff7700', paddingBottom: 4, width: 'fit-content'}}>Change Email</div>
            <input type="email" placeholder="manasuiux@icloud.com" style={{width: '100%', marginBottom: 18, padding: '10px 12px', border: '1px solid #eee', borderRadius: 4, fontSize: 15, fontFamily: 'Barlow, sans-serif'}} />
            <button style={{background: '#ff7700', color: '#fff', border: 'none', borderRadius: 2, padding: '12px 0', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 17, cursor: 'pointer', width: '100%'}}>Change Email</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSecurity;
