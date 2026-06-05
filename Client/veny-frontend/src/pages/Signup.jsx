import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Mail, Lock, Store, Eye, EyeOff,
    ShieldCheck, MapPin, Compass, Edit3, Check, X
} from 'lucide-react';
import Button from '../components/Button';
import { authService } from '../services/authService';
import { toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';

// ─────────────────────────────────────────────
// Address Edit Modal
// ─────────────────────────────────────────────
const AddressModal = ({ addressData, onSave, onClose }) => {
    const [fields, setFields] = useState({
        flatNo:  addressData.flatNo  || '',
        street:  addressData.street  || '',
        area:    addressData.area    || '',
        city:    addressData.city    || '',
        state:   addressData.state   || '',
        pincode: addressData.pincode || '',
    });

    const handleChange = (e) => {
        setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = () => {
        if (!fields.area.trim() || !fields.city.trim() || !fields.state.trim()) {
            toast.error("Area, City and State are required");
            return;
        }
        const parts = [fields.flatNo, fields.street, fields.area, fields.city, fields.state, fields.pincode].filter(Boolean);
        onSave(fields, parts.join(', '));
    };

    const inputClass = "w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-5 text-white placeholder:text-gray-700 focus:outline-none focus:border-veny-primary/50 focus:bg-white/5 transition-all font-medium text-sm";
    const labelClass = "text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block";

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#0a0f1e] border border-white/10 rounded-[2.5rem] p-8 relative animate-in zoom-in-95 duration-300 shadow-[0_0_50px_rgba(99,102,241,0.15)]">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-white italic tracking-tight">Edit Address</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Fill your location details</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Flat / House No.</label>
                            <input type="text" name="flatNo" value={fields.flatNo} onChange={handleChange} placeholder="A-101" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Street / Lane</label>
                            <input type="text" name="street" value={fields.street} onChange={handleChange} placeholder="MG Road" className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Area / Colony <span className="text-red-400">*</span></label>
                        <input type="text" name="area" value={fields.area} onChange={handleChange} placeholder="Sector 18, Noida" className={inputClass} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>City <span className="text-red-400">*</span></label>
                            <input type="text" name="city" value={fields.city} onChange={handleChange} placeholder="Noida" className={inputClass} required />
                        </div>
                        <div>
                            <label className={labelClass}>State <span className="text-red-400">*</span></label>
                            <input type="text" name="state" value={fields.state} onChange={handleChange} placeholder="Uttar Pradesh" className={inputClass} required />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Pincode</label>
                        <input type="text" name="pincode" value={fields.pincode} onChange={handleChange} placeholder="201301" maxLength={6} className={inputClass} />
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 py-3.5 border border-white/10 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white hover:border-white/30 transition-all">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="flex-1 py-3.5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                        <Check size={14} /> Save Address
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// Main Signup Page
// ─────────────────────────────────────────────
const Signup = () => {
    const navigate = useNavigate();

    const [loading, setLoading]                   = useState(false);
    const [showPassword, setShowPassword]         = useState(false);
    const [error, setError]                       = useState("");
    const [locationLoading, setLocationLoading]   = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);

    const locationReceivedRef = useRef(false);

    const [formData, setFormData] = useState({
        name:          "",
        email:         "",
        password:      "",
        confirmPassword: "",
        lat:           null,
        lng:           null,
        address:       "",
        addressFields: { flatNo: '', street: '', area: '', city: '', state: '', pincode: '' },
        role:          "customer",
        businessName:  ""
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const getAddress = async (lat, lng) => {
        try {
            const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            const addr = data.address || {};
            return {
                fullAddress: data.display_name || "",
                fields: {
                    flatNo:  '',
                    street:  addr.road || addr.suburb || '',
                    area:    addr.neighbourhood || addr.suburb || addr.county || '',
                    city:    addr.city || addr.town || addr.village || '',
                    state:   addr.state || '',
                    pincode: addr.postcode || '',
                }
            };
        } catch {
            return { fullAddress: "", fields: { flatNo: '', street: '', area: '', city: '', state: '', pincode: '' } };
        }
    };

    const handleGetLocation = () => {
        setLocationLoading(true);
        setError("");
        locationReceivedRef.current = false;

        const defaultLat = 28.5355;
        const defaultLng = 77.3910;

        const timeoutId = setTimeout(async () => {
            if (!locationReceivedRef.current) {
                const { fullAddress, fields } = await getAddress(defaultLat, defaultLng);
                setFormData(prev => ({ ...prev, lat: defaultLat, lng: defaultLng, address: fullAddress, addressFields: fields }));
                setLocationLoading(false);
                toast("Default location set — tap Edit to update! 📍", { icon: 'ℹ️' });
            }
        }, 6000);

        if (!navigator.geolocation) {
            clearTimeout(timeoutId);
            setLocationLoading(false);
            setError("Geolocation not supported.");
            getAddress(defaultLat, defaultLng).then(({ fullAddress, fields }) => {
                setFormData(prev => ({ ...prev, lat: defaultLat, lng: defaultLng, address: fullAddress, addressFields: fields }));
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                locationReceivedRef.current = true;
                clearTimeout(timeoutId);
                const { latitude, longitude } = position.coords;
                const { fullAddress, fields } = await getAddress(latitude, longitude);
                setFormData(prev => ({ ...prev, lat: latitude, lng: longitude, address: fullAddress, addressFields: fields }));
                setLocationLoading(false);
                toast.success("Location synced! 📍");
            },
            async () => {
                locationReceivedRef.current = true;
                clearTimeout(timeoutId);
                const { fullAddress, fields } = await getAddress(defaultLat, defaultLng);
                setFormData(prev => ({ ...prev, lat: defaultLat, lng: defaultLng, address: fullAddress, addressFields: fields }));
                setLocationLoading(false);
                toast("Location denied. Default set — tap Edit! 📍", { icon: 'ℹ️' });
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    const handleAddressSave = (fields, fullAddress) => {
        setFormData(prev => ({ ...prev, address: fullAddress, addressFields: fields }));
        setShowAddressModal(false);
        toast.success("Address updated!");
    };

    const toggleRole = (selectedRole) => {
        setFormData(prev => ({ ...prev, role: selectedRole, businessName: selectedRole === "customer" ? "" : prev.businessName }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.lat || !formData.lng) { setError("Please sync your location first!"); return; }
        if (!formData.address.trim())        { setError("Please provide your address."); return; }
        if (formData.password !== formData.confirmPassword) { setError("Passwords don't match!"); return; }
        if (formData.password.length < 6)   { setError("Password must be at least 6 characters."); return; }
        if (formData.role === "vendor" && !formData.businessName.trim()) { setError("Business name is required for vendors."); return; }

        setLoading(true);
        try {
            const { confirmPassword, lat, lng, address, addressFields, ...rest } = formData;

            const dataToSend = {
                ...rest,
                location: {
                    type:        'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)],
                    address,
                }
            };

            // ✅ Step 1: Frontend pe OTP generate karo
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiry = new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString();

            // ✅ Step 2: EmailJS se OTP bhejo PEHLE — agar email fail ho toh signup mat karo
            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                {
                    to_email: formData.email,  // ✅ recipient email
                    to_name:  formData.name,   // ✅ recipient name
                    passcode: otpCode,          // ✅ {{passcode}} template variable
                    time:     otpExpiry,        // ✅ {{time}} template variable
                },
                import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );

            // ✅ Step 3: Email success — ab backend pe user save karo
            const response = await authService.signup(dataToSend);

            if (response.status === 201 || response.status === 200) {
                toast.success("Welcome to the Galaxy! Check your email for OTP 🚀");
                // ✅ OTP aur email next page pe pass karo
                navigate('/verify-otp', {
                    state: {
                        email:       formData.email,
                        frontendOtp: otpCode  // ✅ VerifyOTP page pe check hoga
                    }
                });
            }

        } catch (err) {
            console.error("Signup Error:", err);
            // ✅ EmailJS error alag handle karo
            if (err?.status === 400 || err?.text) {
                setError("Email could not be sent. Please check your email address.");
            } else {
                const serverMessage =
                    err.response?.data?.message ||
                    err.response?.data?.msg ||
                    "Signup failed. Please try again.";
                setError(serverMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 py-20 relative overflow-hidden">
                <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-veny-primary/20 rounded-full blur-[120px] animate-blob" />
                <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />

                <div className="w-full max-w-lg bg-white/5 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-[0_0_50px_rgba(79,70,229,0.1)] border border-white/10 relative z-10">

                    <div className="text-center mb-10">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-veny-primary font-black uppercase tracking-[0.2em] mb-4">
                            Start Your Journey
                        </div>
                        <h1 className="text-6xl font-black text-white italic tracking-tighter mb-2">Veny.</h1>
                        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em]">The Elite Marketplace</p>
                    </div>

                    <div className="flex bg-black/40 p-1.5 rounded-2xl mb-6 border border-white/5 shadow-inner">
                        {["customer", "vendor"].map(r => (
                            <button key={r} type="button" onClick={() => toggleRole(r)}
                                className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${formData.role === r ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}>
                                I'm a {r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                        ))}
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
                        <div className="space-y-3">

                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-veny-primary transition-colors" size={18} />
                                <input type="text" name="name" placeholder="Full Name" required value={formData.name} onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:bg-white/10 focus:border-veny-primary/50 outline-none transition-all font-medium" />
                            </div>

                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-veny-primary transition-colors" size={18} />
                                <input type="email" name="email" placeholder="Email Address" required value={formData.email} onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:bg-white/10 focus:border-veny-primary/50 outline-none transition-all font-medium" />
                            </div>

                            {formData.role === "vendor" && (
                                <div className="relative group animate-in zoom-in-95 duration-300">
                                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-veny-primary" size={18} />
                                    <input type="text" name="businessName" placeholder="Business Name" value={formData.businessName} onChange={handleChange}
                                        required={formData.role === "vendor"}
                                        className="w-full pl-12 pr-4 py-4 bg-veny-primary/5 border border-veny-primary/30 rounded-2xl text-white placeholder:text-gray-600 focus:bg-veny-primary/10 focus:border-veny-primary outline-none transition-all font-medium" />
                                </div>
                            )}

                            <div className="pt-2">
                                <button type="button" onClick={handleGetLocation} disabled={locationLoading}
                                    className={`w-full py-4 rounded-2xl border flex items-center justify-center gap-3 transition-all duration-500 group ${formData.lat ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-veny-primary/10 border-veny-primary/30 text-veny-primary hover:bg-veny-primary/20'}`}>
                                    {locationLoading ? <Compass className="animate-spin" size={20} /> : formData.lat ? <MapPin className="animate-pulse" size={20} /> : <Compass size={20} className="group-hover:rotate-180 transition-transform duration-700" />}
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {locationLoading ? "Searching..." : formData.lat ? "Location Synced ✓" : "Sync Location"}
                                    </span>
                                </button>

                                {formData.address && (
                                    <div className="mt-3 bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-2 flex-1 min-w-0">
                                            <MapPin size={12} className="text-veny-primary mt-0.5 flex-shrink-0" />
                                            <p className="text-[11px] text-gray-400 font-medium leading-relaxed truncate">{formData.address}</p>
                                        </div>
                                        <button type="button" onClick={() => setShowAddressModal(true)}
                                            className="flex items-center gap-1.5 text-[9px] font-black text-gray-500 hover:text-veny-primary transition-colors uppercase tracking-widest flex-shrink-0 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-veny-primary/30">
                                            <Edit3 size={10} /> Edit
                                        </button>
                                    </div>
                                )}

                                {!formData.lat && !locationLoading && (
                                    <button type="button"
                                        onClick={() => { setFormData(prev => ({ ...prev, lat: 28.5355, lng: 77.3910 })); setShowAddressModal(true); }}
                                        className="mt-2 w-full text-[10px] font-black text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors underline underline-offset-4">
                                        Or enter address manually
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" required value={formData.password} onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:bg-white/10 focus:border-veny-primary/50 outline-none transition-all font-medium" />
                                </div>
                                <div className="relative group">
                                    <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm" required value={formData.confirmPassword} onChange={handleChange}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:bg-white/10 focus:border-veny-primary/50 outline-none transition-all font-medium" />
                                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in slide-in-from-top-2">
                                <p className="text-red-400 text-[11px] font-black italic flex items-center justify-center gap-2 uppercase tracking-tighter">
                                    <ShieldCheck size={16} /> {error}
                                </p>
                            </div>
                        )}

                        <div className="pt-4">
                            <Button text={`Create ${formData.role === 'customer' ? 'Account' : 'Business'}`} loading={loading}
                                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all" />
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                Already with us?
                                <Link to="/login" className="text-white ml-2 hover:text-veny-primary transition-all underline underline-offset-8 decoration-veny-primary/50">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {showAddressModal && (
                <AddressModal addressData={formData.addressFields} onSave={handleAddressSave} onClose={() => setShowAddressModal(false)} />
            )}
        </>
    );
};

export default Signup;