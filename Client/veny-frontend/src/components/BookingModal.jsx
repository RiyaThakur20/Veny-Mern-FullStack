import { useState } from 'react';
import { Calendar, MapPin, X } from 'lucide-react';
import Button from './Button';
import bookingService from '../services/bookingService';
import { toast } from 'react-hot-toast';

const BookingModal = ({ service, onClose }) => {
    const [scheduledDate, setScheduledDate] = useState('');
    const [loading, setLoading]             = useState(false);

    // Min date — aaj se pehle select na ho
    const today = new Date().toISOString().slice(0, 16);

    // ✅ User ka saved address localStorage se
    const user    = JSON.parse(localStorage.getItem('user') || '{}');
    const address = user?.location?.address || user?.address || "Home";

    const handleConfirmBooking = async () => {
        if (!scheduledDate) {
            toast.error("Please select a date & time");
            return;
        }
        if (new Date(scheduledDate) < new Date()) {
            toast.error("Please select a future date");
            return;
        }

        // Login check
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please login to book a service");
            onClose();
            return;
        }

        setLoading(true);
        try {
            await bookingService.createBooking({
                serviceId:     service._id,
                scheduledDate: scheduledDate,
                address:       address, // ✅ user ka actual address
            });
            toast.success("Booking Request Sent! 🌌");
            onClose();
        } catch (error) {
            const msg =
                error?.response?.data?.msg ||
                error?.response?.data?.message ||
                "Booking failed. Please try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 relative overflow-hidden animate-in zoom-in-95 duration-300 shadow-[0_0_50px_rgba(99,102,241,0.1)]">

                {/* Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-veny-primary/10 blur-[80px] rounded-full pointer-events-none" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="inline-block px-3 py-1 rounded-full bg-veny-primary/10 border border-veny-primary/20 mb-4">
                        <span className="text-[9px] font-black text-veny-primary uppercase tracking-widest">New Booking</span>
                    </div>
                    <h2 className="text-2xl font-black text-white italic tracking-tight mb-1">
                        Confirm Booking
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Service: <span className="text-white font-bold">{service.name}</span>
                    </p>
                    <p className="text-veny-primary font-black text-2xl italic mt-2">₹{service.price}</p>
                </div>

                {/* Date & Time */}
                <div className="space-y-2 mb-6">
                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold ml-1">
                        <Calendar size={12} /> Select Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        value={scheduledDate}
                        min={today}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white outline-none focus:border-veny-primary/50 focus:bg-white/5 transition-all font-medium"
                    />
                </div>

                {/* ✅ Address display */}
                <div className="mb-8 bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                    <MapPin size={14} className="text-veny-primary mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Service Address</p>
                        <p className="text-xs text-gray-300 font-medium leading-relaxed">{address}</p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                    <Button
                        text="Confirm & Book"
                        onClick={handleConfirmBooking}
                        loading={loading}
                    />
                    <button
                        onClick={onClose}
                        className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold py-2 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;