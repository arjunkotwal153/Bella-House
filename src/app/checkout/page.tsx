'use client'
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext"; 
import { supabase } from "../../lib/supabase"; 

// 1. RAZORPAY SCRIPT LOADER
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart(); 
  const { user, loading } = useAuth(); 
  
  const subtotal = cartItems.reduce((total: number, item: any) => {
    const numericPrice = parseFloat(item.price.replace('₹', ''));
    return total + (numericPrice * item.quantity);
  }, 0);
  const shipping = subtotal > 0 ? 150 : 0;
  const total = subtotal + shipping;

  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successOverlayRef = useRef<HTMLDivElement>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  // FORM STATE
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // NEW: Phone state added
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
  // SUPABASE DATABASE INSERTION HELPER
  // =========================================
  const saveOrderToDatabase = async () => {
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
            payment_method: 'razorpay',
            subtotal: subtotal,
            shipping_fee: shipping,
            total: total,
            status: 'paid',
            items: cartItems 
          }
        ]);
      
      if (error) throw error;
        // ---> NEW: Trigger the confirmation email <---
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: email, 
            firstName: firstName,
            total: total,
          }),
        });
      clearCart();
      setIsProcessing(false);

      // Trigger Success Animation
      gsap.to(successOverlayRef.current, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power4.inOut", pointerEvents: "all" });
      gsap.fromTo(".success-text", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.5 });
      
    } catch (error) {
      console.error("Error saving order:", error);
      alert("There was an issue saving your order. Please contact support.");
      setIsProcessing(false);
    }
  };

  // =========================================
  // MAIN CHECKOUT HANDLER
  // =========================================
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Trigger RAZORPAY Flow Immediately
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Secure Payment Gateway failed to load. Please check your internet connection.");
      setIsProcessing(false);
      return;
    }

    try {
      // 1. Tell your backend to create a Razorpay order
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }), 
      });

      const order = await response.json();
      if (!order.id) throw new Error("Server failed to create order.");

      // 2. Configure Razorpay Popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: "Bella House",
        description: "Apparel Purchase",
        order_id: order.id,
        handler: async function (response: any) {
          // PAYMENT SUCCESS! Now save it to Supabase
          await saveOrderToDatabase();
        },
        // NEW: Dynamic prefill block using the phone state
        prefill: {
          name: `${firstName} ${lastName}`,
          email: email,
          contact: phone, // Passes the customer's phone number securely
        },
        theme: {
          color: "#E02915",
        },
        modal: {
          ondismiss: function () {
            // If user closes the window without paying
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error("Razorpay Error:", error);
      alert("Something went wrong initiating the payment.");
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F2EFE9] text-[#E02915] selection:bg-[#E02915] selection:text-[#F2EFE9] pb-32">
      
      {/* SUCCESS OVERLAY */}
      <div ref={successOverlayRef} style={{ clipPath: "inset(0% 0% 100% 0%)" }} className="fixed inset-0 z-[99999] bg-[#E02915] text-[#F2EFE9] flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl text-center flex flex-col items-center">
          <h1 className="success-text font-display text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6 leading-none">Order<br/>Confirmed</h1>
          <p className="success-text font-body text-lg md:text-xl opacity-90 mb-12 max-w-md">Your order has been placed securely. Tracking details will be sent to {email}.</p>
          
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
                {/* NEW: Phone number input field */}
                <input 
                  required 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="PHONE NUMBER (FOR DELIVERY UPDATES)" 
                  className="w-full bg-transparent border-b-2 border-[#E02915]/30 focus:border-[#E02915] p-4 font-body outline-none placeholder:text-[#E02915]/50 transition-colors" 
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

              {/* ANIMATED PAYMENT BUTTON */}
              <button 
                type="submit" 
                disabled={isProcessing} 
                className="group relative w-full bg-[#E02915] text-[#F2EFE9] py-8 font-display text-4xl md:text-5xl uppercase tracking-tighter overflow-hidden disabled:opacity-50 cursor-pointer transition-all active:scale-[0.98]"
              >
                {/* Background slide-up effect */}
                <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500 ease-in-out"></div>
                
                {/* Button Text with sliding arrow */}
                <span className="relative z-10 flex items-center justify-center gap-4">
                  {isProcessing ? "Connecting..." : "Proceed to Payment"}
                  {!isProcessing && <span className="group-hover:translate-x-4 transition-transform duration-500">→</span>}
                </span>
              </button>
              
              <div className="text-center -mt-8 flex flex-col items-center gap-2 opacity-60">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <p className="font-body text-[10px] uppercase tracking-widest font-bold">100% Secure Checkout powered by Razorpay</p>
              </div>

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