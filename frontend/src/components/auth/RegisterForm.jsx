import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

import Input from "../common/Input";
import Button from "../common/Button";
import RoleSelector from "./RoleSelector";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Register button clicked. Validating form data...");

    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]{5,}$/;
    if (!usernameRegex.test(formData.username)) {
      console.log("Validation failed: Username invalid.");
      toast.error("Username must be at least 6 characters, start with a letter, and contain no spaces or special characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      console.log("Validation failed: Password too short.");
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    console.log("Validation passed. Sending request to backend...");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/register", formData);
      console.log("Backend response received:", response.data);
      toast.success("OTP sent to your email successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Error from backend:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      console.log("Registration request finished.");
      setIsLoading(false);
    }
  };

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

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          icon={FiLock}
          required
        />

        <RoleSelector
          value={formData.role}
          onChange={handleRoleChange}
        />

        <Button type="submit" disabled={isLoading}>
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