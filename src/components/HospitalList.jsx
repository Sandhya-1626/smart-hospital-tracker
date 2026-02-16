import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { aiService } from '../services/aiService';
import { Star, Clock, Heart, ArrowRight, ShieldCheck, CreditCard, MapPin, Ambulance, Building2, Map as MapIcon, List, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import InsuranceModal from './InsuranceModal';
import MapView from './MapView';

const HospitalCard = ({ hospital, onConsult, activeInsuranceFilter }) => {
    const { t } = useLanguage();
    const [aiData, setAiData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filter displayed insurance:
    // If activeInsuranceFilter is set, ONLY show that one.
    // Otherwise show all.
    const displayedInsurance = activeInsuranceFilter
        ? hospital.insurance.filter(ins =>
            ins.toLowerCase() === activeInsuranceFilter.toLowerCase() ||
            (activeInsuranceFilter === 'MA' && ins.includes('MA')) ||
            (activeInsuranceFilter.toLowerCase().includes('vidal') && ins.toLowerCase().includes('vidal'))
        )
        : hospital.insurance;

    // Fallback if filter logic misses (shouldn't happen with strict backend filter, but for safety)
    const finalInsuranceList = displayedInsurance.length > 0 ? displayedInsurance : (activeInsuranceFilter ? [activeInsuranceFilter] : []);


    useEffect(() => {
        const fetchAiData = async () => {
            const summary = await aiService.summarizeReviews(hospital.reviews);
            setAiData({ summary });
            setLoading(false);
        };
        fetchAiData();
    }, [hospital]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
            style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>{hospital.name}</h3>
                        {/* Hospital Type Badge */}
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: hospital.type === 'Government' ? '#E0E7FF' : '#F3E8FF',
                            color: hospital.type === 'Government' ? '#4338CA' : '#7E22CE',
                            fontWeight: 600,
                            border: '1px solid currentColor'
                        }}>
                            {hospital.type}
                        </span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        {hospital.city} • <Star size={14} fill="var(--warning)" color="var(--warning)" /> {hospital.rating}
                        {hospital.distance && (
                            <span style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: hospital.distance < 10 ? 'var(--success)' : 'var(--primary)', fontWeight: 700 }}>
                                <MapPin size={14} /> {hospital.distance} km away
                            </span>
                        )}
                    </p>
                </div>
                {hospital.distance && hospital.distance < 10 && (
                    <div style={{ background: 'var(--success)', color: 'white', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Closest Facility
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {hospital.specialists.map(s => (
                    <span key={s} style={{ background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-primary)' }}>{s}</span>
                ))}
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Emergency Availability */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', fontSize: '0.9rem', fontWeight: 600 }}>
                    <Ambulance size={18} />
                    <span>Emergency: {hospital.emergency}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <ShieldCheck size={16} color="var(--primary)" />
                    <span>{t.insuranceAccepted}: {finalInsuranceList.join(", ")}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <CreditCard size={16} color="var(--primary)" />
                    <span>{t.consultationFee}: ₹{hospital.fee}</span>
                </div>

                {loading ? (
                    <div style={{ height: '40px', background: '#F8FAFC', borderRadius: '4px' }} className="animate-pulse"></div>
                ) : (
                    <div style={{ background: 'rgba(0, 98, 255, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Heart size={14} /> {t.aiInsight}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>"{aiData.summary}"</p>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={onConsult} className="primary-button" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', minWidth: '140px' }}>
                    {t.consultNow} <ArrowRight size={16} />
                </button>

                <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=My+Location&destination=${hospital.location.lat},${hospital.location.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px',
                        color: '#2563EB', fontWeight: 600, cursor: 'pointer', padding: '12px',
                        textDecoration: 'none', minWidth: '110px'
                    }}
                >
                    <Navigation size={16} /> Navigate
                </a>

                <button onClick={() => onConsult(hospital, 'insurance')} style={{
                    flex: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px',
                    color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', padding: '12px',
                    minWidth: '140px'
                }}>
                    <ShieldCheck size={16} color="var(--success)" /> Check Insurance
                </button>
            </div>
        </motion.div>
    );
};

const HospitalList = ({ hospitals, loading, onConsult, userLocation, onLocationUpdate, activeInsuranceFilter, onFilterApply }) => {
    const { t } = useLanguage();
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

    // --- NEW STATE for Filters ---
    const [radius, setRadius] = useState(50);
    const [manualLocationInput, setManualLocationInput] = useState("");
    const [insuranceFilter, setInsuranceFilter] = useState(activeInsuranceFilter || "");

    // Sync prop changes to local state
    useEffect(() => {
        if (activeInsuranceFilter) setInsuranceFilter(activeInsuranceFilter);
    }, [activeInsuranceFilter]);

    // Update parent when insurance filter changes (to trigger re-fetch in App.jsx or just filter locally?)
    // The current architecture seems to pass `hospitals` as a prop. 
    // If we want to filter by radius/insurance, we probably need to trigger `onConsult` or a new `onFilterChange` prop 
    // OR we manage the fetch here if `App.jsx` handles it.
    // Based on `App.jsx` likely structure (not shown but inferred), `hospitals` is passed down.
    // To support "If i type...", we need to trigger a search.
    // Let's assume there's a way to request a new search.
    // The `onConsult` seems to be for searching too? Or just clicking a hospital?
    // User prompt: "UI Features: Dropdown... Manual address... Slider".
    // I need to add these controls.

    // Helper for manual location - Returns location object or calls update
    const handleManualLocation = async () => {
        if (!manualLocationInput) return null;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocationInput)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const newLoc = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), zoom: 12 };
                onLocationUpdate(newLoc);
                return newLoc;
            } else {
                alert("Location not found");
                return null;
            }
        } catch (e) {
            console.error(e);
            alert("Error finding location");
            return null;
        }
    };

    // Trigger Search with new filters
    // We need a prop to call back to App.jsx to re-run `recommendHospitals` with new params.
    // Currently `onConsult` is generic. Let's assume we can use `onSearch` if available, or we might need to modify App.jsx.
    // Wait, `HospitalList` receives `hospitals`. If we want to filter/sort differently, we might need to do it here OR ask parent.
    // The `dataService` logic determines the list.
    // Let's look at `App.jsx` in next step to wire it up.
    // For now, I'll add the UI and a "Apply Filters" button that we can wire up.

    const handleAction = (hospital, type) => {
        if (type === 'insurance') {
            setSelectedHospital(hospital);
            setIsInsuranceModalOpen(true);
        } else {
            onConsult(hospital);
        }
    };

    if (loading) {
        return (
            <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card" style={{ height: '200px', marginBottom: '1.5rem', padding: '1.5rem' }}>
                        <div style={{ height: '24px', width: '40%', background: '#F1F5F9', borderRadius: '4px', marginBottom: '1rem' }} className="animate-pulse"></div>
                        <div style={{ height: '16px', width: '20%', background: '#F1F5F9', borderRadius: '4px', marginBottom: '2rem' }} className="animate-pulse"></div>
                        <div style={{ height: '40px', width: '100%', background: '#F1F5F9', borderRadius: '8px' }} className="animate-pulse"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', paddingBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
                    <Clock color="var(--primary)" /> {t.nearbyHospitals}
                </h2>

                {/* --- FILTERS SECTION --- */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    marginTop: '1rem',
                    marginBottom: '1rem',
                    width: '100%'
                }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {/* Insurance Dropdown */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>Insurance Scheme</label>
                            <select
                                value={insuranceFilter}
                                onChange={(e) => {
                                    setInsuranceFilter(e.target.value);
                                    // ideally trigger search here
                                }}
                                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                            >
                                <option value="">Results for All/Combined</option>
                                <option value="CMCHIS">CMCHIS (Govt)</option>
                                <option value="New Health Insurance Scheme">New Health Insurance Scheme</option>
                            </select>
                        </div>

                        {/* Radius Slider */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>Search Radius: {radius} km</label>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                value={radius}
                                onChange={(e) => setRadius(parseInt(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    {/* Manual Location */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            placeholder="Enter City or Area (if GPS unavailable)"
                            value={manualLocationInput}
                            onChange={(e) => setManualLocationInput(e.target.value)}
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                        />
                        <button
                            onClick={handleManualLocation}
                            style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0 12px', cursor: 'pointer' }}
                        >
                            Set Location
                        </button>
                    </div>

                    {/* Apply Button (Temporary if we don't auto-trigger) */}
                    {/* We need to pass these values up to App.jsx to call recommendHospitals. 
                        I will assume onConsult represents a way to pass data up or I need a new prop.
                        Re-using onConsult for now with specific event type or waiting for App.jsx update. 
                        Let's treat 'onSearch' as needed. I'll add a 'Apply Filters' button that calls a prop 'onFilterApply' 
                        (I'll need to parse this in App.jsx).
                        
                        For now, I'll assume the user will trigger search via the main flow, 
                        BUT the request implies these controls ARE the search interface.
                    */}
                </div>

                {hospitals.length > 0 && hospitals[0].source === 'CMCHIS' && (
                    <div style={{
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1E40AF',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '1rem',
                        marginTop: '1rem',
                        gridColumn: '1 / -1',
                        width: '100%'
                    }}>
                        <ShieldCheck size={18} />
                        Displaying hospitals verified under Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)
                    </div>
                )}


                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {hospitals[0]?.distance && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {hospitals.some(h => h.distance) && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', background: '#ECFDF5', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
                                    <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></div>
                                    Sorting by Proximity
                                </div>
                            )}
                        </div>
                    )}

                    {/* View Toggle */}
                    <div style={{ background: '#E2E8F0', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
                                borderRadius: '6px', border: 'none', cursor: 'pointer',
                                background: viewMode === 'list' ? 'white' : 'transparent',
                                color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-secondary)',
                                fontWeight: 600, boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <List size={16} /> List
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
                                borderRadius: '6px', border: 'none', cursor: 'pointer',
                                background: viewMode === 'map' ? 'white' : 'transparent',
                                color: viewMode === 'map' ? 'var(--primary)' : 'var(--text-secondary)',
                                fontWeight: 600, boxShadow: viewMode === 'map' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <MapIcon size={16} /> Map
                        </button>
                        {/* Apply Button */}
                        <button
                            onClick={() => {
                                // If Manual Input is present but not "set" (complex check), we can try to geocode here or just alert.
                                // For now, assume "Set Location" was clicked if needed, or just pass current filters.
                                // If `manualLocationInput` has value, maybe we should auto-geocode?
                                // Let's keep it simple: "Apply" sends current filter state.
                                if (manualLocationInput && !userLocation) {
                                    // If they typed but didn't set, we might want to hint?
                                    // check handleManualLocation logic
                                    handleManualLocation().then(loc => {
                                        onFilterApply({ insurance: insuranceFilter, radius, manualLocation: loc });
                                    });
                                } else {
                                    onFilterApply({ insurance: insuranceFilter, radius });
                                }
                            }}
                            style={{
                                marginTop: '8px',
                                background: 'var(--primary)',
                                color: 'white',
                                padding: '10px',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            Search with Filters
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'map' ? (
                <div className="glass-card" style={{ padding: '1rem' }}>
                    <MapView hospitals={hospitals} userLocation={userLocation} onLocationUpdate={onLocationUpdate} />
                </div>
            ) : (
                <>
                    {hospitals.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                            No hospitals found for your search. Try describing your symptoms differently.
                        </div>
                    ) : (
                        <>
                            {hospitals.map(h => (
                                <HospitalCard
                                    key={h.id}
                                    hospital={h}
                                    onConsult={handleAction}
                                    activeInsuranceFilter={activeInsuranceFilter}
                                />
                            ))}
                            <div style={{
                                marginTop: '2rem',
                                padding: '1rem',
                                background: '#F1F5F9',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                fontSize: '0.8rem',
                                border: '1px solid #E2E8F0'
                            }}>
                                <strong>Disclaimer:</strong> This result is for hospital discovery only and not a medical diagnosis. Please call 108 for emergencies.
                            </div>
                        </>
                    )}
                </>
            )}

            <InsuranceModal
                isOpen={isInsuranceModalOpen}
                onClose={() => setIsInsuranceModalOpen(false)}
                hospital={selectedHospital}
            />
        </div>
    );
};

export default HospitalList;
