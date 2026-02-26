import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null); // null = role picker screen
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/api/auth/register', { ...form, role: selectedRole });
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('name', data.name);
            localStorage.setItem('email', data.email);
            if (selectedRole === 'ADMIN') navigate('/admin/rooms');
            else if (selectedRole === 'RECEPTION') navigate('/reception');
            else navigate('/rooms');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 1: Role Picker ─────────────────────────────────────────
    if (!selectedRole) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ maxWidth: '520px' }}>
                    <h2 style={{ textAlign: 'center' }}>Join Grand Royal</h2>
                    <p className="subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        How would you like to register?
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        {/* User Card */}
                        <button
                            onClick={() => setSelectedRole('USER')}
                            style={{
                                background: 'rgba(108, 99, 255, 0.08)',
                                border: '2px solid rgba(108, 99, 255, 0.3)',
                                borderRadius: '16px',
                                padding: '2rem 1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.75rem',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = '#6c63ff';
                                e.currentTarget.style.background = 'rgba(108,99,255,0.18)';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)';
                                e.currentTarget.style.background = 'rgba(108,99,255,0.08)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <span style={{ fontSize: '3rem' }}>🛎️</span>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                                Guest User
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
                                Browse rooms, make bookings, and view your history
                            </span>
                        </button>

                        {/* Admin Card */}
                        <button
                            onClick={() => setSelectedRole('ADMIN')}
                            style={{
                                background: 'rgba(245, 166, 35, 0.08)',
                                border: '2px solid rgba(245, 166, 35, 0.3)',
                                borderRadius: '16px',
                                padding: '2rem 1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.75rem',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = '#f5a623';
                                e.currentTarget.style.background = 'rgba(245,166,35,0.18)';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(245,166,35,0.3)';
                                e.currentTarget.style.background = 'rgba(245,166,35,0.08)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <span style={{ fontSize: '3rem' }}>⚙️</span>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                                Admin
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
                                Manage room categories, pricing, and availability
                            </span>
                        </button>

                        {/* Reception Card */}
                        <button
                            onClick={() => setSelectedRole('RECEPTION')}
                            style={{
                                background: 'rgba(67, 233, 123, 0.08)',
                                border: '2px solid rgba(67, 233, 123, 0.3)',
                                borderRadius: '16px',
                                padding: '2rem 1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.75rem',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = '#43e97b';
                                e.currentTarget.style.background = 'rgba(67,233,123,0.18)';
                                e.currentTarget.style.transform = 'translateY(-4px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'rgba(67,233,123,0.3)';
                                e.currentTarget.style.background = 'rgba(67,233,123,0.08)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <span style={{ fontSize: '3rem' }}>🛎🖥️</span>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                                Receptionist
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
                                View bookings, availability & daily revenue
                            </span>
                        </button>
                    </div>

                    <p className="link-text" style={{ marginTop: '1.5rem' }}>
                        Already have an account? <Link to="/login">Sign In</Link>
                    </p>
                </div>
            </div>
        );
    }

    // ── Step 2: Registration Form ───────────────────────────────────
    const isAdmin = selectedRole === 'ADMIN';
    const isReception = selectedRole === 'RECEPTION';
    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Role badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <button
                        onClick={() => setSelectedRole(null)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-secondary)', fontSize: '1.1rem', padding: 0
                        }}
                        title="Change role"
                    >
                        ←
                    </button>
                    <span style={{
                        background: isAdmin ? 'rgba(245,166,35,0.15)' : isReception ? 'rgba(67,233,123,0.15)' : 'rgba(108,99,255,0.15)',
                        color: isAdmin ? '#f5a623' : isReception ? '#43e97b' : '#6c63ff',
                        border: `1px solid ${isAdmin ? 'rgba(245,166,35,0.35)' : isReception ? 'rgba(67,233,123,0.35)' : 'rgba(108,99,255,0.35)'}`,
                        borderRadius: '20px',
                        padding: '0.25rem 0.85rem',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                    }}>
                        {isAdmin ? '⚙️ Registering as Admin' : isReception ? '🖥️ Registering as Receptionist' : '🛎️ Registering as Guest User'}
                    </span>
                </div>

                <h2>Create Account</h2>
                <p className="subtitle">Fill in your details below</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Min 6 characters"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={isAdmin ? { background: 'linear-gradient(135deg, #f5a623, #e8941a)' } : isReception ? { background: 'linear-gradient(135deg, #43e97b, #38d96b)' } : {}}
                    >
                        {loading ? 'Creating account...' : `Register as ${isAdmin ? 'Admin' : isReception ? 'Receptionist' : 'User'}`}
                    </button>
                </form>

                <p className="link-text">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
