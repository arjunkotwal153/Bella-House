'use client'
import { useState, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    inquiry: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  // Refs for the GSAP Animation
  const successOverlayRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const closeSuccessMessage = () => {
    // Animate the overlay back down
    gsap.to(successOverlayRef.current, { 
      clipPath: "inset(100% 0% 0% 0%)", 
      duration: 0.8, 
      ease: "power3.inOut", 
      pointerEvents: "none",
      onComplete: () => {
        // Reset the form and button status ONLY after the animation finishes hiding the screen
        setFormData({ name: '', email: '', location: '', inquiry: '', message: '' });
        setStatus('idle');
        // Reset clip path for next time
        gsap.set(successOverlayRef.current, { clipPath: "inset(0% 0% 100% 0%)" });
      }
    });
  };

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
             <h2 className="font-display text-3xl md:text-4xl uppercase tracking-tighter">Thank you, {formData.name || 'there'}</h2>
             <p className="font-body text-sm md:text-base opacity-90 text-center max-w-lg leading-relaxed">
               We have successfully received your inquiry regarding <span className="font-bold uppercase tracking-widest">"{formData.inquiry}"</span>. 
               Our team is reviewing your message and will reply to your email (<span className="font-bold">{formData.email}</span>) within 24-48 hours.
             </p>
          </div>

          <button 
            onClick={closeSuccessMessage} 
            className="success-text font-body text-sm font-bold uppercase tracking-widest border-b-2 border-[#F2EFE9] pb-1 hover:opacity-70 transition-opacity"
          >
            Return to Store
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="w-full px-6 md:px-8 py-6 md:py-8 flex justify-between items-center">
        <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter">Say Hello</h1>
        <Link href="/" className="font-body text-sm font-bold uppercase tracking-widest hover:opacity-60 transition-opacity">[CLOSE]</Link>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-12 md:pt-24 mb-32">
        <h2 className="font-display text-5xl md:text-7xl lg:text-[8rem] uppercase tracking-tighter leading-[0.85] mb-24 text-[#E02915]/40">
          Every great wardrobe started with a vision. <span className="text-[#E02915]">Just tell us what you're looking for and why it matters.</span>
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col">
          
          <div className="flex flex-col md:flex-row border-t border-[#E02915]/30 py-8 gap-4 md:gap-12 items-start md:items-center">
            <div className="flex gap-4 w-full md:w-1/3 font-body font-bold uppercase tracking-widest text-sm md:text-base">
              <span className="opacity-50">(1)</span>
              <span>Name</span>
            </div>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="We like first names. Keeps it human." className="w-full md:w-2/3 bg-transparent outline-none font-body text-base md:text-lg placeholder:text-[#E02915]/40 transition-opacity" />
          </div>

          <div className="flex flex-col md:flex-row border-t border-[#E02915]/30 py-8 gap-4 md:gap-12 items-start md:items-center">
            <div className="flex gap-4 w-full md:w-1/3 font-body font-bold uppercase tracking-widest text-sm md:text-base">
              <span className="opacity-50">(2)</span>
              <span>Email</span>
            </div>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="The real one. We promise not to abuse it." className="w-full md:w-2/3 bg-transparent outline-none font-body text-base md:text-lg placeholder:text-[#E02915]/40 transition-opacity" />
          </div>

          <div className="flex flex-col md:flex-row border-t border-[#E02915]/30 py-8 gap-4 md:gap-12 items-start md:items-center">
            <div className="flex gap-4 w-full md:w-1/3 font-body font-bold uppercase tracking-widest text-sm md:text-base">
              <span className="opacity-50">(3)</span>
              <span>Location</span>
            </div>
            <input required type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Where you are shopping from." className="w-full md:w-2/3 bg-transparent outline-none font-body text-base md:text-lg placeholder:text-[#E02915]/40 transition-opacity" />
          </div>

          <div className="flex flex-col md:flex-row border-t border-[#E02915]/30 py-8 gap-4 md:gap-12 items-start md:items-center">
            <div className="flex gap-4 w-full md:w-1/3 font-body font-bold uppercase tracking-widest text-sm md:text-base">
              <span className="opacity-50">(4)</span>
              <span>Inquiry</span>
            </div>
            <input required type="text" name="inquiry" value={formData.inquiry} onChange={handleChange} placeholder="Order issue, sizing, or general question." className="w-full md:w-2/3 bg-transparent outline-none font-body text-base md:text-lg placeholder:text-[#E02915]/40 transition-opacity" />
          </div>

          <div className="flex flex-col md:flex-row border-t border-[#E02915]/30 py-8 gap-4 md:gap-12 items-start">
            <div className="flex gap-4 w-full md:w-1/3 font-body font-bold uppercase tracking-widest text-sm md:text-base mt-2">
              <span className="opacity-50">(5)</span>
              <span>Message</span>
            </div>
            <textarea required name="message" value={formData.message} onChange={handleChange} placeholder="What's on your mind. No need to polish it." rows={4} className="w-full md:w-2/3 bg-transparent outline-none font-body text-base md:text-lg placeholder:text-[#E02915]/40 resize-none transition-opacity"></textarea>
          </div>
          
          <div className="border-t border-[#E02915]/30 mb-8"></div>

          <button 
            type="submit" 
            disabled={status === 'loading' || status === 'success'}
            className="fixed bottom-0 left-0 w-full bg-[#E02915] text-[#F2EFE9] flex justify-between items-center px-6 md:px-12 py-6 md:py-8 font-body font-bold uppercase tracking-widest text-sm md:text-base hover:bg-black transition-colors disabled:opacity-90 z-50 cursor-pointer"
          >
            <span>
              {status === 'loading' ? 'SENDING...' : status === 'error' ? 'ERROR SENDING. PLEASE TRY AGAIN.' : 'SEND MESSAGE'}
            </span>
            <span className="text-2xl leading-none">
               {status === 'loading' ? '...' : '→'}
            </span>
          </button>
          
        </form>
      </div>
    </main>
  );
}