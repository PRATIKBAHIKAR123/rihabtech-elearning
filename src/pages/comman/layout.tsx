
import Header from "../../layouts/header";
import AdvertiseBanner from "../../layouts/addbanner";
import Footer from "../../layouts/footer";

const CommanLayout = ({ children }: { children: React.ReactNode }) => {


  return (
    <>
    <AdvertiseBanner />
       <Header />
      <main>{children}</main>
      <Footer/>
    </>
  );
};

export default CommanLayout;