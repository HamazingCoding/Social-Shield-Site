import { Link } from "wouter";
import HeroScene from "@/components/three/HeroScene";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Protect Yourself From Social Engineering
              </h1>
              <p className="text-lg opacity-90 mb-6">
                Advanced AI tools to detect fraudulent calls, deepfake videos, and phishing attempts.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/voice-detection">
                  <a className="bg-white text-primary px-6 py-3 rounded-lg font-semibold transition hover:bg-neutral-100 inline-flex items-center">
                    Get Started
                    <i className="fas fa-arrow-right ml-2"></i>
                  </a>
                </Link>
                <a href="#features" className="border border-white bg-transparent px-6 py-3 rounded-lg font-semibold transition hover:bg-white/10 inline-flex items-center">
                  Learn More
                </a>
              </div>
            </div>
            <div className="md:w-1/2 canvas-container">
              <div className="w-full h-full relative overflow-hidden h-[240px] md:h-[240px]">
                <HeroScene />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Our Three-Phase Protection System</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-microphone-alt text-xl text-primary"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Voice Detection</h3>
              <p className="text-neutral-700">Upload audio from calls to instantly verify if the voice is real or AI-generated.</p>
            </div>
            
            <div className="bg-neutral-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-video text-xl text-primary"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Deepfake Detection</h3>
              <p className="text-neutral-700">Analyze video calls to identify signs of synthetic or manipulated content.</p>
            </div>
            
            <div className="bg-neutral-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-fish text-xl text-primary"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Phishing Detection</h3>
              <p className="text-neutral-700">Identify suspicious links and emails designed to steal your personal information.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-neutral-50 border-t border-neutral-200">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Protect Yourself?</h2>
          <p className="text-neutral-700 max-w-2xl mx-auto mb-8">
            Start using our advanced protection tools today and stay one step ahead of social engineering threats.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/voice-detection">
              <a className="bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-lg font-semibold transition">
                <i className="fas fa-microphone-alt mr-2"></i>
                Voice Detection
              </a>
            </Link>
            <Link href="/deepfake-detection">
              <a className="bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-lg font-semibold transition">
                <i className="fas fa-video mr-2"></i>
                Deepfake Detection
              </a>
            </Link>
            <Link href="/phishing-detection">
              <a className="bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-lg font-semibold transition">
                <i className="fas fa-fish mr-2"></i>
                Phishing Detection
              </a>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
