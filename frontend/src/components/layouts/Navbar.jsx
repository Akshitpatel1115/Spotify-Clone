import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import api from "../../api/axios";
import { FiLogOut } from "react-icons/fi";

const Navbar = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      signOut();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between bg-[#121212]/90 px-4 backdrop-blur-md lg:px-8 border-b border-border/30">
      {/* Mobile Logo (Hidden on md/lg since Sidebar has it) */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-black">
          ♫
        </div>
        <span className="font-bold text-white tracking-wide">Spotify</span>
      </div>

      {/* Right side items */}
      <div className="flex flex-1 items-center justify-end gap-4">
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-white hidden sm:block">
              Welcome, {user.username || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 rounded-full bg-surface hover:bg-surface-hover px-4 py-2 text-sm font-bold text-white transition-colors border border-border"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
