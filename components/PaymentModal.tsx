
import React, { useState, useEffect } from 'react';
import { PaymentMethod, InternetPackage } from '../types';
import { initiateMpesaPayment, processCardPayment, verifyTransaction } from '../services/paymentService';

interface PaymentModalProps {
  pkg: InternetPackage;
  onClose: () => void;
  onSuccess: (method: PaymentMethod) => void;
}

const PaymentModal = ({ pkg, onClose, onSuccess }: PaymentModalProps) => {
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.MPESA);
  const [step, setStep] = useState<'details' | 'processing' | 'verifying' | 'done' | 'failed'>('details');
  const [showFullTerms, setShowFullTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [phone, setPhone] = useState('');
  const [timer, setTimer] = useState(60);
  const [showStkNotification, setShowStkNotification] = useState(false);
  const [nodeId] = useState(`CF-NODE-${Math.floor(Math.random() * 90000) + 10000}`);

  useEffect(() => {
    let interval: any;
    if (step === 'processing' && method === PaymentMethod.MPESA) {
      interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      
      // Simulate the phone notification appearing after 1.5 seconds
      const notificationTimer = setTimeout(() => {
        setShowStkNotification(true);
      }, 1500);

      return () => {
        clearInterval(interval);
        clearTimeout(notificationTimer);
      };
    }
    return () => clearInterval(interval);
  }, [step, method]);

  const handlePay = async () => {
    if (!agreedToTerms) return;
    setStep('processing');
    
    if (method === PaymentMethod.MPESA) {
      await initiateMpesaPayment(phone, pkg.price);
      // Automatically transition to verification after some "user thinking time"
      setTimeout(() => setStep('verifying'), 6000);
    } else {
      await processCardPayment({}, pkg.price);
      // Card is usually faster but still needs a "handshake"
      setTimeout(() => setStep('verifying'), 3500);
    }
  };

  useEffect(() => {
    if (step === 'verifying') {
      verifyTransaction("dummy").then(() => {
        setStep('done');
        setTimeout(() => {
          onSuccess(method);
          onClose();
        }, 5000); // Give user more time to see the detailed success screen
      });
    }
  }, [step, method, onSuccess, onClose]);

  const TermsOverlay = () => (
    <div className="absolute inset-0 z-[110] bg-slate-900 p-8 overflow-y-auto animate-in slide-in-from-bottom-full duration-300">
      <div className="flex justify-between items-center mb-8">
        <h4 className="text-xl font-black text-white">Agreement Protocols</h4>
        <button onClick={() => setShowFullTerms(false)} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div className="space-y-6 text-slate-400 text-xs leading-relaxed font-medium">
        <section>
          <h5 className="text-cyan-400 font-black mb-2 uppercase tracking-widest text-[9px]">1. Service Scope</h5>
          <p>Coolfix Air Technologies provides mission-critical high-speed access. Provisioning depends on site readiness and node proximity to our Westlands backbone.</p>
        </section>
        <section>
          <h5 className="text-cyan-400 font-black mb-2 uppercase tracking-widest text-[9px]">2. Fair Use Policy (FUP)</h5>
          <p>While data is unlimited, network priority is dynamically managed. High-fidelity streams are prioritized during peak hours to ensure service continuity.</p>
        </section>
        <section>
          <h5 className="text-cyan-400 font-black mb-2 uppercase tracking-widest text-[9px]">3. Billing & Termination</h5>
          <p>Service cycles are 30 days. Failure to maintain a credit balance results in automated node disconnection by the Centipid Gateway.</p>
        </section>
        <section>
          <h5 className="text-cyan-400 font-black mb-2 uppercase tracking-widest text-[9px]">4. Liability & Shield Layer</h5>
          <p>Client data is encrypted. Coolfix Air is not liable for data loss occurring outside the Shield protection layer of our infrastructure.</p>
        </section>
      </div>
      <button 
        onClick={() => { setAgreedToTerms(true); setShowFullTerms(false); }} 
        className="w-full mt-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all"
      >
        Acknowledge & Sync
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 overflow-hidden">
      {/* Simulated STK Push Mobile Notification */}
      {showStkNotification && step === 'processing' && method === PaymentMethod.MPESA && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 w-full max-w-xs z-[150] animate-in slide-in-from-top-12 duration-500">
          <div className="bg-white rounded-3xl p-5 shadow-2xl border-b-4 border-emerald-500 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl">
              <i className="fa-solid fa-mobile-screen"></i>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">M-Pesa STK</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase">Now</span>
              </div>
              <p className="text-[11px] font-bold text-slate-900 leading-tight">
                Enter PIN to pay KES {pkg.price.toLocaleString()} to COOOLFIX AIR TECH.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in duration-500 relative">
        {showFullTerms && <TermsOverlay />}
        
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Gateway Uplink</h3>
            <p className="text-[10px] text-cyan-500 uppercase tracking-[0.3em] font-black">Secure Transaction Portal</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-800/50 text-slate-400 hover:text-white transition-all hover:bg-slate-800">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-8">
          {step === 'details' && (
            <div className="space-y-6">
              <div className="flex bg-slate-800/50 border border-white/5 p-1.5 rounded-2xl">
                <button
                  onClick={() => setMethod(PaymentMethod.MPESA)}
                  className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-3 ${method === PaymentMethod.MPESA ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <i className="fa-solid fa-mobile-screen-button"></i>
                  <span>M-Pesa Push</span>
                </button>
                <button
                  onClick={() => setMethod(PaymentMethod.CARD)}
                  className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-3 ${method === PaymentMethod.CARD ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <i className="fa-solid fa-credit-card"></i>
                  <span>Global Card</span>
                </button>
              </div>

              <div className="bg-slate-950/50 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Provisioning Node</span>
                  <span className="font-black text-white text-xs uppercase tracking-tight">{pkg.name}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Payload</span>
                  <div className="text-right">
                    <span className="text-4xl font-black text-cyan-400 tracking-tighter">KES {pkg.price.toLocaleString()}</span>
                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Incl. Gateway Tax</p>
                  </div>
                </div>
              </div>

              {method === PaymentMethod.MPESA ? (
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Uplink Terminal (Phone)</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm pr-4 border-r border-white/5">+254</div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="712 345 678"
                      className="w-full bg-slate-800/30 border border-white/5 rounded-2xl py-6 pl-24 pr-8 focus:border-cyan-500/50 focus:bg-slate-800/50 outline-none transition-all text-white font-bold placeholder:text-slate-700"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Global Routing Card</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-slate-800/30 border border-white/5 rounded-2xl py-6 px-8 focus:border-cyan-500/50 focus:bg-slate-800/50 outline-none transition-all text-white font-bold placeholder:text-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full bg-slate-800/30 border border-white/5 rounded-2xl py-6 px-8 focus:border-cyan-500/50 focus:bg-slate-800/50 outline-none transition-all text-white font-bold placeholder:text-slate-700"
                    />
                    <input
                      type="password"
                      placeholder="CVC"
                      className="w-full bg-slate-800/30 border border-white/5 rounded-2xl py-6 px-8 focus:border-cyan-500/50 focus:bg-slate-800/50 outline-none transition-all text-white font-bold placeholder:text-slate-700"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4 p-6 bg-slate-800/40 rounded-[2rem] border border-white/5 group cursor-pointer" onClick={() => setAgreedToTerms(!agreedToTerms)}>
                <div className="relative flex items-center pt-1">
                  <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${agreedToTerms ? 'bg-cyan-600 border-cyan-500' : 'bg-slate-900 border-white/10'}`}>
                    {agreedToTerms && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                  </div>
                </div>
                <label className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-wide cursor-pointer">
                  I authorize the <button onClick={(e) => { e.stopPropagation(); setShowFullTerms(true); }} className="text-cyan-400 hover:text-cyan-300 underline font-black">Mission Agreement</button> and Node Operational Protocols.
                </label>
              </div>

              <button
                onClick={handlePay}
                disabled={!agreedToTerms || (method === PaymentMethod.MPESA && phone.length < 9)}
                className={`w-full py-7 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 disabled:opacity-20 disabled:grayscale motion-btn-shimmer border border-white/5 ${
                  method === PaymentMethod.MPESA ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                }`}
              >
                Initalize Uplink
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-16 flex flex-col items-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 border-[4px] border-slate-800 rounded-full opacity-20"></div>
                <div className={`absolute inset-0 border-[4px] border-t-transparent rounded-full animate-spin transition-colors duration-1000 ${method === PaymentMethod.MPESA ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]'}`}></div>
                <div className="absolute inset-4 border border-dashed border-white/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-black text-2xl text-white tracking-tighter">{timer}</span>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Awaiting PIN</span>
                </div>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-center gap-3">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${method === PaymentMethod.MPESA ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                  <h4 className="text-2xl font-black text-white tracking-tighter uppercase">Authorization Layer</h4>
                </div>
                <p className="text-slate-500 text-xs font-medium max-w-[300px] mx-auto leading-relaxed">
                  {method === PaymentMethod.MPESA 
                    ? "STK Push successfully broadcasted. We are currently listening for the PIN confirmation from your device node." 
                    : "Executing 3D Secure handshake. Authenticating global transaction with issuer terminal."}
                </p>
              </div>
              <div className="w-full max-w-[200px] h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full animate-[shimmer_2s_infinite] ${method === PaymentMethod.MPESA ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
              </div>
              <button onClick={() => setStep('details')} className="text-[10px] font-black text-slate-600 hover:text-rose-500 uppercase tracking-[0.5em] transition-all pt-4">
                [ Abort Command ]
              </button>
            </div>
          )}

          {step === 'verifying' && (
            <div className="py-24 flex flex-col items-center text-center space-y-12 animate-in fade-in duration-1000">
              <div className="w-24 h-24 bg-cyan-600/10 text-cyan-400 rounded-[2.5rem] flex items-center justify-center text-5xl animate-pulse shadow-inner border border-cyan-500/20 relative">
                <i className="fa-solid fa-tower-broadcast"></i>
                <div className="absolute -inset-4 border border-cyan-500/20 rounded-full animate-ping opacity-20"></div>
              </div>
              <div className="space-y-4">
                <h4 className="text-3xl font-black text-white tracking-tighter uppercase">Syncing Node</h4>
                <div className="flex flex-col gap-2">
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Authenticating with Centipid Backbone</p>
                   <div className="flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-150"></div>
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-300"></div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="py-12 flex flex-col items-center text-center space-y-10 animate-in zoom-in duration-700">
              <div className="w-32 h-32 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-6xl shadow-[0_0_80px_-20px_rgba(16,185,129,0.4)] border border-emerald-500/20 relative">
                <i className="fa-solid fa-check-double scale-110"></i>
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping"></div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-4xl font-black text-emerald-500 tracking-tighter uppercase leading-none">Access Active</h4>
                <p className="text-slate-400 text-xs font-bold max-w-[320px] mx-auto leading-relaxed uppercase tracking-wider">
                  Operational handshake verified. Your <span className="text-white">{pkg.name} {pkg.type}</span> uplink is now live on the Centipid Backbone.
                </p>
              </div>

              <div className="w-full bg-slate-950/50 border border-white/5 rounded-[2.5rem] p-8 space-y-4 shadow-inner">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Terminal ID</span>
                  <span className="text-xs font-black text-cyan-500 tracking-tighter">{nodeId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payload Confirmed</span>
                  <span className="text-xs font-black text-white">KES {pkg.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Protocol</span>
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid ${method === PaymentMethod.MPESA ? 'fa-mobile-screen text-emerald-500' : 'fa-credit-card text-indigo-500'}`}></i>
                    <span className="text-xs font-black text-white">{method === PaymentMethod.MPESA ? 'M-Pesa STK' : 'Global Card'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 text-emerald-500/40">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black uppercase tracking-[0.5em]">Encryption Layer: Shield AES-256 Active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
