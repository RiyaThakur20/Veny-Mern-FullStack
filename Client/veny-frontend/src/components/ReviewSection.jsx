import { useState, useEffect } from 'react';
import { Star, Trash2, Send, Loader, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosClient from '../api/axiosClient';

// ─────────────────────────────────────────────
// Star Rating Component
// ─────────────────────────────────────────────
const StarRating = ({ value, onChange, readonly = false, size = 24 }) => {
    const [hovered, setHovered] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onChange && onChange(star)}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                >
                    <Star
                        size={size}
                        className={`transition-colors ${
                            star <= (hovered || value)
                                ? 'text-veny-primary fill-veny-primary'
                                : 'text-gray-600'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────
// Main Review Section
// ─────────────────────────────────────────────
const ReviewSection = ({ serviceId }) => {
    const [reviews, setReviews]       = useState([]);
    const [canReview, setCanReview]   = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [loading, setLoading]       = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating]         = useState(0);
    const [comment, setComment]       = useState('');
    const [error, setError]           = useState('');

    const isLoggedIn = !!localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchReviews();
        if (isLoggedIn) checkCanReview();
    }, [serviceId]);

    const fetchReviews = async () => {
        try {
            const res = await axiosClient.get(`/reviews/service/${serviceId}`);
            setReviews(res.data?.data || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    const checkCanReview = async () => {
        try {
            const res = await axiosClient.get(`/reviews/can-review/${serviceId}`);
            setCanReview(res.data?.canReview);
            setHasReviewed(res.data?.hasReviewed);
        } catch { /* silent */ }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (rating === 0) { setError("Please select a star rating"); return; }
        if (comment.trim().length < 5) { setError("Please write at least 5 characters"); return; }

        setSubmitting(true);
        try {
            await axiosClient.post('/reviews', { serviceId, rating, comment });
            toast.success("Review submitted! ⭐");
            setRating(0);
            setComment('');
            setCanReview(false);
            setHasReviewed(true);
            fetchReviews();
        } catch (err) {
            setError(err?.response?.data?.msg || "Could not submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Delete your review?")) return;
        try {
            await axiosClient.delete(`/reviews/${reviewId}`);
            toast.success("Review deleted");
            setHasReviewed(false);
            setCanReview(true);
            fetchReviews();
        } catch {
            toast.error("Could not delete review");
        }
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="mt-16 space-y-10">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black italic tracking-tighter">Reviews</h2>
                    {reviews.length > 0 && (
                        <div className="flex items-center gap-3 mt-2">
                            <StarRating value={Math.round(avgRating)} readonly size={18} />
                            <span className="text-white font-black">{avgRating}</span>
                            <span className="text-gray-500 text-sm">({reviews.length} reviews)</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Write Review Form */}
            {isLoggedIn && canReview && (
                <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8">
                    <h3 className="text-lg font-black italic mb-6">Write a Review</h3>
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Star Selector */}
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block">
                                Your Rating
                            </label>
                            <StarRating value={rating} onChange={setRating} size={32} />
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">
                                Your Experience
                            </label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                rows={4}
                                maxLength={500}
                                placeholder="Tell others about your experience..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-700 focus:outline-none focus:border-veny-primary/50 focus:bg-white/5 transition-all font-medium resize-none"
                            />
                            <p className="text-[10px] text-gray-600 mt-1 text-right">{comment.length}/500</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-2xl">
                                <p className="text-red-400 text-[11px] font-black flex items-center gap-2">
                                    <ShieldCheck size={14} /> {error}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {submitting
                                ? <><Loader size={16} className="animate-spin" /> Submitting...</>
                                : <><Send size={16} /> Submit Review</>
                            }
                        </button>
                    </form>
                </div>
            )}

            {/* Already reviewed */}
            {isLoggedIn && hasReviewed && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                    <p className="text-green-400 text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                        ✓ You have already reviewed this service
                    </p>
                </div>
            )}

            {/* Not eligible */}
            {isLoggedIn && !canReview && !hasReviewed && (
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                    <p className="text-gray-500 text-[11px] font-black uppercase tracking-widest">
                        Complete a booking to leave a review
                    </p>
                </div>
            )}

            {/* Not logged in */}
            {!isLoggedIn && (
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                    <p className="text-gray-500 text-[11px] font-black uppercase tracking-widest">
                        <a href="/login" className="text-veny-primary hover:underline">Login</a> to leave a review
                    </p>
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-veny-primary/20 border-t-veny-primary rounded-full animate-spin" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-16 bg-white/[0.02] rounded-[2rem] border border-dashed border-white/10">
                    <Star size={32} className="mx-auto text-gray-700 mb-3" />
                    <p className="text-gray-500 font-bold">No reviews yet — be the first!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div key={review._id} className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 hover:border-white/20 transition-all">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                                        {review.customer?.profilePhoto?.url
                                            ? <img src={review.customer.profilePhoto.url} alt="" className="w-full h-full object-cover" />
                                            : <div className="w-full h-full bg-veny-primary/20 flex items-center justify-center text-xs font-black text-veny-primary">
                                                {review.customer?.name?.substring(0, 2).toUpperCase()}
                                              </div>
                                        }
                                    </div>
                                    <div>
                                        <p className="font-black text-sm">{review.customer?.name}</p>
                                        <p className="text-[10px] text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Delete — sirf apna review */}
                                {currentUser?.id === review.customer?._id && (
                                    <button
                                        onClick={() => handleDelete(review._id)}
                                        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="mt-4">
                                <StarRating value={review.rating} readonly size={16} />
                                {review.comment && (
                                    <p className="text-gray-300 text-sm font-medium leading-relaxed mt-3">
                                        {review.comment}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;