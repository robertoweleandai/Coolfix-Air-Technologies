
import React from 'react';

interface TermsModalProps {
  onAccept: () => void;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onAccept, onClose }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-6">
      <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-10 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Service Protocols</h3>
            <p className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.4em] mt-1">Acceptance Required for Provisioning</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          <section className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-6 h-1 bg-cyan-500 rounded-full"></span>
              1. Deployment Scope
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Cooolfix Air Technologies provides high-fidelity digital infrastructure. Service activation is subject to physical node availability and successful backbone synchronization. Installation timelines are estimated and not guaranteed.
            </p>
          </section>

          <section className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-6 h-1 bg-cyan-500 rounded-full"></span>
              2. Fair Usage Policy (FUP)
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              While our fiber tiers provide unlimited data volume, we employ intelligent traffic shaping to prioritize critical packets (VoIP, Security, Cloud) over bulk transfers during peak load intervals on the Centipid Node.
            </p>
          </section>

          <section className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-6 h-1 bg-cyan-500 rounded-full"></span>
              3. Data Protection & Shield Layer
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              All traffic traversing our infrastructure is protected by our proprietary Shield Layer. However, endpoints outside our controlled infrastructure are the responsibility of the subscriber. AES-256 encryption is standard on all backbone relays.
            </p>
          </section>

          <section className="space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-6 h-1 bg-cyan-500 rounded-full"></span>
              4. Termination & Billing
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Service is provisioned on a 30-day pre-paid cycle. Automated disconnection occurs precisely at 00:00 UTC upon balance depletion. Re-activation requires a fresh handshake via the Centipid Gateway.
            </p>
          </section>
        </div>

        <div className="p-10 bg-slate-950/50 border-t border-white/5 flex flex-col gap-6">
          <div className="flex items-center gap-6 p-6 bg-cyan-500/5 rounded-3xl border border-cyan-500/10">
            <i className="fa-solid fa-circle-info text-cyan-400 text-2xl"></i>
            <p className="text-[11px] text-slate-300 font-bold leading-relaxed">
              By clicking "Authorize Agreement", you verify that you have evaluated the technical specifications and accept all operational protocols of Cooolfix Air Technologies.
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 font-black uppercase text-xs tracking-widest border border-white/10 transition-all"
            >
              Decline
            </button>
            <button 
              onClick={onAccept}
              className="flex-[2] py-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-xs tracking-widest shadow-[0_20px_40px_-10px_rgba(6,182,212,0.5)] transition-all motion-btn-shimmer"
            >
              Authorize Agreement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
