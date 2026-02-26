import React, { useState, useEffect } from 'react';
import { useLanguage, LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HospitalList from './components/HospitalList';
import AuthModal from './components/AuthModal';
import Chatbot from './components/Chatbot';
import PanicModal from './components/PanicModal';
import ProfileModal from './components/ProfileModal';
import { getHospitals, searchHospitalsByIssue, recommendHospitals } from './services/dataService';
import { MapPin, Search, Phone, User, Activity, ShieldCheck, Clock, Settings, FileText, CheckCircle, CreditCard, X, AlertTriangle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentModal = ({ isOpen, onClose }) => {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const processPayment = () => {
    setLoading(true);
    setTimeout(() => {
      setPaymentSuccess(true);
      setLoading(false);
      setTimeout(() => {
        onClose();
        setPaymentSuccess(false);
      }, 3000);
    }, 2000);
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
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="glass-card"
          style={{ position: 'relative', width: '100%', maxWidth: '450px', padding: '2rem', background: 'white', border: '1px solid var(--glass-border)' }}
        >
          <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-muted)' }}><X size={20} /></button>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Digital Payment</h2>

          {paymentSuccess ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ background: '#ECFDF5', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle size={32} color="var(--success)" />
              </div>
              <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Payment Successful!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Connecting you to the doctor in 5 seconds...</p>
            </div>
          ) : (
            <div>
              <div style={{ border: '1px solid #E2E8F0', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Consultation Fee</span>
                  <span style={{ fontWeight: 700 }}>₹500.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Platform Charges</span>
                  <span>₹0.00</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={processPayment} disabled={loading} style={{ border: '1px solid #E2E8F0', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', opacity: loading ? 0.7 : 1 }}>
                  <CreditCard size={24} style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{loading ? 'Processing...' : 'UPI/GPay'}</div>
                </button>
                <button onClick={processPayment} disabled={loading} style={{ border: '1px solid #E2E8F0', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', opacity: loading ? 0.7 : 1 }}>
                  <CreditCard size={24} style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{loading ? 'Processing...' : 'Card'}</div>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

const MainApp = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const [showPanic, setShowPanic] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(null); // in KM
  const [currentQuery, setCurrentQuery] = useState('');

  const [locationName, setLocationName] = useState("Detecting Location...");
  const [locationError, setLocationError] = useState(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(true); // Renamed from isDetecting
  const [isManualLocation, setIsManualLocation] = useState(false);

  // New State for strictly filtering display
  const [activeInsuranceFilter, setActiveInsuranceFilter] = useState(null);

  // Real-time Location Tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsDetectingLocation(false);
      return;
    }

    const geoId = navigator.geolocation.watchPosition(
      async (position) => {
        // Stop updating if user manually set location
        if (isManualLocation) return;

        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setUserLocation(newLocation);
        setIsDetectingLocation(false);

        // Reverse Geocoding
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const city = data.address.city || data.address.state_district || data.address.town || "Tamil Nadu";
          const area = data.address.suburb || "";
          setLocationName(area ? `${area}, ${city}` : city);
        } catch (error) {
          console.warn("Geocoding failed", error);
        }
      },
      (error) => {
        console.error("Location access denied or error:", error);
        setIsDetectingLocation(false);
        if (error.code === 1) { // PERMISSION_DENIED
          setLocationError("Location permission denied.");
        } else {
          setLocationError("Unable to retrieve location.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );

    return () => navigator.geolocation.clearWatch(geoId);
  }, [isManualLocation]);

  // Initial fetch (updates when userLocation changes)
  useEffect(() => {
    const fetchDefault = async () => {
      let data = await getHospitals(userLocation);
      if (searchRadius && userLocation) {
        data = data.filter(h => h.distance <= searchRadius);
      }
      setHospitals(data);
      setActiveInsuranceFilter(null); // Reset filter on initial load
      setLoading(false);
    };
    fetchDefault();
  }, [userLocation, searchRadius]);

  const handleManualLocationUpdate = async (newLocation) => {
    console.log("Manual location set:", newLocation);
    setIsManualLocation(true);
    setUserLocation(newLocation);

    // Update address name for manual location
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLocation.lat}&lon=${newLocation.lng}`);
      const data = await response.json();
      const city = data.address.city || data.address.state_district || data.address.town || "Tamil Nadu";
      const area = data.address.suburb || "";
      setLocationName(area ? `${area}, ${city} (Manual)` : `${city} (Manual)`);
    } catch (error) {
      setLocationName("Selected Location");
    }
  };

  const handleSearch = async (issue, policyNumber) => {
    setLoading(true);
    setCurrentQuery(issue);

    // searchHospitalsByIssue now returns { results, detectedProvider }
    let searchData = await searchHospitalsByIssue(issue, userLocation, policyNumber);
    let results = searchData.results;
    setActiveInsuranceFilter(searchData.detectedProvider); // Set specific filter

    if (searchRadius && userLocation) {
      results = results.filter(h => h.distance <= searchRadius);
    }
    setHospitals(results);
    setLoading(false);
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const handleRadiusChange = (radius) => {
    setSearchRadius(radius);
  };

  const handleFilterApply = async ({ insurance, radius, manualLocation }) => {
    setLoading(true);

    // Update state
    if (manualLocation) {
      handleManualLocationUpdate(manualLocation); // This sets userLocation
    }
    setActiveInsuranceFilter(insurance);
    setSearchRadius(radius);

    const loc = manualLocation || userLocation;
    const query = currentQuery || "General";

    // Call the strict recommendation logic
    const { hospitals: results } = await recommendHospitals(
      query,
      loc,
      false,
      insurance || null,
      radius
    );

    setHospitals(results);
    setLoading(false);
  };

  const handleConsult = () => {
    if (isAuthenticated) {
      setShowPayment(true);
    } else {
      setShowAuth(true);
    }
  };

  return (
    <div className="app-container">
      <Navbar
        onLoginClick={() => setShowAuth(true)}
        isLogged={isAuthenticated}
        userName={user?.name}
        onProfileClick={() => setShowProfile(true)}
      />

      <main>
        <Hero
          onSearch={handleSearch}
          // Pass down global location state
          locationName={locationName}
          isDetecting={isDetectingLocation}
          locationError={locationError}
          userLocation={userLocation}
        />

        {/* --- PREMIUM MEDICAL TRUST SECTION --- */}
        <section style={{ padding: '3rem 1rem', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '2rem', color: 'var(--text-secondary)' }}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Verified Hospitals Near You</span>
              <div style={{ height: '4px', width: '4px', background: 'var(--border-strong)', borderRadius: '50%' }} />
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 700, fontSize: '0.9rem' }}>
                <Star size={16} fill="currentColor" /> 4.8/5 Patient Average Rating
              </span>
            </motion.div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem', opacity: 0.6 }}>
              {['Apollo General', 'Medanta Care', 'Fortis Health', 'Max Partner', 'AIIMS Network'].map((logo, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, filter: 'grayscale(100%)' }}
                  whileInView={{ opacity: 1 }}
                  whileHover={{ filter: 'grayscale(0%)', scale: 1.05, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  style={{
                    fontSize: '1.25rem', fontFamily: 'Outfit', fontWeight: 800, color: 'white',
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default'
                  }}
                >
                  <Activity size={24} color={i % 2 === 0 ? "var(--primary)" : "#651FFF"} /> {logo}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- PREMIUM SAAS FEATURE HIGHLIGHTS --- */}
        <section style={{ padding: '6rem 1rem', background: 'var(--bg-base)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <motion.h2
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: 'Outfit', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}
              >
                Intelligent Healthcare Routing
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}
              >
                Experience seamless access to emergency and elective care through our AI-driven insights platform.
              </motion.p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {[
                { icon: <MapPin size={32} color="var(--secondary)" />, title: 'Smart Location Matching', desc: 'Instantly discover the closest top-rated hospitals using real-time geolocation.' },
                { icon: <ShieldCheck size={32} color="var(--secondary)" />, title: 'Insurance Verification', desc: 'Instant eligibility checks for CMCHIS and corporate medical policies.' },
                { icon: <User size={32} color="var(--secondary)" />, title: 'AI Doctor Consultation', desc: 'Get preliminary diagnostic insights from our tuned medical models.' }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="glass-card"
                  style={{
                    padding: '2.5rem 2rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex', flexDirection: 'column', gap: '1rem',
                    position: 'relative', overflow: 'hidden'
                  }}
                >
                  <div style={{ background: 'var(--bg-accent)', padding: '16px', borderRadius: '16px', display: 'inline-block', width: 'fit-content' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', fontFamily: 'Outfit', fontWeight: 700, margin: '0.5rem 0' }}>{feature.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <style>{` .glass-card:hover .hover-glow { opacity: 1 !important; } `}</style>
        </section>

        <section style={{
          background: 'var(--bg-surface)',
          padding: '4rem 1rem',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid var(--border-light)',
          borderBottom: '1px solid var(--border-light)'
        }}>
          {/* Decorative background for stats */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(42, 125, 225, 0.05), transparent)', transform: 'skewX(-20deg)', animation: 'shimmer 4s infinite' }} />

          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={{ fontSize: '4rem', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>500<span style={{ color: 'var(--primary)' }}>+</span></div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500, marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Verified Hospitals</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div style={{ fontSize: '4rem', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>98<span style={{ color: 'var(--success)' }}>%</span></div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500, marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Accuracy</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div style={{ fontSize: '4rem', fontWeight: 900, fontFamily: 'Outfit', color: 'var(--text-primary)' }}>10k<span style={{ color: 'var(--primary)' }}>+</span></div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500, marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Consultations</div>
            </motion.div>
          </div>
        </section>

        <section style={{ padding: '0 2rem' }}>
          <HospitalList
            hospitals={hospitals}
            loading={loading}
            onConsult={handleConsult}
            userLocation={userLocation}
            activeInsuranceFilter={activeInsuranceFilter}
            onLocationUpdate={handleManualLocationUpdate}
            onFilterApply={handleFilterApply}
          />
        </section>
      </main>

      {/* Auth Modal (Login/Signup) */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />

      {/* Payment Modal */}
      <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} />

      {/* Panic Modal */}
      <PanicModal isOpen={showPanic} onClose={() => setShowPanic(false)} />

      {/* Profile Modal */}
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />

      {/* Floating Panic Button */}
      <motion.button
        onClick={() => setShowPanic(true)}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ scale: 1.05, boxShadow: '0 15px 25px -5px rgba(239, 68, 68, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'linear-gradient(135deg, var(--error) 0%, #B91C1C 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.4)',
          zIndex: 900,
          fontWeight: 800,
          fontFamily: 'Outfit',
          letterSpacing: '1px',
          cursor: 'pointer'
        }}
        className="animate-pulse"
      >
        <AlertTriangle size={24} />
        <span>PANIC MODE</span>
      </motion.button>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
        }
        @keyframes shimmer {
          0% { transform: skewX(-20deg) translateX(-150%); }
          100% { transform: skewX(-20deg) translateX(150%); }
        }
      `}</style>

      <footer style={{ padding: '4rem 2rem 2rem 2rem', background: 'var(--bg-surface)', color: 'var(--text-primary)', marginTop: '6rem', position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--border-strong)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--primary)' }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem' }}>
          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'Outfit', fontWeight: 800 }}>
              <div style={{ background: 'var(--bg-accent)', border: '1px solid var(--border-light)', padding: '6px', borderRadius: '8px' }}>
                <CheckCircle size={20} color="var(--primary)" />
              </div>
              Smart Hospital Tracker
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8' }}>Serving health needs with cutting-edge AI technology. Fast, reliable, and accessible healthcare for everyone.</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'Outfit' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', padding: 0 }}>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s', color: 'var(--text-secondary)' }} onMouseOver={(e) => e.target.style.color = 'var(--primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Find Hospitals</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s', color: 'var(--text-secondary)' }} onMouseOver={(e) => e.target.style.color = 'var(--primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Insurance Partners</li>
              <li style={{ cursor: 'pointer', transition: 'color 0.2s', color: 'var(--text-secondary)' }} onMouseOver={(e) => e.target.style.color = 'var(--primary)'} onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}>Doctor Consultation</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'Outfit' }}>Emergency</h4>
            <button className="primary-button" style={{ background: '#FEF2F2', color: 'var(--error)', width: '100%', border: '1px solid #FECACA', boxShadow: 'none' }} onClick={() => setShowPanic(true)}>
              Call 108 Emergency
            </button>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '4rem', paddingTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          © 2026 Smart Hospital Tracker. Built for excellence in healthcare.
        </div>
      </footer>

      <Chatbot
        onRadiusChange={handleRadiusChange}
        onSearch={handleSearch}
        userLocation={userLocation}
        onLocationUpdate={handleManualLocationUpdate}
      />
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
