'use client'
import Link from 'next/link';

const FIELDS = [
  { id: '(1)', name: 'Name', type: 'text', placeholder: 'We like first names. Keeps it human.' },
  { id: '(2)', name: 'Email', type: 'email', placeholder: 'The real one. We promise not to abuse it.' },
  { id: '(3)', name: 'Location', type: 'text', placeholder: 'Where you are shopping from.' },
  { id: '(4)', name: 'Inquiry', type: 'text', placeholder: 'Order issue, sizing, or general question.' },
  { id: '(5)', name: 'Message', type: 'text', placeholder: "What's on your mind. No need to polish it." },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#F2EFE9] text-[#E02915] selection:bg-[#E02915] selection:text-[#F2EFE9] flex flex-col">
      
      {/* Header */}
      <div className="p-6 md:p-12 flex justify-between items-start z-10">
        <h1 className="font-display text-4xl md:text-6xl font-black uppercase tracking-tighter">Say hello</h1>
        <Link href="/" className="font-body font-bold uppercase tracking-widest text-sm hover:opacity-60 transition-opacity">
          [Close]
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full px-6 md:px-12 flex flex-col max-w-[1600px] mx-auto pt-12 md:pt-24">
        
        <h2 className="font-display text-5xl md:text-7xl lg:text-[7vw] font-black uppercase tracking-tighter leading-[0.85] text-[#E02915]/40 mb-16 md:mb-32 md:pl-[30%]">
          Every great wardrobe started with a vision. <span className="text-[#E02915]">Just tell us what you're looking for and why it matters.</span>
        </h2>

        {/* The Brutalist Form */}
        <form className="flex flex-col w-full pb-32">
          {FIELDS.map((field) => (
            <div key={field.id} className="group relative flex flex-col md:flex-row md:items-center py-6 md:py-8 border-b-2 border-[#E02915]/20">
              
              <div className="flex w-full md:w-[30%] items-center font-body font-bold text-lg md:text-2xl mb-4 md:mb-0">
                <span className="w-16 opacity-50">{field.id}</span>
                <span>{field.name}</span>
              </div>
              
              <div className="flex-1 w-full">
                <input 
                  type={field.type}
                  required
                  placeholder={field.placeholder}
                  className="w-full bg-transparent outline-none font-body text-lg md:text-2xl placeholder:text-[#E02915]/30 text-[#E02915]"
                />
              </div>

              {/* THE MAGIC LINE ANIMATION */}
              <span className="absolute bottom-[-2px] left-0 w-full h-[4px] bg-[#E02915] scale-x-0 origin-left transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-focus-within:scale-x-100" />
            </div>
          ))}
        </form>
      </div>

      {/* The Massive Bottom Submit Button */}
      <button 
        type="button"
        className="w-full fixed bottom-0 left-0 bg-[#E02915] text-[#F2EFE9] py-6 px-6 md:px-12 flex justify-between items-center hover:bg-black transition-colors group"
      >
        <span className="font-body font-bold text-xl md:text-2xl uppercase tracking-widest">Send message</span>
        <span className="font-display text-4xl md:text-6xl tracking-tighter group-hover:translate-x-4 transition-transform">→</span>
      </button>

    </main>
  );
}