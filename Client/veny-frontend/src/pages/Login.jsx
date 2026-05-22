import { useState } from 'react';
import Button from '../components/Button';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || location.state?.from || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.data.success || response.status === 200) {
        navigate('/verify-otp', { state: { email, from } });
      }
    } catch (err) {
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Login failed. Please check your credentials.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-[450px] h-[450px] bg-veny-primary/20 rounded-full blur-[120px] animate-blob" />
      <div className="absolute -bottom-24 -right-24 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-[0_0_50px_rgba(79,70,229,0.1)] border border-white/10 relative z-10 transition-all hover:border-white/20">

        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-veny-primary font-black uppercase tracking-[0.2em] mb-4">
            Welcome Back
          </div>
          <h1 className="text-6xl font-black text-white italic tracking-tighter mb-2 drop-shadow-2xl">Veny.</h1>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em]">Professional Marketplace</p>
        </div>

        {/* ✅ autoComplete="off" on form + hidden dummy fields to trick browser */}
        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">

          {/* Dummy hidden fields — browser autofill ko block karta hai */}
          <input type="text" style={{ display: 'none' }} autoComplete="username" />
          <input type="password" style={{ display: 'none' }} autoComplete="current-password" />

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-[0.2em]">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-veny-primary transition-colors" size={18} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="new-password"  // ✅ browser autofill band
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:bg-white/10 focus:border-veny-primary/50 focus:ring-1 focus:ring-veny-primary/20 outline-none transition-all font-medium"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-[0.2em]">
              Security Key
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-veny-primary transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"  // ✅ browser autofill band
                className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:bg-white/10 focus:border-veny-primary/50 focus:ring-1 focus:ring-veny-primary/20 outline-none transition-all font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl animate-in fade-in duration-300">
              <p className="text-red-400 text-[11px] font-black italic flex items-center justify-center gap-2 uppercase tracking-tighter text-center">
                <ShieldCheck size={16} /> {error}
              </p>
            </div>
          )}

          <div className="pt-2">
            <Button
              text="Access Account"
              loading={loading}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            />
          </div>
        </form>

        <div className="text-center mt-10">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
            New to the orbit?
            <Link to="/signup" className="text-white ml-2 hover:text-veny-primary transition-all underline underline-offset-4 decoration-veny-primary/50 inline-flex items-center gap-1">
              Join Now <ArrowRight size={14} />
            </Link>
          </p>

          <button
            onClick={() => navigate('/explore')}
            className="mt-4 text-gray-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:text-gray-400 transition-colors"
          >
            <ArrowLeft size={12} /> Back to Explore
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;