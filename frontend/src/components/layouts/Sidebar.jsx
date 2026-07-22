import { NavLink } from "react-router-dom";
import logoImg from "../../assets/logo.jpeg";
import {
  FiHome,
  FiDisc,
  FiPlusSquare,
  FiMusic,
  FiLogIn,
  FiUserPlus
} from "react-icons/fi";
import useAuth from "../../context/useAuth";

const Sidebar = () => {
  const { user, isAuthenticated } = useAuth();

  const role = user?.role;

  const navLinks = [
    { name: "Home", path: "/", icon: FiHome },
    { name: "Albums", path: "/album", icon: FiDisc },
  ];

  const authLinks = [
    { name: "Login", path: "/login", icon: FiLogIn },
    { name: "Register", path: "/register", icon: FiUserPlus },
  ];

  return (
    <aside className="hidden md:flex flex-col h-full bg-surface border-r border-border transition-all duration-300 md:w-20 lg:w-64 p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 lg:px-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border">
          <img src={logoImg} alt="SONEXA Logo" className="h-full w-full object-cover" />
        </div>
        <span className="hidden lg:block text-2xl font-bold text-white tracking-wide">
          SONEXA
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300
                ${isActive
                  ? "bg-surface-hover text-white font-semibold"
                  : "text-text-secondary hover:text-white hover:bg-surface-hover"
                }
              `}
              title={link.name}
            >
              <Icon className="text-2xl shrink-0" />
              <span className="hidden lg:block truncate">{link.name}</span>
            </NavLink>
          );
        })}

        {/* Artist Section */}
        {role === "artist" && (
          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
            <span className="hidden lg:block text-xs font-bold text-text-secondary uppercase tracking-wider px-3 mb-1">Artist Tools</span>
            <NavLink
              to="/create-album"
              className={({ isActive }) => `
                flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300
                ${isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-text-secondary hover:text-white hover:bg-surface-hover"
                }
              `}
              title="Create Album"
            >
              <FiPlusSquare className="text-2xl shrink-0" />
              <span className="hidden lg:block truncate">Create Album</span>
            </NavLink>
            <NavLink
              to="/createMusic"
              className={({ isActive }) => `
                flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300
                ${isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-text-secondary hover:text-white hover:bg-surface-hover"
                }
              `}
              title="Create Music"
            >
              <FiMusic className="text-2xl shrink-0" />
              <span className="hidden lg:block truncate">Create Music</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* Auth Links (Bottom) */}
      {isAuthenticated ? (
        <div className="mt-auto border-t border-border pt-4">
          <div className="flex items-center gap-3 rounded-xl px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>

            <div className="hidden lg:block overflow-hidden">
              <p className="truncate font-semibold text-white">
                {user?.username}
              </p>

              <p className="truncate text-xs capitalize text-text-secondary">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-auto border-t border-border pt-4 flex flex-col gap-2">
          {authLinks.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => `
            flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300
            ${isActive
                    ? "bg-surface-hover text-white font-semibold"
                    : "text-text-secondary hover:text-white hover:bg-surface-hover"
                  }
          `}
              >
                <Icon className="text-2xl shrink-0" />
                <span className="hidden lg:block">
                  {link.name}
                </span>
              </NavLink>
            );
          })}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
