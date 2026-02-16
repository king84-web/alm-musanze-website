
import React, { useState, useEffect } from 'react';
import { Button, Icon } from '@/src/components/Common';
import { ViewState } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/store/mockdata';
import FloatingPersonCard from './personal-card';



interface PublicLayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, currentView, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { label: string; view: ViewState }[] = [
    { label: 'Home', view: 'PUBLIC_HOME' },
    { label: 'About', view: 'PUBLIC_ABOUT' },
    { label: 'Events', view: 'PUBLIC_EVENTS' },
    { label: 'Gallery', view: 'PUBLIC_GALLERY' },
    { label: 'Finance', view: 'PUBLIC_FINANCE' },
    { label: 'Leaders', view: 'PUBLIC_LEADERS' },
    { label: 'Contact', view: 'PUBLIC_CONTACT' },
  ];

  const isAuthPage = currentView.startsWith('AUTH_');

  const isDarkText = isScrolled || isAuthPage;

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => onNavigate('PUBLIC_HOME')}
            >
              <div
                className="size-10 rounded-full bg-cover bg-center border-0 border-white/20 shadow-sm"
                style={{ backgroundImage: `url(${Logo})` }}
              />
              <span className={`font-black text-xl tracking-tight transition-colors ${isDarkText ? 'text-primary' : 'text-white drop-shadow-md'}`}>
                ALM
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex gap-8">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => onNavigate(item.view)}
                  className={`text-sm font-semibold transition-colors relative group ${isDarkText ? 'text-gray-600 hover:text-primary' : 'text-white/90 hover:text-white'
                    } ${currentView === item.view ? (isDarkText ? 'text-primary' : 'text-white font-bold') : ''}`}
                >
                  {item.label}
                  {currentView === item.view && (
                    <motion.div
                      layoutId="underline"
                      className={`absolute -bottom-1 left-0 right-0 h-0.5 ${isDarkText ? 'bg-primary' : 'bg-white'}`}
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden lg:flex gap-3">
              <Button
                variant={!isDarkText ? 'outline' : 'ghost'}
                className={`outline-none ${currentView.includes("AUTH") ? "" : "text-text-muted border-0"}  focus:ring-0 focus:ring-offset-0 dark:focus:ring-0 dark:focus:ring-offset-0 `}
                size="sm"
                onClick={() => onNavigate('AUTH_LOGIN')}
              >
                Login
              </Button>
              <Button variant="primary" size="sm" onClick={() => onNavigate('AUTH_REGISTER')} className="shadow-lg">
                Register
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                className={`${isDarkText ? 'text-gray-800' : 'text-white'} hover:bg-transparent focus:bg-transparent `}
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Icon name="menu" className="text-2xl" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-[61] w-[85%] max-w-sm bg-white shadow-2xl lg:hidden flex flex-col"
            >
              <div className="p-4 flex justify-between items-center border-b border-gray-100">
                <span className="font-black text-xl text-primary">ALM Musanze</span>
                <Button variant="ghost" className='bg-transparent hover:bg-transparent' onClick={() => setIsMobileMenuOpen(false)}>
                  <Icon name="close" className="text-2xl" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      onNavigate(item.view);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-4 text-left rounded-xl text-lg font-medium transition-colors ${currentView === item.view ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
                <hr className="my-4 border-gray-100" />
                <Button variant="outline" className="w-full justify-center py-3" onClick={() => {
                  onNavigate('AUTH_LOGIN');
                  setIsMobileMenuOpen(false);
                }}>Login</Button>
                <Button variant="primary" className="w-full justify-center py-3" onClick={() => {
                  onNavigate('AUTH_REGISTER');
                  setIsMobileMenuOpen(false);
                }}>Register</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <div className="flex-1 pt-0 F">
        {children}
      </div>
      <FloatingPersonCard />
      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8 border-t-4 border-accent relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <div
                    className="size-10 rounded-full bg-cover bg-center border-0 border-white/20 shadow-sm"
                    style={{ backgroundImage: `url(${Logo})` }}
                  />
                </div>
                <div>
                  <span className="font-bold text-2xl tracking-tight">ALM Musanze</span>
                  <br />
                  <span className='text-gray-500 font-sans text-xs'>
                    <i>Association Liberian Musanze</i>
                  </span>
                </div>
              </div>
              <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
                Fostering unity, celebrating cultural heritage, and supporting the welfare of Liberians in the Northern Province of Rwanda.
              </p>
              <div className="flex gap-4">
                {['facebook', 'chat', 'photo_camera'].map((icon, i) => (
                  <motion.a
                    key={i}
                    whileHover={{ scale: 1.1, backgroundColor: '#CE1126' }}
                    href="#"
                    className="size-10 rounded-full bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Icon name={icon} className="text-white text-lg" />
                  </motion.a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-white border-b-2 border-primary inline-block pb-1">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                {navItems.slice(1, 5).map(item => (
                  <li key={item.view}>
                    <button onClick={() => onNavigate(item.view)} className="hover:text-primary transition-colors flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-primary transition-colors"></span>
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-white border-b-2 border-accent inline-block pb-1">Contact Us</h4>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start gap-3">
                  <Icon name="location_on" className="text-accent mt-1 shrink-0" />
                  <span>Musanze District, Northern Province, Rwanda</span>
                </li>
                <li className="flex items-center gap-3">
                  <Icon name="mail" className="text-accent shrink-0" />
                  <a href="mailto:alm1193732@gmail.com" className="hover:text-white transition-colors">alm1193732@gmail.com</a>
                </li>
                <li className="flex items-center gap-3">
                  <Icon name="call" className="text-accent shrink-0" />
                  <a href="tel:+250792405593" className="hover:text-white transition-colors">+250792405593</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-gray-500 text-sm">
            <p >&copy; {new Date().getFullYear()} Association of Liberians in Musanze. All rights reserved | Developed by: Solomon Kamara</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
