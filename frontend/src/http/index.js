import axios from 'axios';
// import {AuthResponse} from "../models/response/AuthResponse";

export const API_URL = `http://localhost:5001`

// export const API_URL = `http://185.196.117.170:5000`

const $api = axios.create({
    withCredentials: true,
    baseURL: API_URL
})

// Интерцептор запросов
$api.interceptors.request.use((config) => {
    // Получение access token из хранилища
    const token = localStorage.getItem('token');

    // Если токен существует, добавляем его в заголовки
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Интерцептор ответов
$api.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    const originalRequest = error.config;

    // Если сервер вернул ошибку 401 и это не повторный запрос
    if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Отправка запроса на обновление токена
        const { data } = await axios.get(API_URL +'/auth/refresh');

        // Сохранение нового access token в хранилище
        localStorage.setItem('token', data.accessToken);

        // Изменение заголовка Authorization в оригинальном запросе
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        // Повторный запрос с новым access token
        return $api(originalRequest);
    }

    return Promise.reject(error);
});

export default $api;
