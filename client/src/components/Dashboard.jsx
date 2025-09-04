import { useState, useEffect } from 'react'
import API from '../api'
import '../App.css'
import { useNavigate } from 'react-router-dom';


function Dashboard() {
    const [tasks, setTasks] = useState([])
    const [filter, setFilter] = useState('all')
    const [isAddingTask, setIsAddingTask] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' })
    const [user, setUser] = useState({ name: '', email: '' });

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const navigate = useNavigate();




    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser({ name: parsedUser.name, email: parsedUser.email });
        }
    }, []);


    const logout = () => {

        localStorage.removeItem('name');
        localStorage.removeItem('email');
        localStorage.removeItem('token');
        navigate('/');
    };


    // Fetch tasks from backend
    const fetchTasks = async () => {
        try {
            const res = await API.get('/tasks')
            setTasks(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [])


    // Add task API
    const addTask = async () => {
        if (!newTask.title.trim()) return
        try {
            const res = await API.post('/tasks', newTask)
            setTasks([...tasks, res.data])
            setNewTask({ title: '', description: '', priority: 'medium' })
            setIsAddingTask(false)
        } catch (err) {
            console.error(err)
        }
    }

    // Delete task API (fixed)
    const deleteTask = async (_id) => {
        try {
            await API.delete(`/tasks/${_id}`)
            setTasks(tasks.filter(task => task._id !== _id)) // <-- FIXED HERE
        } catch (err) {
            console.error(err)
        }
    }

    // Toggle complete API
    const toggleComplete = async (_id) => {
        try {
            const res = await API.patch(`/tasks/${_id}/completion`);
            setTasks(tasks.map(task =>
                task._id === _id ? res.data : task
            ));
        } catch (err) {
            console.error("Error toggling task completion:", err.response ? err.response.data : err);
        }
    }

    // Edit task APIs
    const startEdit = (task) => {
        setEditingTask({ ...task })
    }

    const saveEdit = async () => {
        try {
            const res = await API.put(`/tasks/${editingTask._id}`, editingTask)
            setTasks(tasks.map(task => task._id === editingTask._id ? res.data : task)) // <-- FIXED HERE
            setEditingTask(null)
        } catch (err) {
            console.error(err)
        }
    }

    const cancelEdit = () => {
        setEditingTask(null)
    }

    const filteredTasks = tasks.filter(task => {
        if (filter === 'completed') return task.completed
        if (filter === 'pending') return !task.completed
        return true
    })

    const taskStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        pending: tasks.filter(t => !t.completed).length
    }

    return (
        <div className="dashboard">
            {sidebarOpen && <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}
            <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-header">
                    <h2>TaskFlow</h2>
                    <button className="mobile-close" onClick={() => setSidebarOpen(false)}>×</button>
                </div>

                <div className="user-profile">
                    <div className="user-avatar">{user.name ? user.name.charAt(0) : 'U'}</div>
                    <div className="user-info">
                        <h3>{user.name || 'User'}</h3>
                        <p>{user.email || 'user@example.com'}</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <button className={`nav-item ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                        <span className="nav-icon">📋</span>
                        All Tasks
                        <span className="nav-count">{taskStats.total}</span>
                    </button>
                    <button className={`nav-item ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
                        <span className="nav-icon">⏳</span>
                        Pending
                        <span className="nav-count">{taskStats.pending}</span>
                    </button>
                    <button className={`nav-item ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
                        <span className="nav-icon">✅</span>
                        Completed
                        <span className="nav-count">{taskStats.completed}</span>
                    </button>
                </nav>

                <button className="logout-btn" onClick={logout}>
                    <span className="nav-icon">🚪</span> Logout
                </button>
            </div>

            <div className="main-content">
                <header className="header">
                    <button className="mobile-menu" onClick={() => setSidebarOpen(true)}>☰</button>
                    <h1>Task Dashboard</h1>
                    <button className="add-task-btn" onClick={() => setIsAddingTask(true)}>+ Add Task</button>
                </header>

                <div className="stats-grid">
                    <div className="stat-card"><h3>Total Tasks</h3><p className="stat-number">{taskStats.total}</p></div>
                    <div className="stat-card"><h3>Pending</h3><p className="stat-number pending">{taskStats.pending}</p></div>
                    <div className="stat-card"><h3>Completed</h3><p className="stat-number completed">{taskStats.completed}</p></div>
                </div>

                {isAddingTask && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Add New Task</h2>
                            <input type="text" placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="form-input" />
                            <textarea placeholder="Task description (optional)" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="form-textarea" />
                            <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="form-select">
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                            <div className="modal-actions">
                                <button onClick={() => setIsAddingTask(false)} className="btn-cancel">Cancel</button>
                                <button onClick={addTask} className="btn-primary">Add Task</button>
                            </div>
                        </div>
                    </div>
                )}

                {editingTask && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Edit Task</h2>
                            <input type="text" value={editingTask.title} onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })} className="form-input" />
                            <textarea value={editingTask.description} onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })} className="form-textarea" />
                            <select value={editingTask.priority} onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })} className="form-select">
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                            <div className="modal-actions">
                                <button onClick={cancelEdit} className="btn-cancel">Cancel</button>
                                <button onClick={saveEdit} className="btn-primary">Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="tasks-section">
                    <div className="section-header">
                        <h2>{filter === 'all' ? 'All Tasks' : filter === 'completed' ? 'Completed Tasks' : 'Pending Tasks'}</h2>
                        <p>{filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}</p>
                    </div>

                    <div className="tasks-grid">
                        {filteredTasks.length === 0 ? (
                            <div className="empty-state">
                                <p>No tasks found</p>
                                <button className="btn-primary" onClick={() => setIsAddingTask(true)}>Create your first task</button>
                            </div>
                        ) : (
                            filteredTasks.map(task => (
                                <div key={task._id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                                    <div className="task-header">
                                        <div className="task-priority"><span className={`priority-badge ${task.priority}`}>{task.priority}</span></div>
                                        <div className="task-actions">
                                            <button className="action-btn edit" onClick={() => startEdit(task)} title="Edit task">✏️</button>
                                            <button className="action-btn delete" onClick={() => deleteTask(task._id)} title="Delete task">🗑️</button>
                                        </div>
                                    </div>

                                    <div className="task-content">
                                        <h3 className={task.completed ? 'task-title-completed' : ''}>{task.title}</h3>
                                        {task.description && <p className="task-description">{task.description}</p>}
                                    </div>

                                    <div className="task-footer">
                                        <button className={`complete-btn ${task.completed ? 'completed' : ''}`} onClick={() => toggleComplete(task._id)}>
                                            {task.completed ? '✓ Completed' : 'Mark Complete'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
