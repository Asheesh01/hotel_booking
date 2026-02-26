import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Navbar() {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const isLoggedIn = !!localStorage.getItem('token');

    const [points, setPoints] = useState(0);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const fetchPoints = async () => {
        try {
            const { data } = await api.get('/api/users/me');
            setPoints(data.loyaltyPoints);
        } catch (err) {
            console.error('Failed to fetch points');
        }
    };

    useEffect(() => {
        if (isLoggedIn && role === 'USER') {
            fetchPoints();
        }
    }, [isLoggedIn, role]);

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">🏨 Grand Royal</Link>
            <ul className="navbar-links">
                <li><Link to="/reception" style={{ color: 'var(--text-primary)' }}>Reception</Link></li>
                <li><Link to="/rooms" style={{ color: 'var(--text-primary)' }}>Rooms</Link></li>

                {isLoggedIn && role === 'USER' && (
                    <li><Link to="/bookings/my" style={{ color: 'var(--text-primary)' }}>My Bookings</Link></li>
                )}
                {isLoggedIn && role === 'ADMIN' && (
                    <li><Link to="/admin/rooms" style={{ color: 'var(--text-primary)' }}>Manage Rooms</Link></li>
                )}

                {isLoggedIn ? (
                    <>
                        <li style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.2 }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>👤 {name}</span>
                            {isLoggedIn && (
                                <span style={{ color: '#eb4d4b', fontSize: '0.75rem', fontWeight: 700 }}>🌟 {points} pts</span>
                            )}
                        </li>
                        <li>
                            <button onClick={handleLogout} style={{
                                background: 'rgba(255,77,109,0.12)',
                                color: '#ff4d6d',
                                border: '1px solid rgba(255,77,109,0.3)',
                                borderRadius: '8px',
                                padding: '0.35rem 0.9rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.85rem'
                            }}>Logout</button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link to="/login" style={{
                                color: 'var(--text-primary)',
                                fontWeight: 500,
                                padding: '0.35rem 0.8rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                background: 'rgba(255,255,255,0.05)'
                            }}>Login</Link>
                        </li>
                        <li>
                            <Link to="/register" style={{
                                background: 'linear-gradient(135deg, #6c63ff, #574fd6)',
                                color: 'white',
                                padding: '0.35rem 1rem',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            }}>Register</Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}
