import { useState, useEffect } from 'react';
import api from '../api/axios';

const emptyRoomForm = { name: '', pricePerNight: '', totalRooms: '', amenities: '', imageUrls: '' };
const emptyPromoForm = { code: '', discountPercentage: '', expiryDate: '', description: '' };

export default function AdminRoomManagement() {
    const [view, setView] = useState('rooms'); // 'rooms' or 'promotions'
    const [rooms, setRooms] = useState([]);
    const [promotions, setPromotions] = useState([]);

    // Room Form
    const [roomForm, setRoomForm] = useState(emptyRoomForm);
    const [editRoomId, setEditRoomId] = useState(null);

    // Promo Form
    const [promoForm, setPromoForm] = useState(emptyPromoForm);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = async () => {
        try {
            const [roomsRes, promosRes] = await Promise.all([
                api.get('/api/rooms'),
                api.get('/api/promotions/admin/all')
            ]);
            setRooms(roomsRes.data);
            setPromotions(promosRes.data);
        } catch (err) {
            console.error('Failed to fetch data');
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleRoomSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            const payload = {
                ...roomForm,
                pricePerNight: parseFloat(roomForm.pricePerNight),
                totalRooms: parseInt(roomForm.totalRooms),
                imageUrls: roomForm.imageUrls.split(',').map(s => s.trim()).filter(Boolean),
            };
            if (editRoomId) {
                await api.put(`/api/admin/rooms/${editRoomId}`, payload);
                setSuccess('Room updated!');
            } else {
                await api.post('/api/admin/rooms', payload);
                setSuccess('Room created!');
            }
            setRoomForm(emptyRoomForm); setEditRoomId(null);
            fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Failed'); }
        finally { setLoading(false); }
    };

    const handlePromoSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        try {
            await api.post('/api/promotions/admin', promoForm);
            setSuccess('Promotion created!');
            setPromoForm(emptyPromoForm);
            fetchData();
        } catch (err) { setError('Failed to create promotion'); }
        finally { setLoading(false); }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>⚙️ Admin Management</h1>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button className={`btn ${view === 'rooms' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('rooms')}>Manage Rooms</button>
                    <button className={`btn ${view === 'promotions' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('promotions')}>Manage Promotions</button>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {view === 'rooms' ? (
                <>
                    <div className="auth-card" style={{ maxWidth: 'none', marginBottom: '2rem' }}>
                        <h3>{editRoomId ? 'Edit Room' : 'Add New Room'}</h3>
                        <form onSubmit={handleRoomSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group"><label>Name</label><input value={roomForm.name} onChange={e => setRoomForm({ ...roomForm, name: e.target.value })} required /></div>
                            <div className="form-group"><label>Price (₹)</label><input type="number" value={roomForm.pricePerNight} onChange={e => setRoomForm({ ...roomForm, pricePerNight: e.target.value })} required /></div>
                            <div className="form-group"><label>Total Rooms</label><input type="number" value={roomForm.totalRooms} onChange={e => setRoomForm({ ...roomForm, totalRooms: e.target.value })} required /></div>
                            <div className="form-group"><label>Amenities</label><input value={roomForm.amenities} onChange={e => setRoomForm({ ...roomForm, amenities: e.target.value })} /></div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Image URLs (comma-separated)</label>
                                <input value={roomForm.imageUrls} onChange={e => setRoomForm({ ...roomForm, imageUrls: e.target.value })} placeholder="url1, url2..." />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }} disabled={loading}>{loading ? 'Saving...' : 'Save Room'}</button>
                            {editRoomId && <button type="button" className="btn btn-secondary" onClick={() => { setEditRoomId(null); setRoomForm(emptyRoomForm); }}>Cancel</button>}
                        </form>
                    </div>

                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Name</th><th>Price</th><th>Total</th><th>Action</th></tr></thead>
                            <tbody>
                                {rooms.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.name}</td><td>₹{r.pricePerNight}</td><td>{r.totalRooms}</td>
                                        <td><button className="btn btn-secondary btn-sm" onClick={() => {
                                            setEditRoomId(r.id);
                                            setRoomForm({ ...r, imageUrls: (r.imageUrls || []).join(', ') });
                                        }}>Edit</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <>
                    <div className="auth-card" style={{ maxWidth: 'none', marginBottom: '2rem' }}>
                        <h3>Add New Promotion</h3>
                        <form onSubmit={handlePromoSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group"><label>Promo Code (e.g. SAVE20)</label><input value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} required /></div>
                            <div className="form-group"><label>Discount (%)</label><input type="number" value={promoForm.discountPercentage} onChange={e => setPromoForm({ ...promoForm, discountPercentage: e.target.value })} required /></div>
                            <div className="form-group"><label>Expiry Date</label><input type="date" value={promoForm.expiryDate} onChange={e => setPromoForm({ ...promoForm, expiryDate: e.target.value })} required /></div>
                            <div className="form-group"><label>Description</label><input value={promoForm.description} onChange={e => setPromoForm({ ...promoForm, description: e.target.value })} /></div>
                            <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }} disabled={loading}>{loading ? 'Creating...' : 'Create Promo Code'}</button>
                        </form>
                    </div>

                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Code</th><th>Discount</th><th>Expires</th><th>Status</th></tr></thead>
                            <tbody>
                                {promotions.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 700, color: '#6c63ff' }}>{p.code}</td>
                                        <td>{p.discountPercentage}%</td>
                                        <td>{p.expiryDate}</td>
                                        <td><span className={`badge ${p.isActive ? 'badge-success' : 'badge-error'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
