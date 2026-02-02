import React, { useState, useEffect } from 'react';
import { useLanguage, LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HospitalList from './components/HospitalList';
import AuthModal from './components/AuthModal';
import Chatbot from './components/Chatbot';
import { getHospitals, searchHospitalsByIssue } from './services/dataService';
import { CheckCircle, CreditCard, X } from 'lucide-react';
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
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(null); // in KM
  const [currentQuery, setCurrentQuery] = useState('');

  // Initial fetch (randomized until location is found)
  useEffect(() => {
    const fetchDefault = async () => {
      let data = await getHospitals(userLocation);
      if (searchRadius && userLocation) {
        data = data.filter(h => h.distance <= searchRadius);
      }
      setHospitals(data);
      setLoading(false);
    };
    fetchDefault();
  }, [userLocation, searchRadius]);

  const handleLocationUpdate = (location) => {
    console.log("Location updated:", location);
    setUserLocation(location);
  };

  const handleSearch = async (issue) => {
    setLoading(true);
    setCurrentQuery(issue);
    let results = await searchHospitalsByIssue(issue, userLocation);
    if (searchRadius && userLocation) {
      results = results.filter(h => h.distance <= searchRadius);
    }
    setHospitals(results);
    setLoading(false);
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const handleRadiusChange = (radius) => {
    setSearchRadius(radius);
    // Filtering happens in useEffect
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
      <Navbar onLoginClick={() => setShowAuth(true)} isLogged={isAuthenticated} userName={user?.name} />

      <main>
        <Hero
          onSearch={handleSearch}
          onLocationUpdate={handleLocationUpdate}
        />

        <div style={{ background: 'var(--primary)', color: 'white', padding: '2rem 1rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>500+</div>
              <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>Verified Hospitals in TN</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>98%</div>
              <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>Response Accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>10k+</div>
              <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>Monthly Consultations</div>
            </div>
          </div>
        </div>

        <section style={{ padding: '0 2rem' }}>
          <HospitalList
            hospitals={hospitals}
            loading={loading}
            onConsult={handleConsult}
          />
        </section>
      </main>

      {/* Auth Modal (Login/Signup) */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />

      {/* Payment Modal */}
      <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} />

      <footer style={{ padding: '4rem 2rem', background: '#0F172A', color: 'white', marginTop: '4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem' }}>
          <div>
            <h3 style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>TN Health AI</h3>
            <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Serving the health needs of Tamil Nadu with cutting-edge AI technology.</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', spaceY: '0.5rem', opacity: 0.6, fontSize: '0.9rem' }}>
              <li>Find Hospitals</li>
              <li>Insurance Partners</li>
              <li>Doctor Consultation</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Emergency</h4>
            <button className="primary-button" style={{ background: 'var(--error)', width: '100%', border: 'none' }}>
              Call 108 Emergency
            </button>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '4rem', paddingTop: '2rem', textAlign: 'center', opacity: 0.4, fontSize: '0.8rem' }}>
          © 2026 TN Health AI Platform. Built for excellence in healthcare.
        </div>
      </footer>

      <Chatbot
        onRadiusChange={handleRadiusChange}
        onSearch={handleSearch}
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
