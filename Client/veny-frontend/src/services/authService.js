import axiosClient from "../api/axiosClient";

export const authService = {
    // User Registration
    signup: (userData) => {
        return axiosClient.post('/auth/signup', userData);
    },

    // User Login
    login: (credentials) => {
        return axiosClient.post('/auth/login', credentials);
    },

    //verify otp
    verifyOTP: (data) => {
        // Data mein 'email' aur 'otp' dono honge
        return axiosClient.post('/auth/verify-otp', data);
    },

    // Resend OTP
    resendOTP: (data) => axiosClient.post('/auth/resend-otp', data),

    // Get User Profile (Future use ke liye)
    getProfile: () => {
        return axiosClient.get('/auth/profile');
    }
};