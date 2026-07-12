'use client'
import Link from 'next/link';
import { useParams } from 'next/navigation';

// DYNAMIC CONTENT MAPPING - UPDATED FOR COMPLIANCE
const policyContent = {
  terms: {
    title: "Terms of Service",
    content: (
      <div className="flex flex-col gap-6">
        <p>This Terms of Service agreement constitutes a legally binding contract between you and Bella House. By accessing our website, browsing our product catalog, or completing a purchase, you acknowledge that you have read, understood, and agreed to be bound by these terms.</p>
        
        <h3 className="font-bold text-lg mt-4 uppercase">1. Use of Service</h3>
        <p>You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.</p>

        <h3 className="font-bold text-lg mt-4 uppercase">2. Modifications to Prices and Services</h3>
        <p>Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.</p>

        <h3 className="font-bold text-lg mt-4 uppercase">3. Governing Law</h3>
        <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India, specifically within the jurisdiction of the courts in Ludhiana, Punjab.</p>
      </div>
    )
  },
  privacy: {
    title: "Privacy Policy",
    content: (
      <div className="flex flex-col gap-6">
        <p>At Bella House, accessible from bellahouse.in, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Bella House and how we use it.</p>
        
        <h3 className="font-bold text-lg mt-4 uppercase">Information We Collect</h3>
        <p>We collect personal information that you provide to us, such as name, email address, shipping address, and payment information when you register an account or place an order. We use this information to fulfill orders, process payments, and improve your shopping experience.</p>

        <h3 className="font-bold text-lg mt-4 uppercase">Data Protection</h3>
        <p>We implement a variety of security measures to maintain the safety of your personal information when you place an order. We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information.</p>
      </div>
    )
  },
  refund: {
    title: "Cancellation & Refund Policy",
    content: (
      <div className="flex flex-col gap-6">
        <p>We take pride in the quality of our handcrafted apparel. Please review our refund policy carefully to understand your rights and our obligations.</p>
        
        <h3 className="font-bold text-lg mt-4 uppercase">Order Cancellation</h3>
        <p>Orders can only be cancelled within 24 hours of placement. Since our products are made-to-measure according to your specific body measurements, production begins shortly after the order is confirmed.</p>

        <h3 className="font-bold text-lg mt-4 uppercase">Returns and Refunds</h3>
        <p>Due to the personalized nature of made-to-measure clothing, we do not accept returns for "change of mind." However, if a product is received with a manufacturing defect or is damaged during transit, please contact us within 48 hours of delivery with photographic evidence. Upon verification, we will offer a repair, replacement, or a refund to the original payment method.</p>
      </div>
    )
  },
  shipping: {
    title: "Shipping & Delivery Policy",
    content: (
      <div className="flex flex-col gap-6">
        <p>Bella House is committed to delivering your order with quality packaging within the given time frame. We ship throughout the week, except Sundays & Public holidays.</p>
        
        <h3 className="font-bold text-lg mt-4 uppercase">Processing Time</h3>
        <p>Since each garment is crafted uniquely to your measurements, please allow 10–14 business days for production and dispatch. Once your order is shipped, you will receive an email containing your tracking information.</p>

        <h3 className="font-bold text-lg mt-4 uppercase">Shipping Charges</h3>
        <p>Shipping charges are calculated at checkout based on your delivery location. We partner with reputable courier services to ensure your package arrives safely. Bella House is not responsible for any delays caused by courier partners due to unforeseen circumstances.</p>
      </div>
    )
  }
};

export default function Page() {
  const params = useParams();
  
  // Safely grab the slug from the browser URL
  const currentSlug = (params?.slug as string)?.toLowerCase();

  // If the slug matches our list, use it. Otherwise, safely default to 'terms'
  const policy = policyContent[currentSlug as keyof typeof policyContent] || policyContent.terms;

  return (
    <main className="min-h-screen bg-[#F2EFE9] text-[#E02915] selection:bg-[#E02915] selection:text-[#F2EFE9]">
      
      {/* THE FUNCTIONAL STICKY HEADER */}
      <header className="w-full px-6 md:px-8 py-6 md:py-8 flex justify-between items-center border-b-2 border-[#E02915] bg-[#F2EFE9] sticky top-0 z-50">
        <Link href="/" className="font-display text-3xl md:text-4xl tracking-tighter leading-none mt-1 hover:opacity-60 transition-opacity">
          ++ BELLA HOUSE
        </Link>
        <div className="flex items-center gap-6 md:gap-8 font-body text-xs md:text-sm font-bold uppercase tracking-widest">
          <Link href="/" className="hover:opacity-60 transition-opacity flex items-center gap-2">
            <span className="hidden sm:inline">←</span> Home
          </Link>
          <Link href="/shop" className="hover:opacity-60 transition-opacity">
            Shop
          </Link>
          <span className="opacity-40 hidden sm:block">|</span>
          <span className="opacity-80">Legal</span>
        </div>
      </header>

      {/* DYNAMIC PAGE CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-20 md:py-32">
        <h1 className="font-display text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-16">
          {policy.title}
        </h1>

        <div className="font-body text-base md:text-lg flex flex-col opacity-90 leading-relaxed">
          {policy.content}
        </div>
      </div>
      
    </main>
  );
}