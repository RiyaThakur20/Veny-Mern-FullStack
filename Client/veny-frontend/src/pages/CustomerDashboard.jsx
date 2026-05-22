import { useState, useEffect } from 'react';
import {
    Menu, X, LayoutDashboard, ShoppingBag,
    Settings, LogOut, Search, Sparkles,
    ArrowRight, CheckCircle, XCircle,
    Clock, Star, Compass, Download
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Map from '../components/Map';
import bookingService from '../services/bookingService';
import ProfileSettings from '../components/ProfileSettings';
import NotificationBell from '../components/NotificationBell';


const STATUS_STYLES = {
    pending:       { color: 'text-yellow-400',   bg: 'bg-yellow-500/10',   border: 'border-yellow-500/30',  label: 'Pending',     icon: <Clock size={13} /> },
    confirmed:     { color: 'text-blue-400',     bg: 'bg-blue-500/10',     border: 'border-blue-500/30',    label: 'Confirmed',   icon: <CheckCircle size={13} /> },
    'in-progress': { color: 'text-veny-primary', bg: 'bg-veny-primary/10', border: 'border-veny-primary/30',label: 'In Progress', icon: <Sparkles size={13} /> },
    completed:     { color: 'text-green-400',    bg: 'bg-green-500/10',    border: 'border-green-500/30',   label: 'Completed',   icon: <CheckCircle size={13} /> },
    cancelled:     { color: 'text-red-400',      bg: 'bg-red-500/10',      border: 'border-red-500/30',     label: 'Cancelled',   icon: <XCircle size={13} /> },
};

const FILTERS = ['All', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

const CustomerDashboard = ({ user: initialUser }) => {
    const [user, setUser]                         = useState(initialUser);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMenu, setActiveMenu]             = useState('Overview');
    const [bookings, setBookings]                 = useState([]);
    const [filter, setFilter]                     = useState('All');
    const [loading, setLoading]                   = useState(true);
    const navigate = useNavigate();

    useEffect(() => { fetchBookings(); }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await bookingService.getMyBookings();
            setBookings(res.data?.bookings || []);
        } catch {
            toast.error("Could not load bookings");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm("Cancel this booking?")) return;
        try {
            await bookingService.cancelBooking(bookingId);
            toast.success("Booking cancelled");
            setFilter('All'); // ✅ filter reset after cancel
            fetchBookings();
        } catch {
            toast.error("Could not cancel booking.");
        }
    };

    // ✅ Download booking history as CSV
    const handleDownload = () => {
        if (bookings.length === 0) { toast.error("No bookings to download"); return; }
        const headers = ['Service', 'Vendor', 'Date', 'Amount', 'Status'];
        const rows = bookings.map(b => [
            b.service?.name || 'N/A',
            b.vendor?.businessName || b.vendor?.name || 'N/A',
            new Date(b.scheduledDate).toLocaleDateString(),
            `₹${b.totalPrice}`,
            b.status
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `veny-bookings-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Booking history downloaded!");
    };

    const handleUserUpdate = (updatedUser) => setUser(updatedUser);

    const userLocation = user?.location?.coordinates?.length === 2
        ? [user.location.coordinates[1], user.location.coordinates[0]]
        : [28.6139, 77.2090];

    const handleLogout = () => {
        localStorage.clear();
        toast.success("See you in the orbit!");
        navigate('/login');
    };

    const filteredBookings = filter === 'All'
        ? bookings
        : bookings.filter(b => b.status === filter);

    const avatar = user?.profilePhoto?.url;

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview' },
        { icon: <ShoppingBag size={20} />,     label: 'My Bookings' },
        { icon: <Compass size={20} />,         label: 'Explore' },
        { icon: <Settings size={20} />,        label: 'Settings' },
    ];

    return (
        <div className="min-h-screen bg-[#020617] flex font-sans text-white relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px] animate-pulse pointer-events-none" />

            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* SIDEBAR */}
            <aside className={`fixed md:sticky top-0 z-50 h-screen w-72 bg-white/5 backdrop-blur-3xl border-r border-white/10 p-8 flex flex-col justify-between transition-all duration-500 ${isMobileMenuOpen ? 'left-0 shadow-2xl' : '-left-72'} md:left-0`}>
                <div>
                    <div className="mb-14 cursor-pointer group" onClick={() => navigate('/explore')}>
                        <h2 className="text-4xl font-black text-white tracking-tighter italic group-hover:scale-105 transition-transform">
                            Veny<span className="text-veny-primary">.</span>
                        </h2>
                        <div className="inline-block mt-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.2em]">Customer Portal</p>
                        </div>
                    </div>

                    <nav className="space-y-3">
                        {menuItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => {
                                    if (item.label === 'Explore') { navigate('/explore'); return; }
                                    setActiveMenu(item.label);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-bold transition-all duration-300 ${
                                    activeMenu === item.label
                                        ? 'bg-white text-black shadow-2xl scale-105'
                                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {item.icon}<span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-red-400 font-bold transition-all rounded-[1.5rem] hover:bg-red-500/5"
                >
                    <LogOut size={20} /><span>Exit Orbit</span>
                </button>
            </aside>

            {/* CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 z-10 overflow-y-auto">

                {/* Header */}
                <header className="py-6 px-6 md:px-12 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm border-b border-white/5">
                    <button
                        onClick={() => setIsMobileMenuOpen(o => !o)}
                        className="md:hidden p-3 bg-white/5 rounded-2xl border border-white/10"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="relative w-full max-w-md hidden sm:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="search"
                            placeholder="Search services..."
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:bg-white/10 transition-all text-sm text-white"
                        />
                    </div>

                    <NotificationBell />

                    <div className="flex items-center gap-4 bg-white/5 p-2 pr-6 rounded-[1.8rem] border border-white/10 ml-4">
                        <div className="h-10 w-10 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                            {avatar
                                ? <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-white text-black flex items-center justify-center text-xs font-black">
                                    {user?.name?.substring(0, 2).toUpperCase()}
                                  </div>
                            }
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[11px] font-black text-white leading-none">{user?.name}</p>
                            <p className="text-[8px] text-indigo-400 mt-1 font-black uppercase tracking-widest italic">Explorer</p>
                        </div>
                    </div>
                </header>

                <main className="p-6 md:p-12">
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-2 text-indigo-400">
                            <Sparkles size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Customer / {activeMenu}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic">
                            Hey, {user?.name?.split(' ')[0]}! 👋
                        </h1>
                    </div>

                    {/* ── OVERVIEW ── */}
                    {activeMenu === 'Overview' && (
                        <div className="animate-in fade-in duration-700 space-y-10">
                            {/* Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard label="Total Bookings" value={bookings.length}                                                                             icon={<ShoppingBag size={22} />} color="indigo" />
                                <StatCard label="Active Orders"  value={bookings.filter(b => ['pending','confirmed','in-progress'].includes(b.status)).length}       icon={<Clock size={22} />}       color="yellow" />
                                <StatCard label="Completed"      value={bookings.filter(b => b.status === 'completed').length}                                       icon={<CheckCircle size={22} />} color="green" />
                                <StatCard label="Total Spent"    value={`₹${bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.totalPrice, 0)}`}  icon={<Star size={22} />}        color="veny" />
                            </div>

                            {/* Map + CTA */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-7 bg-white/5 rounded-[3rem] p-3 border border-white/10 overflow-hidden h-[360px] relative">
                                    <div className="absolute top-6 left-8 z-[1000] bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Your Location</span>
                                    </div>
                                    <Map center={userLocation} markers={[{ position: userLocation, title: "Your Station" }]} />
                                </div>

                                <div className="lg:col-span-5 flex flex-col gap-4">
                                    {/* Explore CTA */}
                                    <div className="bg-gradient-to-br from-veny-primary/20 to-indigo-600/10 rounded-[2rem] p-8 border border-veny-primary/20 flex-1">
                                        <Sparkles size={32} className="text-veny-primary mb-4" />
                                        <h3 className="text-xl font-black italic mb-2">Explore Services</h3>
                                        <p className="text-gray-500 text-xs leading-relaxed mb-6">
                                            Discover top-rated services near your location.
                                        </p>
                                        <Link to="/explore">
                                            <button className="w-full py-3.5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all">
                                                Launch Explorer <ArrowRight size={14} />
                                            </button>
                                        </Link>
                                    </div>

                                    {/* Latest booking */}
                                    {bookings[0] && (() => {
                                        const s = STATUS_STYLES[bookings[0].status] || STATUS_STYLES.pending;
                                        return (
                                            <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10">
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-3">Latest Booking</p>
                                                <h4 className="font-black">{bookings[0].service?.name}</h4>
                                                <p className="text-xs text-gray-500 mt-1">{bookings[0].vendor?.businessName}</p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-veny-primary font-black">₹{bookings[0].totalPrice}</span>
                                                    <span className={`text-[9px] font-black px-2 py-1 rounded-full border flex items-center gap-1 ${s.bg} ${s.color} ${s.border}`}>
                                                        {s.icon} {s.label}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── MY BOOKINGS ── */}
                    {activeMenu === 'My Bookings' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                <h3 className="text-2xl font-black italic">Your Missions</h3>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:border-white/30 transition-all"
                                >
                                    <Download size={14} /> Export CSV
                                </button>
                            </div>

                            {/* Filter tabs */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                {FILTERS.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                                            filter === f
                                                ? 'bg-white text-black border-white'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                                        }`}
                                    >
                                        {f === 'All' ? 'All' : STATUS_STYLES[f]?.label || f}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <div className="w-10 h-10 border-2 border-veny-primary/20 border-t-veny-primary rounded-full animate-spin" />
                                </div>
                            ) : filteredBookings.length === 0 ? (
                                <div className="text-center py-32 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
                                    <ShoppingBag size={40} className="mx-auto text-gray-700 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-400">No bookings found</h3>
                                    <p className="text-gray-600 text-sm mt-2">
                                        <Link to="/explore" className="text-veny-primary hover:underline">
                                            Explore services
                                        </Link> to make your first booking!
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {filteredBookings.map(booking => {
                                        const s         = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
                                        const canCancel = ['pending', 'confirmed'].includes(booking.status);
                                        const canWhatsApp = ['confirmed', 'in-progress'].includes(booking.status) && booking.vendor?.whatsappNumber;

                                        return (
                                            <div
                                                key={booking._id}
                                                className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:border-white/20 transition-all"
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        {/* Title + Status */}
                                                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                                                            <h4 className="font-black text-lg">{booking.service?.name}</h4>
                                                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border flex items-center gap-1 ${s.bg} ${s.color} ${s.border}`}>
                                                                {s.icon} {s.label}
                                                            </span>
                                                        </div>

                                                        {/* Details grid */}
                                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                                            <p>Vendor: <span className="text-white font-bold">{booking.vendor?.businessName || booking.vendor?.name}</span></p>
                                                            <p>Date: <span className="text-white font-bold">{new Date(booking.scheduledDate).toLocaleDateString('en-IN')}</span></p>
                                                            <p>Amount: <span className="text-veny-primary font-black">₹{booking.totalPrice}</span></p>
                                                            <p>Category: <span className="text-white font-bold">{booking.service?.category}</span></p>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-col gap-2">
                                                        {/* Cancel */}
                                                        {canCancel && (
                                                            <button
                                                                onClick={() => handleCancel(booking._id)}
                                                                className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}

                                                        {/* ✅ WhatsApp — confirmed/in-progress pe */}
                                                        {canWhatsApp && (
                                                            <a
                                                                href={`https://wa.me/91${booking.vendor.whatsappNumber}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-1.5"
                                                            >
                                                                📱 WhatsApp
                                                            </a>
                                                        )}

                                                        {/* View Service */}
                                                        <Link to={`/service/${booking.service?._id}`}>
                                                            <button className="px-4 py-2 bg-white/5 text-gray-400 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all w-full">
                                                                View
                                                            </button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── SETTINGS ── */}
                    {activeMenu === 'Settings' && (
                        <div className="animate-in fade-in duration-500">
                            <h3 className="text-2xl font-black italic mb-8">Account Settings</h3>
                            <ProfileSettings user={user} onUpdate={handleUserUpdate} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon, color = 'veny' }) => {
    const colors = {
        veny:   'bg-veny-primary/10 text-veny-primary',
        indigo: 'bg-indigo-500/10 text-indigo-400',
        yellow: 'bg-yellow-500/10 text-yellow-400',
        green:  'bg-green-500/10 text-green-400',
    };
    return (
        <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all group">
            <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
            <h2 className="text-3xl font-black italic">{value}</h2>
        </div>
    );
};

export default CustomerDashboard;