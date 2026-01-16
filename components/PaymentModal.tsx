
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
  const [step, setStep] = useState<'details' | 'processing' | 'verifying' | 'done'>('details');
  const [showFullTerms, setShowFullTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [phone, setPhone] = useState('');
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: any;
    if (step === 'processing' && method === PaymentMethod.MPESA) {
      interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, method]);

  const handlePay = async () => {
    if (!agreedToTerms) return;
    setStep('processing');
    
    if (method === PaymentMethod.MPESA) {
      await initiateMpesaPayment(phone, pkg.price);
      setTimeout(() => setStep('verifying'), 5000);
    } else {
      await processCardPayment({}, pkg.price);
      setStep('verifying');
    }
  };

  useEffect(() => {
    if (step === 'verifying') {
      verifyTransaction("dummy").then(() => {
        setStep('done');
        setTimeout(() => {
          onSuccess(method);
          onClose();
        }, 2000);
      });
    }
  }, [step]);

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
      <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in duration-500 relative">
        {showFullTerms && <TermsOverlay />}
        
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="text-xl font-black text-white">Secure Provisioning</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Cooolfix Air Gateway</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-800/50 text-slate-400 hover:text-white transition-all hover:bg-slate-800">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-8">
          {step === 'details' && (
            <div className="space-y-6">
              <div className="flex bg-slate-800/50 border border-white/5 p-1 rounded-2xl">
                <button
                  onClick={() => setMethod(PaymentMethod.MPESA)}
                  className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-3 ${method === PaymentMethod.MPESA ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <i className="fa-solid fa-mobile-screen-button"></i>
                  <span>M-Pesa</span>
                </button>
                <button
                  onClick={() => setMethod(PaymentMethod.CARD)}
                  className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-3 ${method === PaymentMethod.CARD ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <i className="fa-solid fa-credit-card"></i>
                  <span>Card</span>
                </button>
              </div>

              <div className="bg-slate-800/30 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Plan Node</span>
                  <span className="font-bold text-white text-sm">{pkg.name} ({pkg.type})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Access Credit</span>
                  <span className="text-3xl font-black text-cyan-400 tracking-tighter">KES {pkg.price.toLocaleString()}</span>
                </div>
              </div>

              {method === PaymentMethod.MPESA ? (
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">M-Pesa Terminal</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm border-r border-white/5 pr-4">+254</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="712 345 678"
                      className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-5 pl-20 pr-5 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-white font-bold"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Card Interface</label>
                    <input
                      type="text"
                      placeholder="Card Number"
                      className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-5 px-6 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-white font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-5 px-6 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-white font-bold"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      className="w-full bg-slate-800/50 border border-white/5 rounded-2xl py-5 px-6 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-white font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-4 p-5 bg-slate-800/40 rounded-3xl border border-white/5">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    id="terms-check" 
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-6 h-6 rounded-lg border-white/10 bg-slate-900 text-cyan-500 focus:ring-cyan-500/50 cursor-pointer"
                  />
                </div>
                <label htmlFor="terms-check" className="text-[11px] text-slate-400 leading-relaxed font-medium cursor-pointer">
                  I acknowledge and agree to the <button onClick={(e) => { e.preventDefault(); setShowFullTerms(true); }} className="text-cyan-400 hover:text-cyan-300 underline font-black uppercase">Standard Service Terms</button> and Fair Usage Policy for cooolfix air Technologies.
                </label>
              </div>

              <button
                onClick={handlePay}
                disabled={!agreedToTerms || (method === PaymentMethod.MPESA && phone.length < 9)}
                className={`w-full py-6 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-30 disabled:grayscale ${
                  method === PaymentMethod.MPESA ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                Provision Now
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center text-center space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-[6px] border-slate-800 rounded-full opacity-30"></div>
                <div className={`absolute inset-0 border-[6px] border-t-transparent rounded-full animate-spin transition-colors duration-500 ${method === PaymentMethod.MPESA ? 'border-emerald-500' : 'border-indigo-500'}`}></div>
                <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-white">
                  {timer}s
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-2xl font-black text-white">Authorizing Access</h4>
                <p className="text-slate-500 text-sm max-w-[280px] mx-auto font-medium">
                  {method === PaymentMethod.MPESA 
                    ? `An STK Push has been dispatched to +254${phone}. Please authorize via M-Pesa PIN.` 
                    : "Connecting to secure banking interface. Do not terminate this session."}
                </p>
              </div>
              <button onClick={() => setStep('details')} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-all">
                Abort Transaction
              </button>
            </div>
          )}

          {step === 'verifying' && (
            <div className="py-20 flex flex-col items-center text-center space-y-10 animate-in fade-in">
              <div className="w-24 h-24 bg-cyan-500/10 text-cyan-400 rounded-[2rem] flex items-center justify-center text-4xl animate-pulse shadow-inner border border-cyan-500/20">
                <i className="fa-solid fa-tower-broadcast"></i>
              </div>
              <div className="space-y-3">
                <h4 className="text-2xl font-black text-white tracking-tighter">Syncing Backbone</h4>
                <p className="text-slate-500 text-sm font-medium">Authenticating payment with Centipid Billing Node...</p>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="py-16 flex flex-col items-center text-center space-y-10 animate-in zoom-in duration-700">
              <div className="w-28 h-28 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-5xl shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)] border border-emerald-500/30">
                <i className="fa-solid fa-check-double"></i>
              </div>
              <div className="space-y-4">
                <h4 className="text-3xl font-black text-emerald-500 tracking-tighter">Access Active</h4>
                <p className="text-slate-400 text-sm max-w-[280px] mx-auto font-medium leading-relaxed">
                  Encryption keys exchanged. Your connectivity node has been successfully provisioned.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
