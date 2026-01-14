
import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Icon, EmptyState, Textarea } from '@/src/components/Common';
import { Event, Album, ViewState, Photo, ExecutiveCommitteePosition } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import EventsService from '../libs/eventService';
import { useAlmStore } from '@/store/useAppStore';
import { publicService } from '../libs/publicService';

// Common header for public pages
const PageHeader = ({ title, subtitle, bgImage }: { title: string; subtitle: string; bgImage?: string }) => (
    <div className="relative bg-primary py-24 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay" style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-primary"></div>
        <div className="relative z-10 max-w-7xl mx-auto text-center">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-black text-white mb-4"
            >
                {title}
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-blue-100 max-w-2xl mx-auto"
            >
                {subtitle}
            </motion.p>
        </div>
    </div>
);

export const PublicAbout = () => (
    <div className="bg-white">
        <PageHeader
            title="About Us"
            subtitle="Our journey, mission, and the values that drive our community forward."
            bgImage="https://images.unsplash.com/photo-1542601906990-b4d3fb7d5c73?q=80&w=2000&auto=format&fit=crop"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            {/* Mission & Vision */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                <div>
                    <h2 className="text-3xl font-black text-primary mb-6">Our Mission</h2>
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        To foster unity among Liberians in Musanze, promote our rich cultural heritage, and support the welfare of our members. We strive to create a home away from home where every Liberian feels valued, supported, and empowered to contribute to both our community and the broader Rwandan society.
                    </p>
                    <div className="pl-6 border-l-4 border-accent">
                        <p className="text-xl font-medium italic text-gray-800">"Unity Leads and God Above All."</p>
                    </div>
                </div>
                <div className="grid gap-6">
                    <Card className="p-8 bg-blue-50 border-none">
                        <Icon name="visibility" className="text-4xl text-primary mb-4" />
                        <h3 className="text-xl font-bold mb-2">Our Vision</h3>
                        <p className="text-gray-600">A vibrant, empowered, and integrated community that contributes positively to Rwandan society while upholding Liberian values.</p>
                    </Card>
                    <Card className="p-8 bg-red-50 border-none">
                        <Icon name="favorite" className="text-4xl text-accent mb-4" />
                        <h3 className="text-xl font-bold mb-2">Core Values</h3>
                        <p className="text-gray-600">Unity, Integrity, Solidarity, Cultural Pride, and Mutual Respect form the bedrock of our association.</p>
                    </Card>
                </div>
            </div>

            {/* History */}
            <div className="bg-gray-50 rounded-3xl p-4 md:p-16">
                <div className="max-w-3xl mx-3 lg:mx-auto text-left lg:text-center">
                    <h2 className="text-3xl font-black text-gray-900 mb-8">Our History</h2>
                    <div className="space-y-8 text-left">
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-auto lg:w-24 pt-2 text-right font-bold text-gray-400">2022</div>
                            <div className="flex-1 pb-8 border-l border-gray-200 pl-8 relative">
                                <div className="absolute -left-1.5 top-3 w-3 h-3 rounded-full bg-primary"></div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">Foundation</h4>
                                <p className="text-gray-600">Founded by a small group of students at INES-Ruhengeri who saw the need for mutual support.</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-auto lg:w-24 pt-2 text-right font-bold text-gray-400">2023</div>
                            <div className="flex-1 pb-8 border-l border-gray-200 pl-8 relative">
                                <div className="absolute -left-1.5 top-3 w-3 h-3 rounded-full bg-primary"></div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">Expansion</h4>
                                <p className="text-gray-600">Opened membership to all Liberian professionals and residents in the Northern Province.</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-auto lg:w-24 pt-2 text-right font-bold text-primary">Today</div>
                            <div className="flex-1 pl-8 relative">
                                <div className="absolute -left-1.5 top-3 w-3 h-3 rounded-full bg-accent"></div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">Thriving Community</h4>
                                <p className="text-gray-600">Grown to over 100+ active members with regular events, a welfare fund, and strong local partnerships.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

interface PublicEventsProps {
    events: Event[];
    rsvpEventIds?: string[];
    onToggleRsvp?: (id: string) => void;
    currentUser?: any;
    onNavigate?: (view: ViewState) => void;
}

export const PublicEvents = ({ events, rsvpEventIds = [], onToggleRsvp, currentUser, onNavigate }: PublicEventsProps) => {
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
    const shareEvent = (platform: 'facebook' | 'twitter' | 'whatsapp', event: Event) => {
        const url = encodeURIComponent(`https://alm-musanze.org/events/${event.id}`);
        const text = encodeURIComponent(`Check out this event: ${event.title} at ${event.location}`);

        let shareUrl = '';
        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${text}%20${url}`;
                break;
        }

        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    const downloadFlyer = (e: React.MouseEvent, eventTitle: string) => {
        e.stopPropagation();
        // In a real app, this would use the event.flyerUrl
        const link = document.createElement('a');
        link.href = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUjtKHJQVedLpdZAVUSDzrDyBQI_6KFfzqXVnS8VYMXEf0snhFM6vxckOwtkz-RQKksEVw79e57e2Nq7soCsvUPdLMQSr5_MKAkbioZOeVX_7A_Sdy5fmCncWYOA85p_0tpiF791qpfFvL7EBOPI3cN4ezEV561VhctROL4k5ZzlZokoz8tHj5O7ziGjrQSpzuMaUXLW_Fp7ZS02WQt1F8HN8m6y8pkCVjax4WoaGvjzeodWw4fHezo6FWvaHk6P_W3DEMR8VKVyE'; // Placeholder image
        link.download = `${eventTitle.replace(/\s+/g, '_')}_Flyer.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleRsvp = () => {
        if (!currentUser && onNavigate) {
            onNavigate('AUTH_LOGIN');
            setSelectedEvent(null);
            return;
        }
        if (onToggleRsvp && selectedEvent) {
            const isAttending = rsvpEventIds.includes(selectedEvent.id);
            if (isAttending) {
                if (window.confirm("You are currently attending this event. Do you want to cancel your RSVP?")) {
                    onToggleRsvp(selectedEvent.id);
                }
            } else {
                onToggleRsvp(selectedEvent.id);
            }
        }
    };

    const isRsvp = selectedEvent ? rsvpEventIds.includes(selectedEvent.id) : false;

    // Find the featured upcoming event
    const featuredEvent = events.find(e => e.status === 'Upcoming');

    return (
        <div className="bg-gray-50 min-h-screen">
            <PageHeader
                title="Events & Activities"
                subtitle="Join us as we celebrate, learn, and grow together."
                bgImage="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2000&auto=format&fit=crop"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

                {events.length === 0 ? (
                    <EmptyState
                        title="No Events Scheduled"
                        description="We currently don't have any upcoming events. Please check back later or subscribe to our announcements."
                        icon="event_busy"
                    />
                ) : (
                    <>
                        {/* Featured/Next Event */}
                        <div className="mb-16">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Icon name="event_upcoming" className="text-accent" /> Next Big Event
                            </h2>
                            {featuredEvent && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row cursor-pointer group relative"
                                    onClick={() => setSelectedEvent(featuredEvent)}
                                >
                                    <div className="md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${featuredEvent.image})` }}></div>
                                        {/* Attending Badge for Featured */}
                                        {rsvpEventIds.includes(featuredEvent.id) && (
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm bg-green-500 text-white flex items-center gap-1">
                                                    <Icon name="check_circle" className="text-sm fill" /> Attending
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
                                        <span className="text-accent font-bold tracking-widest uppercase text-sm mb-2">Don't Miss Out</span>
                                        <h3 className="text-3xl font-black text-gray-900 mb-4">{featuredEvent.title}</h3>
                                        <div className="space-y-3 mb-8 text-gray-600">
                                            <p className="flex items-center gap-2"><Icon name="calendar_today" /> {featuredEvent.date} at {featuredEvent.time}</p>
                                            <p className="flex items-center gap-2"><Icon name="location_on" /> {featuredEvent.location}</p>
                                            {featuredEvent.rsvpCount !== undefined && <p className="flex items-center gap-2 text-primary font-bold bg-primary/5 w-fit px-3 py-1 rounded-full"><Icon name="group" /> {featuredEvent.rsvpCount} people attending</p>}
                                        </div>
                                        <p className="text-gray-600 mb-8 leading-relaxed">{featuredEvent.description}</p>
                                        <div className="flex items-center gap-4">
                                            <Button variant="primary" size="lg" onClick={(e) => { e.stopPropagation(); setSelectedEvent(featuredEvent); }}>View Details</Button>
                                            <div className="flex gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); shareEvent('facebook', featuredEvent); }} className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Share on Facebook">
                                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); shareEvent('twitter', featuredEvent); }} className="p-2 rounded-full bg-blue-50 text-blue-400 hover:bg-blue-100 transition-colors" title="Share on Twitter">
                                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); shareEvent('whatsapp', featuredEvent); }} className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Share on WhatsApp">
                                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.filter(e => e.id !== featuredEvent?.id).map(event => {
                                const isAttending = rsvpEventIds.includes(event.id);
                                return (
                                    <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full group cursor-pointer" >
                                        <div
                                            className="h-48 bg-cover bg-center relative"
                                            style={{ backgroundImage: `url(${event.image})` }}
                                            onClick={() => setSelectedEvent(event)}
                                        >
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                            <div className="absolute top-4 right-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${event.status === 'Upcoming' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{event.status}</span>
                                            </div>
                                            {/* Attending Badge */}
                                            {isAttending && (
                                                <div className="absolute top-4 left-4 z-10">
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm bg-green-500 text-white flex items-center gap-1">
                                                        <Icon name="check_circle" className="text-sm fill" /> Attending
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 flex flex-col flex-1">
                                            <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                                            <p className="text-sm text-gray-500 mb-4 flex items-center gap-1"><Icon name="event" /> {event.date} • {event.time}</p>
                                            <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">{event.description}</p>
                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                                        <Icon name="location_on" className="text-sm text-primary" />
                                                        {event.location}
                                                    </div>
                                                    {event.rsvpCount !== undefined && (
                                                        <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                                                            <Icon name="group" className="text-sm" /> {event.rsvpCount} RSVPs
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={(e) => downloadFlyer(e, event.title)} className="p-2 text-gray-400 hover:text-primary transition-colors" title="Download Flyer">
                                                        <Icon name="download" />
                                                    </button>
                                                    <Button size="sm" variant="outline" onClick={() => setSelectedEvent(event)}>Details</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Event Details Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setSelectedEvent(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden"
                        >
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="absolute top-4 right-4 z-20 bg-white/50 hover:bg-white p-2 rounded-full backdrop-blur-md transition-colors"
                            >
                                <Icon name="close" className="text-2xl" />
                            </button>

                            <div className="md:w-1/2 h-64 md:h-auto bg-cover bg-center" style={{ backgroundImage: `url(${selectedEvent.image})` }}></div>

                            <div className="p-8 md:p-10 md:w-1/2 flex flex-col">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase w-fit mb-4 ${selectedEvent.status === 'Upcoming' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{selectedEvent.status}</span>
                                <h2 className="text-3xl font-black text-gray-900 mb-6">{selectedEvent.title}</h2>

                                <div className="space-y-4 mb-8 text-gray-600">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-primary"><Icon name="calendar_month" /></div>
                                        <div>
                                            <p className="font-bold text-gray-900">Date & Time</p>
                                            <p className="text-sm">{selectedEvent.date} at {selectedEvent.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-red-50 rounded-lg text-accent"><Icon name="location_on" /></div>
                                        <div>
                                            <p className="font-bold text-gray-900">Location</p>
                                            <p className="text-sm">{selectedEvent.location}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-sm text-gray-600 mb-8">
                                    <p>{selectedEvent.description}</p>
                                    <p>We look forward to seeing you there! Don't forget to invite your friends and family.</p>
                                </div>

                                <div className="mt-auto pt-6 border-t border-gray-100">
                                    <Button
                                        variant={isRsvp ? "outline" : "primary"}
                                        size="lg"
                                        className={`w-full text-lg shadow-xl ${isRsvp ? "" : "shadow-primary/20"} ${isRsvp ? "text-green-600 border-green-600 hover:bg-green-50" : ""}`}
                                        onClick={handleRsvp}
                                        icon={isRsvp ? "check_circle" : undefined}
                                    >
                                        {currentUser ? (isRsvp ? "Attending (Click to Cancel)" : "RSVP for this Event") : "Login to RSVP"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    ); 
};

export const PublicGallery = ({ albums, photos }: { albums: Album[], photos: Photo[] }) => {
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

    const albumPhotos = selectedAlbum ? photos.filter(p => p.albumId === selectedAlbum.id) : [];

    return (
        <div className="bg-white min-h-screen">
            {!selectedAlbum ? (
                <>
                    <PageHeader
                        title="Alm Gallery"
                        subtitle="Capturing the moments that define our shared journey."
                        bgImage="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop"
                    />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                        {albums.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {albums.map((album, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        key={album.id}
                                        className="group cursor-pointer"
                                        onClick={() => setSelectedAlbum(album)}
                                    >
                                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md mb-4">
                                            <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="primary" icon="visibility">View Album</Button>
                                            </div>
                                            <div className="absolute bottom-4 left-4 text-white">
                                                <p className="font-bold text-lg drop-shadow-md">{album.title}</p>
                                                <p className="text-sm opacity-90 drop-shadow-md">{album.photoCount} Photos</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="Gallery Empty"
                                description="We haven't uploaded any photos yet. Check back soon!"
                                icon="photo_library"
                            />
                        )}
                    </div>
                </>
            ) : (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="flex items-center gap-4 mb-8">
                        <Button variant="ghost" icon="arrow_back" onClick={() => setSelectedAlbum(null)}>Back to Albums</Button>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedAlbum.title}</h2>
                    </div>

                    {albumPhotos.length > 0 ? (
                        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
                            <Masonry gutter="16px">
                                {albumPhotos.map((photo, i) => (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={photo.id}
                                        className="relative rounded-xl overflow-hidden cursor-pointer group mb-4"
                                        onClick={() => setSelectedPhoto(photo)}
                                    >
                                        <img src={photo.url} alt={photo.caption} className="w-full h-auto object-cover block transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    </motion.div>
                                ))}
                            </Masonry>
                        </ResponsiveMasonry>
                    ) : (
                        <EmptyState
                            title="No Photos"
                            description="This album is currently empty."
                            icon="image_not_supported"
                        />
                    )}
                </div>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {selectedPhoto && (
                    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
                        <button>
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2 bg-black/50 rounded-full"
                        
                            <Icon name="close" className="text-3xl" />
                        </button>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
                        >
                            <img src={selectedPhoto.url} alt={selectedPhoto.caption} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
                            {selectedPhoto.caption && <p className="text-white mt-4 text-lg font-medium">{selectedPhoto.caption}</p>}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const PublicFinance = () => {
    const { handleNavigate } = useAlmStore()
    return (
        <div className="bg-gray-50 min-h-screen">
            <PageHeader
                title="Transparency & Finance"
                subtitle="Committed to accountability and trust in all our financial dealings."
                bgImage="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2000&auto=format&fit=crop"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <Card className="p-8 text-center bg-white border-t-4 border-primary shadow-lg">
                        <div className="inline-flex p-4 rounded-full bg-blue-50 text-primary mb-6">
                            <Icon name="verified_user" className="text-4xl" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Transparent Reporting</h3>
                        <p className="text-gray-600">Quarterly financial reports are available to all registered members for review.</p>
                    </Card>
                    <Card className="p-8 text-center bg-white border-t-4 border-accent shadow-lg">
                        <div className="inline-flex p-4 rounded-full bg-red-50 text-accent mb-6">
                            <Icon name="account_balance" className="text-4xl" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Welfare Fund</h3>
                        <p className="text-gray-600">A dedicated percentage of dues goes directly to supporting members in times of need.</p>
                    </Card>
                </div>
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-12 items-center">
                    <div className="md:w-1/2">
                        <h2 className="text-3xl font-black text-gray-900 mb-6">Support Our Mission</h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Your contributions help us organize events, support community members, and maintain our association's operations. We welcome donations from partners and friends of Liberia.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="size-12 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold shrink-0">MTN</div>
                                <div>
                                    <p className="font-bold text-gray-900">Mobile Money</p>
                                    <p className="font-bold text-gray-900">Name: Jannitta Roberts - Financial Secretary</p>
                                    <p className="text-gray-600 font-mono text-lg">*182*8*1*0793124307#</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="size-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">BK</div>
                                <div>
                                    <p className="font-bold text-gray-900">Bank Transfer</p>
                                    <p className="text-gray-600 text-sm">Contact us for bank account details</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:w-1/2 w-full">
                        <div className="bg-gray-100 rounded-2xl p-8 text-center">
                            <h3 className="font-bold text-gray-500 mb-4 uppercase tracking-wider">Annual Budget Overview</h3>
                            <EmptyState
                                title="Budget Reports"
                                description="Detailed budget breakdowns are available in the Member Portal."
                                icon="pie_chart"
                                action={<Button variant="outline" icon="login" className="mt-4" onClick={() => handleNavigate('AUTH_LOGIN')}>Login to View</Button>}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const PublicLeaders = () => {
    const [executiveCommittee, setExecutiveCommittee] = useState<{ id: string; name: string; role: ExecutiveCommitteePosition; image: string }[]>([])
    useEffect(() => {
        (async () => {
            const { data, success, error } = await publicService.getExecutiveCommittee<{ id: string, name: string, role: ExecutiveCommitteePosition, image: string }[]>();
            if (data && success && !error) {
                setExecutiveCommittee(data)
            }
        })()
    }, [])

    const getLabel = (role: ExecutiveCommitteePosition) => {
        switch (role) {
            case ExecutiveCommitteePosition.PRESIDENT:
                return 'President'
            case ExecutiveCommitteePosition.VICE_PRESIDENT:
                return 'Vice President'
            case ExecutiveCommitteePosition.SECRETARY_GENERAL:
                return 'Secretary General'
            case ExecutiveCommitteePosition.Financial_Secretary:
                return 'Financial_Secretary'
            case ExecutiveCommitteePosition.ORGANIZING_SECRETARY:
                return 'Organizing Secretary'
            default:
                return 'Executive Committee Member'
        }
    }
    return (
        <div className="bg-white">
            <PageHeader
                title="Leadership"
                subtitle="Meet the dedicated team serving the ALM community."
                bgImage="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2000&auto=format&fit=crop"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">Executive Committee</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">Elected members who steer the vision and operations of the association.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                    {[
                        // { name: 'Joseph Tamba', role: 'President', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop' },
                        // { name: 'Sarah Keita', role: 'Vice President', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop' },
                        // { name: 'David Sando', role: 'General Secretary', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop' },
                        // { name: 'Esther Weah', role: 'Treasurer', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop' },
                        ...executiveCommittee
                    ].map((leader, i) => (
                        <div key={i} className="text-center group">
                            <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
                                <img src={leader.image} alt={leader.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{leader.name}</h3>
                            <p className="text-primary font-medium uppercase text-sm tracking-wide mt-1">{getLabel(leader.role)}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Standing Committees</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h4 className="font-bold text-lg mb-2 text-primary">planning committee</h4>
                            <p className="text-sm text-gray-600">Responsible for organizing social events and managing member welfare support.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h4 className="font-bold text-lg mb-2 text-primary">Grivences Committee</h4>
                            <p className="text-sm text-gray-600">Ensures members grivence are heard and resolves internal conflicts.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h4 className="font-bold text-lg mb-2 text-primary">Sports committee</h4>
                            <p className="text-sm text-gray-600">Oversees sports activities</p>
                        </div>
                       <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h4 className="font-bold text-lg mb-2 text-primary">Media committee</h4>
                            <p className="text-sm text-gray-600">Oversees all social media activities</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const PublicContact = ({ onSubmitFeedback }: { onSubmitFeedback: (subject: string, message: string, email: string, name: string) => void }) => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmitFeedback(formData.subject, formData.message, formData.email, formData.name);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <PageHeader
                title="Contact Us"
                subtitle="Get in touch with us. We'd love to hear from you."
                bgImage="https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?q=80&w=2000&auto=format&fit=crop"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 mb-6">Get in Touch</h2>
                        <p className="text-gray-600 mb-12 text-lg">Whether you have a question about membership, want to partner with us, or just want to say hello, we're here to help.</p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-full text-primary mt-1"><Icon name="location_on" className="text-2xl" /></div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">Visit Us</h4>
                                    <p className="text-gray-600">Musanze District<br />Northern Province, Rwanda</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-full text-primary mt-1"><Icon name="mail" className="text-2xl" /></div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">Email Us</h4>
                                    <p className="text-gray-600">alm1193732@gmail.com<br />alm1193732@gmail.com</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-full text-primary mt-1"><Icon name="call" className="text-2xl" /></div>
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">Call Us</h4>
                                    <p className="text-gray-600">+250 792405593 </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Card className="p-8 shadow-xl">
                        <h3 className="text-xl font-bold mb-6">Send a Message</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input label="Your Name" placeholder="John Doe" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <Input label="Email Address" type="email" placeholder="john@example.com" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            <Input label="Subject" placeholder="How can we help?" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <Textarea
                                    className="w-full rounded-lg"
                                    rows={5}
                                    placeholder="Type your message here..."
                                    required
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>
                            <Button variant="primary" size="lg" className="w-full" type="submit">Send Message</Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};
