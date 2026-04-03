import axiosInstance from "./axiosInstance";

export const getCariler = async () => {
    const response = await axiosInstance.get('/caris');
    return response.data;
};

export const addCari = async (data) => {
    const response = await axiosInstance.post('/caris', data);
    return response.data;
};