import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiHome, FiDisc, FiPlusSquare, FiMusic, FiLogIn, FiLogOut } from "react-icons/fi";
import useAuth from "../../context/useAuth";
import api from "../../api/axios";
import ConfirmDialog from "../common/ConfirmDialog";

const MobileBottomNav = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const confirmLogout = async () => {
    try {
      await api.post("/auth/logout");
      signOut();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const navLinks = [
    { name: "Home", path: "/", icon: FiHome },
    { name: "Albums", path: "/album", icon: FiDisc },
  ];

  if (user?.role === "artist") {
    navLinks.push({ name: "Album+", path: "/create-album", icon: FiPlusSquare });
    navLinks.push({ name: "Music+", path: "/createMusic", icon: FiMusic });
  }

  return (
    <div className="md:hidden w-full flex items-center justify-around bg-surface/95 backdrop-blur-md border-t border-border h-16 shrink-0 z-50 pb-safe">
      {navLinks.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors
              ${
                isActive
                  ? "text-white"
                  : "text-text-secondary hover:text-white"
              }
            `}
          >
            <Icon className="text-xl" />
            <span className="text-[10px] font-medium tracking-wide">{link.name}</span>
          </NavLink>
        );
      })}

      {!isAuthenticated ? (
        <NavLink
          to="/login"
          className={({ isActive }) => `
            flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors
            ${isActive ? "text-white" : "text-text-secondary hover:text-white"}
          `}
        >
          <FiLogIn className="text-xl" />
          <span className="text-[10px] font-medium tracking-wide">Login</span>
        </NavLink>
      ) : (
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors text-text-secondary hover:text-red-500"
        >
          <FiLogOut className="text-xl" />
          <span className="text-[10px] font-medium tracking-wide">Logout</span>
        </button>
      )}

      <ConfirmDialog 
        isOpen={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to log out?"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </div>
  );
};

export default MobileBottomNav;
