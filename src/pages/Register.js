import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        await API.post("/auth/signup", form);

        navigate("/");
    };

    return (
        <div className="container mt-5">
            <div className="card p-4">
                <h2>Register</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        className="form-control mb-3"
                        placeholder="Name"
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />

                    <input
                        className="form-control mb-3"
                        placeholder="Email"
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />

                    <input
                        type="password"
                        className="form-control mb-3"
                        placeholder="Password"
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />

                    <select
                        className="form-control mb-3"
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button className="btn btn-primary">Register</button>
                </form>
            </div>
        </div>
    );
}

export default Register;