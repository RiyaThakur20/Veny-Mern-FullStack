import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, ShieldCheck, ArrowLeft, Zap, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import serviceService from '../services/serviceService';
import Button from '../components/Button';
import ReviewSection from '../components/ReviewSection';
import BookingModal from '../components/BookingModal';

// ─────────────────────────────────────────────
// Image Gallery Component
// ─────────────────────────────────────────────
const ImageGallery = ({ images }) => {
    const [current, setCurrent] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-64 bg-gradient-to-br from-veny-primary/10 to-indigo-600/10 rounded-[2rem] flex items-center justify-center border border-white/10 mb-8">
                <Zap size={40} className="text-veny-primary/30" />
            </div>
        );
    }

    return (
        <div className="mb-10">
            {/* Main Image */}
            <div className="relative w-full h-72 md:h-96 rounded-[2rem] overflow-hidden border border-white/10 mb-3">
                <img
                    src={images[current].url}
                    alt={`service-${current}`}
                    className="w-full h-full object-cover transition-all duration-500"
                />
                {/* Nav arrows — only if multiple images */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setCurrent(p => (p - 1 + images.length) % images.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-black/80 transition-all"
                        >
                            <ChevronLeft size={20} className="text-white" />
                        </button>
                        <button
                            onClick={() => setCurrent(p => (p + 1) % images.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-black/80 transition-all"
                        >
                            <ChevronRight size={20} className="text-white" />
                        </button>
                        {/* Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-3 flex-wrap">
                    {images.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${i === current ? 'border-veny-primary scale-105' : 'border-white/10 hover:border-white/30'}`}
                        >
                            <img src={img.url} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const ServiceDetail = () => {
    const { id }      = useParams();
    const navigate    = useNavigate();
    const [service, setService]     = useState(null);
    const [loading, setLoading]     = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await serviceService.getServiceById(id);
                setService(data);
            } catch {
                console.error("Error fetching service");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-veny-primary/20 border-t-veny-primary rounded-full animate-spin" />
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Syncing...</p>
            </div>
        </div>
    );

    if (!service) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
            <div className="text-center">
                <Zap size={40} className="mx-auto text-gray-700 mb-4" />
                <p className="text-gray-400 font-bold">Service not found in this orbit.</p>
                <button onClick={() => navigate('/explore')} className="mt-4 text-veny-primary text-sm hover:underline">
                    Back to Explore
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white pt-10 pb-20 px-6">
            <div className="max-w-6xl mx-auto">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-10 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <ArrowLeft size={16} /> Back to Galaxy
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* LEFT: Content */}
                    <div>
                        <span className="bg-veny-primary/10 text-veny-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-veny-primary/20">
                            {service.category}
                        </span>

                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mt-6 mb-6 leading-[0.9]">
                            {service.name}
                        </h1>

                        {/* ✅ Image Gallery */}
                        <ImageGallery images={service.images} />

                        <div className="flex gap-6 mb-10 border-y border-white/5 py-6 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Star size={18} className="text-veny-primary" fill="currentColor" />
                                <span className="font-bold text-sm">
                                    {service.averageRating > 0
                                        ? `${service.averageRating} (${service.numOfReviews} reviews)`
                                        : 'No reviews yet'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Clock size={18} />
                                <span className="font-bold italic text-sm">Avg. 2 Hours</span>
                            </div>
                            {service.vendor?.businessName && (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <MessageSquare size={18} />
                                    <span className="font-bold italic text-sm">{service.vendor.businessName}</span>
                                </div>
                            )}
                        </div>

                        <p className="text-gray-400 text-lg leading-relaxed font-medium mb-10">
                            {service.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                                <ShieldCheck className="text-veny-primary mb-3" />
                                <h4 className="font-bold text-sm mb-1">Verified Provider</h4>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Trusted by Veny Network</p>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
                                <Zap className="text-veny-primary mb-3" />
                                <h4 className="font-bold text-sm mb-1">Instant Booking</h4>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Zero Wait Time Protocol</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Booking Card */}
                    <div className="relative">
                        <div className="sticky top-32 bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-2">
                                Total Service Fee
                            </p>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-6xl font-black italic tracking-tighter">₹{service.price}</span>
                                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">/ Per Mission</span>
                            </div>

                            {/* Rating summary */}
                            {service.averageRating > 0 && (
                                <div className="flex items-center gap-2 mb-4 bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <Star size={16} className="text-veny-primary" fill="currentColor" />
                                    <span className="font-black text-sm">{service.averageRating}</span>
                                    <span className="text-gray-500 text-xs">({service.numOfReviews} reviews)</span>
                                </div>
                            )}

                            {/* Vendor info */}
                            {service.vendor?.businessName && (
                                <div className="flex items-center gap-3 mb-6 bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <div className="w-9 h-9 bg-veny-primary/20 rounded-xl flex items-center justify-center text-xs font-black text-veny-primary flex-shrink-0">
                                        {service.vendor.businessName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">By</p>
                                        <p className="text-sm font-black">{service.vendor.businessName}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <Button
                                    text="Initiate Mission"
                                    onClick={() => setShowModal(true)}
                                />
                                <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                    Secure Transaction via Veny Signal
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review Section */}
                <ReviewSection serviceId={id} />
            </div>

            {/* Booking Modal */}
            {showModal && (
                <BookingModal
                    service={service}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default ServiceDetail;