import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, MapPin, Phone, ClipboardCheck, X, Share2, Navigation } from 'lucide-react';

const PanicModal = ({ isOpen, onClose, hospital, userLocation }) => {
    if (!isOpen || !hospital) return null;

    const checklist = [
        "Government ID Proof (Aadhar/Voter ID)",
        "Insurance Policy Card/Details",
        "Recent Medical Reports & Prescriptions",
        "Emergency Contact Number (Family/Friend)"
    ];

    const handleShare = () => {
        const text = `EMERGENCY COORDINATION:\n\nHospital: ${hospital.name}\nAddress: ${hospital.city}, TN\nEmergency: +91 108 / +91 ${Math.floor(Math.random() * 9000) + 1000}\nDistance: ${hospital.distance || 'Loading'} km\n\nLive Location: https://www.google.com/maps?q=${userLocation?.lat},${userLocation?.lng}`;

        if (navigator.share) {
            navigator.share({ title: 'Emergency Coordination', text });
        } else {
            navigator.clipboard.writeText(text);
            alert("Panic details copied to clipboard!");
        }
    };

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.7)', backdropFilter: 'blur(8px)' }}
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="glass-card"
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '500px',
                        padding: '2rem',
                        background: 'white',
                        border: '2px solid var(--error)',
                        boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', color: 'var(--error)' }}>
                        <ShieldAlert size={32} />
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Panic Mode Active</h2>
                            <p style={{ fontSize: '0.85rem', opacity: 0.8, color: 'var(--text-secondary)' }}>Emergency Coordination in Progress</p>
                        </div>
                    </div>

                    <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem' }}>
                        <p style={{ color: '#991B1B', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                            Stay calm. We are coordinating your arrival at <strong>{hospital.name}</strong>. Here is the critical information for your family.
                        </p>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <MapPin size={18} color="var(--error)" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Target Facility</div>
                                    <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{hospital.name}, {hospital.city}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Navigation size={18} color="var(--error)" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Distance & Route</div>
                                    <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{hospital.distance} km via fastest local route</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Phone size={18} color="var(--error)" />
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Emergency Contact</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--error)' }}>+91 108 / +91 {Math.floor(Math.random() * 9000000000) + 1000000000}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                            <ClipboardCheck size={18} color="var(--success)" /> Admission Checklist
                        </h4>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            {checklist.map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--success)' }}>•</span> {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button
                            onClick={handleShare}
                            className="primary-button"
                            style={{
                                background: 'var(--primary)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <Share2 size={18} /> Share Info
                        </button>
                        <button
                            onClick={onClose}
                            className="secondary-button"
                            style={{ border: '1px solid #E2E8F0' }}
                        >
                            Dismiss
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PanicModal;
