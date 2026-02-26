import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function RoomList() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        minPrice: '', maxPrice: '',
        amenity: '',
        checkIn: '', checkOut: '',
    });

    // compute today and tomorrow for min date restrictions
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const fetchRooms = async (f = filters) => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (f.minPrice) params.append('minPrice', f.minPrice);
            if (f.maxPrice) params.append('maxPrice', f.maxPrice);
            if (f.amenity) params.append('amenity', f.amenity);
            if (f.checkIn) params.append('checkIn', f.checkIn);
            if (f.checkOut) params.append('checkOut', f.checkOut);

            const hasFilters = [...params].length > 0;
            const url = hasFilters ? `/api/rooms/filter?${params}` : '/api/rooms';
            const { data } = await api.get(url);
            setRooms(data);
        } catch {
            setError('Failed to load rooms. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRooms(); }, []);

    const handleSearch = (e) => { e.preventDefault(); fetchRooms(); };

    const handleClear = () => {
        const cleared = { minPrice: '', maxPrice: '', amenity: '', checkIn: '', checkOut: '' };
        setFilters(cleared);
        fetchRooms(cleared);
    };

    const handleBook = (room) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { state: { from: `/book/${room.id}`, room, checkIn: filters.checkIn, checkOut: filters.checkOut } });
            return;
        }
        navigate(`/book/${room.id}`, { state: { room, checkIn: filters.checkIn, checkOut: filters.checkOut } });
    };

    // Nights count for display
    const getNights = () => {
        if (!filters.checkIn || !filters.checkOut) return null;
        const d = Math.round((new Date(filters.checkOut) - new Date(filters.checkIn)) / 86400000);
        return d > 0 ? d : null;
    };
    const nights = getNights();

    return (
        <div className="page-container">
            <div className="hero-banner">
                <h1>🏨 Grand Royal Hotel</h1>
                <p>Experience luxury like never before. Browse our exclusive room categories.</p>
            </div>

            {/* ── Search & Filter Bar ── */}
            <form className="search-bar" onSubmit={handleSearch} style={{ flexWrap: 'wrap', gap: '1rem' }}>
                {/* Date filters */}
                <div className="form-group" style={{ flex: '1 1 150px', minWidth: '140px' }}>
                    <label>📅 Check-In</label>
                    <input
                        type="date"
                        min={today}
                        value={filters.checkIn}
                        onChange={(e) => {
                            const ci = e.target.value;
                            setFilters(f => ({
                                ...f, checkIn: ci,
                                checkOut: f.checkOut && f.checkOut <= ci ? '' : f.checkOut
                            }));
                        }}
                    />
                </div>
                <div className="form-group" style={{ flex: '1 1 150px', minWidth: '140px' }}>
                    <label>📅 Check-Out</label>
                    <input
                        type="date"
                        min={filters.checkIn ? (() => {
                            const d = new Date(filters.checkIn);
                            d.setDate(d.getDate() + 1);
                            return d.toISOString().split('T')[0];
                        })() : tomorrow}
                        value={filters.checkOut}
                        onChange={(e) => setFilters(f => ({ ...f, checkOut: e.target.value }))}
                    />
                </div>

                {/* Amenity keyword */}
                <div className="form-group" style={{ flex: '1 1 160px', minWidth: '150px' }}>
                    <label>✨ Amenity</label>
                    <input
                        type="text"
                        placeholder="WiFi, Pool, Jacuzzi..."
                        value={filters.amenity}
                        onChange={(e) => setFilters(f => ({ ...f, amenity: e.target.value }))}
                    />
                </div>

                {/* Price range */}
                <div className="form-group" style={{ flex: '1 1 110px', minWidth: '100px' }}>
                    <label>Min ₹/night</label>
                    <input
                        type="number"
                        placeholder="0"
                        value={filters.minPrice}
                        onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                    />
                </div>
                <div className="form-group" style={{ flex: '1 1 110px', minWidth: '100px' }}>
                    <label>Max ₹/night</label>
                    <input
                        type="number"
                        placeholder="99999"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary" style={{ minWidth: '100px', width: 'auto' }}>
                        🔍 Search
                    </button>
                    <button type="button" className="btn btn-secondary" style={{ minWidth: '80px', width: 'auto' }} onClick={handleClear}>
                        Clear
                    </button>
                </div>
            </form>

            {/* Nights indicator */}
            {nights && (
                <div style={{
                    textAlign: 'center', marginBottom: '1rem',
                    color: '#6c63ff', fontWeight: 600, fontSize: '0.9rem'
                }}>
                    🌙 {nights} night{nights !== 1 ? 's' : ''} selected · Prices shown include total for {nights} night{nights !== 1 ? 's' : ''}
                </div>
            )}

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="spinner" />
            ) : rooms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No rooms found matching your criteria.
                </div>
            ) : (
                <div className="rooms-grid">
                    {rooms.map((room) => (
                        <div key={room.id} className="room-card">
                            <div className="room-card-image">
                                {room.imageUrls && room.imageUrls.length > 0 ? (
                                    <img src={room.imageUrls[0]} alt={room.name}
                                        onError={(e) => { e.target.style.display = 'none'; }} />
                                ) : (
                                    <span>🛏</span>
                                )}
                            </div>
                            <div className="room-card-body">
                                <div className="room-card-name">{room.name}</div>
                                <div className="room-card-price">
                                    ₹{room.pricePerNight?.toLocaleString()} <span>/ night</span>
                                    {nights && (
                                        <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#f5a623', fontWeight: 700 }}>
                                            · ₹{(room.pricePerNight * nights).toLocaleString()} total
                                        </span>
                                    )}
                                </div>
                                {room.amenities && (
                                    <div className="room-card-amenities">✨ {room.amenities}</div>
                                )}
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        style={{ flex: 1 }}
                                        onClick={() => handleBook(room)}
                                    >
                                        {filters.checkIn && filters.checkOut ? '📅 Book These Dates' : 'Book Now'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
