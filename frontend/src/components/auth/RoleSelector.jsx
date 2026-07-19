import { FiHeadphones, FiMic } from "react-icons/fi";

const roles = [
  {
    id: "user",
    title: "User",
    description: "Discover and enjoy music.",
    icon: FiHeadphones,
  },
  {
    id: "artist",
    title: "Artist",
    description: "Create albums and share your music.",
    icon: FiMic,
  },
];

const RoleSelector = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-gray-300">
        Select Role
        <span className="text-primary"> *</span>
      </label>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        {roles.map((role) => {
          const Icon = role.icon;
          const selected = value === role.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onChange(role.id)}
              className={`
                group
                rounded-2xl
                border
                p-4
                text-left
                transition-all
                duration-300

                ${
                  selected
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border bg-surface hover:border-primary hover:bg-surface-hover"
                }
              `}
            >
              <div className="mb-3 flex items-center justify-between">
                <div
                  className={`
                    flex h-12 w-12 items-center justify-center rounded-full text-2xl transition

                    ${
                      selected
                        ? "bg-primary text-white"
                        : "bg-surface-hover text-gray-300 group-hover:bg-primary group-hover:text-white"
                    }
                  `}
                >
                  <Icon />
                </div>

                {selected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    ✓
                  </div>
                )}
              </div>

              <h3 className="text-base font-semibold text-white">
                {role.title}
              </h3>
              
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;