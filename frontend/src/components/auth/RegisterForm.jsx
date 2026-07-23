import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

import Input from "../common/Input";
import Button from "../common/Button";
import RoleSelector from "./RoleSelector";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(135); // 2 minutes 15 seconds
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  // Restore OTP step if the user refreshes the page
  useEffect(() => {
    const savedEmail = sessionStorage.getItem("pendingRegistrationEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
      setIsOtpStep(true);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isOtpStep && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpStep, timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isPasswordValid = () => {
    const p = formData.password;
    return (
      p.length >= 8 &&
      /[A-Z]/.test(p) &&
      /[a-z]/.test(p) &&
      /[0-9]/.test(p) &&
      /[^A-Za-z0-9]/.test(p)
    );
  };

  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]{5,}$/;
    if (!usernameRegex.test(formData.username)) {
      toast.error("Username must be at least 6 characters, start with a letter, and contain no spaces or special characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!isPasswordValid()) {
      toast.error("Password does not meet all requirements.");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/register", formData);
      toast.success("OTP sent to your email successfully!");
      
      // Save to sessionStorage so it persists on refresh
      sessionStorage.setItem("pendingRegistrationEmail", formData.email);
      setIsOtpStep(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed";
      toast.error(errorMessage);
      
      // If the backend says the registration is already pending, let them enter the OTP anyway!
      if (error.response?.status === 409 && errorMessage.includes("pending")) {
        sessionStorage.setItem("pendingRegistrationEmail", formData.email);
        setIsOtpStep(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/verify-email", { email: formData.email, otp });
      toast.success("Email verified successfully! You can now login.");
      
      // Clean up storage on success
      sessionStorage.removeItem("pendingRegistrationEmail");
      navigate("/login");
    } catch (error) {
      console.error("OTP Verification failed:", error);
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      await api.post("/auth/resend-otp", { email: formData.email });
      toast.success("A new verification code has been sent.");
      setTimer(135); // Reset timer
    } catch (error) {
      console.error("Resend OTP failed:", error);
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  if (isOtpStep) {
    return (
      <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-5 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white">Verify Email</h1>
          <p className="mt-2 text-gray-400">
            We've sent a 6-digit verification code to <strong>{formData.email}</strong>.
          </p>
        </div>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input
            label="Verification Code (OTP)"
            type="text"
            name="otp"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              if (val.length <= 6) setOtp(val);
            }}
            icon={FiLock}
            required
            maxLength={6}
          />
          <Button type="submit" disabled={isLoading || otp.length !== 6}>
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>

        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            type="button"
            disabled={timer > 0 || isLoading}
            onClick={handleResendOtp}
            className="text-sm font-semibold text-primary transition hover:text-primary-hover disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : "Resend OTP"}
          </button>

          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("pendingRegistrationEmail");
              setIsOtpStep(false);
            }}
            className="text-xs text-gray-400 transition hover:text-white"
          >
            Entered the wrong email? Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-5 shadow-2xl">
      {/* Heading */}
      <div className="mb-6 text-center">
    
        <h1 className="text-3xl font-bold text-white">
          Create Account
        </h1>

        <p className="mt-2 text-gray-400">
          Join and start listening to your favorite music.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          name="username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleChange}
          icon={FiUser}
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          icon={FiMail}
          required
        />

        <div className="relative">
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            icon={FiLock}
            required
          />
          {/* Smooth slide down for the strength meter */}
          <div
            className={`mt-2 transition-all duration-300 overflow-hidden ${
              isPasswordFocused || (formData.password.length > 0 && !isPasswordValid())
                ? "max-h-[300px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <PasswordStrengthMeter password={formData.password} />
          </div>
        </div>

        <div>
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={FiLock}
            required
          />
          {formData.confirmPassword.length > 0 && !passwordsMatch && (
            <p className="mt-1 text-sm text-red-500 transition-opacity duration-300">
              Passwords do not match.
            </p>
          )}
        </div>

        <RoleSelector
          value={formData.role}
          onChange={handleRoleChange}
        />

        <Button 
          type="submit" 
          disabled={
            isLoading || 
            !isPasswordValid() || 
            !passwordsMatch || 
            !formData.username || 
            !formData.email
          }
        >
          {isLoading ? "Sending OTP..." : "Create Account"}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="h-px flex-1 bg-border"></div>

        <span className="mx-4 text-sm text-muted">
          OR
        </span>

        <div className="h-px flex-1 bg-border"></div>
      </div>

      {/* Login Link */}
      <p className="text-center text-gray-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-primary transition hover:text-primary-hover"
        >
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;