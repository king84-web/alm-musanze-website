
import React from 'react';
import { Button, Icon, Card } from '../components/Common';
import { Event, Album, ViewState } from '@/types';
import { motion } from 'framer-motion';
import BgImage from '../assets/bg2.jpeg'

interface PublicHomeProps {
  onNavigate: (view: ViewState) => void;
  events: Event[];
  albums: Album[];
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onNavigate, events, albums }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#002868]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
            style={{
              backgroundImage: `url(${BgImage})`,
              backgroundPosition: 'center 50%'
            }}
          />
          {/* Brand Color Overlay - Optimized for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#002868]/95 via-[#002868]/80 to-black/40 sm:to-transparent mix-blend-multiply"></div>
          {/* General Darkening Overlay */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10 mt-2 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center h-full pt-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl text-center sm:text-left mx-auto sm:mx-0"
          >
            <motion.div variants={itemVariants} className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium tracking-wider uppercase shadow-lg">
              Unity • Culture • Progress
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.1] mb-6 [text-shadow:_0_4px_4px_rgb(0_0_0_/_50%)]"
            >
              Association of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 filter drop-shadow-md">Liberians</span> in Musanze
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-2xl lg:text-3xl text-blue-50 font-light mb-10 max-w-2xl leading-relaxed [text-shadow:_0_2px_4px_rgb(0_0_0_/_50%)]"
            >
              "Unity Leads and God Above All."
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
              <Button
                variant="danger"
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-8 py-4 shadow-xl shadow-accent/30 hover:scale-105 transition-transform"
                onClick={() => onNavigate('AUTH_REGISTER')}
              >
                Register
              </Button>
              <Button
                className="w-full sm:w-auto text-base sm:text-lg px-8 py-4 bg-white/10 hover:bg-white text-white hover:text-primary backdrop-blur-md border border-white/30 transition-all hover:scale-105 shadow-lg"
                onClick={() => onNavigate('PUBLIC_EVENTS')}
              >
                Explore Events
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1, duration: 1.5, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
        >
          <Icon name="keyboard_arrow_down" className="text-4xl drop-shadow-md" />
        </motion.div>
      </section>

      {/* Quick Stats / Info Strip */}
      {/* <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Founded', value: '2018', icon: 'flag' },
              { label: 'Active Members', value: '1,200+', icon: 'groups' },
              { label: 'Events Hosted', value: '50+', icon: 'celebration' },
              { label: 'Community Funds', value: '$50k+', icon: 'savings' },
            ].map((stat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={i}
                className="text-center"
              >
                <div className="inline-flex p-3 rounded-full bg-primary/5 text-primary mb-3">
                  <Icon name={stat.icon} className="text-2xl" />
                </div>
                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Featured Sections Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-primary mb-4">Experience ALM</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Discover the pillars that hold our community together, from cultural celebrations to transparent leadership.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Events Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden group cursor-pointer"
              onClick={() => onNavigate('PUBLIC_EVENTS')}
            >
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${events[0]?.image})` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="bg-accent px-2 py-1 rounded text-xs font-bold uppercase mb-1 inline-block">Upcoming</span>
                  <h3 className="font-bold text-xl">Community Gatherings</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4 line-clamp-2">Join us for cultural festivals, meetings, and picnics. Stay connected with your community.</p>
                <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">View Calendar <Icon name="arrow_forward" /></span>
              </div>
            </motion.div>

            {/* Gallery Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden group cursor-pointer"
              onClick={() => onNavigate('PUBLIC_GALLERY')}
            >
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${albums[0]?.coverImage})` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="bg-blue-500 px-2 py-1 rounded text-xs font-bold uppercase mb-1 inline-block">Memories</span>
                  <h3 className="font-bold text-xl">Photo Gallery</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4 line-clamp-2">Relive our best moments. Explore photos from past events, celebrations, and trips.</p>
                <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">View Photos <Icon name="arrow_forward" /></span>
              </div>
            </motion.div>

            {/* Leadership Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden group cursor-pointer"
              onClick={() => onNavigate('PUBLIC_LEADERS')}
            >
              <div className="h-48 overflow-hidden relative bg-gray-100 flex items-center justify-center">
                <div className="absolute inset-0 bg-cover bg-center opacity-80 transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop")' }}></div>
                <div className="absolute inset-0 bg-primary/20"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="bg-yellow-500 px-2 py-1 rounded text-xs font-bold uppercase mb-1 inline-block">Team</span>
                  <h3 className="font-bold text-xl">Our Leadership</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4 line-clamp-2">Meet the dedicated executive committee working to serve and uplift the ALM community.</p>
                <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Meet the Team <Icon name="arrow_forward" /></span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Statement Parallax */}
      <section className="py-32 relative bg-primary overflow-hidden flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-fixed bg-cover bg-center opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542601906990-b4d3fb7d5c73?q=80&w=2000&auto=format&fit=crop")' }}></div>
        <div className="relative z-10 max-w-4xl px-4">
          <Icon name="format_quote" className="text-6xl text-white/30 mb-4" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight">
            "To foster unity among Liberians in Musanze, promote our rich cultural heritage, and support the welfare of our members."
          </h2>
          <h3>Unity Leads and God Above all</h3>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-3" onClick={() => onNavigate('PUBLIC_ABOUT')}>
            Read Our Full Story
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-3xl p-8 md:p-16 text-center border border-gray-100 relative overflow-hidden shadow-lg"
          >
            {/* Dynamic Background Elements */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"
            ></motion.div>
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                x: [0, 50, 0],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none"
            ></motion.div>

            <div className="relative z-10">
              <h2 className="text-4xl font-black text-gray-900 mb-6">Ready to Join Association of liberians in Musanze?</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                Become an official member of ALM today. participate in decision-making, and help us grow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="primary"
                  size="lg"
                  className="px-10 py-4 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                  onClick={() => onNavigate('AUTH_REGISTER')}
                  icon="person_add"
                >
                  Register Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-10 py-4 text-lg border-2 hover:bg-gray-100 transition-colors"
                  onClick={() => onNavigate('PUBLIC_CONTACT')}
                  icon="mail"
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
