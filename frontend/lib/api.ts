import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/emails';

export const api = axios.create({
    baseURL: API_URL,
});

export const scheduleEmail = async (formData: FormData) => {
    return await api.post('/schedule', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const getScheduledEmails = async () => {
    return await api.get('/scheduled');
};

export const getSentEmails = async () => {
    return await api.get('/sent');
};
