'use client'
import { useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

export default function Contact() {
  // Two separate state objects to handle the two different forms
  const [supportData, setSupportData] = useState({ name: '', email: '', location: '', inquiry: '', message: '' });
  const [customData, setCustomData] = useState({ name: '', email: '', location: '', inquiry: '', message: '' });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submittedForm, setSubmittedForm] = useState<'support' | 'custom' | null>(null);
  
  const successOverlayRef = useRef<HTMLDivElement>(null);

  const handleSupportChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSupportData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent, type: 'support' | 'custom') => {
    e.preventDefault();
    setStatus('loading');
    setSubmittedForm(type);

    // Grab the correct data based on which button they clicked
    const payload = type === 'support' ? supportData : customData;

    // Automatically tag the inquiry so you know exactly which form they used in your Gmail!
    const enhancedPayload = {
      ...payload,
      inquiry: type === 'custom' ? `[BESPOKE CUSTOM] ${payload.inquiry}` : `[CLIENT SUPPORT] ${payload.inquiry}`
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enhancedPayload),
      });

      if (!res.ok) throw new Error('Failed to send');
      
      setStatus('success');
      
      // Trigger the beautiful success animation
      gsap.to(successOverlayRef.current, { 
        clipPath: "inset(0% 0% 0% 0%)", 
        duration: 1, 
        ease: "power4.inOut", 
        pointerEvents: "all" 
      });
      gsap.fromTo(".success-text", 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.5 }
      );
      
    } catch (error) {
      console.error(error);
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setSubmittedForm(null);
      }, 3000);
    }
  };

  const closeSuccessMessage = () => {
    gsap.to(successOverlayRef.current, { 
      clipPath: "inset(100% 0% 0% 0%)", 
      duration: 0.8, 
      ease: "power3.inOut", 
      pointerEvents: "none",
      onComplete: () => {
        // Clear only the form that was submitted
        if (submittedForm === 'support') setSupportData({ name: '', email: '', location: '', inquiry: '', message: '' });
        if (submittedForm === 'custom') setCustomData({ name: '', email: '', location: '', inquiry: '', message: '' });
        
        setStatus('idle');
        setSubmittedForm(null);
        gsap.set(successOverlayRef.current, { clipPath: "inset(0% 0% 100% 0%)" });
      }
    });
  };

  // Determine which data to show on the success screen
  const currentData = submittedForm === 'support' ? supportData : submittedForm === 'custom' ? customData : { name: '', inquiry: '', email: '' };

  return (
    <main className="min-h-screen bg-[#F2EFE9] text-[#E02915] selection:bg-[#E02915] selection:text-[#F2EFE9] pb-32">
      
      {/* ========================================= */}
      {/* ANIMATED SUCCESS OVERLAY */}
      {/* ========================================= */}
      <div 
        ref={successOverlayRef} 
        style={{ clipPath: "inset(0% 0% 100% 0%)" }} 
        className="fixed inset-0 z-[99999] bg-[#E02915] text-[#F2EFE9] flex flex-col items-center justify-center p-6"
      >
        <div className="max-w-3xl text-center flex flex-col items-center">
          <h1 className="success-text font-display text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6 leading-none">Message<br/>Received</h1>
          
          <div className="success-text w-full p-8 md:p-12 border-2 border-[#F2EFE9] flex flex-col items-center gap-6 transition-all duration-500 mt-4 mb-12">
             <h2 className="font-display text-3xl md:text-4xl uppercase tracking-tighter">Thank you, {currentData.name || 'there'}</h2>
             <p className="font-body text-sm md:text-base opacity-90 text-center max-w-lg leading-relaxed">
               We have successfully received your {submittedForm === 'custom' ? 'custom design request' : 'inquiry'}. 
               Our team is reviewing your message and will reply to your email (<span className="font-bold">{currentData.email}</span>) within 24-48 hours.
             </p>
          </div>

          <button 
            onClick={closeSuccessMessage} 
            className="success-text font-body text-sm font-bold uppercase tracking-widest border-b-2 border-[#F2EFE9] pb-1 hover:opacity-70 transition-opacity"
          >
            Close & Return
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="w-full px-6 md:px-8 py-6 md:py-8 flex justify-between items-center border-b border-[#E02915]/20">
        <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter">Custom & Support</h1>
        <Link href="/" className="font-body text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity">[CLOSE]</Link>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-12 md:pt-20 mb-32">
        <h2 className="font-display text-4xl md:text-6xl lg:text-[7rem] uppercase tracking-tighter leading-[0.85] mb-16 md:mb-24 text-[#E02915]/40 max-w-5xl">
          Every great wardrobe started with a vision. <span className="text-[#E02915]">How can we help you today?</span>
        </h2>

        {/* TWO COLUMN GRID FOR FORMS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 relative">
          
          {/* Vertical Divider for Desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-[#E02915]/30 -translate-x-1/2"></div>

          {/* ========================================= */}
          {/* LEFT COLUMN: GENERAL SUPPORT & ISSUES       */}
          {/* ========================================= */}
          <form onSubmit={(e) => handleSubmit(e, 'support')} className="flex flex-col">
            <div className="mb-12">
              <h3 className="font-display text-4xl md:text-5xl uppercase tracking-tighter mb-4">Client Care</h3>
              <p className="font-body text-sm opacity-80 uppercase tracking-widest font-bold">Order issues, shipping, or general questions.</p>
            </div>
            
            <div className="flex flex-col border-t border-[#E02915]/30 py-6 gap-3 items-start">
              <div className="flex gap-4 w-full font-body font-bold uppercase tracking-widest text-sm">
                <span className="opacity-50">(1)</span><span>Name</span>
              </div>
              <input required type="text" name="name" value={supportData.name} onChange={handleSupportChange} placeholder="First & Last Name" className="w-full bg-transparent outline-none font-body text-lg placeholder:text-[#E02915]/40 transition-opacity" />
            </div>

            <div className="flex flex-col border-t border-[#E02915]/30 py-6 gap-3 items-start">
              <div className="flex gap-4 w-full font-body font-bold uppercase tracking-widest text-sm">
                <span className="opacity-50">(2)</span><span>Email</span>
              </div>
              <input required type="email" name="email" value={supportData.email} onChange={handleSupportChange} placeholder="Your contact email" className="w-full bg-transparent outline-none font-body text-lg placeholder:text-[#E02915]/40 transition-opacity" />
            </div>

            <div className="flex flex-col border-t border-[#E02915]/30 py-6 gap-3 items-start">
              <div className="flex gap-4 w-full font-body font-bold uppercase tracking-widest text-sm">
                <span className="opacity-50">(3)</span><span>Order # (Optional)</span>
              </div>
              <input type="text" name="location" value={supportData.location} onChange={handleSupportChange} placeholder="e.g. #FCE7CCBB" className="w-full bg-transparent outline-none font-body text-lg placeholder:text-[#E02915]/40 transition-opacity" />
            </div>

            <div className="flex flex-col border-t border-[#E02915]/30 py-6 gap-3 items-start">
              <div className="flex gap-4 w-full font-body font-bold uppercase tracking-widest text-sm">
                <span className="opacity-50">(4)</span><span>Topic</span>
              </div>
              <input required type="text" name="inquiry" value={supportData.inquiry} onChange={handleSupportChange} placeholder="Defect, Exchange, Sizing..." className="w-full bg-transparent outline-none font-body text-lg placeholder:text-[#E02915]/40 transition-opacity" />
            </div>

            <div className="flex flex-col border-t border-b border-[#E02915]/30 py-6 gap-3 items-start">
              <div className="flex gap-4 w-full font-body font-bold uppercase tracking-widest text-sm mt-2">
                <span className="opacity-50">(5)</span><span>Message</span>
              </div>
              <textarea required name="message" value={supportData.message} onChange={handleSupportChange} placeholder="How can we assist you?" rows={3} className="w-full bg-transparent outline-none font-body text-lg placeholder:text-[#E02915]/40 resize-none transition-opacity"></textarea>
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading' || status === 'success'}
              className="mt-8 bg-[#E02915] text-[#F2EFE9] flex justify-between items-center px-8 py-6 font-body font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span>{status === 'loading' && submittedForm === 'support' ? 'Sending...' : 'Submit Inquiry'}</span>
              <span className="text-xl leading-none">→</span>
            </button>
          </form>

          {/* ========================================= */}
          {/* RIGHT COLUMN: BESPOKE CUSTOM DRESS DESIGN   */}
          {/* ========================================= */}
          <form onSubmit={(e) => handleSubmit(e, 'custom')} className="flex flex-col">
             <div className="mb-12">
              <h3 className="font-display text-4xl md:text-5xl uppercase tracking-tighter mb-4">Bespoke Studio</h3>
              <p className="font-body text-sm opacity-80 uppercase tracking-widest font-bold">Request a fully customized dress or tailored piece.</p>
            </div>
            
            <div className="flex flex-col border-t border-[#E02915]/30 py-6 gap-3 items-start">
              <div className="flex gap-4 w-full font-body font-bold uppercase tracking-widest text-sm">
                <span className="opacity-50">(1)</span><span>Name</span>
              </div>
              <input required type="text" name="name" value={customData.name} onChange={handleCustomChange} placeholder="First & Last Name" className="w-full bg-transparent outline-none font-body text-lg placeholder:text-[#E02915]/40 transition-opacity" />
            </div>

            <div className="flex flex-col border-t border-[#E02915]/30 py-6 gap-3 items-start">
              <div className="flex gap-4 w-full font-body font-bold uppercase tracking-widest text-sm">
                <span className="opacity-50">(2)</span><span>Email</span>
              </div>
              <input required type="email" name="email" value={customData.email} onChange={handleCustomChange} placeholder="Your contact email" className="w-full bg-transparent outline-none font-body text-lg placeholder:text-[#E02915]/40 transition-opacity" />
            </div>

            <div className="flex flex-col border-t border-[#E02915]/30 py-6 gap-3 items-start">
              <div className="flex gap-4 w-full font-body font-bold uppercase tracking-widest text-sm">
                <span className="opacity-50">(3)</span><span>Location</span>
              </div>
              <input required type="text" name="location" value={customData.location} onChange={handleCustomChange} placeholder="City & State" className="w-full bg-transparent outline-none font-body text-lg placeholder:text-[#E02915]/40 transition-opacity" />
            </div>

            <div className="flex flex-col border-t border-[#E02915]/30 py-6 gap-3 items-start">
              <div className="flex gap-4 w-full font-body font-bold uppercase tracking-widest text-sm">
                <span className="opacity-50">(4)</span><span>Occasion / Style</span>
              </div>
              <input required type="text" name="inquiry" value={customData.inquiry} onChange={handleCustomChange} placeholder="Wedding, Gala, Specific Vibe..." className="w-full bg-transparent outline-none font-body text-lg placeholder:text-[#E02915]/40 transition-opacity" />
            </div>

            <div className="flex flex-col border-t border-b border-[#E02915]/30 py-6 gap-3 items-start">
              <div className="flex gap-4 w-full font-body font-bold uppercase tracking-widest text-sm mt-2">
                <span className="opacity-50">(5)</span><span>Design Details</span>
              </div>
              <textarea required name="message" value={customData.message} onChange={handleCustomChange} placeholder="Tell us about your vision, measurements, or references..." rows={3} className="w-full bg-transparent outline-none font-body text-lg placeholder:text-[#E02915]/40 resize-none transition-opacity"></textarea>
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading' || status === 'success'}
              className="mt-8 bg-[#E02915] text-[#F2EFE9] flex justify-between items-center px-8 py-6 font-body font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span>{status === 'loading' && submittedForm === 'custom' ? 'Sending...' : 'Request Custom Design'}</span>
              <span className="text-xl leading-none">→</span>
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}