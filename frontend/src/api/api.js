import axios from 'axios';
import { useAuthStore } from "../store/useAuthStore.js";

/** Базовый URL API */
export const API_URL = 'http://127.0.0.1:8000/api';

/**
 * Экземпляр axios с преднастроенными заголовками
 */
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

/** Флаг процесса обновления токена */
let isRefreshing = false;

/** Очередь запросов, ожидающих обновления токена */
let requestQueue = [];

/**
 * Обработка очереди запросов при обновлении токена
 * @param {string|null} token - новый токен или null, если обновление не удалось
 */
const processQueue = (token = null) => {
    requestQueue.forEach(({ config, resolve, reject }) => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            resolve(api(config));
        } else {
            reject(new Error('Ошибка обновления токена'));
        }
    });
    requestQueue = [];
};

/**
 * Проверка, истёк ли токен
 * @param {number|null} expiresAt - время истечения в формате UNIX timestamp (в секундах)
 * @returns {boolean} true — токен просрочен или не задан
 */
const isTokenExpired = (expiresAt) => {
    if (!expiresAt) return true;
    return Date.now() >= expiresAt * 1000;
};

/**
 * Интерсептор запросов
 * Добавляет Authorization-заголовок и обрабатывает обновление токенов
 */
api.interceptors.request.use(
    async (config) => {
        const {
            token,
            tokenExpiresAt,
            refreshToken,
            refreshTokenExpiresAt,
            refresh,
            logout,
            setShowLoginModal,
            setError,
        } = useAuthStore.getState();

        // Если токена нет — отправляем запрос без авторизации
        if (!token) return config;

        // Если refresh токен просрочен — выходим из сессии
        if (isTokenExpired(refreshTokenExpiresAt)) {
            logout();
            setError('Срок действия сессии истёк');
            setShowLoginModal(true);
            throw new Error('Срок действия сессии истёк');
        }

        // Если access токен просрочен — пытаемся обновить
        if (isTokenExpired(tokenExpiresAt)) {
            if (isRefreshing) {
                // Если обновление уже идёт — добавляем запрос в очередь
                return new Promise((resolve, reject) => {
                    requestQueue.push({ config, resolve, reject });
                });
            }

            isRefreshing = true;

            try {
                await refresh(refreshToken);
                const newToken = useAuthStore.getState().token;
                config.headers.Authorization = `Bearer ${newToken}`;
                processQueue(newToken);

                return config;
            } catch (error) {
                processQueue(null);
                logout();
                setShowLoginModal(true);
                throw error;
            } finally {
                isRefreshing = false;
            }
        }

        // Если токен валиден — просто добавляем его в заголовки
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
