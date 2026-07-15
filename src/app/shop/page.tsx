'use client'
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabase"; 
import { useAuth } from "../../context/AuthContext";

const FILTERS = ["All"];
const TEXT_STYLE = "font-display text-[15vw] font-black leading-[0.85] tracking-wide uppercase flex flex-col items-center text-center";

export default function Shop() {
  const router = useRouter(); 
  const { cartItems, setIsCartOpen } = useCart();
  const { setIsAuthOpen, user } = useAuth();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  
  const gridRef = useRef<HTMLDivElement>(null); 
  const transitionBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
      if (data) {
        setAllProducts(data);
        setFilteredProducts(data);
      }
      if (error) console.error("Error fetching products:", error);
    };
    fetchProducts();
  }, []);

  const handleFilter = (category: string) => {
    if (category === activeFilter) return;
    
    gsap.to(".shop-product-card", {
      y: 20, opacity: 0, duration: 0.3, stagger: 0.05, ease: "power2.in",
      onComplete: () => {
        setActiveFilter(category);
        if (category === "All") {
          setFilteredProducts(allProducts);
        } else {
          setFilteredProducts(allProducts.filter(p => p.category === category));
        }
        gsap.fromTo(".shop-product-card", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power3.out" });
      }
    });
  };

  // Lightning Fast General Navigation Transition
  const handleNavigate = (e: React.MouseEvent, path: string) => {
    e.preventDefault(); 
    const tl = gsap.timeline();
    tl.to(transitionBgRef.current, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: "power4.inOut", pointerEvents: "all" })
    .to(".transition-text-line", { y: "0%", duration: 0.3, stagger: 0.05, ease: "power3.out" }, "-=0.2")
    .call(() => router.push(path))
    .set(transitionBgRef.current, { clipPath: "inset(100% 0% 0% 0%)", pointerEvents: "none", delay: 1 })
    .set(".transition-text-line", { y: "110%", delay: 1 });
  };

  const handleProductClick = (e: React.MouseEvent, productId: number) => {
    handleNavigate(e, `/product/${productId}`);
  };

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
          <span className="border-b-2 border-[#E02915]">Shop</span>
          {user ? (
            <a href="/account" onClick={(e) => handleNavigate(e, '/account')} className="hover:opacity-60 transition-opacity cursor-pointer">Account</a>
          ) : (
            <button onClick={() => setIsAuthOpen(true)} className="hover:opacity-60 transition-opacity cursor-pointer">Login</button>
          )}
          <button onClick={() => setIsCartOpen(true)} className="hover:opacity-60 transition-opacity cursor-pointer">Bag ({cartCount})</button>
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-[#E02915]"></div>
        </div>
      </header>

      <section className="pt-40 px-6 md:px-8 w-full max-w-[1800px] mx-auto">
        <h1 className="font-display text-6xl md:text-9xl font-black uppercase tracking-tighter mb-12">Catalog</h1>
        <div className="flex flex-wrap gap-4 md:gap-8 border-b-2 border-[#E02915] pb-6 mb-12">
          {FILTERS.map(filter => (
            <button key={filter} onClick={() => handleFilter(filter)} className={`font-body text-sm md:text-lg font-bold uppercase tracking-widest transition-opacity ${activeFilter === filter ? 'opacity-100 border-b-2 border-[#E02915]' : 'opacity-40 hover:opacity-80'}`}>
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="w-full px-6 md:px-8 pb-32 max-w-[1800px] mx-auto min-h-screen">
        {allProducts.length === 0 ? (
           <div className="w-full py-32 flex justify-center text-xl font-body uppercase tracking-widest opacity-50">Loading Catalog...</div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
            {filteredProducts.map((prod) => (
              <div key={prod.id} className="shop-product-card flex flex-col">
                <div onClick={(e) => handleProductClick(e, prod.id)} className={`overflow-hidden bg-[#E5E1D8] ${prod.aspect} relative w-full group cursor-pointer`}>
                  <img src={prod.image} alt={prod.name} className="absolute inset-0 w-full h-full object-cover" />
                  <img src={prod.hover_image} alt={`${prod.name} alternate view`} className="absolute inset-0 w-full h-full object-cover z-10 transition-all duration-[450ms] ease-[cubic-bezier(0.25,1,0.5,1)] [clip-path:inset(0_100%_0_0)] group-hover:[clip-path:inset(0_0_0_0)]" />
                </div>
                
                <div className="flex flex-col border-t border-[#E02915] pt-3 mt-4">
                  <div className="flex justify-between items-baseline font-body text-lg font-medium">
                    <span>{prod.name}</span><span>₹{prod.price}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 font-body text-[10px] uppercase font-bold tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-[#E02915]"></div><span>{prod.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
            <p>Punjab, India - 141013</p>
            <p className="mt-2">Email: support@bellahouse.in</p>
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
            <a href="#" className="hover:opacity-100 transition-opacity">Instagram</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Twitter (X)</a>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-3 opacity-80">
            <span className="font-bold text-sm uppercase tracking-widest mb-2 text-[#F2EFE9] opacity-100">Company</span>
            <Link href="/about" className="hover:opacity-100 transition-opacity">About Us</Link>
            <Link href="/contact" className="hover:opacity-100 font-bold mt-2 md:mt-4 border-b-2 border-[#F2EFE9] pb-1">Let's talk</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}