import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Instagram, ArrowUpRight } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-[#020617] border-t border-white/5 pt-20 pb-10 px-6 overflow-hidden">
            {/* Subtle Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-veny-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="text-3xl font-black italic tracking-tighter text-white">
                            VENY<span className="text-veny-primary">.</span>
                        </Link>
                        <p className="mt-6 text-gray-500 text-sm font-medium leading-relaxed max-w-xs">
                            The next-generation galactic network connecting premium vendors with elite service seekers. 
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Navigation</h4>
                        <ul className="space-y-4">
                            {['Explore Galaxy', 'Join as Vendor', 'About Mission', 'Active Orbits'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-500 hover:text-veny-primary text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 group">
                                        {item} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Terminal Support</h4>
                        <ul className="space-y-4">
                            {['Help Center', 'Privacy Protocol', 'Terms of Service', 'API Docs'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-500 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Connect */}
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Signal Frequency</h4>
                        <div className="flex gap-4">
                            {[Github, Twitter, Linkedin, Instagram].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-400 hover:text-veny-primary hover:border-veny-primary/50 transition-all group">
                                    <Icon size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                        © {currentYear} Veny Systems Inc. All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                            All Systems Operational
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;