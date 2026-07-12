'use client'
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext"; 
import { supabase } from "../../lib/supabase"; 

export default function Checkout() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart(); 
  const { user, loading } = useAuth(); 
  
  const subtotal = cartItems.reduce((total: number, item: any) => {
    const numericPrice = parseFloat(item.price.replace('₹', ''));
    return total + (numericPrice * item.quantity);
  }, 0);
  const shipping = subtotal > 0 ? 150.00 : 0;
  const total = subtotal + shipping;

  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successOverlayRef = useRef<HTMLDivElement>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');
  
  // FORM STATE
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Auto-fill user data if they are logged in
  useEffect(() => {
    if (user && !email) {
      setEmail(user.email || '');
      if (user.user_metadata?.full_name) {
        const parts = user.user_metadata.full_name.split(' ');
        setFirstName(parts[0]);
        if (parts.length > 1) setLastName(parts.slice(1).join(' '));
      }
    }
  }, [user]);

  // Entrance Animation
  useEffect(() => {
    if (!user) return; 
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      if (formRef.current) {
        tl.fromTo(formRef.current.children, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" });
      }
      tl.fromTo(summaryRef.current, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.4");
    });
    return () => ctx.revert();
  }, [user]);

  // Protect the route
  if (loading) return <div className="min-h-screen bg-[#F2EFE9]" />;
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F2EFE9] text-[#E02915] flex flex-col items-center justify-center">
        <h1 className="font-display text-4xl uppercase tracking-tighter mb-4">Authentication Required</h1>
        <p className="font-body opacity-80">You must be logged in to access checkout.</p>
        <Link href="/" className="mt-8 border-b-2 border-[#E02915] font-bold uppercase tracking-widest text-sm pb-1">Return Home</Link>
      </div>
    );
  }

  // =========================================
  // REAL DATABASE INSERTION
  // =========================================
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            user_email: email,
            shipping_name: `${firstName} ${lastName}`.trim(), 
            shipping_address: address,
            shipping_city: city,
            shipping_postal_code: postalCode,
            payment_method: paymentMethod,
            subtotal: subtotal,
            shipping_fee: shipping,
            total: total,
            status: paymentMethod === 'upi' ? 'pending_verification' : 'processing',
            items: cartItems 
          }
        ]);

      if (error) throw error;

      clearCart();

      gsap.to(successOverlayRef.current, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power4.inOut", pointerEvents: "all" });
      gsap.fromTo(".success-text", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.5 });
      
    } catch (error) {
      console.error("Error saving order:", error);
      alert("There was an issue processing your order. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F2EFE9] text-[#E02915] selection:bg-[#E02915] selection:text-[#F2EFE9] pb-32">
      
      {/* SUCCESS OVERLAY */}
      <div ref={successOverlayRef} style={{ clipPath: "inset(0% 0% 100% 0%)" }} className="fixed inset-0 z-[99999] bg-[#E02915] text-[#F2EFE9] flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl text-center flex flex-col items-center">
          <h1 className="success-text font-display text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6 leading-none">Order<br/>Confirmed</h1>
          <p className="success-text font-body text-lg md:text-xl opacity-90 mb-12 max-w-md">Your order has been placed. Tracking details will be sent to {email}.</p>
          
          <div className="success-text w-full p-8 border-2 border-[#F2EFE9] flex flex-col items-center gap-2 transition-all duration-500">
             <h2 className="font-display text-3xl md:text-4xl uppercase tracking-tighter mb-2">Thank you, {user.user_metadata?.full_name || firstName.toUpperCase()}</h2>
             <p className="font-body text-sm opacity-80 text-center">We will notify you via email and SMS once your package is handed over to our delivery partners.</p>
          </div>

          <Link href="/" onClick={() => window.location.href='/'} className="success-text mt-12 font-body text-sm font-bold uppercase tracking-widest border-b border-[#F2EFE9] pb-1 hover:opacity-70">
            Return to Store
          </Link>
        </div>
      </div>

      <header className="w-full px-6 md:px-8 py-6 md:py-8 flex justify-between items-center border-b-2 border-[#E02915]">
        <Link href="/" className="font-display text-3xl md:text-4xl tracking-tighter leading-none mt-1 hover:opacity-60 transition-opacity">++ BELLA HOUSE</Link>
        <span className="font-body text-sm md:text-base font-bold uppercase tracking-widest">Secure Checkout</span>
      </header>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-32">
          <h2 className="font-display text-4xl uppercase tracking-tighter mb-6">Your bag is empty</h2>
          <Link href="/shop" className="font-body font-bold uppercase tracking-widest border-b-2 border-[#E02915] pb-1 hover:opacity-60">Continue Shopping</Link>
        </div>
      ) : (
        <div className="max-w-[1400px] mx-auto pt-16 px-6 md:px-8 flex flex-col lg:flex-row gap-16">
          <div className="flex-1">
            <h1 className="font-display text-5xl uppercase tracking-tighter mb-12">Checkout</h1>
            <form ref={formRef} onSubmit={handlePlaceOrder} className="flex flex-col gap-12">
              
              <div className="flex flex-col gap-6">
                <h2 className="font-body font-bold uppercase tracking-widest text-sm">1. Contact Information</h2>
                <input 
                  required 
                  type="email" 
                  value={email}
                  disabled
                  className="w-full bg-transparent border-b-2 border-[#E02915]/30 p-4 font-body outline-none opacity-60 cursor-not-allowed" 
                />
              </div>

              {/* Shipping Info */}
              <div className="flex flex-col gap-6">
                <h2 className="font-body font-bold uppercase tracking-widest text-sm">2. Shipping Address</h2>
                <div className="grid grid-cols-2 gap-6">
                  <input required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="FIRST NAME" className="w-full bg-transparent border-b-2 border-[#E02915]/30 focus:border-[#E02915] p-4 font-body outline-none placeholder:text-[#E02915]/50 transition-colors" />
                  <input required type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="LAST NAME" className="w-full bg-transparent border-b-2 border-[#E02915]/30 focus:border-[#E02915] p-4 font-body outline-none placeholder:text-[#E02915]/50 transition-colors" />
                </div>
                <input required type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="STREET ADDRESS" className="w-full bg-transparent border-b-2 border-[#E02915]/30 focus:border-[#E02915] p-4 font-body outline-none placeholder:text-[#E02915]/50 transition-colors" />
                <div className="grid grid-cols-2 gap-6">
                  <input required type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="CITY" className="w-full bg-transparent border-b-2 border-[#E02915]/30 focus:border-[#E02915] p-4 font-body outline-none placeholder:text-[#E02915]/50 transition-colors" />
                  <input required type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="POSTAL CODE" className="w-full bg-transparent border-b-2 border-[#E02915]/30 focus:border-[#E02915] p-4 font-body outline-none placeholder:text-[#E02915]/50 transition-colors" />
                </div>
              </div>

              {/* PAYMENT SYSTEM */}
              <div className="flex flex-col gap-6">
                <h2 className="font-body font-bold uppercase tracking-widest text-sm">3. Payment Method</h2>
                <div className="flex gap-4 mb-2">
                  <button type="button" onClick={() => setPaymentMethod('upi')} className={`flex-1 py-3 font-body font-bold uppercase tracking-widest text-xs border-2 transition-colors ${paymentMethod === 'upi' ? 'bg-[#E02915] text-[#F2EFE9] border-[#E02915]' : 'border-[#E02915]/30 hover:border-[#E02915]'}`}>Pay via UPI</button>
                  <button type="button" onClick={() => setPaymentMethod('cod')} className={`flex-1 py-3 font-body font-bold uppercase tracking-widest text-xs border-2 transition-colors ${paymentMethod === 'cod' ? 'bg-[#E02915] text-[#F2EFE9] border-[#E02915]' : 'border-[#E02915]/30 hover:border-[#E02915]'}`}>Cash on Delivery</button>
                </div>
                <div className="border-2 border-[#E02915] p-6 flex flex-col gap-6 bg-[#E5E1D8]">
                  {paymentMethod === 'upi' ? (
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-40 h-40 bg-white p-2 border-2 border-[#E02915] flex-shrink-0">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=yourname@bank&pn=BellaHouse" alt="UPI QR Code" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex flex-col flex-1 w-full gap-4">
                        <p className="font-body text-sm font-bold uppercase tracking-widest opacity-80">Scan QR to pay <span className="text-[#E02915]">₹{total.toFixed(2)}</span></p>
                        <p className="font-body text-xs opacity-60 normal-case">After successful payment, please enter the 12-digit Transaction/UTR number below to verify your order.</p>
                        <input required type="text" placeholder="ENTER 12-DIGIT UTR NUMBER" className="w-full bg-transparent border-b-2 border-[#E02915] p-3 font-body outline-none placeholder:text-[#E02915]/50 uppercase" />
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="font-body text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Pay at your doorstep</p>
                      <p className="font-body text-xs opacity-60 max-w-md mx-auto normal-case">You will pay the courier when your package arrives. Please ensure you have the exact amount ready to avoid exact-change issues.</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={isProcessing} className="w-full bg-[#E02915] text-[#F2EFE9] py-6 font-display text-4xl uppercase tracking-tighter hover:bg-black transition-colors disabled:opacity-50 cursor-pointer">
                {isProcessing ? "Processing..." : "Confirm Order"}
              </button>
            </form>
          </div>

          <div className="w-full lg:w-[450px]">
            <div ref={summaryRef} className="bg-[#E5E1D8] border-2 border-[#E02915] p-8 sticky top-8">
              <h2 className="font-display text-3xl uppercase tracking-tighter mb-8 border-b-2 border-[#E02915] pb-4">Order Summary</h2>
              <div className="flex flex-col gap-6 mb-8 max-h-[400px] overflow-y-auto">
                {cartItems.map((item: any) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-20 h-24 object-cover border border-[#E02915]" />
                    <div className="flex flex-col flex-1 justify-center font-body text-xs uppercase tracking-widest font-bold">
                      <div className="flex justify-between mb-1"><span className="truncate pr-2">{item.name}</span><span>₹{parseFloat(item.price.replace('₹', '')).toFixed(2)}</span></div>
                      <span className="opacity-60 mb-1">Size: {item.size}</span>
                      <span className="opacity-60">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4 font-body text-sm font-bold uppercase tracking-widest border-t-2 border-[#E02915] pt-6">
                <div className="flex justify-between"><span className="opacity-60">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="opacity-60">Shipping</span><span>₹{shipping.toFixed(2)}</span></div>
                <div className="flex justify-between text-xl mt-4 pt-4 border-t border-[#E02915]/30"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>

        </div>
      )}
    </main>
  );
}