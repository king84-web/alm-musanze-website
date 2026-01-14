
import React, { use, useEffect, useState } from 'react';
import { Card, Button, Badge, Input, Icon, EmptyState, CustomSelect, CustomDatePicker, CustomTimePicker, Textarea, MemberAvatar } from '@/src/components/Common';
import { Member, Event, Transaction, Announcement, Feedback, LoginLog, Attendee, EventSpeaker, ViewState, ExecutiveCommitteePositionOptions } from '@/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Eye, Loader2, SquarePen } from 'lucide-react';
import { useAlmStore } from '@/store/useAppStore';
import ProfileAvatar from '@/src/assets/avatar.png'
import { fetcher } from '../hooks/use-fetcher';
import { getTimeLeft } from '../libs/utils';
import { FinanceDashboard } from '../components/finance/FinanceComponents';

export const AdminDashboard = ({
    members,
    events,
    transactions,
    loginLogs,
    onNavigate
}: {
    members: Member[];
    events: Event[];
    transactions: Transaction[];
    loginLogs?: LoginLog[];
    onNavigate: (view: ViewState) => void;
}) => {

    const activeMembers = members.filter(m => m.status === 'Active').length;
    const pendingMembers = members.filter(m => m.status === 'Pending').length;
    const upcomingEvents = events.filter(e => e.status === 'Upcoming');
    const nextEvent = upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    const { fetchMembers, navigateAction, fetchEvents, } = useAlmStore();

    useEffect(() => {
        fetchMembers();
        fetchEvents();
    }, []);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const revenueThisMonth = transactions
        .filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.status === 'Completed';
        })
        .reduce((sum, t) => sum + t.amount, 0);

    const totalRevenue = transactions
        .filter(t => t.status === 'Completed')
        .reduce((sum, t) => sum + t.amount, 0);

    const newRegistrations30Days = members.filter(m => {
        const joinDate = new Date(m.joinDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return joinDate >= thirtyDaysAgo;
    }).length;

    const districtDataMap = members.reduce((acc, m) => {
        acc[m.district] = (acc[m.district] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const districtData = Object.keys(districtDataMap).map(key => ({ name: key, value: districtDataMap[key] }));
    const DISTRICT_COLORS = ['#002868', '#CE1126', '#F59E0B', '#10B981', '#6366F1', '#8B5CF6'];

    const financialData = [
        { name: 'Jan', revenue: 4000 },
        { name: 'Feb', revenue: 3000 },
        { name: 'Mar', revenue: 2000 },
        { name: 'Apr', revenue: 2780 },
        { name: 'May', revenue: 1890 },
        { name: 'Jun', revenue: 2390 },
        { name: 'Jul', revenue: 3490 },
        { name: 'Aug', revenue: 4200 },
        { name: 'Sep', revenue: revenueThisMonth },
    ];

    const activities = [
        ...(loginLogs || []).map(l => ({ type: 'login', date: new Date(l.timestamp), data: l })),
        ...members.map(m => ({ type: 'join', date: new Date(m.joinDate), data: m })),
        ...transactions.map(t => ({ type: 'payment', date: new Date(t.date), data: t }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#181511] dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">Overview of association performance and activities.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"></span>
                        <Input type="text" placeholder="Search..." icon="search" className={'w-full'} />
                    </div>
                    <Button variant="primary" size="sm" onClick={() => navigateAction('ADD_MEMBER')}>Add New Member</Button>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                    { label: 'Total Members', value: members.length, trend: '+12%', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50', icon: 'groups' },
                    { label: 'Active Members', value: activeMembers, trend: 'Stable', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50', icon: 'verified' },
                    { label: 'Pending', value: pendingMembers, trend: 'Needs Review', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50', icon: 'hourglass_empty' },
                    { label: 'Upcoming Events', value: upcomingEvents.length, trend: 'Next: 2 Days', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50', icon: 'event' },
                    { label: 'Rev. This Month', value: `$${revenueThisMonth.toLocaleString()}`, trend: '+5%', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50', icon: 'payments' },
                    { label: 'New Signups', value: newRegistrations30Days, trend: 'Last 30 days', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50', icon: 'person_add' },
                ].map((stat, i) => (
                    <Card key={i} className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <Icon name={stat.icon} className="text-xl" />
                            </div>
                            <span className={`text-xs font-bold
                             ${stat.color.replace('text-', 'bg-').replace('600', '100')}
                             px-2 py-0.5 rounded-full`}>{stat.trend}</span>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial Overview */}
                <Card className="lg:col-span-2 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Financial Overview</h3>
                        <div className={'w-32'}>
                            <CustomSelect options={[{ label: 'This Year', value: 'year' }, { label: 'Last Year', value: 'last_year' }]} value="year" onChange={() => { }} className="w-32" />

                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData} margin={{ top: 10, right: 0, left: -40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="revenue" fill="#002868" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Member Distribution */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-6">Members by District</h3>
                    <div className="h-[300px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={districtData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {districtData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={DISTRICT_COLORS[index % DISTRICT_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <p className="text-3xl font-black text-gray-900 dark:text-white">{members.length}</p>
                                <p className="text-xs text-gray-500 uppercase">Total</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Events & Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Event Overview */}
                <Card className="p-6 flex flex-col">
                    <h3 className="text-lg font-bold mb-4">Event Overview</h3>
                    {nextEvent ? (
                        <div className="bg-primary/5 rounded-xl p-4 mb-6 border border-primary/10">
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">Next Up</span>
                                <span className="text-primary font-bold text-sm">{getTimeLeft(nextEvent.date)}</span>
                            </div>
                            <h4 className="font-bold text-lg mb-1">{nextEvent.title}</h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mb-3"><Icon name="location_on" className="text-xs" /> {nextEvent.location}</p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                                <div className="bg-primary h-1.5 rounded-full" style={{ width: nextEvent ? `${(nextEvent.rsvpCount / nextEvent.capacity * 100)}%` : '0%' }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{nextEvent.rsvpCount} Attending</span>
                                <span>Cap: {nextEvent.capacity}</span>
                            </div>
                        </div>
                    ) : (
                        <EmptyState title="No Upcoming Events" description="Schedule an event to see it here." icon="event_busy" />
                    )}

                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Upcoming List</h4>
                        <div className="space-y-3">
                            {upcomingEvents.slice(0, 3).map(event => (
                                <div key={event.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                                    <div className="bg-gray-100 dark:bg-white/10 w-12 h-12 flex flex-col items-center justify-center rounded-lg shrink-0 text-gray-600 dark:text-gray-300">
                                        <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-sm font-bold">{new Date(event.date).getDate()}</span>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-sm truncate">{event.title}</p>
                                        <p className="text-xs text-gray-500 truncate">{event.category}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4" onClick={() => onNavigate('ADMIN_EVENTS')}>View All Events</Button>
                </Card>

                {/* Recent Activity */}
                <Card className="lg:col-span-2 p-6">
                    <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                    <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
                        {activities.map((act, i) => (
                            <div key={i} className="flex gap-4 relative">
                                <div className={`size-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white dark:border-gray-900 z-10 
                                    ${act.type === 'login' ? 'bg-blue-100 text-blue-600' :
                                        act.type === 'join' ? 'bg-green-100 text-green-600' :
                                            'bg-yellow-100 text-yellow-600'}`}>
                                    <Icon name={act.type === 'login' ? 'login' : act.type === 'join' ? 'person_add' : 'payments'} className="text-lg" />
                                </div>
                                <div className="pt-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {act.type === 'login' && <span><span className="font-bold">{(act.data as LoginLog).userName}</span> logged into the portal</span>}
                                        {act.type === 'join' && <span>New member registration: <span className="font-bold">{(act.data as Member).firstName} {(act.data as Member).lastName}</span></span>}
                                        {act.type === 'payment' && <span>Payment received: <span className="font-bold">${(act.data as Transaction).amount}</span> from {(act.data as Transaction).contributorName}</span>}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">{act.date.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30" onClick={() => onNavigate('ADMIN_MEMBERS')}>
                    <Icon name="person_add" className="text-2xl text-primary" />
                    <span>Add Member</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30" onClick={() => onNavigate('ADMIN_EVENTS')}>
                    <Icon name="add_circle" className="text-2xl text-primary" />
                    <span>Create Event</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30" onClick={() => onNavigate('ADMIN_CONTENT')}>
                    <Icon name="campaign" className="text-2xl text-primary" />
                    <span>Announcement</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30" onClick={() => onNavigate('ADMIN_FINANCE')}>
                    <Icon name="account_balance_wallet" className="text-2xl text-primary" />
                    <span>Record Payment</span>
                </Button>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} Liberian Association in Rwanda — Admin Portal</p>
                <div className="flex gap-4 mt-2 md:mt-0">
                    <a href="#" className="hover:text-primary">Support</a>
                    <a href="#" className="hover:text-primary">Documentation</a>
                    <span>v1.2.0</span>
                </div>
            </footer>
        </div>
    );
};


export const AdminMembers = ({ members, onAddMember, onUpdateMember, onDeleteMember, onViewMember }: { members: Member[], onAddMember: (m: any) => Promise<boolean | void>, onUpdateMember: (m: Member) => Promise<boolean | void>, onDeleteMember: (id: string) => void, onViewMember: (m: Member) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [sortField, setSortField] = useState<'firstName' | 'lastName' | 'joinDate' | 'status'>('firstName');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const { currentAction, setCurrentAction, fetchMembers } = useAlmStore();

    const handleSortChange = (field: 'firstName' | 'lastName' | 'joinDate' | 'status') => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    useEffect(() => {
        if (!currentAction) return;
        if (currentAction === "EDIT_MEMBER") {
            setIsAdding(true);
            setNewMember(useAlmStore.getState().selectedMember || {});
        }
    }, [currentAction])


    const [statusFilter, setStatusFilter] = useState('All');
    const [genderFilter, setGenderFilter] = useState('All');
    const [districtFilter, setDistrictFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');

    // Derived State
    const filteredMembers = members.filter(m => {
        const matchesSearch =
            (m.firstName ?? "").toLowerCase().includes((searchTerm ?? "").toLowerCase()) ||
            (m.lastName ?? "").toLowerCase().includes((searchTerm ?? "").toLowerCase()) ||
            (m.email ?? "").toLowerCase().includes((searchTerm ?? "").toLowerCase()) ||
            (m.phone ?? "").includes(searchTerm ?? "") ||
            (m.membershipId ?? "").toLowerCase().includes((searchTerm ?? "").toLowerCase());

        const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
        const matchesGender = genderFilter === 'All' || m.gender === genderFilter;
        const matchesDistrict = districtFilter === 'All' || m.district === districtFilter;
        const matchesPayment = paymentFilter === 'All' || m.paymentStatus === paymentFilter;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesGender &&
            matchesDistrict &&
            matchesPayment
        );
    });


    const activeCount = members.filter(m => m.status === 'Active').length;
    const pendingCount = members.filter(m => m.status === 'Pending').length;
    const unpaidCount = members.filter(m => m.paymentStatus === 'Unpaid' || m.paymentStatus === 'Overdue').length;

    const [newMember, setNewMember] = useState<Partial<Member>>({
        firstName: '', lastName: '', email: '', phone: '', status: 'Active',
        membershipId: `ALM-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        joinDate: new Date().toISOString().split('T')[0],
        gender: 'Male', district: 'Musanze', membershipType: 'Regular', paymentStatus: 'Unpaid',
        nationality: 'Liberian', maritalStatus: 'Single', sector: '',
        emergencyContact: { name: '', relation: '', phone: '' }
    });
    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isEditing = Boolean(newMember.id && newMember.id.trim() !== "");

        if (isEditing) {
            const updated = await onUpdateMember(newMember as Member);

            if (updated) {
                setIsAdding(false);
                setCurrentAction(null);
            }
            return;
        }
        const created = await onAddMember(newMember);
        if (created) {
            setIsAdding(false);
            setCurrentAction(null);
        }
    };


    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredMembers.map(m => m.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Analytics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 flex items-center gap-4 border-l-4 border-primary hover:shadow-md transition-shadow">
                    <div className="p-2 text-center bg-primary/10 rounded-full text-primary">
                        <Icon name="group" />
                    </div>
                    <div><p className="text-2xl font-bold">{members.length}</p>
                        <p className="text-[10px] text-gray-500 uppercase text">Total Members</p></div>
                </Card>
                <Card className="p-2 lg:p-4 flex items-center gap-2 lg:gap-4 border-l-4 border-green-500 hover:shadow-md transition-shadow">
                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                        <Icon name="verified" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold">{activeCount}</p>
                        <p className="text-[10px] text-gray-500 uppercase truncate">Active</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-2 lg:gap-4 border-l-4 border-yellow-500 hover:shadow-md transition-shadow">
                    <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                        <Icon name="hourglass_empty" />
                    </div>
                    <div><p className="text-2xl font-bold">{pendingCount}</p>
                        <p className="text-[10px] text-gray-500 uppercase">Pending</p></div>
                </Card>
                <Card className="p-4 flex items-center gap-2 lg:gap-4 border-l-4 border-red-500 hover:shadow-md transition-shadow">
                    <div className="p-2 bg-red-100 rounded-full text-red-600"><Icon name="payments" /></div>
                    <div><p className="text-2xl font-bold">{unpaidCount}</p><p className="text-[10px] text-gray-500 uppercase">Unpaid/Overdue</p></div>
                </Card>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-2xl font-black">Members Directory</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" icon="file_download">Export</Button>
                        <Button variant="primary" icon="person_add" onClick={() => setIsAdding(true)}>Add New Member</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <Input placeholder="Search name, phone, ID..." icon="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <CustomSelect
                        options={['All', 'Active', 'Pending', 'Suspended'].map(s => ({ label: s, value: s }))}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        placeholder="Status"
                    />
                    <CustomSelect
                        options={['All', 'Male', 'Female'].map(s => ({ label: s, value: s }))}
                        value={genderFilter}
                        onChange={setGenderFilter}
                        placeholder="Gender"
                        className="text-sm"
                    />
                    <CustomSelect
                        options={['All', 'Paid', 'Unpaid', 'Overdue'].map(s => ({ label: s, value: s }))}
                        value={paymentFilter}
                        onChange={setPaymentFilter}
                        placeholder="Payment"
                    />
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-center justify-between">
                    <span className="font-bold text-primary text-sm">{selectedIds.length} members selected</span>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" icon="check_circle" className="text-green-600 hover:bg-green-100">Activate</Button>
                        <Button variant="ghost" size="sm" icon="block" className="text-red-600 hover:bg-red-100">Deactivate</Button>
                        <Button variant="ghost" size="sm" icon="mail">Message</Button>
                    </div>
                </motion.div>
            )}

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    {filteredMembers.length > 0 ? (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-white/5 text-text-secondary font-medium">
                                <tr>
                                    <th className="px-4 py-3 w-10">
                                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" onChange={handleSelectAll} checked={selectedIds.length === filteredMembers.length && filteredMembers.length > 0} />
                                    </th>
                                    <th className="px-4 py-3">Member</th>
                                    <th className="px-4 py-3">ID & Contact</th>
                                    <th className="px-4 py-3">Location</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Payment</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredMembers.map(member => (
                                    <tr key={member.id} className={`hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${selectedIds.includes(member.id) ? 'bg-primary/5' : ''}`}>
                                        <td className="px-4 py-3">
                                            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" checked={selectedIds.includes(member.id)} onChange={() => handleSelectOne(member.id)} />
                                        </td>
                                        <td className="px-4 py-3 flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-gray-200 bg-cover bg-center shrink-0 border border-gray-200" style={{ backgroundImage: `url(${member.avatar ?? ProfileAvatar})` }}></div>
                                            <div>
                                                <span className="font-bold block">{member.firstName} {member.lastName}</span>
                                                <span className="text-xs text-gray-500">{member.gender}, {member.nationality}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-xs text-gray-500 mb-0.5">{member.membershipId}</span>
                                                <span className="text-xs">{member.phone}</span>
                                                <span className="text-xs text-gray-400">{member.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="block text-sm">{member.district}</span>
                                            <span className="text-xs text-gray-500">{member.sector}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge color="blue">{member.membershipType}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge color={member.status === 'Active' ? 'green' : member.status === 'Pending' ? 'yellow' : 'red'}>{member.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge color={member.paymentStatus === 'Paid' ? 'green' : member.paymentStatus === 'Overdue' ? 'red' : 'yellow'}>{member.paymentStatus}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => onViewMember(member)} >
                                                    <Eye className="size-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => { setIsAdding(true); setNewMember(member); }}>
                                                    <SquarePen className="size-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" icon="delete" className="text-red-500 hover:text-red-700" onClick={() => setDeleteConfirmationId(member.id)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <EmptyState title="No Members" description="No members match your search criteria." icon="group_off" />}
                </div>
            </Card>

            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[101] flex items-center justify-center !m-0 p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAdding(false)}></div>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-card-dark w-full max-w-4xl rounded-xl p-0 relative z-10 max-h-[90vh] overflow-y-auto flex flex-col">
                            <div className="p-10 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold">{newMember.id ? 'Edit Member' : 'Add New Member'}</h2>
                                <Button variant="ghost" icon="close" onClick={() => {
                                    setIsAdding(false)
                                    setCurrentAction(null);
                                }} />
                            </div>

                            <form onSubmit={handleAddSubmit} className="p-6 space-y-8">
                                {/* Personal Info */}
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider">Personal Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input label="First Name" required value={newMember.firstName} onChange={e => setNewMember({ ...newMember, firstName: e.target.value })} />
                                        <Input label="Last Name" required value={newMember.lastName} onChange={e => setNewMember({ ...newMember, lastName: e.target.value })} />
                                        <CustomSelect label="Gender" options={['Male', 'Female', 'Other'].map(v => ({ label: v, value: v }))} value={newMember.gender || 'Male'} onChange={v => setNewMember({ ...newMember, gender: v as any })} />
                                        <CustomDatePicker label="Date of Birth" value={newMember.dateOfBirth || ''} onChange={v => setNewMember({ ...newMember, dateOfBirth: v })} />
                                        <CustomSelect label="Marital Status" options={['Single', 'Married', 'Divorced', 'Widowed'].map(v => ({ label: v, value: v }))} value={newMember.maritalStatus || 'Single'} onChange={v => setNewMember({ ...newMember, maritalStatus: v as any })} />
                                        <Input label="Nationality" value={newMember.nationality} onChange={e => setNewMember({ ...newMember, nationality: e.target.value })} />
                                    </div>
                                </div>

                                {/* Contact & Location */}
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider">Contact & Location</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input label="Phone Number" required value={newMember.phone} onChange={e => setNewMember({ ...newMember, phone: e.target.value })} />
                                        <Input label="Email Address" type="email" value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} />
                                        <Input label="District" required value={newMember.district} onChange={e => setNewMember({ ...newMember, district: e.target.value })} />
                                        <Input label="Sector" required value={newMember.sector} onChange={e => setNewMember({ ...newMember, sector: e.target.value })} />
                                        <Input label="Cell/Village" value={newMember.cell} onChange={e => setNewMember({ ...newMember, cell: e.target.value })} />
                                    </div>
                                </div>

                                {/* Membership Details */}
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider">Membership Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input label="Membership ID" value={newMember.membershipId} onChange={e => setNewMember({ ...newMember, membershipId: e.target.value })} placeholder="Auto-generated if empty" />
                                        <CustomSelect label="Membership Type" options={['Regular', 'Student', 'Executive', 'Honorary'].map(v => ({ label: v, value: v }))} value={newMember.membershipType || 'Regular'} onChange={v => setNewMember({ ...newMember, membershipType: v as any })} />
                                        <CustomSelect label="Status" options={['Active', 'Pending', 'Suspended'].map(v => ({ label: v, value: v }))} value={newMember.status || 'Active'} onChange={v => setNewMember({ ...newMember, status: v as any })} />
                                        {
                                            newMember.membershipType === "Executive" && (
                                                <CustomSelect options={ExecutiveCommitteePositionOptions} label="Position" value={newMember.position || ''} onChange={v => setNewMember({ ...newMember, position: v as Member['position'] })} />
                                            )
                                        }
                                    </div>
                                </div>

                                {/* Emergency Contact */}
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-gray-500 mb-4 tracking-wider">Emergency Contact</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Input label="Contact Name" value={newMember.emergencyContact?.name} onChange={e => setNewMember({ ...newMember, emergencyContact: { ...newMember.emergencyContact!, name: e.target.value } })} />
                                        <Input label="Relationship" value={newMember.emergencyContact?.relation} onChange={e => setNewMember({ ...newMember, emergencyContact: { ...newMember.emergencyContact!, relation: e.target.value } })} />
                                        <Input label="Contact Phone" value={newMember.emergencyContact?.phone} onChange={e => setNewMember({ ...newMember, emergencyContact: { ...newMember.emergencyContact!, phone: e.target.value } })} />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                                    <Button variant="ghost" type='button' onClick={() => {
                                        setIsAdding(false)
                                        setCurrentAction(null);
                                    }}>Cancel</Button>
                                    <Button variant="primary" type="submit">Save Changes</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {deleteConfirmationId && (
                    <div className="fixed inset-0 z-[102] flex items-center justify-center !m-0 p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirmationId(null)}></div>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white dark:bg-card-dark w-full max-w-sm rounded-xl p-6 relative z-10 text-center">
                            <div className="size-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                                <Icon name="warning" className="text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Delete Member?</h3>
                            <p className="text-gray-500 mb-6 text-sm">Are you sure you want to delete this member? This action cannot be undone and will remove all associated data.</p>
                            <div className="flex justify-center gap-2">
                                <Button variant="ghost" onClick={() => setDeleteConfirmationId(null)}>Cancel</Button>
                                <Button variant="danger" onClick={() => { onDeleteMember(deleteConfirmationId); setDeleteConfirmationId(null); }}>Yes, Delete</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const AdminMemberProfile = ({ member, onBack, loginLogs, onUpdateMember, onDeleteMember }: { member: Member, onBack: () => void, loginLogs: LoginLog[], onUpdateMember: (m: Member) => void, onDeleteMember: (id: string) => void }) => {
    const [showDelete, setShowDelete] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'activities'>('profile');
    const { navigateAction, showToast } = useAlmStore()
    const uploadAvatar = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
            const uploadRes = await fetcher(`/upload/single`, {
                method: "POST",
                useToken: false,
                body: formData,
            });

            if (uploadRes.success) {
                const updatedMember = { ...member, avatar: uploadRes.data.file.url };
                await onUpdateMember(updatedMember);
                showToast("Profile Image updated successfully", "success");
            } else {
                showToast(uploadRes.error || "Failed to upload avatar", "error");
            }

        } catch (error) {
            console.error("Error uploading avatar:", error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center  lg:justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" icon="arrow_back" onClick={onBack}>Back</Button>
                    <h1 className="text-2xl font-bold">Member Profile</h1>
                </div>
                <div className="flex gap-2 justify-end w-full lg:w-auto">
                    <Button variant="outline" icon="edit" onClick={() => navigateAction("EDIT_MEMBER", member)}>Edit Profile</Button>
                    <Button variant="outline" icon="print">Print</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ID Card / Summary */}
                <Card className="p-0 overflow-hidden">
                    <div className="bg-primary h-32 relative">
                        <MemberAvatar member={{
                            avatar: member.avatar,
                        }} onUpload={uploadAvatar} />
                    </div>
                    <div className="pt-20 pb-8 px-6 text-center">
                        <h2 className="text-2xl font-bold">{member.firstName} {member.lastName}</h2>
                        <p className="text-gray-500 mb-4">{member.email}</p>

                        <div className="flex justify-center gap-2 mb-6">
                            <Badge color={member.status === 'Active' ? 'green' : member.status === 'Pending' ? 'yellow' : 'red'}>{member.status}</Badge>
                            <Badge color="blue">{member.membershipType}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-left bg-gray-50 dark:bg-white/5 p-4 rounded-xl text-sm">
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Member ID</p>
                                <p className="font-medium">{member.membershipId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Phone</p>
                                <p className="font-medium">{member.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Nationality</p>
                                <p className="font-medium">{member.nationality}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Joined</p>
                                <p className="font-medium text-xs truncate">{new Date(member.joinDate).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            {member.status !== 'Active' ? (
                                <Button variant="primary" className="w-full bg-green-600 hover:bg-green-700" onClick={() => onUpdateMember({ ...member, status: 'Active' })}>Activate Member</Button>
                            ) : (
                                <Button variant="outline" className="w-full text-yellow-600 border-yellow-600 hover:bg-yellow-50" onClick={() => onUpdateMember({ ...member, status: 'Suspended' })}>Suspend Member</Button>
                            )}
                            <Button variant="danger" className="w-full bg-transparent text-red-600 border border-red-600 hover:bg-red-50" onClick={() => setShowDelete(true)}>Delete Member</Button>
                        </div>
                    </div>
                </Card>

                {/* Detailed Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Personal & Location</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                            <div><p className="text-gray-500">Gender</p><p className="font-medium">{member.gender}</p></div>
                            <div><p className="text-gray-500">Date of Birth</p><p className="font-medium">{member.dateOfBirth}</p></div>
                            <div><p className="text-gray-500">Marital Status</p><p className="font-medium">{member.maritalStatus}</p></div>
                            <div><p className="text-gray-500">District</p><p className="font-medium">{member.district}</p></div>
                            <div><p className="text-gray-500">Sector</p><p className="font-medium">{member.sector}</p></div>
                            <div><p className="text-gray-500">Cell/Village</p><p className="font-medium">{member.cell || '-'}</p></div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Emergency Contact</h3>
                        <div className="grid grid-cols-2 gap-6 text-sm">
                            <div><p className="text-gray-500">Name</p><p className="font-medium">{member.emergencyContact?.name}</p></div>
                            <div><p className="text-gray-500">Relationship</p><p className="font-medium">{member.emergencyContact?.relation}</p></div>
                            <div><p className="text-gray-500">Phone</p><p className="font-medium">{member.emergencyContact?.phone}</p></div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-bold text-lg mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Documents</h3>
                        <div className="space-y-3">
                            {member.documents && member.documents.length > 0 ? member.documents.map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 rounded text-red-600"><Icon name="description" /></div>
                                        <div>
                                            <p className="font-medium text-sm">{doc.name}</p>
                                            <p className="text-xs text-gray-500">{doc.type} • {doc.dateUploaded}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" icon="download" />
                                </div>
                            )) : <p className="text-sm text-gray-500 italic">No documents uploaded.</p>}
                        </div>
                    </Card>
                </div>
            </div>

            <AnimatePresence>
                {showDelete && (
                    <div className="fixed inset-0 z-[102] flex items-center justify-center !m-0 p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDelete(false)}></div>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white dark:bg-card-dark w-full max-w-sm rounded-xl p-6 relative z-10 text-center">
                            <Icon name="warning" className="text-4xl text-red-500 mb-2" />
                            <h3 className="text-lg font-bold">Confirm Deletion</h3>
                            <p className="text-gray-500 mb-4 text-sm">Are you sure you want to permanently remove {member.firstName}?</p>
                            <div className="flex justify-center gap-2 mt-4">
                                <Button variant="ghost" onClick={() => setShowDelete(false)}>Cancel</Button>
                                <Button variant="danger" onClick={() => onDeleteMember(member.id)}>Delete Member</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Admin Events ---
export const AdminEvents = ({ events, onAddEvent, onUpdateEvent, onDeleteEvent }: { events: Event[], onAddEvent: (e: any) => Promise<boolean>, onUpdateEvent: (e: Event) => Promise<boolean>, onDeleteEvent: (id: string) => void }) => {
    const [view, setView] = useState<'LIST' | 'CREATE' | 'DETAILS'>('LIST');
    const { selectedEvent, setSelectedEvent, currentAction, setCurrentAction, setHasUnsavedChanges, currentView, navigateAction, fetchEvents } = useAlmStore();
    const [eventSubmitLoading, setEventSubmitLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('Date');
    const [deleteId, setDeleteId] = useState<string | null>(null);


    useEffect(() => {
        fetchEvents();
    }, []);
    useEffect(() => {
        if (currentView === "ADMIN_EVENTS") {
            switch (currentAction) {
                case "EVENT_DETAILS":
                    if (!selectedEvent) {
                        return
                    };
                    setView('DETAILS');
                    setActiveTab(activeTab === "Attendees" ? "Attendees" : "Overview");
                    break;
                case "EVENT_LIST":
                    setView('LIST');
                    break;
                case "ADD_EVENT":
                    setView('CREATE');
                    setActiveTab('Basic');
                    break;
                case "EDIT_EVENT":
                    setView('CREATE');
                    setFormData(selectedEvent || {});
                    setActiveTab("Basic");
                    setHasUnsavedChanges(true);
                    break;
                default:
                    setView('LIST');
            }
        }
    }, [currentAction, selectedEvent]);


    const filteredEvents = events.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    }).sort((a, b) => {
        if (sortOrder === 'Date') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortOrder === 'Popularity') return (b.rsvpCount || 0) - (a.rsvpCount || 0);
        return 0;
    });

    const [formData, setFormData] = useState<Partial<Event>>({
        title: '', date: '', time: '', location: '', description: '',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUjtKHJQVedLpdZAVUSDzrDyBQI_6KFfzqXVnS8VYMXEf0snhFM6vxckOwtkz-RQKksEVw79e57e2Nq7soCsvUPdLMQSr5_MKAkbioZOeVX_7A_Sdy5fmCncWYOA85p_0tpiF791qpfFvL7EBOPI3cN4ezEV561VhctROL4k5ZzlZokoz8tHj5O7ziGjrQSpzuMaUXLW_Fp7ZS02WQt1F8HN8m6y8pkCVjax4WoaGvjzeodWw4fHezo6FWvaHk6P_W3DEMR8VKVyE',
        category: 'Meeting', status: 'Draft', capacity: 0, price: 0, organizer: '',
        registrationRequired: false, speakers: [], agenda: [], attachments: []
    });


    const [activeTab, setActiveTab] = useState('Overview');

    const handleSave = async (e: React.FormEvent) => {
        setEventSubmitLoading(true);
        e.preventDefault();
        if (formData.id) {
            const updatedEvent = await onUpdateEvent({ ...selectedEvent, ...formData } as Event);
            if (!updatedEvent) {
                setEventSubmitLoading(false);
                return;
            }
        } else {
            const addEvent = await onAddEvent(formData);
            if (!addEvent) {
                setEventSubmitLoading(false);
                return;
            };
        }
        setView('LIST');
        setCurrentAction("EVENT_LIST");
        setHasUnsavedChanges(false);
        setFormData({
            title: '', date: '', time: '', location: '', description: '', category: 'Meeting', status: 'Draft', capacity: 0, price: 0, organizer: '',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUjtKHJQVedLpdZAVUSDzrDyBQI_6KFfzqXVnS8VYMXEf0snhFM6vxckOwtkz-RQKksEVw79e57e2Nq7soCsvUPdLMQSr5_MKAkbioZOeVX_7A_Sdy5fmCncWYOA85p_0tpiF791qpfFvL7EBOPI3cN4ezEV561VhctROL4k5ZzlZokoz8tHj5O7ziGjrQSpzuMaUXLW_Fp7ZS02WQt1F8HN8m6y8pkCVjax4WoaGvjzeodWw4fHezo6FWvaHk6P_W3DEMR8VKVyE',
            registrationRequired: false, speakers: [], agenda: [], attachments: []
        });
        setEventSubmitLoading(false);
    };

    const addSpeaker = () => setFormData({ ...formData, speakers: [...(formData.speakers || []), { id: Date.now().toString(), name: '', title: '' }] });
    const updateSpeaker = (idx: number, field: string, val: string) => {
        const newSpeakers = [...(formData.speakers || [])];
        newSpeakers[idx] = { ...newSpeakers[idx], [field]: val };
        setFormData({ ...formData, speakers: newSpeakers });
    };
    const removeSpeaker = (idx: number) => setFormData({ ...formData, speakers: formData.speakers?.filter((_, i) => i !== idx) });

    const addAgendaItem = () => setFormData({ ...formData, agenda: [...(formData.agenda || []), { id: Date.now().toString(), time: '', activity: '' }] });
    const updateAgendaItem = (idx: number, field: string, val: string) => {
        const newAgenda = [...(formData.agenda || [])];
        newAgenda[idx] = { ...newAgenda[idx], [field]: val };
        setFormData({ ...formData, agenda: newAgenda });
    };
    const removeAgendaItem = (idx: number) => setFormData({ ...formData, agenda: formData.agenda?.filter((_, i) => i !== idx) });

    const handleAttendeeAction = (attendeeId: string, action: 'Approve' | 'Reject' | 'CheckIn') => {
        if (!selectedEvent || !selectedEvent.attendees) return;
        const updatedAttendees = selectedEvent.attendees.map(a => {
            if (a.id === attendeeId) {
                if (action === 'Approve') return { ...a, status: 'Confirmed' as const };
                if (action === 'Reject') return { ...a, status: 'Rejected' as const };
                if (action === 'CheckIn') return { ...a, status: 'Checked In' as const, attended: true };
            }
            return a;
        });
        const updatedEvent = { ...selectedEvent, attendees: updatedAttendees };
        setSelectedEvent(updatedEvent);
        navigateAction("EVENT_DETAILS", updatedEvent);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {view === 'LIST' && (
                <>
                    {/* Header & Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4 flex items-center gap-4"><div className="p-3 bg-blue-100 rounded-full text-blue-600"><Icon name="event" /></div><div><p className="text-2xl font-bold">{events.length}</p><p className="text-xs text-gray-500 uppercase">Total Events</p></div></Card>
                        <Card className="p-4 flex items-center gap-4"><div className="p-3 bg-green-100 rounded-full text-green-600"><Icon name="event_upcoming" /></div><div><p className="text-2xl font-bold">{events.filter(e => e.status === 'Upcoming').length}</p><p className="text-xs text-gray-500 uppercase">Upcoming</p></div></Card>
                        <Card className="p-4 flex items-center gap-4"><div className="p-3 bg-gray-100 rounded-full text-gray-600"><Icon name="event_available" /></div><div><p className="text-2xl font-bold">{events.filter(e => e.status === 'Past').length}</p><p className="text-xs text-gray-500 uppercase">Completed</p></div></Card>
                        <Card className="p-4 flex items-center gap-4"><div className="p-3 bg-purple-100 rounded-full text-purple-600"><Icon name="groups" /></div><div><p className="text-2xl font-bold">85%</p><p className="text-xs text-gray-500 uppercase">Avg Attendance</p></div></Card>
                    </div>

                    <Card className="p-4 flex flex-col gap-4">
                        <div className="flex flex-row justify-between items-center gap-4">
                            <h1 className="text-2xl font-black">Events</h1>
                            <Button variant="primary" icon="add" onClick={() => { navigateAction('ADD_EVENT'); }}>Create Event</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-1"><Input placeholder="Search events..." icon="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                            <CustomSelect options={['All', 'Upcoming', 'Past', 'Cancelled'].map(s => ({ label: s, value: s }))} value={statusFilter} onChange={setStatusFilter} placeholder="Status" />
                            <CustomSelect options={['All', 'Meeting', 'Workshop', 'Cultural', 'Sports'].map(s => ({ label: s, value: s }))} value={categoryFilter} onChange={setCategoryFilter} placeholder="Category" />
                            <CustomSelect options={['Date', 'Popularity', 'Newest'].map(s => ({ label: s, value: s }))} value={sortOrder} onChange={setSortOrder} placeholder="Sort By" />
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map(event => (
                            <Card key={event.id} className="overflow-hidden flex flex-col group hover:shadow-lg transition-all">
                                <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url(${event.image})` }}>
                                    <div className="absolute top-2 right-2"><Badge color={event.status === 'Upcoming' ? 'green' : event.status === 'Past' ? 'gray' : 'red'}>{event.status}</Badge></div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{event.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                        <Icon name="calendar_today" className="text-sm" /> {new Date(event.date).toLocaleDateString()} • {event.time}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                        <Icon name="location_on" className="text-sm" /> {event.location}
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <div className="flex items-center gap-1 text-xs font-bold text-primary">
                                            <Icon name="group" className="text-sm" /> {event.rsvpCount || 0} / {event.capacity || '∞'}
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" icon="visibility" onClick={() => { navigateAction("EVENT_DETAILS", event) }} />
                                            <Button variant="ghost" size="sm" icon="edit" onClick={() => { navigateAction("EDIT_EVENT", event); }} />
                                            <Button variant="ghost" size="sm" icon="delete" className="text-red-500 hover:bg-red-50" onClick={() => setDeleteId(event.id)} />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {filteredEvents.length === 0 && <div className="col-span-full"><EmptyState title="No Events Found" description="Try adjusting your filters or create a new event." icon="event_busy" /></div>}
                    </div>
                </>
            )}

            {view === 'CREATE' && (
                <Card className="max-w-7xl mx-auto overflow-hidden">
                    <div className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center">
                        <h2 className="text-2xl font-bold">{formData.id ? 'Edit Event' : 'Create New Event'}</h2>
                        <Button variant="ghost" icon="close" onClick={() => {
                            navigateAction("EVENT_LIST")
                            setFormData({
                                title: '', date: '', time: '', location: '', description: '', category: 'Meeting',
                                status: 'Draft', capacity: 0, price: 0, organizer: '', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUjtKHJQVedLpdZAVUSDzrDyBQI_6KFfzqXVnS8VYMXEf0snhFM6vxckOwtkz-RQKksEVw79e57e2Nq7soCsvUPdLMQSr5_MKAkbioZOeVX_7A_Sdy5fmCncWYOA85p_0tpiF791qpfFvL7EBOPI3cN4ezEV561VhctROL4k5ZzlZokoz8tHj5O7ziGjrQSpzuMaUXLW_Fp7ZS02WQt1F8HN8m6y8pkCVjax4WoaGvjzeodWw4fHezo6FWvaHk6P_W3DEMR8VKVyE',
                                registrationRequired: false, speakers: [], agenda: [], attachments: []
                            });
                        }} />
                    </div>
                    <div className="flex border-b border-gray-200 dark:border-gray-800">
                        {['Basic', 'Details & Agenda', 'Registration'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-sm font-medium ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}>{tab}</button>
                        ))}
                    </div>
                    <form onSubmit={handleSave} className="p-6">
                        {activeTab === 'Basic' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2"><Input label="Event Name" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                                    <CustomSelect label="Category" options={['Meeting', 'Workshop', 'Cultural', 'Training', 'Sports'].map(c => ({ label: c, value: c }))} value={formData.category || 'Meeting'} onChange={v => setFormData({ ...formData, category: v as any })} />
                                    <Input label="Organizer" value={formData.organizer} onChange={e => setFormData({ ...formData, organizer: e.target.value })} />
                                    <CustomDatePicker label="Date" value={formData.date || ''} onChange={v => setFormData({ ...formData, date: v })} />
                                    <CustomTimePicker label="Time" value={formData.time || ''} onChange={v => setFormData({ ...formData, time: v })} />
                                    <Input label="Venue / Location" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">Banner Image URL</label>
                                        <div className="flex gap-4">
                                            <Input value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="flex-1" />
                                            <div className="size-10 rounded bg-gray-200 bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${formData.image})` }}></div>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">Description</label>
                                        <Textarea className="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark p-3 h-32" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Event details..." required />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Details & Agenda' && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <div className="flex justify-between items-center mb-4"><h3 className="font-bold">Speakers / Guests</h3><Button variant="outline" size="sm" icon="add" onClick={addSpeaker} type="button">Add Speaker</Button></div>
                                    {formData.speakers?.map((speaker, i) => (
                                        <div key={i} className="flex gap-4 mb-2 items-center">
                                            <Input placeholder="Name" value={speaker.name} onChange={e => updateSpeaker(i, 'name', e.target.value)} className="flex-1" />
                                            <Input placeholder="Role" value={speaker.title} onChange={e => updateSpeaker(i, 'title', e.target.value)} className="flex-1" />
                                            <Button variant="ghost" size="sm" icon="delete" className="text-red-500" onClick={() => removeSpeaker(i)} type="button" />
                                        </div>
                                    ))}
                                    {(!formData.speakers || formData.speakers.length === 0) && <p className="text-sm text-gray-400 italic">No speakers added.</p>}
                                </div>
                                <hr className="border-gray-100" />
                                <div>
                                    <div className="flex justify-between items-center mb-4"><h3 className="font-bold">Agenda</h3><Button variant="outline" size="sm" icon="add" onClick={addAgendaItem} type="button">Add Item</Button></div>
                                    {formData.agenda?.map((item, i) => (
                                        <div key={i} className="flex gap-4 mb-2 items-center">
                                            <CustomTimePicker value={item.time} onChange={v => updateAgendaItem(i, 'time', v)} className="w-32" />
                                            <Input placeholder="Activity" value={item.activity} onChange={e => updateAgendaItem(i, 'activity', e.target.value)} className="flex-1" />
                                            <Button variant="ghost" size="sm" icon="delete" className="text-red-500" onClick={() => removeAgendaItem(i)} type="button" />
                                        </div>
                                    ))}
                                    {(!formData.agenda || formData.agenda.length === 0) && <p className="text-sm text-gray-400 italic">No agenda items added.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'Registration' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-card-dark rounded-lg border border-gray-200 dark:border-gray-500">
                                    <input type="checkbox" className="size-5 rounded border-gray-300 text-primary focus:ring-primary" checked={formData.registrationRequired} onChange={e => setFormData({ ...formData, registrationRequired: e.target.checked })} />
                                    <div><p className="font-bold">Registration Required</p><p className="text-sm text-gray-500">Users must sign up to attend this event.</p></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="Max Capacity" type="number" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })} />
                                    <Input label="Event Fee (RWF)" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })} placeholder="0 for free" />
                                    <Input label="Contact Email" type="email" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                            <Button variant="ghost" onClick={() => navigateAction('EVENT_LIST')} type="button">Cancel</Button>
                            <Button variant="primary" type="submit" disabled={eventSubmitLoading} className=' disabled:bg-opacity-45'>
                                {eventSubmitLoading ? <span className="flex items-center gap-2">
                                    <Loader2 size={20} className="animate-spin" /> Saving...</span> : 'Save Event'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {view === 'DETAILS' && selectedEvent && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-4 mb-4">
                        <Button variant="ghost" icon="arrow_back" onClick={() => navigateAction('EVENT_LIST')}>Back</Button>
                        <h1 className="text-2xl font-bold">Event Details</h1>
                        <div className="ml-auto flex gap-2">
                            <Button variant="outline" icon="edit" onClick={() => navigateAction('EDIT_EVENT', selectedEvent)}>Edit</Button>
                            <Button variant="danger" icon="delete" onClick={() => setDeleteId(selectedEvent.id)}>Delete</Button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
                        <div className="h-64 bg-cover bg-center relative" style={{ backgroundImage: `url(${selectedEvent.banner || selectedEvent.image})` }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                                <div>
                                    <Badge color={selectedEvent.category === 'Meeting' ? 'gray' : 'yellow'} >{selectedEvent.category}</Badge>
                                    <h1 className="text-4xl font-black text-white mt-2 mb-2">{selectedEvent.title}</h1>
                                    <div className="flex items-center gap-6 text-white/90 text-sm font-medium">
                                        <span className="flex items-center gap-2"><Icon name="calendar_month" /> {new Date(selectedEvent.date).toLocaleDateString()}, {selectedEvent.time}</span>
                                        <span className="flex items-center gap-2"><Icon name="location_on" /> {selectedEvent.location}</span>
                                        <span className="flex items-center gap-2"><Icon name="person" /> By {selectedEvent.organizer}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex border-b border-gray-200 dark:border-gray-800">
                            {['Overview', 'Attendees'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-4 font-medium text-sm transition-colors ${activeTab === tab ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-gray-500 hover:text-gray-700'}`}>{tab}</button>
                            ))}
                        </div>

                        <div className="p-8">
                            {activeTab === 'Overview' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                    <div className="lg:col-span-2 space-y-8">
                                        <div>
                                            <h3 className="text-xl font-bold mb-4">About this Event</h3>
                                            <p className="text-gray-600 leading-relaxed">{selectedEvent.description}</p>
                                        </div>
                                        {selectedEvent.agenda && selectedEvent.agenda.length > 0 && (
                                            <div>
                                                <h3 className="text-xl font-bold mb-4">Agenda</h3>
                                                <div className="space-y-4">
                                                    {selectedEvent.agenda.map((item, i) => (
                                                        <div key={i} className="flex gap-4 p-4 bg-gray-50 dark:bg-background-dark rounded-lg border-l-4 border-primary">
                                                            <span className="font-mono font-bold text-primary w-16">{item.time}</span>
                                                            <span className="font-medium text-gray-800 dark:text-gray-200">{item.activity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-8">
                                        {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold mb-4">Speakers</h3>
                                                <div className="space-y-4">
                                                    {selectedEvent.speakers.map((speaker, idx) => (
                                                        <div key={idx} className="flex items-center gap-3">
                                                            <div className="size-12 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: `url(${speaker.avatar})` }}></div>
                                                            <div>
                                                                <p className="font-bold text-sm">{speaker.name}</p>
                                                                <p className="text-xs text-gray-500">{speaker.title}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="bg-gray-50 dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <h4 className="font-bold text-gray-900 dark:text-primary mb-2">Registration Info</h4>
                                            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                <div className="flex justify-between"><span>Status:</span> <Badge color="green">Open</Badge></div>
                                                <div className="flex justify-between"><span>Capacity:</span> <span className="font">{selectedEvent.capacity}</span></div>
                                                <div className="flex justify-between"><span>Registered:</span> <span className="font">{selectedEvent.attendees?.length || 0}</span></div>
                                                <div className="flex justify-between"><span>Price:</span> <span className="font">{selectedEvent.price ? `RWF ${selectedEvent.price}` : 'Free'}</span></div>
                                            </div>
                                            <div className="space-y-2">
                                                <Button variant="outline" className="w-full" icon="share">Share Event</Button>
                                                <Button variant="outline" className="w-full" icon="download">Download Report</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Attendees' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" icon="file_download">Export CSV</Button>
                                            <Button variant="outline" size="sm" icon="print">Print List</Button>
                                        </div>
                                        <Button variant="primary" size="sm" icon="send">Send Notification</Button>
                                    </div>
                                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                        {selectedEvent.attendees && selectedEvent.attendees.length > 0 ? (
                                            <table className="w-full text-sm text-left dark:border-gray-700">
                                                <thead className="bg-gray-50 dark:bg-background-dark text-gray-500 font-medium">
                                                    <tr>
                                                        <th className="px-4 py-3">Name</th>
                                                        <th className="px-4 py-3">Contact</th>
                                                        <th className="px-4 py-3">Reg Date</th>
                                                        <th className="px-4 py-3">Status</th>
                                                        <th className="px-4 py-3">Attendance</th>
                                                        <th className="px-4 py-3 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {selectedEvent.attendees.map(attendee => (
                                                        <tr key={attendee.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-gray-900">{attendee.name}</td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-col text-xs">
                                                                    <span>{attendee.email}</span>
                                                                    <span className="text-gray-400">{attendee.phone}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-500">{attendee.registrationDate}</td>
                                                            <td className="px-4 py-3">
                                                                <Badge color={attendee.status === 'Confirmed' ? 'green' : attendee.status === 'Pending' ? 'yellow' : 'red'}>{attendee.status}</Badge>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {attendee.status !== 'Rejected' && attendee.status !== 'Cancelled' && (
                                                                    <button
                                                                        onClick={() => handleAttendeeAction(attendee.id, 'CheckIn')}
                                                                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${attendee.attended ? 'bg-green-100 text-green-700 cursor-default' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                                    >
                                                                        {attendee.attended ? 'Present' : 'Mark Present'}
                                                                    </button>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                {attendee.status === 'Pending' && (
                                                                    <div className="flex justify-end gap-1">
                                                                        <Button variant="ghost" size="sm" icon="check" className="text-green-600" onClick={() => handleAttendeeAction(attendee.id, 'Approve')} />
                                                                        <Button variant="ghost" size="sm" icon="close" className="text-red-600" onClick={() => handleAttendeeAction(attendee.id, 'Reject')} />
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : <EmptyState title="No Attendees" description="No one has registered for this event yet." icon="group_off" />}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {deleteId && (
                    <div className="fixed inset-0 z-[102] flex items-center justify-center !m-0 p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)}></div>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-sm rounded-xl p-6 relative z-10 text-center">
                            <Icon name="warning" className="text-4xl text-red-500 mb-2" />
                            <h3 className="text-lg font-bold">Delete Event?</h3>
                            <p className="text-sm text-gray-500 mb-4">This will permanently delete the event and all attendee data.</p>
                            <div className="flex justify-center gap-2">
                                <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
                                <Button variant="danger" onClick={() => { onDeleteEvent(deleteId); setDeleteId(null); setView('LIST'); setSelectedEvent(null); }}>Delete</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Admin Finance ---
export const AdminFinance = ({ transactions, onAddTransaction }: { transactions: Transaction[], onAddTransaction: (t: any) => void }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTx, setNewTx] = useState({ amount: '', type: 'Contribution', date: '', contributorName: '' });
    const { members } = useAlmStore()
    const totalRevenue = transactions.reduce((acc, curr) => acc + (curr.status === 'Completed' ? curr.amount : 0), 0);
    const expenses = 12450;
    const netBalance = totalRevenue - expenses;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddTransaction({
            amount: parseFloat(newTx.amount),
            type: newTx.type,
            date: newTx.date || new Date().toISOString().split('T')[0],
            contributorName: newTx.contributorName,
            status: 'Completed'
        });
        setIsAdding(false);
        setNewTx({ amount: '', type: 'Contribution', date: '', contributorName: '' });
    };
    if (!isAdding) {
        return (
            <>
                <FinanceDashboard members={members} initialTransactions={[]} />
            </>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
                <h1 className="text-3xl font-black">Budget & Finance</h1>
                <Button variant="primary" icon="add" onClick={() => setIsAdding(true)}>Add Transaction</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-green-500">
                    <h3 className="font-medium text-text-secondary">Total Revenue</h3>
                    <p className="text-3xl font-bold mt-2">${totalRevenue.toLocaleString()}</p>
                </Card>
                <Card className="p-6 border-l-4 border-red-500">
                    <h3 className="font-medium text-text-secondary">Expenses YTD</h3>
                    <p className="text-3xl font-bold mt-2 text-red-500">RWF{expenses?.toLocaleString()}</p>
                </Card>
                <Card className="p-6 border-l-4 border-blue-500">
                    <h3 className="font-medium text-text-secondary">Net Balance</h3>
                    <p className="text-3xl font-bold mt-2 text-blue-600">${netBalance.toLocaleString()}</p>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/5">
                    <h3 className="font-bold">Transaction Ledger</h3>
                </div>
                <div className="overflow-x-auto">
                    {transactions.length > 0 ? (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-white/5 text-text-secondary dark:text-text-muted font-medium">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Contributor</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">{tx.date}</td>
                                        <td className="px-6 py-4">{tx.contributorName || 'Anonymous'}</td>
                                        <td className="px-6 py-4 font-medium">{tx.type}</td>
                                        <td className="px-6 py-4">${tx.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <Badge color={tx.status === 'Completed' ? 'green' : tx.status === 'Pending' ? 'yellow' : 'red'}>
                                                {tx.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <EmptyState title="No Transactions" description="Recorded transactions will appear here." icon="receipt_long" />}
                </div>
            </Card>

            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAdding(false)}></div>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-card-dark w-full max-w-md rounded-xl p-6 relative z-10">
                            <h2 className="text-xl font-bold mb-4">Record Transaction</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input label="Amount" type="number" required value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })} />
                                <Input label="Contributor Name" required value={newTx.contributorName} onChange={e => setNewTx({ ...newTx, contributorName: e.target.value })} />
                                <CustomSelect label="Type" options={['Contribution', 'Donation', 'Event Fee'].map(t => ({ label: t, value: t }))} value={newTx.type} onChange={val => setNewTx({ ...newTx, type: val as any })} />
                                <CustomDatePicker label="Date" value={newTx.date} onChange={date => setNewTx({ ...newTx, date })} />
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                    <Button variant="primary" type="submit">Save</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Admin Content ---
export const AdminContent = ({ announcements, onAddAnnouncement, onDeleteAnnouncement }: { announcements: Announcement[], onAddAnnouncement: (t: string, c: string) => void, onDeleteAnnouncement: (id: string) => void }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddAnnouncement(title, content);
        setTitle('');
        setContent('');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-3xl font-black">Content Management</h1>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4">
                    <h2 className="text-xl font-bold">New Announcement</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Title" placeholder="Headline" value={title} onChange={e => setTitle(e.target.value)} required />
                        <Textarea
                            className="w-full rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark p-3"
                            rows={4}
                            placeholder="Content..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            required
                        />
                        <div className="flex justify-end">
                            <Button variant="primary" type="submit">Publish</Button>
                        </div>
                    </form>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Active Announcements</h2>
                    <div className="space-y-4">
                        {announcements.length === 0 && <EmptyState title="No Content" description="Published announcements will appear here." icon="article" />}
                        {announcements.map(ann => (
                            <div key={ann.id} className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-800 relative group">
                                <button
                                    onClick={() => onDeleteAnnouncement(ann.id)}
                                    className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded"
                                >
                                    <Delete size={18} />
                                </button>
                                <h3 className="font-bold">{ann.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ann.content}</p>
                                <p className="text-xs text-gray-400 mt-2">{ann.date}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

// --- Admin Inbox ---
export const AdminInbox = ({ feedback, onDelete, onReply, onArchive }: { feedback: Feedback[], onDelete: (id: string) => void, onReply: (id: string) => void, onArchive: (id: string) => void }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selectedMessage = feedback.find(f => f.id === selectedId);

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-fade-in">
            <div className="w-full md:w-1/3 bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5">
                    <h2 className="font-bold text-lg">Inbox ({feedback.filter(f => f.status === 'Unread').length})</h2>
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {feedback.length === 0 && <EmptyState title="Inbox Empty" description="No messages found." icon="inbox" />}
                    {feedback.map(msg => (
                        <div
                            key={msg.id}
                            onClick={() => setSelectedId(msg.id)}
                            className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${selectedId === msg.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-bold text-sm ${msg.status === 'Unread' ? 'text-black dark:text-white' : 'text-gray-500'}`}>{msg.sender}</h4>
                                <span className="text-xs text-text-muted">{msg.date.split(',')[0]}</span>
                            </div>
                            <p className="text-sm font-medium truncate">{msg.subject}</p>
                            <div className="mt-2">
                                <Badge color={msg.status === 'Unread' ? 'blue' : msg.status === 'Replied' ? 'green' : 'gray'}>{msg.status}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col">
                {selectedMessage ? (
                    <>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold">{selectedMessage.subject}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-sm text-text-secondary">From: <span className="font-medium text-primary">{selectedMessage.email}</span></p>
                                    <span className="text-gray-300">•</span>
                                    <p className="text-sm text-text-secondary">{selectedMessage.date}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" icon="archive" onClick={() => onArchive(selectedMessage.id)}>Archive</Button>
                                <Button variant="danger" size="sm" icon="delete" onClick={() => { onDelete(selectedMessage.id); setSelectedId(null); }}>Delete</Button>
                            </div>
                        </div>
                        <div className="flex-1 text-sm leading-relaxed text-text-secondary dark:text-text-muted bg-gray-50 dark:bg-white/5 p-6 rounded-lg overflow-y-auto custom-scrollbar">
                            {selectedMessage.message}
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                            <h4 className="text-sm font-bold mb-2">Reply</h4>
                            <Textarea className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark text-sm mb-3 " rows={3} placeholder="Type your reply..." />
                            <div className="flex justify-end">
                                <Button variant="primary" icon="send" onClick={() => onReply(selectedMessage.id)}>Send Reply</Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <Icon name="email" className="text-6xl mb-4 opacity-20" />
                        <p>Select a message to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Admin Gallery ---
export const AdminGallery = ({ albums, photos, onAddAlbum, onDeleteAlbum, onAddPhoto, onDeletePhoto }: { albums: any[], photos: any[], onAddAlbum: (a: any) => void, onDeleteAlbum: (id: string) => void, onAddPhoto: (p: any) => void, onDeletePhoto: (id: string) => void }) => {
    const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
    const [showAddAlbumForm, setShowAddAlbumForm] = useState(false);
    const [showAddPhotoForm, setShowAddPhotoForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', coverImage: '' });
    const [photoFormData, setPhotoFormData] = useState({ caption: '', url: '', albumId: '' });
    const [imagePreview, setImagePreview] = useState<string>('');
    const [photoPreview, setPhotoPreview] = useState<string>('');

    const albumPhotos = selectedAlbum ? photos.filter(p => p.albumId === selectedAlbum.id) : [];

    const handleAddAlbum = () => {
        if (formData.title && formData.coverImage) {
            onAddAlbum({
                title: formData.title,
                description: formData.description,
                coverImage: formData.coverImage,
                photoCount: 0
            });
            setFormData({ title: '', description: '', coverImage: '' });
            setImagePreview('');
            setShowAddAlbumForm(false);
        }
    };

    const handleAddPhoto = () => {
        if (photoFormData.url && photoFormData.albumId) {
            onAddPhoto({
                url: photoFormData.url,
                caption: photoFormData.caption,
                albumId: photoFormData.albumId
            });
            setPhotoFormData({ caption: '', url: '', albumId: '' });
            setPhotoPreview('');
            setShowAddPhotoForm(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isAlbumCover: boolean) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (isAlbumCover) {
                    setImagePreview(result);
                    setFormData({ ...formData, coverImage: result });
                } else {
                    setPhotoPreview(result);
                    setPhotoFormData({ ...photoFormData, url: result });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (selectedAlbum) {
        return (
            <div className="animate-fade-in">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" icon="arrow_back" onClick={() => setSelectedAlbum(null)}>Back to Albums</Button>
                    <h2 className="text-2xl font-bold">{selectedAlbum.title}</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Album Photos */}
                    <div className="lg:col-span-3">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Photos ({albumPhotos.length})</h3>
                            <Button variant="primary" size="sm" icon="add_photo_alternate" onClick={() => { setPhotoFormData({ ...photoFormData, albumId: selectedAlbum.id }); setShowAddPhotoForm(true); }}>Add Photo</Button>
                        </div>
                        {albumPhotos.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {albumPhotos.map(photo => (
                                    <div key={photo.id} className="relative group rounded-lg overflow-hidden shadow-md h-48">
                                        <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button variant="danger" size="sm" icon="delete" onClick={() => onDeletePhoto(photo.id)}>Delete</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState title="No Photos" description="Add photos to this album." icon="image_not_supported" />
                        )}
                    </div>

                    {/* Album Info */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-6">
                            <img src={selectedAlbum.coverImage} alt={selectedAlbum.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                            <h3 className="text-lg font-bold mb-2">{selectedAlbum.title}</h3>
                            <p className="text-sm text-gray-600 mb-4">{selectedAlbum.description}</p>
                            <div className="space-y-2">
                                <p className="text-sm"><strong>Photos:</strong> {albumPhotos.length}</p>
                                <p className="text-sm"><strong>Created:</strong> {new Date(selectedAlbum.createdAt || Date.now()).toLocaleDateString()}</p>
                            </div>
                            <Button variant="danger" size="sm" className="w-full mt-4" icon="delete" onClick={() => { onDeleteAlbum(selectedAlbum.id); setSelectedAlbum(null); }}>Delete Album</Button>
                        </Card>
                    </div>
                </div>

                {/* Add Photo Form Modal */}
                <AnimatePresence>
                    {showAddPhotoForm && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-card-dark rounded-xl p-6 max-w-md w-full shadow-xl"
                            >
                                <h3 className="text-xl font-bold mb-4">Add Photo to Album</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Photo</label>
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded" />
                                            ) : (
                                                <div>
                                                    <Icon name="cloud_upload" className="text-4xl text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-600">Click to upload photo</p>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, false)} className="hidden" id="photo-upload" />
                                            <label htmlFor="photo-upload" className="block mt-2 cursor-pointer">Upload</label>
                                        </div>
                                    </div>
                                    <Input label="Caption" placeholder="Photo description..." value={photoFormData.caption} onChange={e => setPhotoFormData({ ...photoFormData, caption: e.target.value })} />
                                    <div className="flex gap-2 pt-4">
                                        <Button variant="outline" className="flex-1" onClick={() => { setShowAddPhotoForm(false); setPhotoPreview(''); }}>Cancel</Button>
                                        <Button variant="primary" className="flex-1" onClick={handleAddPhoto}>Add Photo</Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-[#181511] dark:text-white">Gallery Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage event photo albums and member galleries.</p>
                </div>
                <Button variant="primary" size="lg" icon="add_to_photos" onClick={() => setShowAddAlbumForm(true)}>Create Album</Button>
            </div>

            {albums.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {albums.map((album, i) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            key={album.id}
                            className="group"
                        >
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col cursor-pointer" onClick={() => setSelectedAlbum(album)}>
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                    <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="primary" icon="visibility">View Album</Button>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{album.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">{album.description}</p>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{albumPhotos.filter(p => p.albumId === album.id).length} Photos</span>
                                        <Button variant="danger" size="sm" icon="delete" onClick={(e) => { e.stopPropagation(); onDeleteAlbum(album.id); }}>Delete</Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title="No Albums"
                    description="Create your first album to start managing photos."
                    icon="photo_library"
                    action={<Button variant="primary" icon="add_to_photos" className="mt-4" onClick={() => setShowAddAlbumForm(true)}>Create Album</Button>}
                />
            )}

            {/* Add Album Form Modal */}
            <AnimatePresence>
                {showAddAlbumForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-card-dark rounded-xl p-6 max-w-md w-full shadow-xl"
                        >
                            <h3 className="text-xl font-bold mb-4">Create New Album</h3>
                            <div className="space-y-4">
                                <Input label="Album Title" placeholder="e.g. Annual Gala 2023" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                <Textarea label="Description" placeholder="Album description..." rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                <div>
                                    <label className="block text-sm font-medium mb-2">Cover Image</label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded" />
                                        ) : (
                                            <div>
                                                <Icon name="cloud_upload" className="text-4xl text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600">Click to upload cover image</p>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="hidden" id="image-upload" />
                                        <label htmlFor="image-upload" className="block mt-2 cursor-pointer">Upload</label>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button variant="outline" className="flex-1" onClick={() => { setShowAddAlbumForm(false); setFormData({ title: '', description: '', coverImage: '' }); setImagePreview(''); }}>Cancel</Button>
                                    <Button variant="primary" className="flex-1" onClick={handleAddAlbum}>Create Album</Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
