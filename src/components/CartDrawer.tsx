'use client'
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // <-- IMPORT AUTH
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();
  const { user, setIsAuthOpen } = useAuth(); // <-- GET USER STATE
  const router = useRouter();
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const subtotal = cartItems.reduce((total, item) => {
    const numericPrice = parseFloat(item.price.replace('$', ''));
    return total + (numericPrice * item.quantity);
  }, 0);

  useEffect(() => {
    if (isCartOpen) {
      gsap.to(overlayRef.current, { opacity: 1, pointerEvents: 'all', duration: 0.4, ease: "power2.out" });
      gsap.to(drawerRef.current, { x: "0%", duration: 0.6, ease: "power4.out" });
    } else {
      gsap.to(overlayRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.4, ease: "power2.in" });
      gsap.to(drawerRef.current, { x: "100%", duration: 0.5, ease: "power3.in" });
    }
  }, [isCartOpen]);

  // GATEKEEPER FUNCTION
  const handleCheckoutClick = () => {
    setIsCartOpen(false); // Close the drawer
    
    if (!user) {
      // If not logged in, drop the auth modal down!
      setIsAuthOpen(true);
    } else {
      // If logged in, proceed to checkout
      router.push('/checkout');
    }
  };

  return (
    <>
      <div 
        ref={overlayRef}
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9000] opacity-0 pointer-events-none cursor-pointer"
      />

      <div 
        ref={drawerRef}
        className="fixed top-0 right-0 w-full md:w-[500px] h-full bg-[#F2EFE9] text-[#E02915] z-[9001] translate-x-full flex flex-col border-l-2 border-[#E02915]"
      >
        <div className="flex justify-between items-center p-6 border-b-2 border-[#E02915]">
          <h2 className="font-display text-4xl uppercase tracking-tighter mt-2">Your Bag</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-4xl font-light hover:opacity-60 transition-opacity leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          {cartItems.length === 0 ? (
            <p className="font-body text-sm uppercase tracking-widest opacity-60 text-center mt-12">Your bag is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-6">
                <div className="w-24 h-32 bg-[#E5E1D8] border border-[#E02915]">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex flex-col flex-1 justify-between font-body text-sm">
                  <div>
                    <div className="flex justify-between font-bold uppercase tracking-widest text-base mb-1">
                      <span>{item.name}</span>
                      <span>{item.price}</span>
                    </div>
                    <span className="opacity-70 uppercase tracking-widest text-xs">Size: {item.size}</span>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-4 border border-[#E02915] px-3 py-1">
                      <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="hover:opacity-60">−</button>
                      <span className="w-4 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="hover:opacity-60">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.size)} className="uppercase tracking-widest text-[10px] font-bold border-b border-[#E02915] hover:opacity-60">Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t-2 border-[#E02915] bg-[#F2EFE9]">
          <div className="flex justify-between font-body text-lg font-bold uppercase tracking-widest mb-6">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          
          {/* UPDATED: Uses the gatekeeper function instead of direct Link */}
          <button 
            onClick={handleCheckoutClick}
            disabled={cartItems.length === 0}
            className="w-full py-4 bg-[#E02915] text-[#F2EFE9] font-display text-3xl uppercase tracking-tighter hover:bg-black transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
          >
            Checkout <span>→</span>
          </button>
        </div>
      </div>
    </>
  );
}