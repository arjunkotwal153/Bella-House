'use client'
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle Entrance/Exit Animation
  useEffect(() => {
    if (isAuthOpen) {
      gsap.to(modalRef.current, { y: "0%", duration: 0.8, ease: "power4.inOut", pointerEvents: "all" });
    } else {
      gsap.to(modalRef.current, { y: "-100%", duration: 0.8, ease: "power4.inOut", pointerEvents: "none" });
      // Reset state on close
      setTimeout(() => { setErrorMsg(''); setEmail(''); setPassword(''); setName(''); }, 800);
    }
  }, [isAuthOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });
      if (error) setErrorMsg(error.message);
      else setErrorMsg('Success! Check your email (or you are logged in automatically).');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErrorMsg(error.message);
    }
    
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthOpen(false);
  };

  // If user is already logged in, show a completely different view
  if (user && isAuthOpen) {
    return (
      <div ref={modalRef} className="fixed inset-0 z-[9999] bg-[#F2EFE9] text-black translate-y-[-100%] flex flex-col justify-between">
        <div className="p-6 md:p-12 flex justify-between items-center">
          <h2 className="font-display text-4xl font-black uppercase tracking-tighter">Your Account</h2>
          <button onClick={() => setIsAuthOpen(false)} className="font-body font-bold uppercase tracking-widest text-sm hover:opacity-60">[Close]</button>
        </div>
        <div className="flex-1 px-6 md:px-12 flex flex-col justify-center">
          <h1 className="font-display text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            Welcome back, <br/> {user.user_metadata?.full_name || 'Member'}.
          </h1>
          <p className="font-body text-xl opacity-80 mb-12">You are securely logged into Bella House.</p>
          <button onClick={handleLogout} className="self-start font-body font-bold uppercase tracking-widest text-sm border-b-2 border-black pb-1 hover:opacity-60">Log Out</button>
        </div>
      </div>
    );
  }

  // The brutalist form configuration based on mode
  const fields = mode === 'signup' 
    ? [
        { id: '(1)', name: 'Name', type: 'text', placeholder: 'We like first names. Keeps it human.', value: name, set: setName },
        { id: '(2)', name: 'Email', type: 'email', placeholder: 'The real one. We promise not to abuse it.', value: email, set: setEmail },
        { id: '(3)', name: 'Password', type: 'password', placeholder: 'Make it secure. At least 6 characters.', value: password, set: setPassword },
      ]
    : [
        { id: '(1)', name: 'Email', type: 'email', placeholder: 'Enter the email you registered with.', value: email, set: setEmail },
        { id: '(2)', name: 'Password', type: 'password', placeholder: 'Enter your password.', value: password, set: setPassword },
      ];

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-[9999] bg-[#F2EFE9] text-black translate-y-[-100%] flex flex-col justify-between pointer-events-none"
    >
      
      {/* Header */}
      <div className="p-6 md:p-12 flex justify-between items-center">
        <div className="flex gap-4">
          <button onClick={() => setMode('signin')} className={`font-display text-4xl font-black uppercase tracking-tighter ${mode === 'signin' ? 'text-black' : 'text-black/30 hover:text-black/60'}`}>Sign in</button>
          <button onClick={() => setMode('signup')} className={`font-display text-4xl font-black uppercase tracking-tighter ${mode === 'signup' ? 'text-black' : 'text-black/30 hover:text-black/60'}`}>Join us</button>
        </div>
        <button onClick={() => setIsAuthOpen(false)} className="font-body font-bold uppercase tracking-widest text-sm hover:opacity-60 transition-opacity">
          [Close]
        </button>
      </div>

      {/* Main Content & Form */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 flex flex-col justify-center max-w-[1400px] mx-auto w-full">
        
        <h1 className="font-display text-4xl md:text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-black/40 mb-16 max-w-5xl">
          Every great wardrobe starts with a login. <span className="text-black">Just tell us who you are and let's get started.</span>
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {fields.map((field) => (
            <div key={field.id} className="group relative flex flex-col md:flex-row md:items-center py-6 border-b border-black/20">
              
              <div className="flex w-full md:w-[30%] items-center font-body font-bold text-lg md:text-xl mb-4 md:mb-0">
                <span className="w-12 opacity-50">{field.id}</span>
                <span>{field.name}</span>
              </div>
              
              <div className="flex-1 w-full">
                <input 
                  type={field.type}
                  required
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  className="w-full bg-transparent outline-none font-body text-lg md:text-xl placeholder:text-black/30 text-black"
                />
              </div>

              {/* THE MAGIC LINE ANIMATION */}
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-black scale-x-0 origin-left transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-focus-within:scale-x-100" />
            </div>
          ))}

          {errorMsg && (
            <p className="font-body font-bold text-[#E02915] mt-8 tracking-widest uppercase text-sm">
              * {errorMsg}
            </p>
          )}
        </form>
      </div>

      {/* The Massive Bottom Submit Button */}
      <button 
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-[#E02915] text-[#F2EFE9] py-6 px-6 md:px-12 flex justify-between items-center hover:bg-black transition-colors disabled:opacity-50"
      >
        <span className="font-body font-bold text-lg md:text-xl uppercase tracking-widest">
          {isLoading ? 'Processing...' : mode === 'signin' ? 'Access Account' : 'Create Account'}
        </span>
        <span className="font-display text-4xl md:text-5xl tracking-tighter">→</span>
      </button>

    </div>
  );
}