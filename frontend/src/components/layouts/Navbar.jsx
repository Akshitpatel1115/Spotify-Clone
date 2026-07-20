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
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xl font-bold text-black">
          ♫
        </div>
        <span className="font-bold text-white tracking-wide text-lg">Spotify</span>
      </div>

      {/* Right side items */}
      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4 min-w-0">
        {user && (
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex flex-col items-end justify-center overflow-hidden">
              <span className="text-sm font-bold text-white truncate max-w-[90px] sm:max-w-[200px]">
                {user.username || 'User'}
              </span>
              {user.role && (
                <span className="text-[10px] font-black tracking-widest text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full mt-0.5 shrink-0">
                  {user.role}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-2 rounded-full bg-surface hover:bg-surface-hover p-2 sm:px-4 sm:py-2 text-sm font-bold text-white transition-colors border border-border"
              title="Logout"
            >
              <FiLogOut />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
