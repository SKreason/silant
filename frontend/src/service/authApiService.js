import api, {API_URL} from '../api/api.js';
import axios from "axios";

/**
 * Экземпляр axios для запросов на обновление токена
 * Настроен с базовым URL и заголовками по умолчанию
 */
const refreshApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
})

/**
 * Сервис для работы с аутентификацией.
 * Предоставляет методы для:
 * - входа в систему (логин)
 * - обновления access-токена
 */
export const authApiService = {

    /**
     * Выполняет вход пользователя в систему
     * @async
     * @param {Object} credentials - Учетные данные пользователя
     * @param {string} credentials.username - Имя пользователя
     * @param {string} credentials.password - Пароль
     * @returns {Promise<Object>} Объект с токенами доступа
     * @throws {Error} Ошибка авторизации с сообщением от сервера или стандартным текстом
     */
    async login(credentials) {
        try {
            const response = await api.post('/token/', credentials);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.detail
                || error.response?.data?.error
                || 'Ошибка авторизации';
            throw new Error(errorMessage);
        }
    },

    /**
     * Обновляет access-токен с помощью refresh-токена
     * @async
     * @param {string} refreshToken - Refresh-токен для получения нового access-токена
     * @returns {Promise<Object>} Объект с новым access-токеном
     * @throws {Error} Ошибка обновления токена с сообщением от сервера или стандартным текстом
     */
    async refresh(refreshToken) {
        try {
            const response = await refreshApi.post(`/token/refresh/`, {
                refresh: refreshToken
            });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.detail
                || error.response?.data?.error
                || 'Ошибка обновления токена';
            throw new Error(errorMessage);
        }
    },
};
