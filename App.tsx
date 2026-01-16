
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FIBER_PACKAGES, HOTSPOT_PACKAGES, NETWORKING_SERVICES, CONSULTING_SERVICES } from './constants';
import { InternetPackage, AppView } from './types';
import AirAssistant from './components/AirAssistant';
import PaymentModal from './components/PaymentModal';
import TermsModal from './components/TermsModal';

const PORTAL_URL = "https://coolfixairtechnologies.centipidtechnologies.com/login";
const WHATSAPP_NUMBER = "254712156070";
const MAPS_URL = "https://www.google.com/maps/dir//Nairobi/@-1.2395534,36.9003507,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x182f152ff8dee4f9:0x5dd7036813bd8d66!2m2!1d36.8914904!2d-1.2397669";

const HQ_POSITION: [number, number] = [-1.2598, 36.8041];

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

  const handleWhatsAppRedirect = (message: string) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleOrder = (pkg: InternetPackage) => {
    const msg = `Hello Coolfix Air Technologies! I would like to provision the ${pkg.name} ${pkg.type} package (${pkg.speed || pkg.duration}) for KES ${pkg.price}. Please provide installation details.`;
    setAiAssistantQuery(`I am interested in provisioning the ${pkg.name} ${pkg.type} plan. Can you explain the Shield protection for this tier?`);
    handleWhatsAppRedirect(msg);
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

    // Simulate Network Latency / API Call
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
          <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full mb-10 backdrop-blur-2xl animate-in fade-in slide-in-from-top-8 duration-1000">
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
            <button 
              onClick={() => scrollToSection('residential')}
              className="w-full sm:w-auto px-12 py-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all shadow-[0_30px_60px_-15px_rgba(6,182,212,0.5)] active:scale-95 motion-btn-shimmer"
            >
              Provision Access
            </button>
            <button 
              onClick={() => scrollToSection('tracking')}
              className="w-full sm:w-auto px-12 py-6 bg-slate-900/50 hover:bg-slate-800 text-white border border-white/10 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all backdrop-blur-xl shadow-2xl"
            >
              Track Provisioning
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Shield Layer', icon: 'fa-shield-halved', val: 'Active', desc: 'AES-256 Packet Encryption' },
            { title: 'Latency (Avg)', icon: 'fa-microchip', val: '12ms', desc: 'Direct Peer routing' },
            { title: 'Up-Time', icon: 'fa-clock-rotate-left', val: '99.9%', desc: 'SLA Guaranteed' }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 flex flex-col items-center text-center space-y-6 group hover:border-cyan-500/30 transition-all duration-500 backdrop-blur-xl">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-3xl text-cyan-400 group-hover:scale-110 transition-transform shadow-inner">
                <i className={`fa-solid ${stat.icon}`}></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">{stat.title}</p>
                <h4 className="text-4xl font-black text-white">{stat.val}</h4>
                <p className="text-sm text-slate-400 font-medium mt-2">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const PackageCard = ({ pkg }: { pkg: InternetPackage }) => (
    <div key={pkg.id} className={`relative p-10 rounded-[3.5rem] bg-slate-900/60 border transition-all duration-700 flex flex-col h-full group ${pkg.isPopular ? 'border-cyan-500 shadow-[0_0_80px_-20px_rgba(6,182,212,0.4)] scale-105 z-10' : 'border-white/5 hover:border-white/10'}`}>
      {pkg.isPopular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-cyan-600 text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl">
          Elite Choice
        </div>
      )}
      <div className="mb-10 flex justify-between items-start">
        <div>
          <h4 className="text-slate-500 text-[11px] font-black uppercase tracking-widest mb-1">{pkg.name}</h4>
          <p className="text-4xl font-black text-white tracking-tighter">
            {pkg.type === 'Fiber' ? pkg.speed : pkg.duration}
          </p>
        </div>
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-cyan-500/50">
          <i className={`fa-solid ${pkg.type === 'Fiber' ? 'fa-house-signal' : 'fa-wifi'} `}></i>
        </div>
      </div>
      <div className="mb-10 flex items-baseline">
        <span className="text-slate-400 text-sm font-bold mr-2">KES</span>
        <span className="text-5xl font-black text-white tracking-tighter">{pkg.price.toLocaleString()}</span>
        <span className="text-slate-500 text-[11px] ml-3 font-black uppercase tracking-widest">
          {pkg.type === 'Fiber' ? '/ Mo' : ` / ${pkg.duration}`}
        </span>
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
        <button 
          onClick={() => handleProvisionAttempt(pkg)}
          className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 ${pkg.isPopular ? 'bg-cyan-600 text-white hover:bg-cyan-500' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
        >
          Provision Now
        </button>
        <button 
          onClick={() => handleOrder(pkg)}
          className="w-full py-5 rounded-2xl bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3"
        >
          <i className="fa-brands fa-whatsapp text-lg"></i>
          Order via WhatsApp
        </button>
      </div>
    </div>
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
            {FIBER_PACKAGES.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-4 mb-12">
            <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Hotspot Gateway</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {HOTSPOT_PACKAGES.map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
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
              <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40 grayscale group-hover:grayscale-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
            </div>
            <div className="p-12 space-y-8 relative -mt-20 bg-slate-900/60 backdrop-blur-3xl rounded-t-[4rem]">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-cyan-600/10 rounded-2xl flex items-center justify-center text-cyan-400 text-3xl group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-inner">
                  <i className={`fa-solid ${service.icon}`}></i>
                </div>
                <h3 className="text-3xl font-black text-white tracking-tight leading-none uppercase">{service.title}</h3>
              </div>
              <p className="text-lg text-slate-400 font-medium leading-relaxed">{service.desc}</p>
              <div className="flex flex-wrap gap-3">
                {service.specs.map((spec, j) => (
                  <span key={j} className="px-5 py-2 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {spec}
                  </span>
                ))}
              </div>
              <button 
                onClick={() => handleWhatsAppRedirect(`Hello! I am inquiring about ${service.title} services for my office/home.`)}
                className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10 transition-all"
              >
                Inquire Architecture
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
          <div key={i} className="p-16 bg-slate-900/40 border border-white/5 rounded-[4rem] hover:border-blue-500/50 transition-all duration-700 group flex flex-col items-center text-center shadow-3xl">
            <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] flex items-center justify-center text-blue-400 text-5xl mb-12 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
              <i className={`fa-solid ${service.icon}`}></i>
            </div>
            <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tight leading-tight">{service.title}</h3>
            <p className="text-slate-400 font-medium leading-relaxed mb-12 flex-1">{service.desc}</p>
            <button 
              onClick={() => handleWhatsAppRedirect(`I would like to book a strategic briefing for ${service.title}.`)}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95"
            >
              Book Briefing
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
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <i className="fa-solid fa-satellite-dish text-8xl text-emerald-500"></i>
          </div>

          <form onSubmit={handleTrackOrder} className="relative z-10 flex flex-col md:flex-row gap-6 mb-12">
            <input 
              type="text" 
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              placeholder="Enter Order ID (e.g. CF-ACT-001) or Phone" 
              className="flex-1 bg-slate-950/50 border border-white/10 rounded-3xl p-6 outline-none font-bold focus:border-emerald-500 transition-all text-white shadow-inner"
            />
            <button 
              disabled={isTracking}
              className="px-12 py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {isTracking ? <i className="fa-solid fa-circle-notch animate-spin mr-2"></i> : null}
              {isTracking ? 'Scanning...' : 'Track Activation'}
            </button>
          </form>

          {trackResult ? (
            <div className="animate-in fade-in zoom-in duration-500 space-y-12">
              <div className="grid grid-cols-3 gap-4 h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${trackResult.stage >= 1 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : ''}`}></div>
                <div className={`h-full transition-all duration-1000 ${trackResult.stage >= 2 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : ''}`}></div>
                <div className={`h-full transition-all duration-1000 ${trackResult.stage >= 3 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : ''}`}></div>
              </div>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4 shadow-lg ${
                  trackResult.status === 'Active' ? 'bg-emerald-600 text-white' : 
                  trackResult.status === 'In Progress' ? 'bg-cyan-600 text-white' : 
                  'bg-amber-600 text-white'
                }`}>
                  {trackResult.status}
                </div>
                <h4 className="text-3xl font-black text-white uppercase tracking-tight">{trackResult.message}</h4>
                <p className="text-slate-500 text-sm font-medium">Last Sync: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          ) : !isTracking && (
            <div className="py-20 flex flex-col items-center text-center opacity-30 grayscale pointer-events-none">
              <i className="fa-solid fa-radar text-6xl mb-6"></i>
              <p className="text-sm font-black uppercase tracking-[0.5em]">Awaiting Uplink Input</p>
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
        <p className="text-2xl text-slate-400 font-medium leading-relaxed max-w-3xl">Our engineering teams are ready to deploy your next high-speed environment. Connect via our backbone nodes below.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10 items-stretch">
        <div className="space-y-8 flex flex-col">
          <div className="group bg-slate-900/60 border border-white/5 p-10 rounded-[4rem] hover:border-cyan-500/30 transition-all duration-700 flex items-center gap-10 shadow-3xl flex-1">
            <div className="w-20 h-20 bg-cyan-600/10 rounded-3xl flex items-center justify-center text-cyan-400 text-3xl group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-inner">
              <i className="fa-solid fa-phone-volume"></i>
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Direct Command</p>
              <a href="tel:+254712156070" className="text-4xl font-black text-white hover:text-cyan-400 transition-colors tracking-tighter">0712 156 070</a>
            </div>
          </div>

          <div 
            className="group bg-slate-900/60 border border-white/5 p-10 rounded-[4rem] hover:border-emerald-500/30 transition-all duration-700 flex items-center gap-10 cursor-pointer shadow-3xl flex-1" 
            onClick={() => handleWhatsAppRedirect("Hello Coolfix Air! I require urgent technical support.")}
          >
            <div className="w-20 h-20 bg-emerald-600/10 rounded-3xl flex items-center justify-center text-emerald-400 text-3xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
              <i className="fa-brands fa-whatsapp"></i>
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">WhatsApp Gateway</p>
              <p className="text-4xl font-black text-white group-hover:text-emerald-400 transition-colors tracking-tighter uppercase">Automated Agent</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/5 p-10 rounded-[4rem] flex flex-col gap-6 shadow-3xl flex-[1.5] relative overflow-hidden group">
            <div className="flex items-center gap-6 z-10">
              <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                <i className="fa-solid fa-map-location-dot"></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Satellite HQ</p>
                <p className="text-xl font-black text-white uppercase tracking-tight">Westlands, Nairobi</p>
              </div>
            </div>
            
            <div className="flex-1 w-full min-h-[250px] relative rounded-[2.5rem] overflow-hidden border border-white/5 mt-4">
              <MapContainer 
                center={HQ_POSITION} 
                zoom={14} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={HQ_POSITION} icon={L.divIcon({
                  className: 'custom-div-icon',
                  html: `
                    <div style="position: relative; width: 40px; height: 40px;">
                      <div style="position: absolute; inset: 0; background: #06b6d4; opacity: 0.3; border-radius: 50%; animation: pulse 2s infinite;"></div>
                      <div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px; background: #fff; border: 3px solid #06b6d4; border-radius: 50%; box-shadow: 0 0 10px #06b6d4;"></div>
                    </div>
                  `,
                  iconSize: [40, 40],
                  iconAnchor: [20, 20]
                })}>
                  <Popup className="custom-popup">
                    <div className="text-slate-900 p-2">
                      <p className="font-black text-xs uppercase tracking-widest mb-1">Coolfix HQ</p>
                      <p className="text-[10px] font-medium opacity-80">Strategic Infrastructure Node</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
              <button 
                onClick={() => window.open(MAPS_URL, '_blank')}
                className="absolute bottom-4 right-4 z-[1000] bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-xl active:scale-95"
              >
                Open Nav
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-12 md:p-20 rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden group h-full">
          <div className="absolute top-0 right-0 p-12 hidden md:block">
            <div className="flex items-center space-x-3 bg-emerald-500/10 px-5 py-2 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">Backbone Live</span>
            </div>
          </div>
          
          <div className="mb-12">
            <h3 className="text-5xl font-black text-white mb-4 tracking-tight uppercase">Deploy Request</h3>
            <p className="text-slate-500 font-medium">Initialize your infrastructure requirements for precision evaluation.</p>
          </div>

          <form className="grid md:grid-cols-2 gap-10" onSubmit={(e) => { e.preventDefault(); handleWhatsAppRedirect("Automated site audit request initiated from web portal."); }}>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] ml-3">Client Identity</label>
                <input type="text" placeholder="Your Name / Organization" className="w-full bg-slate-950/50 border border-white/10 rounded-3xl p-6 outline-none font-bold focus:border-cyan-500 transition-all text-white shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] ml-3">Contact Payload</label>
                <input type="email" placeholder="Email or Phone Number" className="w-full bg-slate-950/50 border border-white/10 rounded-3xl p-6 outline-none font-bold focus:border-cyan-500 transition-all text-white shadow-inner" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] ml-3">Service Modality</label>
                <select className="w-full bg-slate-950/50 border border-white/10 rounded-3xl p-6 outline-none font-bold focus:border-cyan-500 transition-all text-white appearance-none shadow-inner">
                  <option>Residential Precision Fiber</option>
                  <option>Enterprise Infrastructure</option>
                  <option>Network Security Audit</option>
                  <option>Cloud Architecture Strategy</option>
                </select>
              </div>
            </div>
            <div className="space-y-8 flex flex-col">
              <div className="space-y-3 flex-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] ml-3">Deployment Brief</label>
                <textarea placeholder="Describe your technical requirements..." className="w-full h-full bg-slate-950/50 border border-white/5 rounded-3xl p-6 outline-none font-bold focus:border-cyan-500 transition-all text-white resize-none shadow-inner min-h-[200px]"></textarea>
              </div>
              <button className="w-full py-7 rounded-[2rem] bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-[0.4em] text-xs shadow-3xl transition-all active:scale-95 motion-btn-shimmer">
                Dispatch Command
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-700 ${isScrolled ? 'bg-slate-950/90 backdrop-blur-3xl py-5 border-b border-white/5 shadow-2xl' : 'bg-transparent py-10'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center md:hidden">
            <i className="fa-solid fa-tower-broadcast text-white"></i>
          </div>

          <div className="hidden md:flex flex-1 justify-center items-center space-x-14">
            {[
              { id: 'home', label: 'Backbone' },
              { id: 'residential', label: 'Access' },
              { id: 'networking', label: 'Infrastructure' },
              { id: 'consulting', label: 'Strategy' },
              { id: 'tracking', label: 'Tracking' },
              { id: 'contact', label: 'Contact' },
            ].map((link) => (
              <button 
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:text-cyan-400 relative py-2 ${activeSection === link.id ? 'text-cyan-400' : 'text-slate-500'}`}
              >
                {link.label}
                {activeSection === link.id && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 rounded-full animate-in zoom-in duration-500"></span>}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
             <button 
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${isVoiceEnabled ? 'bg-cyan-600/10 border-cyan-500/50 text-cyan-400' : 'bg-white/5 border-white/10 text-slate-500'}`}
                title={isVoiceEnabled ? "Mute Global Voice" : "Unmute Global Voice"}
              >
                <i className={`fa-solid ${isVoiceEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
              </button>
            <a 
              href={PORTAL_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all backdrop-blur-md shadow-inner hidden sm:block"
            >
              Control Hub
            </a>
          </div>
          
          <button className="md:hidden text-white text-2xl w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'}`}></i>
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[55] bg-slate-950/98 backdrop-blur-3xl p-10 pt-40 flex flex-col space-y-10 animate-in slide-in-from-right duration-500">
          {[
            { id: 'home', label: 'Backbone' },
            { id: 'residential', label: 'Access' },
            { id: 'networking', label: 'Infrastructure' },
            { id: 'consulting', label: 'Strategy' },
            { id: 'tracking', label: 'Tracking' },
            { id: 'contact', label: 'Contact' },
          ].map(v => (
            <button key={v.id} onClick={() => scrollToSection(v.id)} className={`text-5xl font-black uppercase tracking-tighter text-left ${activeSection === v.id ? 'text-cyan-500' : 'text-white/60'}`}>{v.label}</button>
          ))}
          <a href={PORTAL_URL} className="text-sm font-black text-cyan-500 uppercase tracking-[0.5em] mt-20">Access Portal</a>
        </div>
      )}

      <main className="animate-in fade-in duration-1000">
        {renderHome()}
        {renderResidential()}
        {renderNetworking()}
        {renderConsulting()}
        {renderTracking()}
        {renderContact()}
      </main>

      <footer className="bg-slate-950 border-t border-white/5 py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-32 text-center md:text-left">
            <div className="col-span-1 md:col-span-2 space-y-12">
              <div className="flex items-center justify-center md:justify-start space-x-4">
                <div className="w-14 h-14 bg-cyan-600 rounded-2xl flex items-center justify-center shadow-3xl">
                  <i className="fa-solid fa-tower-broadcast text-white text-2xl"></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Coolfix Air</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-1 leading-none">Technologies</span>
                </div>
              </div>
              <p className="text-slate-500 font-medium max-w-sm mx-auto md:mx-0 leading-relaxed text-lg">
                Elite high-speed access and cloud network engineering. Certified Westlands provider since 2018.
              </p>
              <div className="flex justify-center md:justify-start gap-5">
                {['facebook', 'twitter', 'linkedin', 'instagram'].map(s => (
                  <button key={s} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-cyan-600 transition-all shadow-xl">
                    <i className={`fa-brands fa-${s}`}></i>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-[11px] font-black text-white uppercase tracking-[0.5em] mb-12">Protocol Links</h5>
              <ul className="space-y-6">
                {['Fiber Tiers', 'Hotspot Node', 'Tracking', 'Infrastructure'].map(l => (
                  <li key={l}>
                    <button 
                      onClick={() => {
                        const target = l === 'Tracking' ? 'tracking' : (l === 'Fiber Tiers' || l === 'Hotspot Node') ? 'residential' : 'networking';
                        scrollToSection(target);
                      }} 
                      className="text-sm font-bold text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest text-left"
                    >
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-10">
              <h5 className="text-[11px] font-black text-white uppercase tracking-[0.5em] mb-12">Command Ops</h5>
              <div className="space-y-6">
                <div className="flex items-center justify-center md:justify-start gap-5 group cursor-pointer" onClick={() => handleWhatsAppRedirect("Command inquiry from footer.")}>
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-all"><i className="fa-solid fa-phone-volume"></i></div>
                  <span className="text-sm font-black text-slate-400 group-hover:text-white transition-colors">0712 156 070</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-5 group cursor-pointer" onClick={() => window.open(MAPS_URL, '_blank')}>
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-all"><i className="fa-solid fa-location-dot"></i></div>
                  <span className="text-sm font-black text-slate-400 group-hover:text-white transition-colors">WESTLANDS HQ</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] gap-8">
            <p>&copy; 2024 COOLFIX AIR TECHNOLOGIES. DEPLOYED IN KENYA.</p>
            <div className="flex space-x-12">
              <button className="hover:text-white transition-colors">Security Protocol</button>
              <button className="hover:text-white transition-colors">Privacy Shield</button>
            </div>
          </div>
        </div>
      </footer>

      {pendingPkgTerms && (
        <TermsModal 
          onAccept={() => {
            setHasAcceptedTerms(true);
            setSelectedPkg(pendingPkgTerms);
            setPendingPkgTerms(null);
          }}
          onClose={() => setPendingPkgTerms(null)}
        />
      )}

      {selectedPkg && (
        <PaymentModal 
          pkg={selectedPkg} 
          onClose={() => setSelectedPkg(null)} 
          onSuccess={() => setSelectedPkg(null)} 
        />
      )}

      <AirAssistant 
        externalQuery={aiAssistantQuery} 
        onQueryHandled={() => setAiAssistantQuery(null)} 
        isVoiceEnabled={isVoiceEnabled}
        onVoiceToggle={setIsVoiceEnabled}
      />
    </div>
  );
};

export default App;
