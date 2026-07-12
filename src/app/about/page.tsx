'use client'
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F2EFE9] text-[#E02915] selection:bg-[#E02915] selection:text-[#F2EFE9]">
      
      <header className="w-full px-6 md:px-8 py-6 md:py-8 flex justify-between items-center border-b-2 border-[#E02915]">
        <Link href="/" className="font-display text-3xl md:text-4xl tracking-tighter leading-none mt-1 hover:opacity-60 transition-opacity">++ BELLA HOUSE</Link>
        <span className="font-body text-sm md:text-base font-bold uppercase tracking-widest">About Us</span>
      </header>

      <section className="max-w-[1400px] mx-auto px-6 md:px-8 py-24 md:py-40 min-h-screen flex flex-col md:flex-row gap-16 md:gap-32">
        
        <div className="md:w-1/2">
          <h1 className="font-display text-6xl md:text-8xl lg:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] mb-8">
            Made to be worn. Or judged. Or both.
          </h1>
        </div>

        <div className="md:w-1/2 flex flex-col justify-center gap-12 font-body text-lg md:text-2xl opacity-90 leading-relaxed">
          <p>
            Bella House was created to celebrate our collective creativity and passion for women's apparel. We don't believe in fast fashion; we believe in carefully designed, structured pieces that outlast seasonal trends.
          </p>
          <p>
            Based in Ludhiana, Punjab, every piece is conceptualized with negative space, brutalist architecture, and grid systems in mind. We treat fabric the same way a developer treats code: formatting matters, structure is everything, and the final output must be flawless.
          </p>
          
          <div className="mt-8 pt-12 border-t-2 border-[#E02915]">
             <h3 className="font-bold uppercase tracking-widest text-sm mb-4">The Team</h3>
             <p className="text-base">Founded by Indra Kotwal. Driven by grid systems and a love for high-contrast design. </p>
          </div>
        </div>

      </section>
    </main>
  );
}