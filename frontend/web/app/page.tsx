import SafeSpaceJournal from "../components/SafeSpaceJournal";
import DisorderLibrary from "../components/DisorderLibrary";
import { NearestPractitioner } from "../components/NearestPractitioner";
import AiAgent from "../components/AiAgent";
import Disclaimer from "../components/Disclaimer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7fafd] text-[#181c1f] antialiased font-body-font">
      <header className="bg-[#f7fafd] text-[#09435e] w-full sticky top-0 border-b border-[#e0e3e6] shadow-sm z-50">
        <div className="max-w-[1120px] mx-auto px-6 md:px-8 flex justify-between items-center h-16">
          <div className="text-xl font-semibold">Menti.Co</div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#41484d]">
            <a className="border-b-2 border-[#09435e] pb-1 text-[#09435e]" href="#">Symptom Guide</a>
            <a className="hover:text-[#09435e] transition-colors duration-300" href="#">Articles</a>
            <a className="hover:text-[#09435e] transition-colors duration-300" href="#">Remedies</a>
            <a className="hover:text-[#09435e] transition-colors duration-300" href="#">About Us</a>
          </nav>

          <div className="flex items-center gap-4">
            <button aria-label="Search" className="text-[#41484d] hover:text-[#09435e] transition-colors duration-300">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button aria-label="Account" className="text-[#41484d] hover:text-[#09435e] transition-colors duration-300">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-[1120px] mx-auto px-6 py-10 space-y-20">
        <section className="text-center space-y-8 py-12 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-[#09435e] leading-tight">
            Understand Your Mind. Discover Your Path to Wellness.
          </h1>
          <p className="text-lg md:text-xl text-[#41484d] leading-8">
            Explore a trusted, calm, and evidence-based environment for mental health education.
          </p>
        </section>

        <AiAgent />

        <SafeSpaceJournal />

        <NearestPractitioner />

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="md:col-span-2 bg-white rounded-3xl p-8 flex flex-col justify-between group hover:shadow-[0_8px_24px_rgba(42,91,119,0.08)] transition-shadow duration-300 ease-in-out relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <span className="material-symbols-outlined text-[6rem]">menu_book</span>
            </div>
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center space-x-2 text-[#2e6861] bg-[#b3eee5] px-3 py-1 rounded-full text-sm font-semibold">
                <span className="material-symbols-outlined text-[16px]">star</span>
                <span>Daily Featured Insight</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-[#09435e]">
                The Neuroscience of Mindfulness
              </h2>
              <p className="text-base md:text-lg text-[#41484d] leading-8">
                Discover how consistent mindfulness practices physically alter the brain's structure, reducing reactivity in the amygdala and strengthening the prefrontal cortex over time.
              </p>
            </div>
            <div className="mt-8 relative z-10">
              <a className="inline-flex items-center text-[#09435e] font-semibold hover:text-[#336380] transition-colors duration-300" href="#">
                Read Article <span className="material-symbols-outlined ml-1 text-[18px]">arrow_forward</span>
              </a>
            </div>
          </article>

          <div className="bg-[#09435e] text-white rounded-3xl p-8 flex flex-col justify-center items-center text-center">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-80" style={{ fontVariationSettings: `FILL 1` }}>library_books</span>
            <h3 className="text-4xl font-semibold">500+</h3>
            <p className="text-sm mt-2 opacity-90">Clinically Reviewed Articles</p>
          </div>

          <article className="bg-white rounded-3xl p-6 border border-[#e0e3e6] hover:bg-[#f1f4f7] transition-colors duration-300 ease-in-out cursor-pointer flex flex-col items-start">
            <div className="p-3 bg-[#c6e7ff] rounded-xl text-[#001e2d] mb-4">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: `FILL 1` }}>health_and_safety</span>
            </div>
            <h3 className="text-xl font-semibold text-[#181c1f] mb-2">Symptom Guide</h3>
            <p className="text-sm text-[#41484d] mb-4 flex-grow leading-7">
              An interactive tool to help you articulate and understand what you're experiencing before speaking to a professional.
            </p>
            <span className="text-[#09435e] font-semibold flex items-center">
              Start Guide <span className="material-symbols-outlined ml-1 text-[18px]">arrow_right_alt</span>
            </span>
          </article>

          <article className="md:col-span-2 bg-white rounded-3xl p-6 border border-[#e0e3e6] flex flex-col md:flex-row items-center gap-6 hover:shadow-[0_4px_12px_rgba(42,91,119,0.08)] transition-shadow duration-300 ease-in-out">
            <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden bg-[#e5e8ec] flex-shrink-0">
              <img
                alt="Natural Remedies"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFHDsBXGEku1WTSTC2YQVt2p-H4y4uvO-z6iCvc4VMFrAi-XIdW0KlGwAm9rxIE4-uq2LvEw-1vAdykOzTSu94OWdMrLqh81BcP3FlqeIsh5xgghdoQFakt7pKNANU_i_mgvLP18xw40s-q2ozIv-qPPeQovdiLJPaFwsRec6yUb2xjur5N6Am7dqABbd43PFqURHLIuuUU6GRhCtyECYPfZ51gBqIPZ_5k_wEsY5zpp76X3YNNFwzksDTWvBZhydxcvwaXKAux7VG"
              />
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center text-[#2e6861] font-semibold text-sm">
                <span className="material-symbols-outlined mr-2 text-[18px]">spa</span>
                Lifestyle Strategies
              </div>
              <h3 className="text-2xl font-semibold text-[#181c1f]">Evidence-Based Natural Remedies</h3>
              <p className="text-sm text-[#41484d] leading-7">
                Explore holistic approaches to mental wellness, from the impact of nutrition on mood to sleep hygiene protocols that support emotional regulation.
              </p>
            </div>
          </article>
        </section>

        <DisorderLibrary />
        
        <Disclaimer />

        <section className="bg-[#ffdad6] text-[#93000a] rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: `FILL 1` }}>emergency</span>
            <div>
              <h3 className="font-semibold">Need immediate support?</h3>
              <p className="text-sm opacity-90">If you are in crisis, please seek immediate help.</p>
            </div>
          </div>
          <a className="px-6 py-2 bg-[#93000a] text-[#ffdad6] rounded-2xl font-semibold hover:bg-[#7b0000] transition-colors duration-300" href="#">
            View Emergency Resources
          </a>
        </section>
      </main>

      <footer className="bg-[#ebeef2] text-[#09435e] w-full border-t border-[#e0e3e6] mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-[1120px] mx-auto py-16 gap-8">
          <div className="text-xl font-semibold">Menti.Co</div>
          <p className="text-sm text-[#41484d] text-center md:text-left">
            © 2026 Menti.Co. For educational purposes only. If in crisis, call emergency services.
          </p>
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-[#41484d]">
            <a className="hover:text-[#09435e] transition-colors" href="#">Legal</a>
            <a className="hover:text-[#09435e] transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-[#09435e] transition-colors" href="#">Emergency Resources</a>
            <a className="hover:text-[#09435e] transition-colors" href="#">Contact Us</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
