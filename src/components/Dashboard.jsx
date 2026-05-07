import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);

    const user = JSON.parse(localStorage.getItem("user"));

    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "Todo",
        assignedTo: "",
    });

    const [comment, setComment] = useState("");

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };

    // Fetch Tasks
    const fetchTasks = async () => {
        try {
            const res = await API.get("/tasks");

            setTasks(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    // Fetch Users
    const fetchUsers = async () => {
        try {
            const res = await API.get("/users");

            setUsers(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
        } else {
            fetchTasks();
            fetchUsers();
        }
    }, []);

    // Handle Input
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // Create Task
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await API.post("/tasks", form);

            setForm({
                title: "",
                description: "",
                status: "Todo",
                assignedTo: "",
            });

            fetchTasks();
        } catch (error) {
            alert("Only Admin or Manager can create tasks");
        }
    };

    // Update Status
    const updateStatus = async (taskId, status) => {
        try {
            await API.patch(`/tasks/${taskId}/status`, {
                status,
            });

            fetchTasks();
        } catch (error) {
            alert("Only assigned user can update status");
        }
    };

    // Add Comment
    const addComment = async (taskId) => {
        if (!comment) return;

        try {
            await API.post(`/tasks/${taskId}/comment`, {
                text: comment,
            });

            setComment("");

            fetchTasks();
        } catch (error) {
            console.log(error);
        }
    };

    // Delete Task
    const deleteTask = async (id) => {
        try {
            await API.delete(`/tasks/${id}`);

            fetchTasks();
        } catch (error) {
            alert("Only Admin can delete tasks");
        }
    };

    return (
        <div className="container mt-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Dashboard</h2>

                    <p className="mb-0">
                        Welcome, <strong>{user?.name}</strong>
                    </p>

                    <p>
                        Role:{" "}
                        <span className="badge bg-primary">
                            {user?.role}
                        </span>
                    </p>
                </div>

                <button className="btn btn-danger" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {/* Create Task */}
            {(user?.role === "admin" || user?.role === "manager") && (
                <div className="card shadow p-4 mb-4">
                    <h4 className="mb-3">Create Task</h4>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input
                                type="text"
                                name="title"
                                className="form-control"
                                placeholder="Task Title"
                                value={form.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <textarea
                                name="description"
                                className="form-control"
                                placeholder="Task Description"
                                rows="3"
                                value={form.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Assign User */}
                        <div className="mb-3">
                            <select
                                name="assignedTo"
                                className="form-control"
                                value={form.assignedTo}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Assign User</option>

                                {users
                                    .filter((u) => u.role === "user")
                                    .map((u) => (
                                        <option key={u._id} value={u._id}>
                                            {u.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div className="mb-3">
                            <select
                                name="status"
                                className="form-control"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="Todo">Todo</option>
                                <option value="In Progress">
                                    In Progress
                                </option>
                                <option value="Completed">
                                    Completed
                                </option>
                            </select>
                        </div>

                        <button className="btn btn-success">
                            Create Task
                        </button>
                    </form>
                </div>
            )}

            {/* Task List */}
            <div className="row d-flex justify-content-between">
                <h4 className="mb-3">All Tasks</h4>

                {tasks.length === 0 ? (
                    <div className="alert alert-warning">
                        No tasks available
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div className="card shadow-sm mb-4 col-md-5" key={task._id}>
                            <div className="card-body">
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <h5>{task.title}</h5>

                                        <p>{task.description}</p>

                                        <p className="mb-1">
                                            Assigned To:{" "}
                                            <strong>
                                                {task?.assignedTo?.name || "N/A"}
                                            </strong>
                                        </p>

                                        <p className="mb-2">
                                            Created By:{" "}
                                            <strong>
                                                {task?.createdBy?.name}
                                            </strong>
                                        </p>

                                        {/* Status */}

                                    </div>

                                    <div>
                                        <span
                                            className={`badge ${task.status === "Completed"
                                                ? "bg-success"
                                                : task.status === "In Progress"
                                                    ? "bg-warning text-dark"
                                                    : "bg-secondary"
                                                }`}
                                        >
                                            {task.status}
                                        </span>

                                    </div>
                                    {/* Delete */}
                                    {user?.role === "admin" && (
                                        <button
                                            className="btn btn-danger btn-sm"
                                            style={{height:30}}
                                            onClick={() => deleteTask(task._id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>

                                {/* User Status Update */}

                                {task?.assignedTo?._id?.toString() ===
                                    user?._id?.toString() && (
                                        <div className="mt-3">
                                            <h6>Update Status</h6>

                                            <select
                                                className="form-control"
                                                value={task.status}
                                                onChange={(e) =>
                                                    updateStatus(
                                                        task._id,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="Todo">Todo</option>

                                                <option value="In Progress">
                                                    In Progress
                                                </option>

                                                <option value="Completed">
                                                    Completed
                                                </option>
                                            </select>
                                        </div>
                                    )}

                                {/* Comments */}
                                <div className="mt-4">
                                    <h6>Comments</h6>

                                    {task.comments?.map((c) => (
                                        <div
                                            className="border rounded p-2 mb-2"
                                            key={c._id}
                                        >
                                            <strong>{c.user?.name}</strong>

                                            <p className="mb-0">{c.text}</p>
                                        </div>
                                    ))}

                                    {/* Add Comment */}
                                    <div className="d-flex gap-2 mt-2">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Add comment"
                                            value={comment}
                                            onChange={(e) =>
                                                setComment(e.target.value)
                                            }
                                        />

                                        <button
                                            className="btn btn-primary"
                                            onClick={() => addComment(task._id)}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Dashboard;