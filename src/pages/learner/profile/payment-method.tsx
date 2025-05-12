import { useState } from 'react';
import GradientHeader from '../../../components/ui/GradientHeader';
import LearnerProfileSidebar from '../../../components/ui/LearnerProfileSidebar';

const ProfilePaymentMethod = () => {
  const [firstName] = useState('Manas');
  const [lastName] = useState('Agrawal');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  return (
    <div className="public-profile-root min-h-screen">
      <GradientHeader subtitle="My Profile / Learner" title={`${firstName} ${lastName}`} />
      <div className="container flex flex-col md:flex-row">
        <div className="public-profile-content">
          <LearnerProfileSidebar />
        </div>
        <div className="flex flex-col flex-1 gap-4 mt-[32px] items-center w-full">
          <div className="w-full">
            <div className="bg-white border border-[#E6E6E6] shadow-md flex flex-col gap-6 py-4 px-8">
              <div className="font-semibold text-[#ff7700] text-lg mb-2 border-b-2 border-[#ff7700] pb-1 w-fit mb-[24px]">Add Card</div>
              <div className="flex gap-4 mb-2">
                <img src="/Images/icons/Visa.png" alt="Visa" className="h-7" />
                {/* <img src="/Images/icons/Mastercard.png" alt="Mastercard" className="h-7" /> */}
                {/* <img src="/Images/icons/Troy.png" alt="Troy" className="h-7" /> */}
              </div>
              <div className="flex flex-col md:flex-row gap-4 mb-2">
                <input
                  type="text"
                  placeholder="Card Holder Name"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value)}
                  className="profile-input"
                />
                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="profile-input"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4 mb-2">
                <input
                  type="text"
                  placeholder="M / Y"
                  value={expiry}
                  onChange={e => setExpiry(e.target.value)}
                  className="profile-input"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={cvv}
                  onChange={e => setCvv(e.target.value)}
                  className="profile-input"
                />
              </div>
              <div className="text-sm text-[#888] mb-2">Kart bilgilerinin iyzico tarafından sonraki siparişleriniz için saklanır. Kartını iyzico uygulamadan yönetebilirsin.</div>
              <button type="button" className="bg-[#ff7700] text-white py-2 px-8 font-semibold text-base hover:bg-[#e55e00] transition-colors self-start">Save Card</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePaymentMethod;
