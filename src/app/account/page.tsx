'use client'
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch Orders
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      // Thanks to RLS, this will automatically ONLY fetch this user's orders!
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      if (error) console.error("Error fetching orders:", error);
      
      setLoadingOrders(false);
    };

    fetchOrders();
  }, [user]);

  // Entrance Animation
  useEffect(() => {
    if (authLoading || !user) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, [authLoading, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Protect the route
  if (authLoading) return <div className="min-h-screen bg-[#F2EFE9]" />;
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F2EFE9] text-[#E02915] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-4xl uppercase tracking-tighter mb-4">Access Denied</h1>
        <p className="font-body opacity-80 mb-8">You must be logged in to view your account.</p>
        <Link href="/" className="border-b-2 border-[#E02915] font-bold uppercase tracking-widest text-sm pb-1">Return Home</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2EFE9] text-[#E02915] selection:bg-[#E02915] selection:text-[#F2EFE9] pb-32">
      
      <header className="w-full px-6 md:px-8 py-6 md:py-8 flex justify-between items-center border-b-2 border-[#E02915]">
        <Link href="/" className="font-display text-3xl md:text-4xl tracking-tighter leading-none mt-1 hover:opacity-60 transition-opacity">++ BELLA HOUSE</Link>
        <div className="flex gap-6 items-center">
          <Link href="/shop" className="font-body text-sm font-bold uppercase tracking-widest hover:opacity-60">Shop</Link>
          <button onClick={handleLogout} className="font-body text-sm font-bold uppercase tracking-widest hover:opacity-60">Log Out</button>
        </div>
      </header>

      <div ref={containerRef} className="max-w-[1400px] mx-auto pt-16 px-6 md:px-8 flex flex-col gap-16">
        
        {/* Profile Header */}
        <section className="flex flex-col gap-4 border-b-2 border-[#E02915] pb-12">
          <h1 className="font-display text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
            Hello, <br />{user.user_metadata?.full_name || 'Member'}.
          </h1>
          <p className="font-body text-lg opacity-80">Email: {user.email}</p>
        </section>

        {/* Order History */}
        <section className="flex flex-col gap-8">
          <h2 className="font-body font-bold uppercase tracking-widest text-xl">Order History</h2>
          
          {loadingOrders ? (
            <p className="font-body opacity-60">Loading your orders...</p>
          ) : orders.length === 0 ? (
            <div className="border-2 border-[#E02915] p-12 text-center flex flex-col items-center gap-4 bg-[#E5E1D8]">
              <p className="font-body opacity-80">You haven't placed any orders yet.</p>
              <Link href="/shop" className="font-body font-bold uppercase tracking-widest text-sm border-b-2 border-[#E02915] pb-1 hover:opacity-60">Start Shopping</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order) => (
                <div key={order.id} className="border-2 border-[#E02915] bg-[#E5E1D8] flex flex-col md:flex-row">
                  
                  {/* Order Details Left Side */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between gap-8 md:border-r-2 border-[#E02915]">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-body text-xs uppercase tracking-widest">
                      <div className="flex flex-col gap-1">
                        <span className="opacity-60 font-bold">Order ID</span>
                        {/* Slice UUID to make it look cleaner */}
                        <span>#{order.id.slice(0, 8)}</span> 
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="opacity-60 font-bold">Date</span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="opacity-60 font-bold">Total</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="opacity-60 font-bold">Status</span>
                        <span className={order.status === 'processing' ? 'text-black' : ''}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 font-body text-sm">
                      <span className="font-bold uppercase tracking-widest text-xs opacity-60">Shipped To:</span>
                      <p>{order.shipping_name}</p>
                      <p className="opacity-80">{order.shipping_address}, {order.shipping_city} {order.shipping_postal_code}</p>
                    </div>
                  </div>

                  {/* Order Items Right Side */}
                  <div className="p-6 md:p-8 md:w-[400px] flex flex-col gap-4 bg-[#F2EFE9]">
                    <span className="font-body font-bold uppercase tracking-widest text-xs opacity-60 mb-2">Items</span>
                    <div className="flex flex-col gap-4 max-h-[200px] overflow-y-auto">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex gap-4">
                          <img src={item.image} alt={item.name} className="w-16 h-20 object-cover border border-[#E02915]" />
                          <div className="flex flex-col justify-center font-body text-xs uppercase tracking-widest font-bold">
                            <span className="truncate max-w-[150px]">{item.name}</span>
                            <span className="opacity-60 mt-1">Size: {item.size}</span>
                            <span className="opacity-60">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}