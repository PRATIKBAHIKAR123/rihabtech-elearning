import { useLocation } from "react-router-dom";
import Header from "./header";
import AdvertiseBanner from "./addbanner";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  // hide header on these paths
  const hideHeaderOn = ["/login", "/signup"];
  const shouldHideHeader = hideHeaderOn.includes(location.pathname);

  return (
    <>{!shouldHideHeader && <AdvertiseBanner />}
      {!shouldHideHeader && <Header />}
      <main>{children}</main>
    </>
  );
};

export default MainLayout;