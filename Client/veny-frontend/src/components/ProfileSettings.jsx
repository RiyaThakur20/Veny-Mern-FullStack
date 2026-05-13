import { useState, useRef } from 'react';
import { Camera, User, Phone, Store, Save, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosClient from '../api/axiosClient';

const ProfileSettings = ({ user, onUpdate }) => {
    const [formData, setFormData] = useState({
        name:         user?.name         || '',
        businessName: user?.businessName || '',
        phoneNumber:  user?.phoneNumber  || '',
    });
    const [photoPreview, setPhotoPreview]   = useState(user?.profilePhoto?.url || null);
    const [photoFile, setPhotoFile]         = useState(null);
    const [saving, setSaving]               = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be under 2MB");
            return;
        }
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handlePhotoUpload = async () => {
        if (!photoFile) return;
        setUploadingPhoto(true);
        try {
            const data = new FormData();
            data.append('profilePhoto', photoFile);
            const res = await axiosClient.post('/profile/photo', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Update localStorage
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...storedUser, profilePhoto: res.data.data.profilePhoto };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            if (onUpdate) onUpdate(updatedUser);
            toast.success("Profile photo updated! 📸");
            setPhotoFile(null);
        } catch {
            toast.error("Photo upload failed");
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await axiosClient.put('/profile', formData);
            // Update localStorage
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...storedUser, ...res.data.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            if (onUpdate) onUpdate(updatedUser);
            toast.success("Profile updated! ✨");
        } catch (err) {
            toast.error(err?.response?.data?.msg || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const initials = user?.name?.substring(0, 2).toUpperCase() || 'VE';

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Profile Photo */}
            <div className="bg-white/[0.03] rounded-[2.5rem] p-8 border border-white/10">
                <h3 className="text-lg font-black italic mb-6 text-white">Profile Photo</h3>
                <div className="flex flex-col sm:flex-row items-center gap-8">

                    {/* Avatar */}
                    <div className="relative group flex-shrink-0">
                        <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-2 border-white/10 group-hover:border-veny-primary/50 transition-all">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-veny-primary/20 flex items-center justify-center text-3xl font-black text-veny-primary">
                                    {initials}
                                </div>
                            )}
                        </div>
                        {/* Camera overlay */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 w-9 h-9 bg-white text-black rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                        >
                            <Camera size={16} />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoSelect}
                        />
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <p className="text-gray-400 text-sm mb-1">JPG, PNG or WebP — max 2MB</p>
                        <p className="text-gray-600 text-xs mb-4">Square images work best</p>
                        {photoFile && (
                            <button
                                onClick={handlePhotoUpload}
                                disabled={uploadingPhoto}
                                className="px-6 py-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {uploadingPhoto ? <><Loader size={14} className="animate-spin" /> Uploading...</> : <><Camera size={14} /> Upload Photo</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Info */}
            <div className="bg-white/[0.03] rounded-[2.5rem] p-8 border border-white/10">
                <h3 className="text-lg font-black italic mb-6 text-white">Personal Info</h3>
                <div className="space-y-4">

                    {/* Name */}
                    <div className="relative group">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">
                            Full Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-veny-primary transition-colors" size={18} />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder:text-gray-700 focus:outline-none focus:border-veny-primary/50 focus:bg-white/5 transition-all font-bold"
                                placeholder="Your full name"
                            />
                        </div>
                    </div>

                    {/* Business Name — vendor only */}
                    {user?.role === 'vendor' && (
                        <div className="relative group">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">
                                Business Name
                            </label>
                            <div className="relative">
                                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-veny-primary transition-colors" size={18} />
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-veny-primary/5 border border-veny-primary/20 rounded-2xl text-white placeholder:text-gray-700 focus:outline-none focus:border-veny-primary/50 focus:bg-veny-primary/10 transition-all font-bold"
                                    placeholder="Your business name"
                                />
                            </div>
                        </div>
                    )}

                    {/* Phone */}
                    <div className="relative group">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-veny-primary transition-colors" size={18} />
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder:text-gray-700 focus:outline-none focus:border-veny-primary/50 focus:bg-white/5 transition-all font-bold"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    {/* Email — read only */}
                    <div className="relative">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-gray-500 font-bold cursor-not-allowed"
                        />
                        <p className="text-[10px] text-gray-600 mt-1.5 ml-1">Email cannot be changed</p>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-8">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-4 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    >
                        {saving
                            ? <><Loader size={16} className="animate-spin" /> Saving...</>
                            : <><Save size={16} /> Save Changes</>
                        }
                    </button>
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-white/[0.03] rounded-[2.5rem] p-8 border border-white/10">
                <h3 className="text-lg font-black italic mb-4 text-white">Account Info</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 rounded-2xl p-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Role</p>
                        <p className="font-black capitalize text-veny-primary">{user?.role}</p>
                    </div>
                    <div className="bg-black/20 rounded-2xl p-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</p>
                        <p className="font-black text-green-400">✓ Verified</p>
                    </div>
                    <div className="bg-black/20 rounded-2xl p-4 col-span-2">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Member Since</p>
                        <p className="font-black">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;