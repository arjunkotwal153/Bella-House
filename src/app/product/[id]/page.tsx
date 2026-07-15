'use client'
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useCart } from "../../../context/CartContext";
import { supabase } from "../../../lib/supabase"; 
import { useAuth } from "../../../context/AuthContext";

const TEXT_STYLE = "font-display text-[15vw] font-black leading-[0.85] tracking-wide uppercase flex flex-col items-center text-center";

export default function ProductDetail() {
  const router = useRouter(); 
  const params = useParams(); // Safely gets the ID from the URL
  const { cartItems, addToCart, setIsCartOpen } = useCart();
  const { setIsAuthOpen, user } = useAuth();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Custom Measurement State
  const [measurements, setMeasurements] = useState({
    chest: '',
    waist: '',
    hips: '',
    shoulder: '',
    length: ''
  });
  
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  const transitionBgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;
      const { data, error } = await supabase.from('products').select('*').eq('id', params.id).single();
      if (data) setProduct(data);
      if (error) console.error("Error fetching product:", error);
      setLoading(false);
    };
    fetchProduct();
  }, [params.id]);

  useEffect(() => {
    if (loading || !product) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
    });
    return () => ctx.revert();
  }, [loading, product]);

  const handleNavigate = (e: React.MouseEvent, path: string) => {
    e.preventDefault(); 
    const tl = gsap.timeline();
    tl.to(transitionBgRef.current, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: "power4.inOut", pointerEvents: "all" })
    .to(".transition-text-line", { y: "0%", duration: 0.3, stagger: 0.05, ease: "power3.out" }, "-=0.2")
    .call(() => router.push(path))
    .set(transitionBgRef.current, { clipPath: "inset(100% 0% 0% 0%)", pointerEvents: "none", delay: 1 })
    .set(".transition-text-line", { y: "110%", delay: 1 });
  };

  const handleAddToCart = () => {
    // Validation: Ensure all measurements are filled
    if (!measurements.chest || !measurements.waist || !measurements.hips || !measurements.shoulder || !measurements.length) {
      alert("Please enter all measurements to ensure a perfect fit.");
      return;
    }

    setIsAdding(true);
    
    // Bundle measurements into a readable string for the cart
    const customSizeString = `C:${measurements.chest}" W:${measurements.waist}" H:${measurements.hips}" S:${measurements.shoulder}" L:${measurements.length}"`;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      quantity: quantity,
      size: customSizeString
    });

    setTimeout(() => {
      setIsAdding(false);
      setIsCartOpen(true);
    }, 600);
  };

  if (loading) return <div className="min-h-screen bg-[#F2EFE9]" />;
  if (!product) return <div className="min-h-screen bg-[#F2EFE9] flex items-center justify-center font-display text-4xl">Product Not Found</div>;

  return (
    <main className="relative min-h-screen bg-[#F2EFE9] text-[#E02915] selection:bg-[#E02915] selection:text-[#F2EFE9]">
      
      <div ref={transitionBgRef} style={{ clipPath: "inset(100% 0% 0% 0%)" }} className="fixed inset-0 z-[99999] bg-[#E02915] flex flex-col items-center justify-center pointer-events-none">
        <h1 className={`${TEXT_STYLE} text-[#F2EFE9] w-full`}>
          <span className="overflow-hidden w-full flex justify-center pb-2"><span className="transition-text-line block translate-y-[110%]">BELLA</span></span>
          <span className="overflow-hidden w-full flex justify-center"><span className="transition-text-line block translate-y-[110%]">HOUSE</span></span>
        </h1>
      </div>

      <header className="fixed top-0 left-0 w-full px-6 md:px-8 py-6 md:py-8 flex justify-between items-center text-[#E02915] font-body text-sm md:text-base font-semibold uppercase tracking-wide z-40 bg-[#F2EFE9]/90 backdrop-blur-md">
        <a href="/" onClick={(e) => handleNavigate(e, '/')} className="flex items-center hover:opacity-60 transition-opacity cursor-pointer">
          <span className="font-display text-3xl md:text-4xl tracking-tighter leading-none mt-1">++</span>
        </a>
        <div className="flex items-center gap-6 md:gap-10">
          <a href="/shop" onClick={(e) => handleNavigate(e, '/shop')} className="hover:opacity-60 transition-opacity cursor-pointer border-b-2 border-transparent hover:border-[#E02915]">Shop</a>
          {user ? (
            <a href="/account" onClick={(e) => handleNavigate(e, '/account')} className="hover:opacity-60 transition-opacity cursor-pointer">Account</a>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className="hover:opacity-60 transition-opacity cursor-pointer">Login</button>
          )}
          <button onClick={() => setIsCartOpen(true)} className="hover:opacity-60 transition-opacity cursor-pointer">Bag ({cartCount})</button>
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-[#E02915]"></div>
        </div>
      </header>

      <section ref={contentRef} className="pt-32 px-6 md:px-8 pb-32 max-w-[1800px] mx-auto min-h-screen flex flex-col lg:flex-row gap-16 lg:gap-24 opacity-0">
        
        {/* Left: Product Images */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <div className="w-full aspect-[3/4] bg-[#E5E1D8] relative overflow-hidden group">
             <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
             <img src={product.hover_image} alt={`${product.name} alternate view`} className="absolute inset-0 w-full h-full object-cover z-10 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] opacity-0 group-hover:opacity-100" />
          </div>
        </div>

        {/* Right: Product Details & Measurement Form */}
        <div className="w-full lg:w-1/2 flex flex-col pt-8 lg:sticky lg:top-32 h-fit">
          <a href="/shop" onClick={(e) => handleNavigate(e, '/shop')} className="font-body text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-8 hover:opacity-60 transition-opacity w-fit cursor-pointer">
            <span>←</span> Return to Shop
          </a>
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-[6vw] font-black uppercase tracking-tighter leading-[0.85] mb-6">
            {product.name}
          </h1>
          <p className="font-body text-3xl md:text-4xl mb-8">₹{product.price}</p>
          
          <p className="font-body text-lg opacity-80 leading-relaxed max-w-md mb-12">
            {product.description}
          </p>

          <div className="flex flex-col gap-8 w-full max-w-md">
            
            {/* Made to Measure Form */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end mb-2">
                <span className="font-body text-sm font-bold uppercase tracking-widest">Tailored Measurements (Inches)</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 font-body">
                <input type="number" placeholder="CHEST" value={measurements.chest} onChange={(e) => setMeasurements({...measurements, chest: e.target.value})} className="border-b-2 border-[#E02915]/30 focus:border-[#E02915] bg-transparent outline-none p-3 placeholder:text-[#E02915]/50 transition-colors" />
                <input type="number" placeholder="WAIST" value={measurements.waist} onChange={(e) => setMeasurements({...measurements, waist: e.target.value})} className="border-b-2 border-[#E02915]/30 focus:border-[#E02915] bg-transparent outline-none p-3 placeholder:text-[#E02915]/50 transition-colors" />
                <input type="number" placeholder="HIPS" value={measurements.hips} onChange={(e) => setMeasurements({...measurements, hips: e.target.value})} className="border-b-2 border-[#E02915]/30 focus:border-[#E02915] bg-transparent outline-none p-3 placeholder:text-[#E02915]/50 transition-colors" />
                <input type="number" placeholder="SHOULDER" value={measurements.shoulder} onChange={(e) => setMeasurements({...measurements, shoulder: e.target.value})} className="border-b-2 border-[#E02915]/30 focus:border-[#E02915] bg-transparent outline-none p-3 placeholder:text-[#E02915]/50 transition-colors" />
                <input type="number" placeholder="DESIRED LENGTH" value={measurements.length} onChange={(e) => setMeasurements({...measurements, length: e.target.value})} className="col-span-2 border-b-2 border-[#E02915]/30 focus:border-[#E02915] bg-transparent outline-none p-3 placeholder:text-[#E02915]/50 transition-colors" />
              </div>

              {/* WhatsApp Helper */}
              <a 
                href="https://wa.me/919056550173?text=Hi%20Bella%20House,%20I%20need%20help%20with%20my%20measurements!" 
                target="_blank" 
                rel="noopener noreferrer"
                className="border-b border-[#E02915] hover:opacity-70 transition-opacity"
                >
                WHATSAPP US: 9056550173
              </a>
            </div>

            <div className="flex flex-col gap-2">
               <span className="font-body text-sm font-bold uppercase tracking-widest">Quantity</span>
               <div className="flex items-center gap-6">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-2xl hover:opacity-60 transition-opacity pb-1">−</button>
                 <span className="font-body text-xl w-4 text-center">{quantity}</span>
                 <button onClick={() => setQuantity(quantity + 1)} className="text-2xl hover:opacity-60 transition-opacity pb-1">+</button>
               </div>
            </div>

            <button onClick={handleAddToCart} disabled={isAdding} className="w-full sm:w-fit mt-8 font-display text-5xl md:text-6xl uppercase tracking-tighter text-[#E02915] hover:opacity-70 transition-opacity border-b-4 border-[#E02915] pb-2 leading-none flex items-center gap-4 group disabled:opacity-50">
              {isAdding ? "Adding..." : "Add to Bag"}
              <span className="group-hover:translate-x-2 transition-transform block mt-1">↗</span>
            </button>
            
          </div>
        </div>
      </section>

      {/* Standard Footer */}
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
            <p>Punjab, India - 141013</p>
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
            <a href="https://www.instagram.com/priyanka_90208235?igsh=YXZlZzdhZnJicXdo" className="hover:opacity-100 transition-opacity">Instagram</a>
            
          </div>
          <div className="flex flex-col items-start lg:items-end gap-3 opacity-80">
            
            <Link href="/about" className="hover:opacity-100 transition-opacity">About Us</Link>
            <Link href="/contact" className="hover:opacity-100 font-bold mt-2 md:mt-4 border-b-2 border-[#F2EFE9] pb-1">Let's talk</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}