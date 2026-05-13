import axiosClient from "../api/axiosClient";

/**
 * Service Layer — all Service-related API calls
 * Industrial practice: UI components never call axios directly
 */
const serviceService = {

    // 1. Get all services — supports pagination & filters
    getAllServices: async (params = {}) => {
        try {
            const response = await axiosClient.get('/services', { params });
            return response.data; // { success, data, total, page, totalPages }
        } catch (error) {
            throw error;
        }
    },

    // 2. Get single service by ID — was MISSING, caused ServiceDetail crash
    getServiceById: async (id) => {
        try {
            const response = await axiosClient.get(`/services/${id}`);
            return response.data?.data || response.data;
        } catch (error) {
            throw error;
        }
    },

    // 3. Get nearby services
    getNearbyServices: async ({ lat, lng, radius = 5000 }) => {
        try {
            const response = await axiosClient.get('/services/nearby', {
                params: { lat, lng, radius }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 4. Create a new service (Vendor only)
    createService: async (serviceData) => {
        try {
            const response = await axiosClient.post('/services/add', serviceData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 5. Get services of the logged-in vendor
    getMyServices: async () => {
        try {
            const response = await axiosClient.get('/services/vendor/my-services');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 6. Update an existing service
    updateService: async (id, updatedData) => {
        try {
            const response = await axiosClient.put(`/services/${id}`, updatedData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 7. Delete a service
    deleteService: async (id) => {
        try {
            const response = await axiosClient.delete(`/services/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default serviceService;