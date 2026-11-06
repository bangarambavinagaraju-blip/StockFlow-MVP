import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Boxes, Mail, Lock, Eye, EyeOff } from "lucide-react";
import api from "../api";
import "./Auth.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            localStorage.setItem("stockflow_token", response.data.token);
            localStorage.setItem(
                "stockflow_user",
                JSON.stringify(response.data.user)
            );

            navigate("/dashboard", { replace: true });

        } catch (err) {
            setError(
                err.response?.data?.message || "Login failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-brand">
                    <div className="auth-logo">
                        <Boxes size={30} />
                    </div>
                    <h1>StockFlow</h1>
                    <p>INVENTORY MANAGEMENT</p>
                </div>

                <div className="auth-heading">
                    <h2>Welcome Back!</h2>
                    <p>Sign in to manage your inventory.</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label>Email Address</label>

                    <div className="auth-input">
                        <Mail size={18} />
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <label>Password</label>

                    <div className="auth-input">
                        <Lock size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?
                    <Link to="/signup"> Create Account</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;