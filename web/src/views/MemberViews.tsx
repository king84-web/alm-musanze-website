
import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Badge, Input, Icon, EmptyState, CustomSelect, Textarea } from '../components/Common';
import { Event, Announcement, Album, Transaction, Photo } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Member } from '@/types';
import { useAlmStore } from '@/store/useAppStore';
import { fetcher } from '../hooks/use-fetcher';
import { countyOptions } from '../libs/utils';

export const MemberDashboard = ({
    events,
    announcements,
    rsvpEventIds,
    onToggleRsvp,
    user,
    haandleEditProfile
}: {
    events: Event[];
    announcements: Announcement[];
    rsvpEventIds: string[];
    onToggleRsvp: (id: string) => void;
    user: any;
    haandleEditProfile?: () => void;
}) => (
    <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black text-text-primary dark:text-text-light">Welcome back, {user?.firstName || 'Member'}!</h1>
                <p className="text-text-secondary dark:text-text-muted mt-1">Here's what's happening in your community today.</p>
            </div>
            <Button variant="primary" icon="edit" onClick={haandleEditProfile}>Edit Profile</Button>
        </div>

        {/* Featured Carousel (Simulated) */}
        <section>
            <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-bold">Upcoming Events</h2>
                <Button variant="ghost" className="text-primary">View All</Button>
            </div>
            {events.filter(e => e.status === 'Upcoming').length > 0 ? (
                <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                    {events.filter(e => e.status === 'Upcoming').slice(0, 3).map(event => {
                        const isRsvp = rsvpEventIds.includes(event.id);
                        return (
                            <Card key={event.id} className="min-w-[300px] flex-1 overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
                                <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url(${event.image})` }}>
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                                    <p className="text-sm text-primary font-medium mb-4">{event.date}</p>
                                    <Button
                                        variant={isRsvp ? "primary" : "outline"}
                                        size="sm"
                                        className={`w-full ${isRsvp ? "bg-green-600 hover:bg-green-700 border-transparent" : ""}`}
                                        onClick={() => onToggleRsvp(event.id)}
                                        icon={isRsvp ? "check_circle" : undefined}
                                    >
                                        {isRsvp ? "Attending" : "RSVP"}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card className="p-8 text-center">
                    <p className="text-text-muted">No upcoming events at the moment.</p>
                </Card>
            )}
        </section>

        {/* Announcements */}
        <section>
            <h2 className="text-xl font-bold mb-4">Recent Announcements</h2>
            <div className="grid gap-4">
                {announcements.length > 0 ? announcements.map(ann => (
                    <Card key={ann.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <Icon name={ann.icon} className="text-2xl" />
                        </div>
                        <div>
                            <h3 className="font-bold text-text-primary dark:text-text-light">{ann.title}</h3>
                            <p className="text-sm text-text-secondary dark:text-text-muted mt-1">{ann.content}</p>
                            <p className="text-xs text-text-muted mt-2">{ann.date}</p>
                        </div>
                    </Card>
                )) : (
                    <EmptyState
                        title="No Announcements"
                        description="Check back later for updates from the administration."
                        icon="campaign"
                    />
                )}
            </div>
        </section>
    </div>
);

// --- Events ---
export const MemberEvents = ({
    events,
    rsvpEventIds,
    onToggleRsvp
}: {
    events: Event[];
    rsvpEventIds: string[];
    onToggleRsvp: (id: string) => void;
}) => (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black">Community Events</h1>
                <p className="text-text-secondary dark:text-text-muted">Join us, connect, and celebrate.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
                <Input placeholder="Search events..." icon="search" className="min-w-[250px]" />
                <Button variant="outline" icon="filter_list">Filter</Button>
            </div>
        </div>

        {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => {
                    const isRsvp = rsvpEventIds.includes(event.id);
                    const isUpcoming = event.status === 'Upcoming';
                    return (
                        <Card key={event.id} className="overflow-hidden flex flex-col h-full">
                            <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${event.image})` }} />
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge color={isUpcoming ? 'green' : 'gray'}>{event.status}</Badge>
                                    <span className="text-xs text-text-muted">{event.date}</span>
                                </div>
                                <h3 className="font-bold text-xl mb-2">{event.title}</h3>
                                <p className="text-sm text-text-secondary dark:text-text-muted flex-1">{event.description}</p>
                                <div className="mt-4 flex items-center text-sm text-text-secondary dark:text-text-muted mb-4">
                                    <Icon name="location_on" className="text-lg mr-1" />
                                    {event.location}
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant={isRsvp ? "primary" : "primary"}
                                        className={`flex-1 ${isRsvp ? "bg-green-600 hover:bg-green-700" : ""}`}
                                        disabled={!isUpcoming}
                                        onClick={() => isUpcoming && onToggleRsvp(event.id)}
                                        icon={isRsvp ? "check" : undefined}
                                    >
                                        {isRsvp ? "Attending" : "RSVP Now"}
                                    </Button>
                                    <Button variant="outline" icon="download">Flyer</Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        ) : (
            <EmptyState
                title="No Events Found"
                description="There are no events matching your criteria at the moment."
                icon="event_busy"
            />
        )}
    </div>
);




interface MemberProfileProps {
    user: Member | null;
    onSave?: (updatedUser: Partial<Member>) => void;
    onCancel?: () => void;
}

export const MemberProfile = ({ onSave, onCancel, user }: MemberProfileProps) => {
    const [formData, setFormData] = useState<Partial<Member>>({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        bio: user?.bio || 'Dedicated member of the Liberian community...',
        avatar: user?.avatar || '',
        county: user.county
    });
    const { } = useAlmStore()
    const { setToast, showToast, fetchCurrentUser } = useAlmStore()
    const [avatarPreview, setAvatarPreview] = useState(
        user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_eNyYtW1vOcquJv4H2VbWCx2P1dONGfGzHxcO3eRAnxjKCqQ7kSI9YzqqjdQv0N2Xwv36HV5Pc5sFDy6rvHZLkAcpvFyVF3sgwwKW8TCXIpVt22L3NfWIi0R66VKkLXpIWL7iY4MTPEnfStuqnsJ3pe20wVKFGbJAOmWoA87BBWnvQxLdTFC1fZow1G5j7DAzKG9zspuhnbnPsmXv-I0m9bWuAJmlkghOn8Ks3svjyInfb8a7sxtt5DqsC7uMGoeGnB8dhKcMvNA'
    );

    useEffect(() => {
        fetchCurrentUser()
    }, [])

    const [hasChanges, setHasChanges] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = <K extends keyof Member>(
        field: K,
        value: Member[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };



    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setToast({ type: "error", message: "Please upload a valid image file" });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setToast({ type: "error", message: "File size exceeds 5MB limit" });
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file); // the key "avatar" must match the server

            const { data: { file: uploadedFile }, success, error } = await fetcher("/upload/single", {
                method: "POST",
                body: formData,
                useToken: true,
            });
            if (!success) throw new Error(error || "Upload failed");
            setAvatarPreview(uploadedFile.url);
            setFormData(prev => ({ ...prev, avatar: uploadedFile.url }));
            setHasChanges(true);
        } catch (err: any) {
            setToast({ type: "error", message: err.message || "Error uploading image" });
        } finally {
            setIsUploading(false);
        }
    };



    const handleSave = () => {
        if (!hasChanges) return;

        // Validation
        if (!formData.firstName?.trim()) {
            showToast('First name is required', 'error');
            return;
        }
        if (!formData.lastName?.trim()) {
            showToast('Last name is required', 'error');
            return;
        }
        if (!formData.email?.trim()) {
            showToast('Email is required', 'error');
            return;
        }
        if (!formData.phone?.trim()) {
            showToast('Phone is required', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        onSave?.(formData);
        setHasChanges(false);
    };

    const handleCancel = () => {
        if (hasChanges) {
            const confirm = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
            if (!confirm) return;
        }

        // Reset form
        setFormData({
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            bio: user?.bio || 'Dedicated member of the Liberian community...',
            avatar: user?.avatar || '',
        });
        setAvatarPreview(
            user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_eNyYtW1vOcquJv4H2VbWCx2P1dONGfGzHxcO3eRAnxjKCqQ7kSI9YzqqjdQv0N2Xwv36HV5Pc5sFDy6rvHZLkAcpvFyVF3sgwwKW8TCXIpVt22L3NfWIi0R66VKkLXpIWL7iY4MTPEnfStuqnsJ3pe20wVKFGbJAOmWoA87BBWnvQxLdTFC1fZow1G5j7DAzKG9zspuhnbnPsmXv-I0m9bWuAJmlkghOn8Ks3svjyInfb8a7sxtt5DqsC7uMGoeGnB8dhKcMvNA'
        );
        setHasChanges(false);
        onCancel?.();
    };

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center py-12">
                    <p className="text-text-secondary dark:text-text-muted">No user data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black">My Profile</h1>
                {hasChanges && (
                    <Badge color="yellow">
                        Unsaved Changes
                    </Badge>
                )}
            </div>

            <Card className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar Section */}
                    <div className="relative">
                        <div
                            className="size-32 rounded-full bg-cover bg-center border-4 border-white dark:border-gray-800 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ backgroundImage: `url("${avatarPreview}")` }}
                            onClick={handleAvatarClick}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleAvatarClick();
                                }
                            }}
                        >
                            {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                    <span className="text-white text-xs">Uploading...</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleAvatarClick}
                            className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary-hover transition-colors"
                            title="Change profile picture"
                        >
                            <Icon name="edit" className="text-sm" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            aria-label="Upload profile picture"
                        />
                    </div>

                    {/* Form Section */}
                    <div className="flex-1 w-full space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <p className="text-text-secondary dark:text-text-muted">
                                    Member ID: {user.membershipId || 'N/A'}
                                </p>
                                <p className="text-sm text-text-secondary dark:text-text-muted mt-1">
                                    Joined: {new Date(user.joinDate).toLocaleString() || 'N/A'}
                                </p>
                            </div>
                            <Badge color={user.status === 'Approved' ? 'green' : user.status === 'Pending' ? 'yellow' : 'gray'}>
                                {user.status || 'Active'}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="First Name"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value as Member['firstName'])}
                                required
                            />
                            <Input
                                label="Last Name"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value as Member['lastName'])}
                                required
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value as Member['email'])}
                                required
                            />
                            <div>
                                <CustomSelect
                                    label="County of Origin (Liberia)"
                                    options={countyOptions}
                                    value={formData.county}
                                    onChange={(val) => handleInputChange("county", val)}
                                    placeholder="Select County"
                                />
                            </div>
                            <Input
                                label="Phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value as Member['phone'])}
                                required
                            />
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-1">
                                    Bio
                                </label>
                                <Textarea
                                    className="w-full"
                                    rows={4}
                                    value={formData.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value as Member['bio'])}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>
                        {/* Additional Info (Read-only) */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <h3 className="text-sm font-semibold text-text-secondary dark:text-gray-400 mb-3">
                                Additional Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-text-secondary dark:text-text-muted">Membership Type:</span>
                                    <span className="ml-2 font-medium">{user.membershipType || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary dark:text-text-muted">County Address:</span>
                                    <span className="ml-2 font-medium">{user.county || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary dark:text-text-muted">Payment Status:</span>
                                    <span className="ml-2 font-medium">{user.paymentStatus || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary dark:text-text-muted">District:</span>
                                    <span className="ml-2 font-medium">{user.district || 'N/A'}</span>
                                </div>
                                
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <Button variant="ghost" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSave}
                                disabled={!hasChanges || isUploading}
                            >
                                {isUploading ? 'Uploading...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

// --- Finance ---
export const MemberFinance = ({ transactions }: { transactions: Transaction[] }) => {
    // Mock data for chart
    const data = [
        { name: 'Jan', amount: 100 },
        { name: 'Feb', amount: 200 },
        { name: 'Mar', amount: 150 },
        { name: 'Apr', amount: 300 },
        { name: 'May', amount: 250 },
        { name: 'Jun', amount: 400 },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black">My Contributions</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 md:col-span-2">
                    <h3 className="text-lg font-bold mb-6">Contribution History</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="amount" fill="#002868" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-sm font-medium text-text-secondary dark:text-text-muted">Total This Year</h3>
                        <p className="text-3xl font-black text-primary mt-2">$1,400.00</p>
                    </Card>
                    <Card className="p-6 flex flex-col items-center text-center space-y-4">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Icon name="qr_code_2" className="text-2xl" />
                        </div>
                        <div>
                            <h3 className="font-bold">Make a Contribution</h3>
                            <p className="text-xs text-text-muted mt-1">Scan to pay via MoMo</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">View Code</Button>
                    </Card>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Transaction History</h3>
                    <Button variant="ghost" size="sm" icon="filter_list">Filter</Button>
                </div>
                <div className="overflow-x-auto">
                    {transactions.length > 0 ? (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-white/5 text-text-secondary dark:text-text-muted font-medium">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">{tx.date}</td>
                                        <td className="px-6 py-4 font-medium">{tx.type}</td>
                                        <td className="px-6 py-4">${tx.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <Badge color={tx.status === 'Completed' ? 'green' : tx.status === 'Pending' ? 'yellow' : 'red'}>
                                                {tx.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-text-secondary hover:text-primary transition-colors">
                                                <Icon name="download" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState
                            title="No Transactions"
                            description="You haven't made any transactions yet."
                            icon="receipt_long"
                        />
                    )}
                </div>
            </Card>
        </div>
    );
}

// --- Gallery ---
export const MemberGallery = ({ albums, photos }: { albums: Album[], photos: Photo[] }) => {
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

    const albumPhotos = selectedAlbum ? photos.filter(p => p.albumId === selectedAlbum.id) : [];

    return (
        <div className="space-y-8">
            {!selectedAlbum ? (
                <>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-black">Member Gallery</h1>
                            <p className="text-text-secondary dark:text-text-muted">Relive our best moments together.</p>
                        </div>
                        <Button variant="primary" icon="upload">Upload Photos</Button>
                    </div>

                    {albums.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {albums.map(album => (
                                <div key={album.id} className="group cursor-pointer" onClick={() => setSelectedAlbum(album)}>
                                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                                        <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="primary" size="sm" icon="visibility">View</Button>
                                        </div>
                                        <div className="absolute top-3 right-3">
                                            <Badge color="gray">{album.type}</Badge>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{album.title}</h3>
                                    <p className="text-sm text-text-secondary dark:text-text-muted">{album.photoCount} Photos • {album.date}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="Gallery Empty"
                            description="No photo albums have been uploaded yet."
                            icon="photo_library"
                        />
                    )}
                </>
            ) : (
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <Button variant="ghost" icon="arrow_back" onClick={() => setSelectedAlbum(null)}>Back to Albums</Button>
                        <h2 className="text-2xl font-bold">{selectedAlbum.title}</h2>
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
                    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center !m-0 p-4">
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50 p-2 bg-black/50 rounded-full"
                        >
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

// --- Feedback ---
export const MemberFeedback = ({ onSubmit, user }: { onSubmit: (subject: string, message: string, email: string, name: string) => void; user: any }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('General Suggestion');

    const handleSubmit = () => {
        onSubmit(`${type}: ${subject}`, message, user?.email || 'member@example.com', user ? `${user.firstName} ${user.lastName}` : 'Member');
        setSubject('');
        setMessage('');
    };

    const typeOptions = [
        { label: 'General Suggestion', value: 'General Suggestion' },
        { label: 'Event Idea', value: 'Event Idea' },
        { label: 'Website Issue', value: 'Website Issue' },
        { label: 'Other', value: 'Other' }
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black">We Value Your Feedback</h1>
                <p className="text-text-secondary dark:text-text-muted">Help us improve the ALM community experience.</p>
            </div>

            <Card className="p-6 md:p-8 space-y-6">
                <div className="space-y-4">
                    <div>
                        <CustomSelect
                            label="Feedback Type"
                            options={typeOptions}
                            value={type}
                            onChange={setType}
                        />
                    </div>
                    <Input label="Subject" placeholder="Brief summary..." value={subject} onChange={e => setSubject(e.target.value)} />
                    <div>
                        <label className="block text-sm font-medium mb-1">Message</label>
                        <Textarea
                            className="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark p-3"
                            rows={5}
                            placeholder="Tell us more..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                    </div>
                </div>
                <Button variant="primary" className="w-full" size="lg" onClick={handleSubmit}>Submit Feedback</Button>
            </Card>
        </div>
    );
};
