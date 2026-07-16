'use client'
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ==========================================
// SCROLL SEQUENCE CONFIGURATION
// ==========================================
const TOTAL_FRAMES = 200; 

const currentFrame = (index: number) => 
  `/sequence/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`;

const TEXT_STYLE = "font-display text-[15vw] font-black leading-[0.85] tracking-wide uppercase flex flex-col items-center text-center";

export default function Home() {
  const router = useRouter(); 
  const { cartItems, setIsCartOpen } = useCart(); 
  const { setIsAuthOpen, user } = useAuth(); 
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0); 
  
  // Refs
  const introRef = useRef<HTMLDivElement>(null);
  const transitionBgRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  
  // Sequence Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sequenceContainerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [hasEntered, setHasEntered] = useState<boolean | null>(null);

  // Check if they already clicked "Enter" during this visit
  useEffect(() => {
    const entered = sessionStorage.getItem("bella_entered");
    if (entered) {
      setHasEntered(true);
    } else {
      setHasEntered(false);
    }
  }, []);

  // ==========================================
  // FIXED SEAMLESS MARQUEE
  // ==========================================
  useEffect(() => {
    if (hasEntered === null || hasEntered === false || !marqueeRef.current) return;
    
    const ctx = gsap.context(() => {
      gsap.to(".marquee-content", { 
        xPercent: -50, 
        ease: "none", 
        duration: 15,
        repeat: -1 
      });
    }, marqueeRef);
    return () => ctx.revert();
  }, [hasEntered]);

  // ==========================================
  // SEQUENCE IMAGE PRELOADER (SILENT BACKGROUND)
  // ==========================================
  useEffect(() => {
    let loadedCount = 0;
    const imgs: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) setImagesLoaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) setImagesLoaded(true);
      }
      imgs.push(img);
    }
    imagesRef.current = imgs;
  }, []);

  // ==========================================
  // RETINA CANVAS RENDER & SCROLL LOGIC
  // ==========================================
  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current || !sequenceContainerRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const renderFrame = (index: number) => {
      const img = imagesRef.current[index];
      if (!img || !img.complete) return;

      const logicalWidth = window.innerWidth;
      const logicalHeight = window.innerHeight;

      const hRatio = logicalWidth / img.width;
      const vRatio = logicalHeight / img.height;
      
      const isMobile = logicalWidth < 768;
      const ratio = isMobile ? Math.min(hRatio, vRatio) : Math.max(hRatio, vRatio);
      
      const centerShift_x = (logicalWidth - img.width * ratio) / 2;
      const centerShift_y = (logicalHeight - img.height * ratio) / 2;

      context.clearRect(0, 0, logicalWidth, logicalHeight);
      context.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    };

    const frame = { current: 0 };
    let lastWidth = window.innerWidth;

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      
      // CRITICAL MOBILE FIX: Ignore resize events on mobile if only the height changed (URL bar hiding)
      if (currentWidth === lastWidth && currentWidth < 768) {
        return; 
      }
      lastWidth = currentWidth;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.scale(dpr, dpr);
      renderFrame(frame.current);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); 

    const ctx = gsap.context(() => {
      
      if (hasEntered === true) {
        gsap.set(".hero-text-line", { y: "0%" });
      } else {
        gsap.set(".hero-text-line", { y: "110%" });
      }

      gsap.to(frame, {
        current: TOTAL_FRAMES - 1,
        snap: "current",
        ease: "none",
        scrollTrigger: {
          trigger: sequenceContainerRef.current,
          start: "top top",
          end: "+=600%", 
          scrub: 1.5, // CRITICAL MOBILE FIX: Increased from 0.5 to 1.5 for buttery momentum smoothing
          pin: true, 
          anticipatePin: 1, // Smooths the entry into the pinned section
        },
        onUpdate: () => renderFrame(frame.current)
      });

    });

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
    };
  }, [imagesLoaded, hasEntered]);

  // ==========================================
  // ENTER BUTTON ANIMATION (SLIDES VIDEO UP)
  // ==========================================
  const handleEnter = () => {
    if (!imagesLoaded) return; 
    
    sessionStorage.setItem("bella_entered", "true");
    
    gsap.to(introRef.current, {
      yPercent: -100,
      duration: 1.2,
      ease: "power4.inOut",
      onComplete: () => setHasEntered(true)
    });

    gsap.to(".hero-text-line", { y: "0%", duration: 1.2, stagger: 0.15, ease: "power4.out", delay: 0.3 });
  };

  const handleNavigate = (e: React.MouseEvent, path: string) => {
    e.preventDefault(); 
    const tl = gsap.timeline();
    tl.to(transitionBgRef.current, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: "power4.inOut", pointerEvents: "all" })
    .to(".transition-text-line", { y: "0%", duration: 0.3, stagger: 0.05, ease: "power3.out" }, "-=0.2")
    .call(() => router.push(path))
    .set(transitionBgRef.current, { clipPath: "inset(100% 0% 0% 0%)", pointerEvents: "none", delay: 1 })
    .set(".transition-text-line", { y: "110%", delay: 1 });
  };

  if (hasEntered === null) return <div className="min-h-screen bg-[#F2EFE9]" />;

  return (
    <main className="relative bg-[#F2EFE9] text-[#E02915] overflow-hidden selection:bg-[#E02915] selection:text-[#F2EFE9]">
      
      <div ref={transitionBgRef} style={{ clipPath: "inset(100% 0% 0% 0%)" }} className="fixed inset-0 z-[99999] bg-[#E02915] flex flex-col items-center justify-center pointer-events-none">
        <h1 className={`${TEXT_STYLE} text-[#F2EFE9] w-full`}>
          <span className="overflow-hidden w-full flex justify-center pb-2"><span className="transition-text-line block translate-y-[110%]">BELLA</span></span>
          <span className="overflow-hidden w-full flex justify-center"><span className="transition-text-line block translate-y-[110%]">HOUSE</span></span>
        </h1>
      </div>

      {!hasEntered && (
        <div ref={introRef} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black">
         <video 
            src="https://zyhljvwkaukzukhhnhzf.supabase.co/storage/v1/object/public/assets/intro.mp4" 
            autoPlay 
            loop 
            muted  
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full mt-12">
            <h1 className={`${TEXT_STYLE} text-white mb-12`}>
              <span>BELLA</span>
              <span>HOUSE</span>
            </h1>
            <button 
              onClick={handleEnter}
              disabled={!imagesLoaded}
              className={`px-12 py-5 border text-white font-body text-sm font-bold uppercase tracking-[0.3em] transition-all duration-500 backdrop-blur-sm 
                ${imagesLoaded ? 'border-white/50 hover:bg-white hover:text-black cursor-pointer' : 'border-white/10 opacity-50 cursor-not-allowed'}`}
            >
              {imagesLoaded ? "Enter Here" : "Loading..."}
            </button>
          </div>
        </div>
      )}

      <section className="relative h-screen flex flex-col items-center justify-center w-full">
        <header className="absolute top-6 left-6 right-6 md:top-8 md:left-8 md:right-8 flex justify-between items-center text-[#E02915] font-body text-sm md:text-base font-semibold uppercase tracking-wide z-10">
          <div className="flex items-center">
            <a href="/" onClick={(e) => handleNavigate(e, '/')} className="font-display text-3xl md:text-4xl tracking-tighter leading-none mt-1 cursor-pointer">++</a>
          </div>
          <div className="flex items-center gap-6 md:gap-10">
            <a href="/shop" onClick={(e) => handleNavigate(e, '/shop')} className="hover:opacity-60 transition-opacity cursor-pointer">Shop</a>
            {user ? (
              <a href="/account" onClick={(e) => handleNavigate(e, '/account')} className="hover:opacity-60 transition-opacity cursor-pointer">Account</a>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="hover:opacity-60 transition-opacity cursor-pointer">Login</button>
            )}
            <button onClick={() => setIsCartOpen(true)} className="hover:opacity-60 transition-opacity cursor-pointer">Bag ({cartCount})</button>
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-[#E02915]"></div>
          </div>
        </header>

        <h1 className={`${TEXT_STYLE} px-4 md:px-8`}>
          <span className="overflow-hidden w-full flex justify-center pb-2"><span className="hero-text-line block translate-y-[110%]">BELLA</span></span>
          <span className="overflow-hidden w-full flex justify-center"><span className="hero-text-line block translate-y-[110%]">HOUSE</span></span>
        </h1>

        <div ref={marqueeRef} className="absolute bottom-0 left-0 w-full overflow-hidden border-t-2 border-[#E02915] py-3 md:py-5 bg-[#F2EFE9] text-[#E02915] flex items-center z-20">
          <div className="flex whitespace-nowrap font-display text-3xl md:text-4xl uppercase tracking-tighter">
            <div className="marquee-content flex min-w-max">
              <div className="flex gap-8 md:gap-16 pr-8 md:pr-16">
                <span>STYLE IS A WAY TO SAY WHO YOU ARE WITHOUT HAVING TO SPEAK ++</span>
                <span>MADE TO BE WORN. OR JUDGED. OR BOTH. ++</span>
              </div>
              <div className="flex gap-8 md:gap-16 pr-8 md:pr-16">
                <span>STYLE IS A WAY TO SAY WHO YOU ARE WITHOUT HAVING TO SPEAK ++</span>
                <span>MADE TO BE WORN. OR JUDGED. OR BOTH. ++</span>
              </div>  
            </div>
          </div>
        </div>
      </section>

      <section ref={sequenceContainerRef} className="relative h-screen w-full bg-[#F2EFE9]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
      </section>

      <section className="w-full flex justify-center py-24 md:py-32 bg-[#F2EFE9]">
        <a href="/shop" onClick={(e) => handleNavigate(e, '/shop')} className="font-display text-5xl md:text-7xl uppercase tracking-tighter text-[#E02915] hover:opacity-70 transition-opacity border-b-4 border-[#E02915] pb-2 leading-none cursor-pointer">
          Explore Catalog
        </a>
      </section>

      <footer className="w-full bg-[#E02915] text-[#F2EFE9] flex flex-col pt-16 pb-12 px-4 md:px-8 border-t-4 border-[#E02915]">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-6 pt-12 mt-4 font-body text-xs md:text-sm tracking-wide">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-base md:text-lg uppercase tracking-widest mb-2">++ Bella House</span>
            <span className="opacity-80">All rights reserved © 2026</span>
          </div>
          <div className="flex flex-col gap-2 opacity-80 leading-relaxed">
            <span className="font-bold text-sm uppercase tracking-widest mb-2 text-[#F2EFE9] opacity-100">Contact Us</span>
            <p>Phase 2, Urban Estate</p>
            <p>Dugri, Ludhiana</p>
            <p>Punjab, India - 141001</p>
            <p className="mt-2">Email: arjunkotwal153@gmail.com</p>
            <p>Phone: +91 9056550173</p>
          </div>
          <div className="flex flex-col gap-3 opacity-80">
            <span className="font-bold text-sm uppercase tracking-widest mb-2 text-[#F2EFE9] opacity-100">Legal</span>
            <Link href="/policies/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <Link href="/policies/terms" className="hover:opacity-100 transition-opacity">Terms of Service</Link>
            <Link href="/policies/refund" className="hover:opacity-100 transition-opacity">Cancellation & Refund</Link>
            <Link href="/policies/shipping" className="hover:opacity-100 transition-opacity">Shipping & Delivery</Link>
          </div>
          <div className="flex flex-col gap-3 opacity-80">
             <span className="font-bold text-sm uppercase tracking-widest mb-2 text-[#F2EFE9] opacity-100">Socials</span>
            <a href="https://www.instagram.com/priyanka_90208235?igsh=YXZlZzdhZnJicXdo" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">Instagram</a>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-3 opacity-80">
            <span className="font-bold text-sm uppercase tracking-widest mb-2 text-[#F2EFE9] opacity-100">Company</span>
            <Link href="/about" className="hover:opacity-100 transition-opacity">About Us</Link>
            <Link href="/contact" className="mt-2 md:mt-4 bg-[#F2EFE9] text-[#E02915] px-4 py-2 font-display text-lg uppercase tracking-widest hover:bg-black hover:text-[#F2EFE9] transition-colors inline-block text-center border border-[#F2EFE9]">
              Custom & Support →
            </Link>
          </div>
        </div>
      </footer>

      <Link 
        href="/contact" 
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[9000] bg-[#E02915] text-[#F2EFE9] px-6 py-4 rounded-full font-body text-xs md:text-sm font-bold uppercase tracking-widest shadow-xl hover:scale-105 hover:bg-black transition-all duration-300 flex items-center gap-3 border border-[#E02915]"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        Custom & Support
      </Link>

    </main>
  );
}