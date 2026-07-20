import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import FooterPlayer from "./FooterPlayer";
import MobileBottomNav from "./MobileBottomNav";

const Layout = ({ children }) => {
  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#121212] text-white">
      {/* Top Section: Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="relative flex flex-1 flex-col min-w-0 bg-background overflow-hidden">
          <Navbar />
          
          <div className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
            {<Outlet />}
          </div>
        </main>
      </div>

      {/* Bottom Section: Footer Player & Mobile Nav */}
      <div className="relative z-50 flex shrink-0 flex-col">
        <FooterPlayer />
        <MobileBottomNav />
      </div>
    </div>
  );
};

export default Layout;
