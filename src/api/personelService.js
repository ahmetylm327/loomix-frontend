import axiosInstance from './axiosInstance';

export const getPersoneller = async () => {
    try {
        const response = await axiosInstance.get('/employees');
        return response.data;
    } catch (error) {
        console.error("Personel çekme hatası:", error);
        throw error;
    }
};