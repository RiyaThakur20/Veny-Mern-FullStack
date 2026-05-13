import axiosClient from '../api/axiosClient';

const bookingService = {

    // 1. Create booking
    createBooking: async (bookingData) => {
        return await axiosClient.post('/bookings/create', bookingData);
    },

    // 2. Get my bookings (customer + vendor dono ke liye)
    getMyBookings: async () => {
        return await axiosClient.get('/bookings/my-bookings');
    },

    // 3. Update booking status (vendor — confirm/complete/start)
    updateStatus: async (bookingId, status) => {
        return await axiosClient.patch(`/bookings/update/${bookingId}`, { status });
    },

    // 4. Cancel booking (customer)
    cancelBooking: async (bookingId) => {
        return await axiosClient.patch(`/bookings/update/${bookingId}`, { status: 'cancelled' });
    },
};

export default bookingService;