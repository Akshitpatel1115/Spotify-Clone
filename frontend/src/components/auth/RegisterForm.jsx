import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

import Input from "../common/Input";
import Button from "../common/Button";
import RoleSelector from "./RoleSelector";
import api from "../../api/axios";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const navigate = useNavigate();

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

    try {
      await api.post("/auth/register", formData);
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Registration failed");
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

        <Button type="submit">
          Create Account
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