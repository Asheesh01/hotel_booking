import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function RebookPage() {
    const { reservationNumber } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const booking = state?.booking;

    const today = new Date().toISOString().split('T')[0];
    const [form, setForm] = useState({ newCheckIn: today, newCheckOut: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post(
                `/api/bookings/${reservationNumber}/rebook?newCheckIn=${form.newCheckIn}&newCheckOut=${form.newCheckOut}`
            );
            setSuccess(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Rebooking failed. The room may not be available for selected dates.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ maxWidth: '450px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '3rem' }}>🔁</div>
                        <h2 style={{ marginTop: '0.5rem' }}>Rebooking Confirmed!</h2>
                    </div>
                    <div style={{ background: 'rgba(108,99,255,0.1)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>New Reservation #</span>
                                <span style={{ fontWeight: 700, color: '#6c63ff' }}>{success.reservationNumber}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Room</span>
                                <span>{success.roomCategoryName}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Check-in</span>
                                <span>{success.checkInDate}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Check-out</span>
                                <span>{success.checkOutDate}</span>
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/bookings/my')}>View Bookings</button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: '450px' }}>
                <h2>Rebook Your Stay</h2>
                <p className="subtitle">
                    Rebooking: <strong>{booking?.roomCategoryName || reservationNumber}</strong>
                </p>

                {booking && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <div>Previous: {booking.checkInDate} → {booking.checkOutDate} ({booking.roomsBooked} room{booking.roomsBooked > 1 ? 's' : ''})</div>
                    </div>
                )}

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Check-in Date</label>
                        <input
                            type="date"
                            min={today}
                            value={form.newCheckIn}
                            onChange={(e) => setForm({ ...form, newCheckIn: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>New Check-out Date</label>
                        <input
                            type="date"
                            min={form.newCheckIn || today}
                            value={form.newCheckOut}
                            onChange={(e) => setForm({ ...form, newCheckOut: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Processing...' : 'Confirm Rebooking'}
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ marginTop: '0.75rem', width: '100%' }}
                        onClick={() => navigate('/bookings/my')}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
