import { useState, useEffect } from 'react';
import { Search, Sparkles, Star, ArrowRight, Zap, MapPin } from 'lucide-react';
import serviceService from '../services/serviceService';
import { Link } from 'react-router-dom';

// ─────────────────────────────────────────────
// Hero Section
// ─────────────────────────────────────────────
const HeroSection = ({ searchQuery, setSearchQuery }) => (
    <div className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-[#020617] pt-20">
        {/* Nebula Background */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[140px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[140px] rounded-full opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[size:70px_70px] opacity-[0.05]" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 mb-8 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-veny-primary animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300/80">
                    Galactic Network Online
                </span>
            </div>

            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-10 italic">
                VENY<span className="text-veny-primary">.</span> <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-t from-white/20 to-white">
                    EXPLORE.
                </span>
            </h1>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group mt-4">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000" />
                <div className="relative flex items-center bg-black/40 border border-white/10 rounded-[2rem] p-2 backdrop-blur-2xl">
                    <Search className="ml-5 text-gray-500 group-focus-within:text-veny-primary transition-colors flex-shrink-0" size={20} />
                    <input
                        type="text"
                        placeholder="Find a service in the universe..."
                        className="w-full bg-transparent py-4 px-4 outline-none text-white font-medium placeholder:text-gray-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="hidden md:flex bg-white text-black px-8 py-3.5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex-shrink-0">
                        Scan Galaxy
                    </button>
                </div>
            </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
            <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
        </div>
    </div>
);

// ─────────────────────────────────────────────
// Service Card — with image
// ─────────────────────────────────────────────
const ServiceCard = ({ service }) => {
    const hasImage = service.images && service.images.length > 0;

    return (
        <div className="group relative bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)] flex flex-col">

            {/* ✅ Service Image */}
            <div className="relative w-full h-48 overflow-hidden flex-shrink-0">
                {hasImage ? (
                    <img
                        src={service.images[0].url}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    // Placeholder when no image
                    <div className="w-full h-full bg-gradient-to-br from-veny-primary/10 to-indigo-600/10 flex items-center justify-center">
                        <Sparkles size={40} className="text-veny-primary/30" />
                    </div>
                )}
                {/* Category badge over image */}
                <div className="absolute top-4 left-4">
                    <span className="bg-black/60 backdrop-blur-md text-white/80 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 group-hover:bg-veny-primary group-hover:text-black group-hover:border-veny-primary transition-all duration-500">
                        {service.category}
                    </span>
                </div>
                {/* Rating badge over image */}
                <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <Star size={12} className="text-veny-primary" fill="currentColor" />
                        <span className="text-[11px] font-black text-white">
                            {service.averageRating > 0 ? service.averageRating.toFixed(1) : 'New'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-black italic tracking-tighter text-white mb-2 group-hover:translate-x-1 transition-transform">
                    {service.name}
                </h3>
                <p className="text-gray-500 text-[13px] line-clamp-2 mb-4 font-medium leading-relaxed flex-1">
                    {service.description}
                </p>

                {/* Vendor name */}
                {service.vendor?.businessName && (
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4 flex items-center gap-1">
                        <MapPin size={10} className="text-veny-primary" />
                        {service.vendor.businessName}
                    </p>
                )}

                {/* Price + CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] mb-1">Launch Price</p>
                        <p className="text-2xl font-black italic tracking-tighter">₹{service.price}</p>
                    </div>
                    <Link to={`/service/${service._id}`}>
                        <button className="p-4 bg-white text-black rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl group-hover:shadow-white/10">
                            <ArrowRight size={18} />
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const AllServices = () => {
    const [services, setServices]                 = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [loading, setLoading]                   = useState(true);
    const [searchQuery, setSearchQuery]           = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Cleaning', 'Repair', 'Salon', 'Electrician', 'Plumber', 'Cooking'];

    useEffect(() => {
        const loadServices = async () => {
            try {
                const response = await serviceService.getAllServices();
                const cleanData = response?.data || [];
                setServices(cleanData);
                setFilteredServices(cleanData);
            } catch {
                setServices([]);
                setFilteredServices([]);
            } finally {
                setLoading(false);
            }
        };
        loadServices();
    }, []);

    useEffect(() => {
        let result = [...services];
        if (selectedCategory !== 'All') {
            result = result.filter(s => s.category === selectedCategory);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q)
            );
        }
        setFilteredServices(result);
    }, [searchQuery, selectedCategory, services]);

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-veny-primary/30">
            <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            {/* Category Filter */}
            <div className="sticky top-[80px] z-40 bg-[#020617]/80 backdrop-blur-xl border-y border-white/5 py-6 mb-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-3">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                                selectedCategory === cat
                                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                    : 'bg-white/[0.03] border-white/5 text-gray-500 hover:text-white hover:border-white/20'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Services Grid */}
            <main className="max-w-7xl mx-auto px-6 pb-32">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <div className="w-12 h-12 border-2 border-veny-primary/20 border-t-veny-primary rounded-full animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Syncing with Stars...</p>
                    </div>
                ) : filteredServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredServices.map(service => (
                            <ServiceCard key={service._id} service={service} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
                        <Zap size={40} className="mx-auto text-gray-700 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">No Services Found in this Orbit</h3>
                        <p className="text-gray-600 text-sm mt-2">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AllServices;