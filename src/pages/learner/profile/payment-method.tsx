import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';

const PaymentMethod = () => {
  return (
    <div style={{display: 'flex', maxWidth: 1200, margin: '0 auto', padding: '40px 24px 0 24px', minHeight: 400}}>
      <LearnerProfileSidebar />
      <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start'}}>
        <form style={{background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', width: 520, marginLeft: 40, padding: '32px 32px 32px 32px', display: 'flex', flexDirection: 'column', gap: 24}}>
          <div style={{fontWeight: 700, color: '#ff7700', fontFamily: 'Barlow, sans-serif', fontSize: 18, marginBottom: 16, borderBottom: '2px solid #ff7700', paddingBottom: 4, width: 'fit-content'}}>Add Card</div>
          <div style={{display: 'flex', gap: 12, marginBottom: 16}}>
            <img src="/visa.png" alt="Visa" style={{height: 28}} />
            <img src="/mastercard.png" alt="Mastercard" style={{height: 28}} />
            <img src="/troy.png" alt="Troy" style={{height: 28}} />
          </div>
          <input type="text" placeholder="Card Holder Name" style={{width: '100%', marginBottom: 12, padding: '10px 12px', border: '1px solid #eee', borderRadius: 4, fontSize: 15, fontFamily: 'Barlow, sans-serif'}} />
          <input type="text" placeholder="Card Number" style={{width: '100%', marginBottom: 12, padding: '10px 12px', border: '1px solid #eee', borderRadius: 4, fontSize: 15, fontFamily: 'Barlow, sans-serif'}} />
          <div style={{display: 'flex', gap: 12, marginBottom: 12}}>
            <input type="text" placeholder="M / Y" style={{flex: 1, padding: '10px 12px', border: '1px solid #eee', borderRadius: 4, fontSize: 15, fontFamily: 'Barlow, sans-serif'}} />
            <input type="text" placeholder="CVV" style={{flex: 1, padding: '10px 12px', border: '1px solid #eee', borderRadius: 4, fontSize: 15, fontFamily: 'Barlow, sans-serif'}} />
          </div>
          <div style={{fontSize: 13, color: '#888', marginBottom: 16, fontFamily: 'Barlow, sans-serif'}}>Kart bilgilerinin iyzico tarafından sonraki siparişleriniz için saklanır. Kartını iyzico uygulamadan yönetebilirsin.</div>
          <button type="button" style={{marginTop: 8, background: '#ff7700', color: '#fff', border: 'none', borderRadius: 2, padding: '12px 0', fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 17, cursor: 'pointer'}}>Save Card</button>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethod;
