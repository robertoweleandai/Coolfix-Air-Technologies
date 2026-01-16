
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FIBER_PACKAGES, HOTSPOT_PACKAGES, NETWORKING_SERVICES, CONSULTING_SERVICES } from './constants';
import { InternetPackage, AppView } from './types';
import AirAssistant from './components/AirAssistant';
import PaymentModal from './components/PaymentModal';
import TermsModal from './components/TermsModal';

const PORTAL_URL = "https://coolfixairtechnologies.centipidtechnologies.com/login";
const HQ_POSITION: [number, number] = [-1.2598, 36.8041];

// Defining PackageCard outside to avoid re-creation on every render and fix TS key prop errors
interface PackageCardProps {
  pkg: InternetPackage;
  onProvision: (pkg: InternetPackage) => void;
  onOrder: (pkg: InternetPackage) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onProvision, onOrder }) => (
  <div className={`relative p-10 rounded-[3.5rem] bg-slate-900/60 border transition-all duration-700 flex flex-col h-full group ${pkg.isPopular ? 'border-cyan-500 shadow-[0_0_80px_-20px_rgba(6,182,212,0.4)] scale-105 z-10' : 'border-white/5 hover:border-white/10'}`}>
    <div className="mb-10 flex justify-between items-start">
      <div>
        <h4 className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-1">{pkg.name}</h4>
        <p className="text-4xl font-black text-white tracking-tighter">{pkg.type === 'Fiber' ? pkg.speed : pkg.duration}</p>
      </div>
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-cyan-500/50">
        <i className={`fa-solid ${pkg.type === 'Fiber' ? 'fa-house-signal' : 'fa-wifi'} `}></i>
      </div>
    </div>
    <div className="mb-10 flex items-baseline">
      <span className="text-slate-400 text-sm font-bold mr-2">KES</span>
      <span className="text-5xl font-black text-white tracking-tighter">{pkg.price.toLocaleString()}</span>
      <span className="text-slate-500 text-[11px] ml-3 font-black uppercase tracking-widest">{pkg.type === 'Fiber' ? '/ Mo' : ` / ${pkg.duration}`}</span>
    </div>
    <ul className="space-y-5 mb-12 flex-1">
      {pkg.features.map((f, i) => (
        <li key={i} className="flex items-center text-sm font-medium text-slate-400">
          <div className="w-5 h-5 bg-cyan-500/10 rounded-full flex items-center justify-center mr-4">
            <i className="fa-solid fa-check text-cyan-400 text-[8px]"></i>
          </div>
          {f}
        </li>
      ))}
    </ul>
    <div className="space-y-4">
      <button onClick={() => onProvision(pkg)} className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 ${pkg.isPopular ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
        Provision Now
      </button>
      <button onClick={() => onOrder(pkg)} className="w-full py-5 rounded-2xl bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3">
        <i className="fa-brands fa-whatsapp text-lg"></i>
        WhatsApp Gateway
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppView>('home');
  const [selectedPkg, setSelectedPkg] = useState<InternetPackage | null>(null);
  const [pendingPkgTerms, setPendingPkgTerms] = useState<InternetPackage | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [aiAssistantQuery, setAiAssistantQuery] = useState<string | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  // Tracking State
  const [trackId, setTrackId] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackResult, setTrackResult] = useState<{status: string, message: string, stage: number} | null>(null);
  const [displayStage, setDisplayStage] = useState(0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id as AppView);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sectionIds = ['home', 'residential', 'networking', 'consulting', 'tracking', 'contact'];
    
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (trackResult && displayStage < trackResult.stage) {
      const timer = setTimeout(() => {
        setDisplayStage(prev => prev + 1);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [trackResult, displayStage]);

  const handleWhatsAppGateway = (message: string) => {
    // Instead of opening WhatsApp directly, we route through the internal AI triage first
    setAiAssistantQuery(`[WhatsApp Gateway Intent]: ${message}`);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleOrder = (pkg: InternetPackage) => {
    handleWhatsAppGateway(`I would like to provision the ${pkg.name} ${pkg.type} package (${pkg.speed || pkg.duration}) for KES ${pkg.price}.`);
  };

  const handleProvisionAttempt = (pkg: InternetPackage) => {
    if (hasAcceptedTerms) {
      setSelectedPkg(pkg);
    } else {
      setPendingPkgTerms(pkg);
    }
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId) return;
    setIsTracking(true);
    setTrackResult(null);
    setDisplayStage(0);
    setTimeout(() => {
      setIsTracking(false);
      const cleanId = trackId.toUpperCase();
      if (cleanId.startsWith('CF-ACT')) {
        setTrackResult({ status: 'Active', message: 'Service activated on Backbone Node. Fully Operational.', stage: 3 });
      } else if (cleanId.startsWith('07') || cleanId.startsWith('+254')) {
        setTrackResult({ status: 'In Progress', message: 'Field Engineer dispatched for physical termination.', stage: 2 });
      } else {
        setTrackResult({ status: 'Pending Activation', message: 'Payment verified. Provisioning node in queue.', stage: 1 });
      }
    }, 2000);
  };

  const renderHome = () => (
    <section id="home" className="space-y-32 pb-32">
      <div className="relative h-[95vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 opacity-60"></div>
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-20 mix-blend-overlay scale-110 animate-[pulse_10s_infinite]" 
            alt="Data Center"
          />
        </div>
        <div className="relative z-10 text-center max-w-5xl px-6">
          <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-10 backdrop-blur-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Centipid Node: Nairobi Active</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-white mb-10 tracking-tighter leading-[0.85] uppercase">
            Precision <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">Fiber.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
            Pioneering digital infrastructure with high-fidelity fiber, Cloud Network engineering, and premium IT services.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <button onClick={() => scrollToSection('residential')} className="w-full sm:w-auto px-12 py-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all shadow-[0_30px_60px_-15px_rgba(6,182,212,0.5)] active:scale-95 motion-btn-shimmer">
              Provision Access
            </button>
            <button onClick={() => scrollToSection('tracking')} className="w-full sm:w-auto px-12 py-6 bg-slate-900/50 hover:bg-slate-800 text-white border border-white/10 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all backdrop-blur-xl shadow-2xl">
              Track Provisioning
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderResidential = () => (
    <section id="residential" className="pt-40 pb-32 container mx-auto px-6">
      <div className="mb-24 text-center">
        <h2 className="text-6xl font-black text-white mb-8 tracking-tighter uppercase leading-none">High-Fidelity <span className="text-cyan-500">Access.</span></h2>
        <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">Select your connection terminal. All plans feature direct backbone routing and automated security layers.</p>
      </div>
      <div className="space-y-32">
        <div>
          <div className="flex items-center gap-4 mb-12">
            <div className="w-1.5 h-8 bg-cyan-500 rounded-full"></div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Fiber Optics</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FIBER_PACKAGES.map((pkg) => (
              <PackageCard 
                key={pkg.id} 
                pkg={pkg} 
                onProvision={handleProvisionAttempt} 
                onOrder={handleOrder} 
              />
            ))}
          </div>
        </div>
        
        {/* Hotspot Section */}
        <div>
          <div className="flex items-center gap-4 mb-12">
            <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Hotspot Nodes</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {HOTSPOT_PACKAGES.map((pkg) => (
              <PackageCard 
                key={pkg.id} 
                pkg={pkg} 
                onProvision={handleProvisionAttempt} 
                onOrder={handleOrder} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const renderNetworking = () => (
    <section id="networking" className="pt-40 pb-32 container mx-auto px-6">
      <div className="mb-24 text-center md:text-left">
        <h2 className="text-6xl font-black text-white mb-8 tracking-tighter uppercase leading-none">Infrastructure <br /><span className="text-cyan-500">Engineering.</span></h2>
        <p className="text-xl text-slate-400 font-medium max-w-3xl leading-relaxed">Precision hardware and software deployments for high-fidelity connectivity.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {NETWORKING_SERVICES.map((service, i) => (
          <div key={i} className="group relative bg-slate-900/40 border border-white/5 rounded-[4rem] overflow-hidden hover:border-cyan-500/50 transition-all duration-700 shadow-2xl">
            <div className="aspect-video overflow-hidden relative">
              <img src={service.image} alt={service.title} className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
            </div>
            <div className="p-12 space-y-8 relative -mt-20 bg-slate-900/60 backdrop-blur-3xl rounded-t-[4rem]">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-cyan-600/10 rounded-2xl flex items-center justify-center text-cyan-400 text-3xl shadow-inner">
                  <i className={`fa-solid ${service.icon}`}></i>
                </div>
                <h3 className="text-3xl font-black text-white tracking-tight leading-none uppercase">{service.title}</h3>
              </div>
              <p className="text-lg text-slate-400 font-medium leading-relaxed">{service.desc}</p>
              <button onClick={() => handleWhatsAppGateway(`I am inquiring about ${service.title} services.`)} className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10 transition-all">
                Inquire via Gateway
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderConsulting = () => (
    <section id="consulting" className="pt-40 pb-32 container mx-auto px-6">
      <div className="mb-24 text-center">
        <h2 className="text-6xl font-black text-white mb-8 tracking-tighter uppercase leading-none">Strategic <br /><span className="text-blue-500">Advisory.</span></h2>
        <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">Elite IT consulting and cloud architecture for the Kenyan digital landscape.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {CONSULTING_SERVICES.map((service, i) => (
          <div key={i} className="p-16 bg-slate-900/40 border border-white/5 rounded-[4rem] flex flex-col items-center text-center shadow-3xl">
            <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center text-blue-400 text-5xl mb-12 shadow-inner">
              <i className={`fa-solid ${service.icon}`}></i>
            </div>
            <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tight leading-tight">{service.title}</h3>
            <p className="text-slate-400 font-medium leading-relaxed mb-12 flex-1">{service.desc}</p>
            <button onClick={() => handleWhatsAppGateway(`I would like to book a strategic briefing for ${service.title}.`)} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl">
              Book via Gateway
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  const renderTracking = () => (
    <section id="tracking" className="pt-40 pb-32 container mx-auto px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-20">
          <h2 className="text-6xl font-black text-white mb-8 tracking-tighter uppercase leading-none">Provision <span className="text-emerald-500">Tracking.</span></h2>
          <p className="text-xl text-slate-400 font-medium leading-relaxed">Scan the Centipid backbone for your node activation status.</p>
        </div>
        <div className="bg-slate-900/60 border border-white/5 p-12 rounded-[4rem] shadow-3xl relative overflow-hidden">
          <form onSubmit={handleTrackOrder} className="relative z-10 flex flex-col md:flex-row gap-6 mb-12">
            <input 
              type="text" 
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              placeholder="Enter Order ID or Phone" 
              className="flex-1 bg-slate-950/50 border border-white/10 rounded-3xl p-6 outline-none font-bold text-white shadow-inner"
            />
            <button disabled={isTracking} className="px-12 py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50">
              {isTracking ? 'Scanning...' : 'Track Activation'}
            </button>
          </form>
          {trackResult && (
            <div className="animate-in fade-in space-y-12">
              <div className="grid grid-cols-3 gap-4 h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${displayStage >= 1 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : ''}`}></div>
                <div className={`h-full transition-all duration-1000 ${displayStage >= 2 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : ''}`}></div>
                <div className={`h-full transition-all duration-1000 ${displayStage >= 3 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : ''}`}></div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4 shadow-lg ${displayStage >= trackResult.stage ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  {displayStage >= trackResult.stage ? trackResult.status : 'Evaluating node...'}
                </div>
                <h4 className="text-3xl font-black text-white uppercase tracking-tight h-10">{displayStage >= trackResult.stage ? trackResult.message : ''}</h4>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  const renderContact = () => (
    <section id="contact" className="pt-44 pb-32 container mx-auto px-6">
      <div className="mb-16">
        <h2 className="text-7xl md:text-9xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.85]">Mission <br /><span className="text-cyan-500">Control.</span></h2>
        <p className="text-2xl text-slate-400 font-medium leading-relaxed max-w-3xl">Our engineering teams are ready to deploy your next high-speed environment.</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-10 items-stretch">
        <div className="space-y-8 flex flex-col">
          <div className="group bg-slate-900/60 border border-white/5 p-10 rounded-[4rem] flex items-center gap-10 shadow-3xl flex-1">
            <div className="w-20 h-20 bg-cyan-600/10 rounded-3xl flex items-center justify-center text-cyan-400 text-3xl shadow-inner">
              <i className="fa-solid fa-phone-volume"></i>
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Direct Command</p>
              <a href="tel:+254712156070" className="text-4xl font-black text-white hover:text-cyan-400 tracking-tighter">0712 156 070</a>
            </div>
          </div>
          <div onClick={() => handleWhatsAppGateway("Support request initiated from mission control.")} className="group bg-slate-900/60 border border-white/5 p-10 rounded-[4rem] flex items-center gap-10 cursor-pointer shadow-3xl flex-1">
            <div className="w-20 h-20 bg-emerald-600/10 rounded-3xl flex items-center justify-center text-emerald-400 text-3xl shadow-inner">
              <i className="fa-brands fa-whatsapp"></i>
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">WhatsApp Gateway</p>
              <p className="text-4xl font-black text-white group-hover:text-emerald-400 uppercase tracking-tighter">Automated Agent</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-700 ${isScrolled ? 'bg-slate-950/90 backdrop-blur-3xl py-5 border-b border-white/5 shadow-2xl' : 'bg-transparent py-10'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="hidden md:flex flex-1 justify-center items-center space-x-14">
            {['home', 'residential', 'networking', 'consulting', 'tracking', 'contact'].map(id => (
              <button key={id} onClick={() => scrollToSection(id)} className={`text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:text-cyan-400 ${activeSection === id ? 'text-cyan-400' : 'text-slate-500'}`}>
                {id}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-4">
             <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${isVoiceEnabled ? 'bg-cyan-600/10 border-cyan-500/50 text-cyan-400' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                <i className={`fa-solid ${isVoiceEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
              </button>
            <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hidden sm:block">Control Hub</a>
          </div>
        </div>
      </nav>
      <main className="animate-in fade-in duration-1000">
        {renderHome()}
        {renderResidential()}
        {renderNetworking()}
        {renderConsulting()}
        {renderTracking()}
        {renderContact()}
      </main>
      <footer className="bg-slate-950 border-t border-white/5 py-32 text-center md:text-left">
        <div className="container mx-auto px-6">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">&copy; 2024 COOOLFIX AIR TECHNOLOGIES. DEPLOYED IN KENYA.</p>
        </div>
      </footer>
      {pendingPkgTerms && <TermsModal onAccept={() => { setHasAcceptedTerms(true); setSelectedPkg(pendingPkgTerms); setPendingPkgTerms(null); }} onClose={() => setPendingPkgTerms(null)} />}
      {selectedPkg && <PaymentModal pkg={selectedPkg} onClose={() => setSelectedPkg(null)} onSuccess={() => setSelectedPkg(null)} />}
      <AirAssistant externalQuery={aiAssistantQuery} onQueryHandled={() => setAiAssistantQuery(null)} isVoiceEnabled={isVoiceEnabled} onVoiceToggle={setIsVoiceEnabled} />
    </div>
  );
};

export default App;
