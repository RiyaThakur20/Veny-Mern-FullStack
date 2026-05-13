import { useState, useEffect } from 'react';
import {
    Menu, X, LayoutDashboard, Package, Users,
    Settings, LogOut, Search, PlusCircle,
    Edit3, Trash2, IndianRupee, Sparkles, MapPin,
    CheckCircle, XCircle, Clock, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import serviceService from '../services/serviceService';
import axiosClient from '../api/axiosClient';
import AddServiceForm from '../components/AddServiceForm';
import Map from '../components/Map';
import ProfileSettings from '../components/ProfileSettings';

const STATUS_STYLES = {
    pending:      { color: 'text-yellow-400',   bg: 'bg-yellow-500/10',   border: 'border-yellow-500/30',  icon: <Clock size={14} /> },
    confirmed:    { color: 'text-blue-400',     bg: 'bg-blue-500/10',     border: 'border-blue-500/30',    icon: <CheckCircle size={14} /> },
    'in-progress':{ color: 'text-veny-primary', bg: 'bg-veny-primary/10', border: 'border-veny-primary/30',icon: <Sparkles size={14} /> },
    completed:    { color: 'text-green-400',    bg: 'bg-green-500/10',    border: 'border-green-500/30',   icon: <CheckCircle size={14} /> },
    cancelled:    { color: 'text-red-400',      bg: 'bg-red-500/10',      border: 'border-red-500/30',     icon: <XCircle size={14} /> },
};

const VendorDashboard = ({ user: initialUser }) => {
    const [user, setUser]                         = useState(initialUser);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeMenu, setActiveMenu]             = useState('Overview');
    const [myServices, setMyServices]             = useState([]);
    const [bookings, setBookings]                 = useState([]);
    const [showAddForm, setShowAddForm]           = useState(false);
    const [editingService, setEditingService]     = useState(null);
    const [togglingId, setTogglingId]             = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchServices();
        fetchBookings();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await serviceService.getMyServices();
            setMyServices(res.data || []);
        } catch { toast.error("Could not load services"); }
    };

    const fetchBookings = async () => {
        try {
            const res = await axiosClient.get('/bookings/my-bookings');
            setBookings(res.data?.bookings || []);
        } catch { toast.error("Could not load bookings"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this service?")) return;
        try {
            await serviceService.deleteService(id);
            toast.success("Service removed!");
            fetchServices();
        } catch { toast.error("Could not delete service."); }
    };

    // ✅ Service availability toggle
    const handleToggle = async (service) => {
        setTogglingId(service._id);
        try {
            await serviceService.updateService(service._id, { isActive: !service.isActive });
            toast.success(service.isActive ? "Service paused" : "Service activated!");
            fetchServices();
        } catch { toast.error("Could not update service."); }
        finally { setTogglingId(null); }
    };

    const handleStatusUpdate = async (bookingId, status) => {
        try {
            await axiosClient.patch(`/bookings/update/${bookingId}`, { status });
            toast.success(`Status updated to "${status}"`);
            fetchBookings();
        } catch { toast.error("Could not update status."); }
    };

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
    };

    const userLocation = user?.location?.coordinates?.length === 2
        ? [user.location.coordinates[1], user.location.coordinates[0]]
        : [28.6139, 77.2090];

    const handleLogout = () => {
        localStorage.clear();
        toast.success("Orbit Exited");
        navigate('/login');
    };

    // Earnings chart data — last 6 months
    const earningsData = (() => {
        const months = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleString('default', { month: 'short' });
            months[key] = 0;
        }
        bookings
            .filter(b => b.status === 'completed')
            .forEach(b => {
                const month = new Date(b.createdAt).toLocaleString('default', { month: 'short' });
                if (months[month] !== undefined) months[month] += b.totalPrice || 0;
            });
        return Object.entries(months).map(([month, earnings]) => ({ month, earnings }));
    })();

    const totalRevenue = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview' },
        { icon: <Package size={20} />,          label: 'My Services' },
        { icon: <Users size={20} />,            label: 'Bookings' },
        { icon: <Settings size={20} />,         label: 'Settings' },
    ];

    // Profile avatar
    const avatar = user?.profilePhoto?.url;

    return (
        <div className="min-h-screen bg-[#020617] flex font-sans text-white relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-veny-primary/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[150px] animate-pulse pointer-events-none" />

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
                        <div className="inline-block mt-2 px-3 py-1 rounded-full bg-veny-primary/10 border border-veny-primary/20">
                            <p className="text-[9px] text-veny-primary font-black uppercase tracking-[0.2em]">Vendor Portal</p>
                        </div>
                    </div>
                    <nav className="space-y-3">
                        {menuItems.map((item) => (
                            <button key={item.label}
                                onClick={() => { setActiveMenu(item.label); setIsMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-sm font-bold transition-all duration-300 ${activeMenu === item.label ? 'bg-white text-black shadow-2xl scale-105' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                                {item.icon}<span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-red-400 font-bold transition-all rounded-[1.5rem] hover:bg-red-500/5">
                    <LogOut size={20} /><span>Terminal Exit</span>
                </button>
            </aside>

            {/* CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 z-10 overflow-y-auto">
                {/* Header */}
                <header className="py-6 px-6 md:px-12 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm border-b border-white/5">
                    <button onClick={() => setIsMobileMenuOpen(o => !o)} className="md:hidden p-3 bg-white/5 rounded-2xl border border-white/10">
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <div className="relative w-full max-w-md hidden sm:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input type="search" placeholder="Search orbit..." className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:bg-white/10 transition-all text-sm text-white" />
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 p-2 pr-6 rounded-[1.8rem] border border-white/10 ml-4">
                        <div className="h-10 w-10 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                            {avatar
                                ? <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-white text-black flex items-center justify-center text-xs font-black">{user?.name?.substring(0, 2).toUpperCase()}</div>
                            }
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[11px] font-black text-white leading-none">{user?.name}</p>
                            <p className="text-[8px] text-veny-primary mt-1 font-black uppercase tracking-widest italic">{user?.businessName}</p>
                        </div>
                    </div>
                </header>

                <main className="p-6 md:p-12">
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-2 text-veny-primary">
                            <Sparkles size={16} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Vendor / {activeMenu}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic">
                            Welcome, {user?.name?.split(' ')[0]}.
                        </h1>
                    </div>

                    {/* ── OVERVIEW ── */}
                    {activeMenu === 'Overview' && (
                        <div className="animate-in fade-in duration-700 space-y-10">
                            {/* Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard label="Total Revenue"  value={`₹${totalRevenue}`} icon={<IndianRupee size={22} />} />
                                <StatCard label="Active Services" value={myServices.filter(s => s.isActive).length} icon={<Package size={22} />} />
                                <StatCard label="Total Bookings" value={bookings.length} icon={<Users size={22} />} />
                                <StatCard label="Pending Orders" value={bookings.filter(b => b.status === 'pending').length} icon={<Clock size={22} />} />
                            </div>

                            {/* Earnings Chart */}
                            <div className="bg-white/5 rounded-[3rem] p-8 border border-white/10">
                                <h3 className="text-lg font-black italic mb-6">Earnings — Last 6 Months</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={earningsData} barSize={32}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                                        <Tooltip
                                            contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, fontSize: 12 }}
                                            formatter={v => [`₹${v}`, 'Earnings']}
                                        />
                                        <Bar dataKey="earnings" fill="#6366f1" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Map + Recent bookings */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-8 bg-white/5 rounded-[3rem] p-3 border border-white/10 overflow-hidden h-[380px] relative">
                                    <div className="absolute top-6 left-8 z-[1000] bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-veny-primary rounded-full animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Business Location</span>
                                    </div>
                                    <Map center={userLocation} markers={[{ position: userLocation, title: user?.businessName || "Your Business" }]} />
                                </div>
                                <div className="lg:col-span-4 bg-white/5 rounded-[2rem] p-6 border border-white/10">
                                    <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-gray-400">Recent Orders</h3>
                                    {bookings.slice(0, 4).length === 0
                                        ? <p className="text-gray-600 text-xs text-center py-8">No bookings yet</p>
                                        : bookings.slice(0, 4).map(b => {
                                            const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
                                            return (
                                                <div key={b._id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                                    <div>
                                                        <p className="text-xs font-black">{b.service?.name}</p>
                                                        <p className="text-[10px] text-gray-500">{b.customer?.name}</p>
                                                    </div>
                                                    <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${s.bg} ${s.color} ${s.border}`}>{b.status}</span>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── MY SERVICES ── */}
                    {activeMenu === 'My Services' && (
                        <div className="animate-in slide-in-from-right duration-500">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black italic">Professional Inventory</h3>
                                {!showAddForm && (
                                    <button onClick={() => { setEditingService(null); setShowAddForm(true); }}
                                        className="bg-white text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                                        <PlusCircle size={16} /> New Listing
                                    </button>
                                )}
                            </div>

                            {showAddForm ? (
                                <AddServiceForm
                                    editingService={editingService}
                                    onServiceAdded={() => { fetchServices(); setShowAddForm(false); setEditingService(null); }}
                                    onCancel={() => { setShowAddForm(false); setEditingService(null); }}
                                />
                            ) : myServices.length === 0 ? (
                                <div className="text-center py-32 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
                                    <Package size={40} className="mx-auto text-gray-700 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-400">No services yet</h3>
                                    <p className="text-gray-600 text-sm mt-2">Click "New Listing" to publish your first service.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {myServices.map(service => (
                                        <div key={service._id} className={`bg-white/5 border p-6 rounded-[2rem] flex flex-wrap items-center justify-between gap-4 transition-all ${service.isActive ? 'border-white/10 hover:border-white/20' : 'border-red-500/20 opacity-60'}`}>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-black text-lg text-veny-primary">{service.name}</h4>
                                                    {/* Active/Inactive badge */}
                                                    <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${service.isActive ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                                                        {service.isActive ? 'Active' : 'Paused'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 font-bold italic">{service.category}</p>
                                            </div>
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <p className="text-xl font-black italic">₹{service.price}</p>
                                                {/* ✅ Availability Toggle */}
                                                <button
                                                    onClick={() => handleToggle(service)}
                                                    disabled={togglingId === service._id}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${service.isActive ? 'bg-green-500/10 text-green-400 hover:bg-red-500/10 hover:text-red-400' : 'bg-red-500/10 text-red-400 hover:bg-green-500/10 hover:text-green-400'}`}
                                                    title={service.isActive ? 'Pause service' : 'Activate service'}
                                                >
                                                    {service.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                    {togglingId === service._id ? '...' : service.isActive ? 'Pause' : 'Activate'}
                                                </button>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setEditingService(service); setShowAddForm(true); }}
                                                        className="p-3 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all">
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(service._id)}
                                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── BOOKINGS ── */}
                    {activeMenu === 'Bookings' && (
                        <div className="animate-in fade-in duration-500 space-y-4">
                            <h3 className="text-2xl font-black italic mb-8">Incoming Orders</h3>
                            {bookings.length === 0 ? (
                                <div className="text-center py-32 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
                                    <Users size={40} className="mx-auto text-gray-700 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-400">No bookings yet</h3>
                                </div>
                            ) : bookings.map(booking => {
                                const s = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
                                return (
                                    <div key={booking._id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:border-white/20 transition-all">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <h4 className="font-black text-lg mb-2">{booking.service?.name}</h4>
                                                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-500">
                                                    <p>Customer: <span className="text-white font-bold">{booking.customer?.name}</span></p>
                                                    <p>Date: <span className="text-white font-bold">{new Date(booking.scheduledDate).toLocaleDateString()}</span></p>
                                                    <p>Phone: <span className="text-white font-bold">{booking.customer?.phoneNumber || 'N/A'}</span></p>
                                                    <p>Amount: <span className="text-veny-primary font-black">₹{booking.totalPrice}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3 items-end">
                                                <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${s.bg} ${s.color} ${s.border}`}>
                                                    {s.icon} {booking.status.toUpperCase()}
                                                </span>
                                                {booking.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                                            className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-blue-500 hover:text-white transition-all">
                                                            Confirm
                                                        </button>
                                                        <button onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                                            className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}
                                                {booking.status === 'confirmed' && (
                                                    <button onClick={() => handleStatusUpdate(booking._id, 'in-progress')}
                                                        className="px-4 py-2 bg-veny-primary/20 text-veny-primary border border-veny-primary/30 rounded-xl text-[10px] font-black uppercase hover:bg-veny-primary hover:text-black transition-all">
                                                        Start Work
                                                    </button>
                                                )}
                                                {booking.status === 'in-progress' && (
                                                    <button onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                                        className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-green-500 hover:text-white transition-all">
                                                        Mark Complete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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

const StatCard = ({ label, value, icon }) => (
    <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all group">
        <div className="w-12 h-12 bg-veny-primary/10 text-veny-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
        <h2 className="text-3xl font-black italic">{value}</h2>
    </div>
);

export default VendorDashboard;