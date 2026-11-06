import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Boxes, Mail, Lock, Building2 } from "lucide-react";
import api from "../api";
import "./Auth.css";

function Signup() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        organization_name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/signup", form);

            alert("Account created successfully! Please log in.");
            navigate("/login");

        } catch (err) {
            setError(
                err.response?.data?.message || "Signup failed."
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
                    <h2>Create Your Account</h2>
                    <p>Register your organization to get started.</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label>Organization Name</label>

                    <div className="auth-input">
                        <Building2 size={18} />
                        <input
                            type="text"
                            placeholder="Enter organization name"
                            value={form.organization_name}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    organization_name: e.target.value
                                })
                            }
                            required
                        />
                    </div>

                    <label>Email Address</label>

                    <div className="auth-input">
                        <Mail size={18} />
                        <input
                            type="email"
                            placeholder="Enter email address"
                            value={form.email}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    email: e.target.value
                                })
                            }
                            required
                        />
                    </div>

                    <label>Password</label>

                    <div className="auth-input">
                        <Lock size={18} />
                        <input
                            type="password"
                            placeholder="Minimum 8 characters"
                            value={form.password}
                            onChange={e =>
                                setForm({
                                    ...form,
                                    password: e.target.value
                                })
                            }
                            minLength={8}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <div className="auth-footer">
                    Already registered?
                    <Link to="/login"> Sign In</Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;