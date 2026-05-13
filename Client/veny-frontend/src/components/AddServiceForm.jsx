import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Sparkles, IndianRupee, Tag, AlignLeft, Send, Phone, X, ImagePlus, Loader } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const CATEGORIES = ['Cleaning', 'Repair', 'Salon', 'Electrician', 'Plumber', 'Cooking'];

const AddServiceForm = ({ onServiceAdded, editingService, onCancel }) => {
    const [formData, setFormData] = useState({
        name:           '',
        description:    '',
        price:          '',
        category:       'Cleaning',
        whatsappNumber: '',
    });
    const [images, setImages]           = useState([]);      // File objects
    const [previews, setPreviews]       = useState([]);      // Preview URLs
    const [existingImages, setExistingImages] = useState([]); // Already uploaded images
    const [loading, setLoading]         = useState(false);
    const fileInputRef                  = useRef(null);

    useEffect(() => {
        if (editingService) {
            setFormData({
                name:           editingService.name,
                description:    editingService.description,
                price:          editingService.price,
                category:       editingService.category || 'Cleaning',
                whatsappNumber: editingService.whatsappNumber || '',
            });
            // Show existing images
            setExistingImages(editingService.images || []);
        } else {
            setFormData({ name: '', description: '', price: '', category: 'Cleaning', whatsappNumber: '' });
            setImages([]);
            setPreviews([]);
            setExistingImages([]);
        }
    }, [editingService]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const totalAllowed = 4 - existingImages.length;

        if (files.length > totalAllowed) {
            toast.error(`Max ${totalAllowed} more image(s) allowed`);
            return;
        }

        // Size check — 5MB each
        const oversized = files.filter(f => f.size > 5 * 1024 * 1024);
        if (oversized.length > 0) {
            toast.error("Each image must be under 5MB");
            return;
        }

        setImages(files);
        setPreviews(files.map(f => URL.createObjectURL(f)));
    };

    const removeNewImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (parseFloat(formData.price) <= 0) {
            toast.error("Price must be greater than ₹0");
            return;
        }
        if (!formData.whatsappNumber.trim()) {
            toast.error("WhatsApp number is required");
            return;
        }

        setLoading(true);
        try {
            // ✅ FormData use karo — multipart/form-data for images
            const data = new FormData();
            data.append('name',           formData.name);
            data.append('description',    formData.description);
            data.append('price',          formData.price);
            data.append('category',       formData.category);
            data.append('whatsappNumber', formData.whatsappNumber);

            // New images append karo
            images.forEach(img => data.append('images', img));

            if (editingService) {
                await axiosClient.put(`/services/${editingService._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Service orbit updated! ✨");
            } else {
                await axiosClient.post('/services/add', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Service launched to Veny! 🚀");
            }

            // Reset
            setFormData({ name: '', description: '', price: '', category: 'Cleaning', whatsappNumber: '' });
            setImages([]);
            setPreviews([]);
            setExistingImages([]);
            if (onServiceAdded) onServiceAdded();

        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.response?.data?.msg ||
                "Transmission failed. Try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const totalImages = existingImages.length + images.length;

    return (
        <div className="w-full bg-white/[0.03] backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-veny-primary/20 rounded-xl flex items-center justify-center border border-veny-primary/30">
                        <Sparkles className="text-veny-primary" size={20} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white italic tracking-tight">
                            {editingService ? "Modify Listing" : "Initialize Service"}
                        </h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                            Terminal Entry ID: {editingService ? editingService._id.substring(0, 8) : 'NEW_ENTRY'}
                        </p>
                    </div>
                </div>
                {onCancel && (
                    <button type="button" onClick={onCancel}
                        className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Service Name */}
                <div className="relative group">
                    <label className="flex items-center gap-2 text-gray-400 mb-2 text-[10px] font-black uppercase tracking-widest ml-1 group-focus-within:text-veny-primary transition-colors">
                        <Tag size={12} /> Service Name
                    </label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-700 focus:outline-none focus:border-veny-primary/50 focus:bg-white/5 transition-all font-bold"
                        placeholder="e.g. Professional House Cleaning" required />
                </div>

                {/* Description */}
                <div className="relative group">
                    <label className="flex items-center gap-2 text-gray-400 mb-2 text-[10px] font-black uppercase tracking-widest ml-1 group-focus-within:text-veny-primary transition-colors">
                        <AlignLeft size={12} /> Description
                    </label>
                    <textarea name="description" value={formData.description} onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-700 h-32 focus:outline-none focus:border-veny-primary/50 focus:bg-white/5 transition-all font-medium resize-none"
                        placeholder="Briefly describe what you offer..." required />
                </div>

                {/* Price + Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group">
                        <label className="flex items-center gap-2 text-gray-400 mb-2 text-[10px] font-black uppercase tracking-widest ml-1 group-focus-within:text-veny-primary transition-colors">
                            <IndianRupee size={12} /> Price (INR)
                        </label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} min="1"
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-700 focus:outline-none focus:border-veny-primary/50 focus:bg-white/5 transition-all font-black italic text-xl"
                            placeholder="500" required />
                    </div>

                    <div className="relative group">
                        <label className="flex items-center gap-2 text-gray-400 mb-2 text-[10px] font-black uppercase tracking-widest ml-1 group-focus-within:text-veny-primary transition-colors">
                            <Tag size={12} /> Category
                        </label>
                        <select name="category" value={formData.category} onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-veny-primary/50 focus:bg-white/5 transition-all appearance-none font-bold cursor-pointer">
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat} className="bg-gray-900 text-white">{cat}</option>
                            ))}
                        </select>
                        <div className="absolute right-5 bottom-4 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* WhatsApp */}
                <div className="relative group">
                    <label className="flex items-center gap-2 text-gray-400 mb-2 text-[10px] font-black uppercase tracking-widest ml-1 group-focus-within:text-veny-primary transition-colors">
                        <Phone size={12} /> WhatsApp Number
                    </label>
                    <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-700 focus:outline-none focus:border-veny-primary/50 focus:bg-white/5 transition-all font-bold"
                        placeholder="+91 98765 43210" required />
                    <p className="text-[10px] text-gray-600 mt-1.5 ml-1 font-bold">
                        Customers will contact you via this number for bookings.
                    </p>
                </div>

                {/* ✅ Image Upload */}
                <div>
                    <label className="flex items-center gap-2 text-gray-400 mb-3 text-[10px] font-black uppercase tracking-widest ml-1">
                        <ImagePlus size={12} /> Service Images (max 4)
                    </label>

                    {/* Existing images */}
                    {existingImages.length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-3">
                            {existingImages.map((img, i) => (
                                <div key={i} className="relative group/img">
                                    <img src={img.url} alt={`service-${i}`}
                                        className="w-24 h-24 object-cover rounded-2xl border border-white/10" />
                                    <button type="button" onClick={() => removeExistingImage(i)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New image previews */}
                    {previews.length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-3">
                            {previews.map((src, i) => (
                                <div key={i} className="relative group/img">
                                    <img src={src} alt={`preview-${i}`}
                                        className="w-24 h-24 object-cover rounded-2xl border border-veny-primary/30" />
                                    <button type="button" onClick={() => removeNewImage(i)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload button */}
                    {totalImages < 4 && (
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                            className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-gray-500 hover:text-white hover:border-veny-primary/50 hover:bg-veny-primary/5 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <ImagePlus size={16} />
                            {totalImages === 0 ? 'Add Images' : `Add More (${4 - totalImages} left)`}
                        </button>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageSelect}
                    />
                    <p className="text-[10px] text-gray-600 mt-2 ml-1 font-bold">
                        JPG, PNG or WebP — max 5MB each
                    </p>
                </div>

                {/* Buttons */}
                <div className="pt-4 space-y-3">
                    <button type="submit" disabled={loading}
                        className="w-full group bg-white text-black font-black py-5 rounded-[1.8rem] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-[0_0_40px_rgba(255,255,255,0.1)] uppercase tracking-[0.2em] text-[11px]">
                        {loading
                            ? <><Loader size={16} className="animate-spin" /> Transmitting...</>
                            : <>{editingService ? "Update Listing" : "Deploy Service"} <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                        }
                    </button>

                    {onCancel && (
                        <button type="button" onClick={onCancel}
                            className="w-full py-4 rounded-[1.8rem] border border-white/10 text-gray-400 hover:text-white hover:border-white/30 font-black text-[11px] uppercase tracking-[0.2em] transition-all">
                            Cancel Mission
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddServiceForm;