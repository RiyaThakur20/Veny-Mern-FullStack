import React from 'react';

const Button = ({ text, onClick, type = 'submit', loading = false, variant = 'primary' }) => {
    // Industrial Variant Logic (In case you need a secondary button later)
    const baseStyles = "relative w-full py-4 rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";
    
    const variants = {
        primary: "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-veny-primary/20",
        secondary: "bg-transparent border border-white/20 text-white hover:bg-white/5",
        danger: "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={loading}
            className={`${baseStyles} ${variants[variant]}`}
        >
            {/* --- GLOW EFFECT ON HOVER --- */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

            <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                    <>
                        {/* Custom Spinner */}
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                        <span>Syncing...</span>
                    </>
                ) : (
                    text
                )}
            </span>
        </button>
    );
};

export default Button;