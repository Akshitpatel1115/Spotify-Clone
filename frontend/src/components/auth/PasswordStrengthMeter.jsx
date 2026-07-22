import React from "react";
import { FiCheckCircle, FiCircle } from "react-icons/fi";

const PasswordStrengthMeter = ({ password }) => {
  const getRequirements = () => [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const requirements = getRequirements();
  const strengthScore = requirements.filter((req) => req.met).length;

  const getStrengthData = () => {
    switch (strengthScore) {
      case 0:
      case 1:
        return { label: "Very Weak", color: "bg-red-500", text: "text-red-500" };
      case 2:
        return { label: "Weak", color: "bg-orange-500", text: "text-orange-500" };
      case 3:
        return { label: "Fair", color: "bg-yellow-500", text: "text-yellow-500" };
      case 4:
        return { label: "Good", color: "bg-green-400", text: "text-green-400" };
      case 5:
        return { label: "Excellent", color: "bg-green-500", text: "text-green-500" };
      default:
        return { label: "Very Weak", color: "bg-red-500", text: "text-red-500" };
    }
  };

  const strengthData = getStrengthData();

  return (
    <div className="w-full rounded-xl bg-gray-900 p-4 border border-border shadow-md">
      {/* Strength Meter Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">Password Strength</span>
        <span className={`text-sm font-bold transition-colors duration-300 ${strengthData.text}`}>{strengthData.label}</span>
      </div>

      {/* Strength Bar */}
      <div className="flex gap-1 mb-4 h-2 w-full rounded-full overflow-hidden">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`flex-1 transition-colors duration-300 ${
              level <= strengthScore ? strengthData.color : "bg-gray-700"
            }`}
          />
        ))}
      </div>

      {/* Requirements List */}
      <div className="space-y-1.5">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2">
            {req.met ? (
              <FiCheckCircle className="text-green-500 shrink-0 w-4 h-4 transition-colors duration-300" />
            ) : (
              <FiCircle className="text-gray-500 shrink-0 w-4 h-4 transition-colors duration-300" />
            )}
            <span
              className={`text-sm transition-colors duration-300 ${
                req.met ? "text-gray-200" : "text-gray-500"
              }`}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
