
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FIBER_PACKAGES, HOTSPOT_PACKAGES, NETWORKING_SERVICES, CONSULTING_SERVICES } from './constants';
import { InternetPackage, AppView } from './types';
import AirAssistant from './components/AirAssistant';
import PaymentModal from './components/PaymentModal';
import TermsModal from './components/TermsModal';

const PORTAL_URL = "https://coolfixairtechnologies.centipidtechnologies.com/login";
const HQ_POSITION: [number, number] = [-1.2598, 36.8041];

const INITIAL_TECHS = [
  { id: 1, pos: [-1.2550, 36.8080] as [number, number], name: "Tech Alpha - Node 04" },
  { id: 2, pos: [-1.2650, 36.7950] as [number, number], name: "Tech Bravo - Sector Delta" },
  { id: 3, pos: [-1.2500, 36.7900] as [number, number], name: "Tech Gamma - Backbone Sync" },
];

const hqIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-10 h-10 bg-cyan-600 rounded-full border-4 border-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.8)] flex items-center justify-center text-white text-[10px] font-black animate-pulse">HQ</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const techIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.6)] flex items-center justify-center text-white text-[8px] font-black"><i class="fa-solid fa-truck-fast"></i></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

/**
 * Added key to PackageCardProps to resolve TypeScript error on lines 260 and 276
 */
interface PackageCardProps {
  key?: React.Key;
  pkg: InternetPackage;
  onProvision: (pkg: InternetPackage) => void;
  onOrder: (pkg: InternetPackage) => void;
}

const PackageCard = ({ pkg, onProvision, onOrder }: PackageCardProps) => (
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

const App = () => {
  const [activeSection, setActiveSection] = useState<AppView>('home');
  const [selectedPkg, setSelectedPkg] = useState<InternetPackage | null>(null);
  const [pendingPkgTerms, setPendingPkgTerms] = useState<InternetPackage | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [aiAssistantQuery, setAiAssistantQuery] = useState<string | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  const [technicians, setTechnicians] = useState(INITIAL_TECHS);
  const [formSent, setFormSent] = useState(false);

  const [trackId, setTrackId] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackResult, setTrackResult] = useState<{status: string, message: string, stage: number} | null>(null);
  const [displayStage, setDisplayStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTechnicians(current => 
        current.map(tech => ({
          ...tech,
          pos: [
            tech.pos[0] + (Math.random() - 0.5) * 0.0005,
            tech.pos[1] + (Math.random() - 0.5) * 0.0005
          ]
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
    setAiAssistantQuery(`[WhatsApp Gateway Intent]: ${message}`);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => setFormSent(false), 5000);
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
      <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="max-w-4xl">
          <h2 className="text-7xl md:text-9xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.85]">Mission <br /><span className="text-cyan-500">Control.</span></h2>
          <p className="text-2xl text-slate-400 font-medium leading-relaxed">Initialize deployment protocols or escalate critical node inquiries to our engineering terminal. Real-time fleet tracking active.</p>
        </div>
        <div className="flex items-center gap-6 bg-slate-900/40 border border-white/5 p-6 rounded-[2.5rem] backdrop-blur-xl">
           <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Team" className="w-full h-full object-cover" />
                </div>
              ))}
           </div>
           <div>
              <p className="text-xs font-black text-white uppercase tracking-widest">Active Fleet</p>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1">3 Field Engineers Live</p>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 bg-slate-900/60 border border-white/5 rounded-[4rem] p-12 shadow-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10">
            <i className="fa-solid fa-satellite text-cyan-500/10 text-7xl group-hover:text-cyan-500/20 transition-all duration-1000 group-hover:rotate-12"></i>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Deployment Briefing</h3>
            </div>
            
            {formSent ? (
              <div className="py-24 flex flex-col items-center text-center animate-in zoom-in duration-500">
                <div className="w-28 h-28 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-5xl mb-10 shadow-[0_0_40px_rgba(16,185,129,0.2)] border border-emerald-500/20">
                  <i className="fa-solid fa-satellite-dish animate-bounce"></i>
                </div>
                <h4 className="text-3xl font-black text-white mb-4 tracking-tighter">Handshake Successful</h4>
                <p className="text-slate-400 font-medium max-w-sm mx-auto">Packet received. A field engineer will synchronize with your sector shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-10">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-6">Subscriber Name</label>
                    <input required type="text" placeholder="John Doe" className="w-full bg-slate-950/50 border border-white/5 rounded-3xl py-6 px-10 text-white outline-none focus:border-cyan-500/50 transition-all font-bold placeholder:text-slate-700" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-6">Target Sector</label>
                    <input required type="text" placeholder="e.g. Westlands HQ" className="w-full bg-slate-950/50 border border-white/5 rounded-3xl py-6 px-10 text-white outline-none focus:border-cyan-500/50 transition-all font-bold placeholder:text-slate-700" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-6">Uplink Terminal (Phone)</label>
                    <input required type="tel" placeholder="+254 7XX XXX XXX" className="w-full bg-slate-950/50 border border-white/5 rounded-3xl py-6 px-10 text-white outline-none focus:border-cyan-500/50 transition-all font-bold placeholder:text-slate-700" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-6">Request Protocol</label>
                    <select className="w-full bg-slate-950/50 border border-white/5 rounded-3xl py-6 px-10 text-white outline-none focus:border-cyan-500/50 transition-all font-bold appearance-none cursor-pointer">
                      <option className="bg-slate-900">Fiber Residential</option>
                      <option className="bg-slate-900">Business Enterprise</option>
                      <option className="bg-slate-900">Infrastructure Splicing</option>
                      <option className="bg-slate-900">Strategic Consulting</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-6">Mission Directives</label>
                  <textarea rows={4} placeholder="Specify bandwidth requirements or site technicalities..." className="w-full bg-slate-950/50 border border-white/5 rounded-[2.5rem] py-8 px-10 text-white outline-none focus:border-cyan-500/50 transition-all font-bold placeholder:text-slate-700"></textarea>
                </div>
                <button type="submit" className="w-full py-7 bg-cyan-600 hover:bg-cyan-500 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.5em] shadow-2xl transition-all active:scale-95 motion-btn-shimmer border border-cyan-400/20">
                  Transmit Request
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-8">
            <a href="tel:0712156070" className="group bg-slate-900/60 border border-white/5 p-12 rounded-[4rem] flex items-center gap-10 shadow-3xl transition-all hover:border-cyan-500/50 hover:bg-slate-900/80 active:scale-95">
              <div className="w-20 h-20 bg-cyan-600/10 rounded-3xl flex items-center justify-center text-cyan-400 text-4xl shadow-inner group-hover:bg-cyan-500/20 transition-all group-hover:rotate-12">
                <i className="fa-solid fa-phone-volume"></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2">Primary Uplink</p>
                <span className="text-3xl font-black text-white group-hover:text-cyan-400 tracking-tighter transition-colors">0712 156 070</span>
              </div>
            </a>
            
            <div onClick={() => handleWhatsAppGateway("Direct node inquiry from Mission Control terminal.")} className="group bg-slate-900/60 border border-white/5 p-12 rounded-[4rem] flex items-center gap-10 cursor-pointer shadow-3xl transition-all hover:border-emerald-500/50 hover:bg-slate-900/80 active:scale-95">
              <div className="w-20 h-20 bg-emerald-600/10 rounded-3xl flex items-center justify-center text-emerald-400 text-4xl shadow-inner group-hover:bg-emerald-500/20 transition-all group-hover:-rotate-12">
                <i className="fa-brands fa-whatsapp"></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2">Automated Gateway</p>
                <span className="text-3xl font-black text-white group-hover:text-emerald-400 uppercase tracking-tighter transition-colors">Air Agent</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/5 rounded-[4.5rem] p-12 shadow-3xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h4 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-5">
                <i className="fa-solid fa-tower-observation text-cyan-500 animate-pulse"></i>
                Geospatial HQ
              </h4>
              <div className="flex items-center gap-3 px-5 py-2 bg-slate-950/50 rounded-full border border-white/5">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                 <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Live Sync</span>
              </div>
            </div>
            
            <div className="h-[400px] w-full relative z-10 border border-white/5 rounded-[3rem] overflow-hidden">
              <MapContainer center={HQ_POSITION} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapController center={HQ_POSITION} />
                
                <Marker position={HQ_POSITION} icon={hqIcon}>
                  <Popup className="custom-popup">
                    <div className="p-4 bg-slate-900 text-white rounded-xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-cyan-500 mb-1">Cooolfix HQ</p>
                      <p className="text-xs font-bold leading-relaxed">Centipid Mission Control Node. Westlands, Nairobi.</p>
                    </div>
                  </Popup>
                </Marker>

                {technicians.map(tech => (
                  <Marker key={tech.id} position={tech.pos} icon={techIcon}>
                    <Popup>
                      <div className="p-3 bg-slate-900 text-white rounded-lg">
                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-1">Field Engineer</p>
                        <p className="text-xs font-bold">{tech.name}</p>
                        <p className="text-[8px] text-slate-400 mt-2">Status: Active Provisioning</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            
            <div className="mt-10 flex flex-col gap-4">
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                <span>Node: Central Nairobi</span>
                <span className="text-cyan-500/60">Range: 15km Radius</span>
              </div>
              <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                 <div className="h-full bg-cyan-500/30 w-full animate-[shimmer_2s_infinite]"></div>
              </div>
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
