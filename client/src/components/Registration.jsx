import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // for redirect
import axios from "axios";
import "../index.css";

const Registration = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleToggleForm = () => {
        setIsLogin(!isLogin);
        setErrors({});
        setMessage("");
        setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: "",
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email address is invalid";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!isLogin) {
            if (!formData.name) {
                newErrors.name = "Name is required";
            }
            if (!formData.confirmPassword) {
                newErrors.confirmPassword = "Please confirm your password";
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setMessage("");

        try {
            if (isLogin) {
                // LOGIN API
                const res = await axios.post("http://localhost:5000/api/auth/login", {
                    email: formData.email,
                    password: formData.password,
                });

                localStorage.setItem("token", res.data.token);
                setMessage("Login successful!");
                localStorage.setItem("user", JSON.stringify(res.data.user));
                navigate("/dashboard");
            } else {
                // REGISTER API
                await axios.post("http://localhost:5000/api/auth/register", {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                });

                setMessage("Account created successfully! Please log in.");
                setIsLogin(true); // switch to login
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                });
            }
        } catch (err) {
            setMessage(
                err.response?.data?.message || "Something went wrong. Try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container small-ui">
            <div className="auth-card">
                {/* Left Section */}
                <div className="illustration-section">
                    <div className="logo">TaskFlow</div>
                    <h2>Boost Your Productivity</h2>
                    <p>
                        Organize your tasks, collaborate with your team, and get things done
                        faster with TaskFlow.
                    </p>
                    <div className="illustration-img">
                        <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M80,150 C100,50 300,50 320,150 L320,250 L80,250 Z"
                                fill="#6e8efb"
                                opacity="0.2"
                            />
                            <circle
                                cx="200"
                                cy="120"
                                r="60"
                                fill="#6e8efb"
                                opacity="0.2"
                            />
                            <rect
                                x="120"
                                y="180"
                                width="160"
                                height="80"
                                rx="10"
                                fill="#a777e3"
                                opacity="0.2"
                            />
                            <circle cx="150" cy="210" r="10" fill="white" />
                            <circle cx="200" cy="210" r="10" fill="white" />
                            <circle cx="250" cy="210" r="10" fill="white" />
                            <path d="M120,230 L280,230" stroke="white" strokeWidth="5" />
                        </svg>
                    </div>
                </div>

                {/* Right Section */}
                <div className="form-section">
                    <div className="form-toggle">
                        <button
                            className={`toggle-btn ${isLogin ? "active" : ""}`}
                            onClick={() => setIsLogin(true)}
                        >
                            Login
                        </button>
                        <button
                            className={`toggle-btn ${!isLogin ? "active" : ""}`}
                            onClick={() => setIsLogin(false)}
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="form-content">
                        <h2>{isLogin ? "Welcome back" : "Create an account"}</h2>
                        <p>
                            {isLogin
                                ? "Sign in to continue"
                                : "Join us to streamline your workflow"}
                        </p>

                        {message && <p className="server-message">{message}</p>}

                        <form onSubmit={handleSubmit}>
                            {!isLogin && (
                                <div className="input-group">
                                    <i className="fas fa-user"></i>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={errors.name ? "error" : ""}
                                    />
                                    {errors.name && (
                                        <span className="error-message">{errors.name}</span>
                                    )}
                                </div>
                            )}

                            <div className="input-group">
                                <i className="fas fa-envelope"></i>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={errors.email ? "error" : ""}
                                />
                                {errors.email && (
                                    <span className="error-message">{errors.email}</span>
                                )}
                            </div>

                            <div className="input-group">
                                <i className="fas fa-lock"></i>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={errors.password ? "error" : ""}
                                />
                                {errors.password && (
                                    <span className="error-message">{errors.password}</span>
                                )}
                            </div>

                            {!isLogin && (
                                <div className="input-group">
                                    <i className="fas fa-lock"></i>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className={errors.confirmPassword ? "error" : ""}
                                    />
                                    {errors.confirmPassword && (
                                        <span className="error-message">
                                            {errors.confirmPassword}
                                        </span>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? isLogin
                                        ? "Signing in..."
                                        : "Creating account..."
                                    : isLogin
                                        ? "Sign In"
                                        : "Create Account"}
                            </button>
                        </form>

                        <div className="form-footer">
                            <p>
                                {isLogin
                                    ? "Don't have an account?"
                                    : "Already have an account?"}
                                <button
                                    type="button"
                                    onClick={handleToggleForm}
                                    className="form-link"
                                >
                                    {isLogin ? "Sign up now" : "Sign in"}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Registration;
