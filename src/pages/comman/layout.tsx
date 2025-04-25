
import Header from "../../layouts/header";
import AdvertiseBanner from "../../layouts/addbanner";

const CommanLayout = ({ children }: { children: React.ReactNode }) => {


  return (
    <>
    <AdvertiseBanner />
       <Header />
      <main>{children}</main>
    </>
  );
};

export default CommanLayout;