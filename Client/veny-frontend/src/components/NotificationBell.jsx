import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-hot-toast';

const TYPE_ICONS = {
    booking_new:       '🌌',
    booking_confirmed: '✅',
    booking_cancelled: '❌',
    booking_completed: '🎉',
    booking_inprogress:'🚀',
    review_new:        '⭐',
};

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount]     = useState(0);
    const [open, setOpen]                   = useState(false);
    const [loading, setLoading]             = useState(false);
    const dropdownRef                       = useRef(null);
    const navigate                          = useNavigate();

    const token = localStorage.getItem('token');

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await axiosClient.get('/notifications');
            setNotifications(res.data?.data || []);
            setUnreadCount(res.data?.unreadCount || 0);
        } catch { /* silent */ }
    };

    // Poll every 30 seconds
    useEffect(() => {
        if (!token) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [token]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleOpen = () => {
        setOpen(o => !o);
        if (!open) fetchNotifications();
    };

    const handleMarkAllRead = async () => {
        try {
            await axiosClient.patch('/notifications/read-all');
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch { toast.error("Could not mark as read"); }
    };

    const handleMarkOne = async (id) => {
        try {
            await axiosClient.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* silent */ }
    };

    const handleClearAll = async () => {
        setLoading(true);
        try {
            await axiosClient.delete('/notifications/clear');
            setNotifications([]);
            setUnreadCount(0);
            toast.success("Notifications cleared!");
        } catch { toast.error("Could not clear notifications"); }
        finally { setLoading(false); }
    };

    const handleNotifClick = async (notif) => {
        if (!notif.isRead) await handleMarkOne(notif._id);
        setOpen(false);
        navigate(notif.link || '/dashboard');
    };

    const timeAgo = (date) => {
        const diff = Math.floor((Date.now() - new Date(date)) / 1000);
        if (diff < 60)   return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    if (!token) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={handleOpen}
                className="relative p-2.5 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
                <Bell size={20} />
                {/* Unread badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-veny-primary text-black text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-14 w-80 bg-[#0a0f1e] border border-white/10 rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] z-[200] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                        <div>
                            <h3 className="text-sm font-black text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <p className="text-[10px] text-veny-primary font-bold">{unreadCount} unread</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="p-1.5 text-gray-500 hover:text-green-400 transition-colors"
                                    title="Mark all read"
                                >
                                    <Check size={15} />
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    disabled={loading}
                                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                                    title="Clear all"
                                >
                                    <Trash2 size={15} />
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="p-1.5 text-gray-500 hover:text-white transition-colors">
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell size={28} className="mx-auto text-gray-700 mb-3" />
                                <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">No notifications</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif._id}
                                    onClick={() => handleNotifClick(notif)}
                                    className={`flex items-start gap-3 px-5 py-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 ${!notif.isRead ? 'bg-veny-primary/5' : ''}`}
                                >
                                    {/* Icon */}
                                    <span className="text-lg flex-shrink-0 mt-0.5">
                                        {TYPE_ICONS[notif.type] || '🔔'}
                                    </span>

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-black mb-0.5 ${!notif.isRead ? 'text-white' : 'text-gray-400'}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                                            {notif.message}
                                        </p>
                                        <p className="text-[10px] text-gray-600 mt-1 font-bold">
                                            {timeAgo(notif.createdAt)}
                                        </p>
                                    </div>

                                    {/* Unread dot */}
                                    {!notif.isRead && (
                                        <div className="w-2 h-2 bg-veny-primary rounded-full flex-shrink-0 mt-1" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;