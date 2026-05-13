import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Sparkles, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLink = ({ isActive }) =>
        isActive
            ? "text-[11px] font-black text-white uppercase tracking-[0.2em] transition-all"
            : "text-[11px] font-black text-gray-400 hover:text-white uppercase tracking-[0.2em] transition-all";

    const links = [
        { to: "/explore", label: "Explore Galaxy", icon: <Sparkles size={13} className="text-veny-primary" /> },
        { to: "/login",   label: "Login",           icon: null },
        { to: "/signup",  label: "Signup",           icon: null },
    ];

    return (
        <nav className="fixed top-0 w-full z-[100] bg-[#020617]/70 backdrop-blur-xl border-b border-white/5 px-6 py-5">
            <div className="max-w-7xl mx-auto flex justify-between items-center">

                {/* LOGO */}
                <Link to="/" className="group flex items-center gap-2">
                    <h1 className="text-3xl font-black tracking-tighter text-white italic transition-transform group-hover:scale-105">
                        VENY<span className="text-veny-primary text-4xl leading-none">.</span>
                    </h1>
                </Link>

                <div className="flex items-center gap-6">

                    {/* DESKTOP LINKS */}
                    <div className="hidden md:flex items-center gap-8">
                        {links.map(({ to, label, icon }) => (
                            <NavLink key={to} to={to} className={navLink}>
                                <span className="flex items-center gap-2">
                                    {icon}
                                    {label}
                                </span>
                            </NavLink>
                        ))}
                    </div>

                    {/* CTA */}
                    <Link
                        to="/signup"
                        className="relative overflow-hidden bg-white text-black px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)] group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <span className="relative">Join as Vendor</span>
                    </Link>

                    {/* MOBILE HAMBURGER */}
                    <button
                        className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                        onClick={() => setMobileOpen(o => !o)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* MOBILE DROPDOWN MENU */}
            {mobileOpen && (
                <div className="md:hidden mt-4 pb-4 border-t border-white/5 flex flex-col gap-2 px-2 pt-4 animate-in slide-in-from-top-2 duration-200">
                    {links.map(({ to, label, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                                    isActive
                                        ? 'bg-white/10 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            {icon}
                            {label}
                        </NavLink>
                    ))}
                </div>
            )}
        </nav>
    );
};

export default Navbar;