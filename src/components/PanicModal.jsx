import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, Navigation, MapPin, ShieldCheck, X, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { getHospitals } from '../services/dataService';
import { authService } from '../services/authService';

const PanicModal = ({ isOpen, onClose }) => {
    const [nearestHospital, setNearestHospital] = useState(null);
    const [currentAddress, setCurrentAddress] = useState('Locating you...');
    const [loading, setLoading] = useState(true);
    const [alertStatus, setAlertStatus] = useState('idle'); // idle, sending, success, error
    const [currentUser, setCurrentUser] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null); // Store generated message
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
    }, [isOpen]);

    const handleAlertFamily = async () => {
        if (!currentUser || !currentUser.emergencyContact) {
            console.error("No emergency contact found for user:", currentUser);
            alert("No emergency contact found! Please update your profile or register a new account.");
            setAlertStatus('error');
            return;
        }

        // Generate message immediately
        const message = `
🚨 EMERGENCY ALERT 🚨
Name: ${currentUser.name}
Status: PANIC MODE ACTIVATED
Location: ${currentAddress}
Nearest Hospital: ${nearestHospital ? nearestHospital.name : 'Unknown'}
        `.trim();

        setAlertMessage(message);
        setAlertStatus('sending');



        try {
            const response = await fetch('/api/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: currentUser.emergencyContact,
                    name: currentUser.name,
                    location: currentAddress,
                    message: message
                })
            });

            // Parse as text first to avoid crashing on empty/HTML responses
            const text = await response.text();
            console.log("Raw Server Response:", text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error("Server returned non-JSON response: " + text.substring(0, 100));
            }

            if (data.success) {
                setAlertStatus('success');
            } else {
                setAlertStatus('error');
                setErrorMessage(data.error || "Failed to send alert");
                console.error("SMS Failed:", data.error);
            }
        } catch (error) {
            console.error("Network Error:", error);
            setAlertStatus('error');
            setErrorMessage(error.message || "Network Error");
        }
    };

    // Admission Checklist
    const [checklist, setChecklist] = useState([
        { id: 1, text: "Patient's ID Proof (Aadhar/Voter ID)", checked: false },
        { id: 2, text: "Insurance Card / Policy Number", checked: false },
        { id: 3, text: "Previous Medical Reports / Prescriptions", checked: false },
        { id: 4, text: "Emergency Contact Number", checked: false },
        { id: 5, text: "List of Current Medications", checked: false },
    ]);

    const toggleCheck = (id) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;

                        // 1. Reverse Geocode for Address
                        try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                            const data = await res.json();
                            const city = data.address.city || data.address.town || "Unknown Location";
                            const suburb = data.address.suburb || "";
                            setCurrentAddress(suburb ? `${suburb}, ${city}` : city);
                        } catch (e) {
                            setCurrentAddress("Address Unavailable");
                        }

                        // 2. Find Nearest Hospital
                        const hospitals = await getHospitals({ lat: latitude, lng: longitude });
                        // getHospitals returns a sorted list if location is provided
                        if (hospitals && hospitals.length > 0) {
                            setNearestHospital(hospitals[0]);
                        }
                        setLoading(false);
                    },
                    (err) => {
                        console.error("Location Error:", err);
                        setCurrentAddress("Location access denied");
                        setLoading(false);
                    }
                );
            } else {
                setCurrentAddress("Geolocation not supported");
                setLoading(false);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>

                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(239, 68, 68, 0.2)', backdropFilter: 'blur(8px)' }}
                    onClick={onClose}
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="glass-card"
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '500px',
                        background: 'white',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.25)',
                        border: '2px solid #FECACA'
                    }}
                >
                    {/* Header */}
                    <div style={{ background: '#FEF2F2', padding: '1.5rem', borderBottom: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#EF4444', color: 'white', padding: '10px', borderRadius: '50%' }}>
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h2 style={{ color: '#991B1B', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>PANIC MODE ACTIVATED</h2>
                            <p style={{ color: '#B91C1C', fontSize: '0.9rem', margin: 0 }}>Stay calm. Help is on the way.</p>
                        </div>
                        <button onClick={onClose} style={{ marginLeft: 'auto', padding: '8px', borderRadius: '50%', background: 'white', border: '1px solid #FECACA', cursor: 'pointer' }}>
                            <X size={20} color="#EF4444" />
                        </button>
                    </div>

                    <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: '60vh' }}>

                        {/* Nearest Hospital Card */}
                        <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #E2E8F0' }}>
                            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShieldCheck size={16} /> Nearest Hospital
                            </h3>

                            {loading ? (
                                <div style={{ height: '60px', background: '#E2E8F0', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
                            ) : nearestHospital ? (
                                <div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                                        {nearestHospital.name}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748B', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                        <MapPin size={16} />
                                        {nearestHospital.location.address || "Address details loading..."} ({nearestHospital.distance} km away)
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <a href={`tel:${nearestHospital.contact}`}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#EF4444', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
                                            <Phone size={18} /> Call Hospital
                                        </a>
                                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${nearestHospital.location.lat},${nearestHospital.location.lng}`}
                                            target="_blank" rel="noreferrer"
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#3B82F6', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none' }}>
                                            <Navigation size={18} /> Navigate
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: '#EF4444' }}>Could not find hospitals nearby. Please call 108 directly.</div>
                            )}
                        </div>

                        {/* Current Location */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#EFF6FF', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #BFDBFE' }}>
                            <div style={{ background: '#3B82F6', width: '12px', height: '12px', borderRadius: '50%', boxShadow: '0 0 0 4px #DBEAFE' }}></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: '#60A5FA', fontWeight: 600, textTransform: 'uppercase' }}>Your Live Location</div>
                                <div style={{ fontWeight: 600, color: '#1E3A8A' }}>{currentAddress}</div>
                            </div>
                        </div>

                        {/* Admission Checklist */}
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>Admission Checklist</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {checklist.map(item => (
                                    <div key={item.id}
                                        onClick={() => toggleCheck(item.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: item.checked ? '#F0FDF4' : 'white', border: item.checked ? '1px solid #86EFAC' : '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: item.checked ? 'none' : '2px solid #CBD5E1', background: item.checked ? '#22C55E' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {item.checked && <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }}></div>}
                                        </div>
                                        <span style={{ fontSize: '0.9rem', color: item.checked ? '#15803D' : '#475569', textDecoration: item.checked ? 'line-through' : 'none' }}>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Emergency Footer (Sticky) */}
                    <div style={{ padding: '1.5rem', borderTop: '1px solid #FECACA', background: '#FEF2F2', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>

                        {/* Alert Status Feedback */}
                        {/* Message Preview Box - Always visible if message generated */}
                        {alertMessage && (
                            <div style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1rem', marginBottom: '0.5rem' }}>
                                <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>EMERGENCY MESSAGE</span>
                                    <span>To: {currentUser?.emergencyContact}</span>
                                </div>
                                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-line', background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                                    {alertMessage}
                                </div>
                            </div>
                        )}

                        {alertStatus === 'success' && (
                            <div style={{ background: '#DCFCE7', color: '#166534', padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', width: '100%' }}>
                                <CheckCircle size={18} />
                                Message triggered successfully
                            </div>
                        )}

                        {alertStatus === 'error' && (
                            <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', width: '100%' }}>
                                <AlertCircle size={18} />
                                {alertStatus === 'error' && !currentUser ? "Please login to use this feature." : (errorMessage || "Failed to trigger alert.")}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                            <button
                                onClick={handleAlertFamily}
                                disabled={alertStatus === 'sending' || alertStatus === 'success'}
                                style={{
                                    flex: 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    color: 'white', fontWeight: 600, fontSize: '1rem', padding: '14px',
                                    background: 'linear-gradient(to right, #F59E0B, #EA580C)',
                                    borderRadius: '12px', border: 'none', cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)',
                                    opacity: alertStatus === 'sending' ? 0.7 : 1
                                }}>
                                {alertStatus === 'sending' ? 'Sending...' : alertStatus === 'success' ? 'Alert Sent' : 'Call to Home'}
                                {!alertStatus.startsWith('s') && <Send size={20} />}
                            </button>

                            <a href="tel:108" style={{
                                flex: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                color: '#EF4444', fontWeight: 600, fontSize: '1rem', padding: '14px',
                                background: 'white', borderRadius: '12px',
                                border: '2px solid #FECACA', textDecoration: 'none',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                <Phone size={20} className="animate-pulse" /> Call 108
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.95); }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
        </AnimatePresence>
    );
};

export default PanicModal;
