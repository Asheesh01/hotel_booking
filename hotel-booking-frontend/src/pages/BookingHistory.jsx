import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function BookingHistory() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/api/bookings/my')
            .then(({ data }) => setBookings(data))
            .catch(() => setError('Failed to load booking history'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner" />;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>My Bookings</h1>
                <p>Your complete booking history at Grand Royal Hotel</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                    <p>No bookings yet.</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem', width: 'auto' }}
                        onClick={() => navigate('/rooms')}>
                        Browse Rooms
                    </button>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Reservation #</th>
                                <th>Room</th>
                                <th>Room #</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>Rooms</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((b) => (
                                <tr key={b.id}>
                                    <td style={{ fontWeight: 600, color: '#6c63ff' }}>{b.reservationNumber}</td>
                                    <td>{b.roomCategoryName}</td>
                                    <td style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6c63ff' }}>{b.roomNumbers || '-'}</td>
                                    <td>{b.checkInDate}</td>
                                    <td>{b.checkOutDate}</td>
                                    <td>{b.roomsBooked}</td>
                                    <td>
                                        <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-accent btn-sm"
                                            onClick={() => navigate(`/bookings/${b.reservationNumber}/rebook`, { state: { booking: b } })}
                                        >
                                            Rebook
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
