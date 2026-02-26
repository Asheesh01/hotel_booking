import { useState, useEffect } from 'react';
import api from '../api/axios';

function StatCard({ icon, label, value, color }) {
    return (
        <div style={{
            background: 'var(--bg-card)',
            border: `1px solid ${color}40`,
            borderRadius: '14px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            flex: 1,
            minWidth: '160px'
        }}>
            <div style={{ fontSize: '2rem' }}>{icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</div>
        </div>
    );
}

export default function ReceptionDashboard() {
    const [tab, setTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [revenue, setRevenue] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get('/api/reception/bookings'),
            api.get('/api/reception/rooms/availability'),
            api.get('/api/reception/revenue/daily'),
            api.get('/api/reception/stats'),
        ])
            .then(([b, a, r, s]) => {
                setBookings(b.data);
                setAvailability(a.data);
                setRevenue(r.data);
                setStats(s.data);
            })
            .catch(() => setError('Failed to load reception data.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner" />;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>🛎️ Reception Dashboard</h1>
                <p>Live hotel overview — bookings, availability, and revenue</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Stats Cards */}
            {stats && (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    <StatCard icon="📋" label="Total Bookings" value={stats.totalBookings} color="#6c63ff" />
                    <StatCard icon="🚪" label="Today's Check-ins" value={stats.todayCheckIns} color="#43e97b" />
                    <StatCard icon="💰" label="Today's Revenue" value={`₹${(stats.todayRevenue || 0).toLocaleString()}`} color="#f5a623" />
                    <StatCard icon="💎" label="Total Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} color="#f64f6f" />
                </div>
            )}

            {/* Tab Bar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                {[
                    { id: 'bookings', label: '📋 All Bookings' },
                    { id: 'availability', label: '🏨 Room Availability' },
                    { id: 'revenue', label: '💰 Daily Revenue' },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        style={{
                            background: tab === t.id ? 'rgba(108,99,255,0.2)' : 'transparent',
                            color: tab === t.id ? '#6c63ff' : 'var(--text-secondary)',
                            border: tab === t.id ? '1px solid rgba(108,99,255,0.4)' : '1px solid transparent',
                            borderRadius: '8px',
                            padding: '0.5rem 1.1rem',
                            cursor: 'pointer',
                            fontWeight: tab === t.id ? 600 : 400,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab: All Bookings */}
            {tab === 'bookings' && (
                bookings.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No bookings yet.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Reservation #</th>
                                    <th>Guest</th>
                                    <th>Room</th>
                                    <th>Check-in</th>
                                    <th>Check-out</th>
                                    <th>Rooms</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(b => (
                                    <tr key={b.id}>
                                        <td style={{ fontWeight: 600, color: '#6c63ff' }}>{b.reservationNumber}</td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{b.guestName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.guestEmail}</div>
                                        </td>
                                        <td>{b.roomCategoryName}</td>
                                        <td>{b.checkInDate}</td>
                                        <td>{b.checkOutDate}</td>
                                        <td>{b.roomsBooked}</td>
                                        <td>
                                            <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            {/* Tab: Room Availability */}
            {tab === 'availability' && (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Room Category</th>
                                <th>Total Rooms</th>
                                <th>Available Today</th>
                                <th>Booked Today</th>
                                <th>Price / Night</th>
                                <th>Occupancy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {availability.map(r => {
                                const pct = r.totalRooms > 0 ? Math.round((r.bookedToday / r.totalRooms) * 100) : 0;
                                return (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: 600 }}>{r.name}</td>
                                        <td>{r.totalRooms}</td>
                                        <td>
                                            <span style={{ color: r.availableToday > 0 ? '#43e97b' : '#f64f6f', fontWeight: 600 }}>
                                                {r.availableToday}
                                            </span>
                                        </td>
                                        <td>{r.bookedToday}</td>
                                        <td>₹{r.pricePerNight?.toLocaleString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '6px', minWidth: '80px' }}>
                                                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: '4px', background: pct > 80 ? '#f64f6f' : '#6c63ff' }} />
                                                </div>
                                                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab: Daily Revenue */}
            {tab === 'revenue' && (
                revenue.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No revenue data yet.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date (Check-in)</th>
                                    <th>Revenue Generated</th>
                                    <th>Visual</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const max = Math.max(...revenue.map(r => r.revenue), 1);
                                    return revenue.map((r, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 500 }}>{r.date}</td>
                                            <td style={{ fontWeight: 700, color: '#f5a623' }}>
                                                ₹{r.revenue.toLocaleString()}
                                            </td>
                                            <td style={{ width: '200px' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '8px' }}>
                                                    <div style={{
                                                        width: `${(r.revenue / max) * 100}%`,
                                                        height: '100%',
                                                        borderRadius: '4px',
                                                        background: 'linear-gradient(90deg, #f5a623, #e8941a)'
                                                    }} />
                                                </div>
                                            </td>
                                        </tr>
                                    ));
                                })()}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
}
