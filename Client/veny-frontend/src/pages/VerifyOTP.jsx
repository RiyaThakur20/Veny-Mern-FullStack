import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../components/Button';
import { authService } from '../services/authService';

const VerifyOTP = () => {
    const navigate  = useNavigate();
    const location  = useLocation();
    const email     = location.state?.email || "";
    const from      = location.state?.from  || '/dashboard';

    const [otp, setOtp]             = useState("");
    const [loading, setLoading]     = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError]         = useState("");

    useEffect(() => {
        if (!email) navigate('/login', { replace: true });
    }, [email, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // ✅ Pehle frontend OTP se match karo
            const frontendOtp = location.state?.frontendOtp;
            if (frontendOtp && String(otp) !== String(frontendOtp)) {
                setError("Invalid OTP. Please try again.");
                setLoading(false);
                return;
            }

            const response = await authService.verifyOTP({ email, otp });
            if (response.status === 200) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                if (user) localStorage.setItem('user', JSON.stringify(user));
                toast.success("Access granted! Welcome to Veny 🚀");
                navigate(from, { replace: true });
            }
        } catch (err) {
            const msg = err.response?.data?.msg || err.response?.data?.message || "Invalid OTP. Please try again.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError("");
        try {
            await authService.resendOTP({ email });
            toast.success("New OTP sent to your email!");
            setOtp("");
        } catch {
            toast.error("Could not resend OTP. Please go back and login again.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-[450px] h-[450px] bg-veny-primary/20 rounded-full blur-[120px] animate-blob" />
            <div className="absolute -bottom-24 -right-24 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

            <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] shadow-[0_0_50px_rgba(79,70,229,0.1)] border border-white/10 relative z-10">

                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-xl hover:border-veny-primary/50 transition-all duration-500 group">
                        <ShieldCheck className="text-veny-primary group-hover:scale-110 transition-transform" size={40} />
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter italic">Identity Check</h2>
                    <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] mt-3 leading-relaxed">
                        Secure code sent to <br />
                        <span className="text-white font-black">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="relative group">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength="6"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-full text-center tracking-[0.6em] text-4xl font-black py-6 bg-black/20 border border-white/10 rounded-[2rem] text-white placeholder:text-gray-800 focus:bg-white/5 focus:border-veny-primary/50 focus:ring-1 focus:ring-veny-primary/20 outline-none transition-all shadow-inner"
                            required
                        />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-veny-primary/20 blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
                            <p className="text-red-400 text-[11px] font-black italic text-center uppercase tracking-tighter">
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="pt-2">
                        <Button
                            text="Authorize Access"
                            loading={loading}
                            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        />
                    </div>

                    <div className="flex flex-col gap-4 items-center pt-2">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resending}
                            className="text-veny-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-all group disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={resending ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
                            {resending ? "Sending..." : "Resend OTP"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-gray-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-gray-400 transition-colors"
                        >
                            <ArrowLeft size={14} /> Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTP;