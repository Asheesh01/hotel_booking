import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function BookingForm() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const room = state?.room;

    const today = new Date().toISOString().split('T')[0];
    const [form, setForm] = useState({
        checkInDate: state?.checkIn || today,
        checkOutDate: state?.checkOut || '',
        roomsBooked: 1,
        promoCode: '',
    });
    const [promoInfo, setPromoInfo] = useState(null);
    const [promoError, setPromoError] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);

    if (!room) {
        return (
            <div className="page-container">
                <div className="alert alert-error">No room selected. <a href="/rooms">Go back to rooms</a></div>
            </div>
        );
    }

    const nights = () => {
        if (!form.checkInDate || !form.checkOutDate) return 0;
        const diff = new Date(form.checkOutDate) - new Date(form.checkInDate);
        return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
    };

    const handleApplyPromo = async () => {
        if (!form.promoCode) return;
        setPromoError('');
        try {
            const { data } = await api.get(`/api/promotions/validate?code=${form.promoCode}`);
            if (data.valid) {
                setPromoInfo(data);
            } else {
                setPromoError(data.message);
                setPromoInfo(null);
            }
        } catch {
            setPromoError('Could not validate promo code.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/api/bookings', {
                roomCategoryId: room.id,
                checkInDate: form.checkInDate,
                checkOutDate: form.checkOutDate,
                roomsBooked: parseInt(form.roomsBooked),
                promoCode: promoInfo ? form.promoCode : null
            });
            setSuccess(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ maxWidth: '480px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '3rem' }}>🎉</div>
                        <h2 style={{ marginTop: '0.5rem' }}>Booking Confirmed!</h2>
                    </div>
                    <div style={{ background: 'rgba(108,99,255,0.1)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Reservation #</span>
                                <span style={{ fontWeight: 700, color: '#6c63ff' }}>{success.reservationNumber}</span>
                            </div>
                            {success.roomNumbers && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Assigned Room(s)</span>
                                    <span style={{ fontWeight: 700 }}>{success.roomNumbers}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Check-in</span>
                                <span>{success.checkInDate}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Check-out</span>
                                <span>{success.checkOutDate}</span>
                            </div>
                            <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: '0.5rem', paddingTop: '0.5rem' }} />
                            {success.discountAmount > 0 && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Original Quote</span>
                                        <span style={{ textDecoration: 'line-through' }}>₹{success.originalPrice.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Promo Discount</span>
                                        <span style={{ color: '#eb4d4b' }}>-₹{success.discountAmount.toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                                <span>Total Paid</span>
                                <span style={{ color: '#6c63ff' }}>₹{success.totalPrice.toLocaleString()}</span>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '1rem', background: '#fff', borderRadius: '8px', padding: '0.5rem', border: '1px dashed #6c63ff' }}>
                                🌟 You earned <strong>{success.loyaltyPointsEarned}</strong> loyalty points!
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/bookings/my')}>
                        View All Bookings
                    </button>
                    <button className="btn btn-secondary" style={{ marginTop: '0.75rem', width: '100%' }} onClick={() => navigate('/rooms')}>
                        Back to Rooms
                    </button>
                </div>
            </div>
        );
    }

    const basePrice = nights() * room.pricePerNight * form.roomsBooked;
    const discount = promoInfo ? (basePrice * promoInfo.discountPercentage) / 100 : 0;
    const finalPrice = basePrice - discount;

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: '480px' }}>
                <h2>Book Your Stay</h2>
                <p className="subtitle">{room.name} — ₹{room.pricePerNight?.toLocaleString()} / night</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Check-in</label>
                            <input
                                type="date"
                                min={today}
                                value={form.checkInDate}
                                onChange={(e) => setForm({ ...form, checkInDate: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Check-out</label>
                            <input
                                type="date"
                                min={form.checkInDate || today}
                                value={form.checkOutDate}
                                onChange={(e) => setForm({ ...form, checkOutDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Number of Rooms</label>
                        <input
                            type="number"
                            min="1"
                            value={form.roomsBooked}
                            onChange={(e) => setForm({ ...form, roomsBooked: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Promo Code</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Enter code"
                                style={{ flex: 1, textTransform: 'uppercase' }}
                                value={form.promoCode}
                                onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
                            />
                            <button type="button" className="btn btn-secondary" onClick={handleApplyPromo} style={{ width: 'auto', minWidth: '80px' }}>Apply</button>
                        </div>
                        {promoError && <div style={{ color: '#eb4d4b', fontSize: '0.8rem', marginTop: '0.25rem' }}>{promoError}</div>}
                        {promoInfo && <div style={{ color: '#2ecc71', fontSize: '0.8rem', marginTop: '0.25rem' }}>✅ Applied: {promoInfo.discountPercentage}% OFF</div>}
                    </div>

                    {nights() > 0 && (
                        <div style={{
                            background: 'rgba(108,99,255,0.05)',
                            borderRadius: '10px',
                            padding: '1rem',
                            marginBottom: '1.2rem',
                            fontSize: '0.9rem',
                            border: '1px solid rgba(108,99,255,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Quote ({nights()} night{nights() > 1 ? 's' : ''})</span>
                                <span>₹{basePrice.toLocaleString()}</span>
                            </div>
                            {discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#eb4d4b' }}>
                                    <span>Promo Discount</span>
                                    <span>-₹{discount.toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                <span>Total Price</span>
                                <span style={{ color: '#6c63ff' }}>₹{finalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Processing...' : 'Confirm Booking'}
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ marginTop: '0.75rem', width: '100%' }}
                        onClick={() => navigate('/rooms')}>
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
