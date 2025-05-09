import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import Logo from "./Logo";

type NavLinkProps = {
  href: string;
  icon: string;
  children: ReactNode;
};

const NavLink = ({ href, icon, children }: NavLinkProps) => {
  const [location] = useLocation();
  const isActive = location === href || 
                  (href !== "/" && location.startsWith(href));
  
  return (
    <li>
      <Link href={href}>
        <a className={`px-3 py-2 rounded-lg transition font-medium flex items-center ${
          isActive ? "bg-primary/10 text-primary" : "hover:bg-neutral-100"
        }`}>
          <i className={`fas ${icon} mr-2 ${isActive ? "text-primary" : "text-primary"}`}></i>
          <span>{children}</span>
        </a>
      </Link>
    </li>
  );
};

const Footer = () => (
  <footer className="bg-neutral-900 text-white pt-12 pb-6">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center mb-4">
            <i className="fas fa-shield-alt text-2xl mr-3 text-primary-light"></i>
            <h2 className="text-xl font-bold">Guardian Shield</h2>
          </div>
          <p className="text-neutral-400 text-sm">Protecting you from social engineering attacks with advanced AI technology.</p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4">Protection Tools</h3>
          <ul className="space-y-2 text-neutral-300">
            <li><Link href="/voice-detection"><a className="hover:text-white transition">AI Voice Detection</a></Link></li>
            <li><Link href="/deepfake-detection"><a className="hover:text-white transition">Deepfake Detection</a></Link></li>
            <li><Link href="/phishing-detection"><a className="hover:text-white transition">Phishing Detection</a></Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4">Resources</h3>
          <ul className="space-y-2 text-neutral-300">
            <li><a href="#" className="hover:text-white transition">Blog</a></li>
            <li><a href="#" className="hover:text-white transition">Security Guide</a></li>
            <li><a href="#" className="hover:text-white transition">FAQ</a></li>
            <li><a href="#" className="hover:text-white transition">API Documentation</a></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-neutral-300">
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-neutral-800 pt-6 flex flex-col md:flex-row justify-between items-center">
        <div className="text-neutral-400 text-sm mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} Guardian Shield. All rights reserved.
        </div>
        <div className="flex space-x-4">
          <a href="#" className="text-neutral-400 hover:text-white transition"><i className="fab fa-twitter"></i></a>
          <a href="#" className="text-neutral-400 hover:text-white transition"><i className="fab fa-linkedin"></i></a>
          <a href="#" className="text-neutral-400 hover:text-white transition"><i className="fab fa-github"></i></a>
        </div>
      </div>
    </div>
  </footer>
);

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 font-sans text-neutral-900">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <Link href="/">
              <a className="flex items-center">
                <Logo className="text-primary mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-primary">Guardian Shield</h1>
                  <p className="text-xs text-neutral-600">Social Engineering Protection Platform</p>
                </div>
              </a>
            </Link>
          </div>
          
          <nav className="w-full sm:w-auto">
            <ul className="flex justify-between space-x-1 sm:space-x-2 text-sm">
              <NavLink href="/voice-detection" icon="fa-microphone-alt">
                Voice Detection
              </NavLink>
              <NavLink href="/deepfake-detection" icon="fa-video">
                Deepfake Detection
              </NavLink>
              <NavLink href="/phishing-detection" icon="fa-fish">
                Phishing Detection
              </NavLink>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
      
      {/* Add Font Awesome */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        rel="stylesheet"
      />
    </div>
  );
}
