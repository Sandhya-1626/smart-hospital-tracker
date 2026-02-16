import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Heart, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, login } = useAuth(); // We might need to manually refresh user state
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        emergencyContact: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                name: user.name || '',
                mobile: user.mobile || '',
                emergencyContact: user.emergencyContact || ''
            });
            setError(null);
            setSuccess(null);
        }
    }, [isOpen, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (!/^\d{10}$/.test(formData.mobile)) throw new Error("Invalid mobile number");
            if (!/^\d{10}$/.test(formData.emergencyContact)) throw new Error("Invalid emergency contact");

            const updatedSession = await authService.updateProfile(user.id, formData);

            if (updatedSession) {
                setSuccess("Profile updated successfully!");
                // Ideally, AuthContext should allow updating user state without full login
                // For now, we manually reload to reflect changes or assume context updates on next mount
                // A quick hack for context refresh if `login` isn't suitable:
                // window.location.reload(); // Too aggressive

                // Better: Close after short delay
                setTimeout(() => {
                    onClose();
                    window.location.reload(); // Simple way to refresh app state dependent on session
                }, 1500);
            }
        } catch (err) {
            setError(err.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="glass-card"
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '450px',
                        padding: '2rem',
                        background: 'white',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '24px',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}
                >
                    <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>

                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', textAlign: 'center', color: '#1E293B' }}>Edit Profile</h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Email</span>
                            <span style={{ fontWeight: 600 }}>{user?.email}</span>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="tel"
                                name="mobile"
                                placeholder="Mobile Number"
                                required
                                maxLength="10"
                                value={formData.mobile}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', outline: 'none' }}
                            />
                        </div>

                        <div style={{ background: '#FFF1F2', padding: '12px', borderRadius: '8px', border: '1px solid #FECACA' }}>
                            <div style={{ position: 'relative', marginBottom: '8px' }}>
                                <Heart size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: '#E11D48' }} />
                                <input
                                    type="tel"
                                    name="emergencyContact"
                                    placeholder="Emergency Contact"
                                    required
                                    maxLength="10"
                                    value={formData.emergencyContact}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 'var(--radius-md)', border: '1px solid #FDA4AF', outline: 'none', background: 'white' }}
                                />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#9F1239', margin: 0, paddingLeft: '4px' }}>
                                *Required for Panic Mode alerts.
                            </p>
                        </div>

                        {error && (
                            <div style={{ padding: '10px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: '#DC2626', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        {success && (
                            <div style={{ padding: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-sm)', color: '#059669', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle size={16} /> {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="primary-button"
                            style={{ width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProfileModal;
