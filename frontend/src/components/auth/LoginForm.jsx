import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Input from "../common/Input";
import Button from "../common/Button";
import api from '../../api/axios'
import useAuth from "../../context/useAuth";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", formData);

      const { token, user } = response.data;

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      login(user, token);

      navigate('/')



    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-5 shadow-2xl">
      {/* Heading */}
      <div className="mb-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            ♫
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white">
          Welcome Back
        </h1>

        <p className="mt-2 text-text-secondary">
          Log in to continue listening to your favorite music.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" className="mt-2">
          Login
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="h-px flex-1 bg-border"></div>
        <span className="mx-4 text-sm text-text-secondary">
          OR
        </span>
        <div className="h-px flex-1 bg-border"></div>
      </div>

      {/* Register Link */}
      <p className="text-center text-text-secondary">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-primary transition hover:text-primary-hover"
        >
          Create Account
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;