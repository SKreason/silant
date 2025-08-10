import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {authApiService} from "../service/authApiService.js";
import {useSilantStore} from "./useSilantStore.js";

/**
 * Начальное состояние auth store
 */
const initialState = {
    token: null,
    tokenExpiresAt: null,
    refreshToken: null,
    refreshTokenExpiresAt: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    username: null,
    type: null,
    fullname: null,
    showLoginModal: false,
};

/**
 * Zustand store для авторизации и управления токенами
 * Хранит токены, данные пользователя и методы логина/логаута/обновления
 */
const useAuthStore = create(
    persist(
        (set, get) => ({
            ...initialState,

            /**
             * Устанавливает токены и помечает пользователя как авторизованного
             */
            setToken: (token, refreshToken, tokenExpiresAt, refreshTokenExpiresAt) => {
                set({
                    token,
                    tokenExpiresAt,
                    refreshToken,
                    refreshTokenExpiresAt,
                    isAuthenticated: true,
                    error: null,
                });
            },

            /**
             * Обновляет access-токен и время его истечения
             */
            setRefresh: (token, tokenExpiresAt) => {
                set({
                    token,
                    tokenExpiresAt,
                })
            },

            /**
             * Устанавливает данные пользователя
             */
            setUser: (username, type, fullname) => {
                set({
                    username,
                    type,
                    fullname
                })
            },

            /** Устанавливает ошибку */
            setError: (error) => set({error}),

            /** Показывает или скрывает модальное окно логина */
            setLoading: (isLoading) => set({isLoading}),

            /** Показывает или скрывает модальное окно логина */
            setShowLoginModal: (showLoginModal) => set({showLoginModal}),

            /**
             * Логин пользователя
             * @param {string} login - Логин
             * @param {string} password - Пароль
             * @returns {Promise<{success: boolean, error?: string}>}
             */
            login: async (login, password) => {
                const {setLoading, setToken, setError, setUser} = get();

                try {
                    setLoading(true);
                    setError(null);

                    const response = await authApiService.login({
                        "username": login,
                        "password": password
                    });

                    setToken(
                        response.access,
                        response.refresh,
                        response.access_expires_at,
                        response.refresh_expires_at
                    );

                    setUser(
                        response.user.username,
                        response.user.type,
                        response.user.fullname
                    );
                } catch (error) {
                    setError(error.message);
                    return {
                        success: false,
                        error: error.message,
                    };
                } finally {
                    setLoading(false);
                }

                return true;
            },

            /**
             * Обновление access-токена по refresh-токену
             * @param {string} refreshToken
             * @returns {Promise<{success: boolean, error?: string}>}
             */
            refresh: async (refreshToken) => {
                const {setRefresh, setError} = get();

                try {
                    setError(null);

                    const response = await authApiService.refresh(refreshToken);
                    setRefresh(response.access, response.access_expires_at);
                } catch (error) {
                    setError(error.message);
                    return false;
                }

                return true;
            },

            /**
             * Выход пользователя
             * Сбрасывает auth store и очищает данные Silant store
             */
            logout: () => {
                useSilantStore.getState().clearSilantStore();
                set(initialState);
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                token: state.token,
                refreshToken: state.refreshToken,
                tokenExpiresAt: state.tokenExpiresAt,
                refreshTokenExpiresAt: state.refreshTokenExpiresAt,
                isAuthenticated: state.isAuthenticated,
                type: state.type,
                fullname: state.fullname,
            })
        }
    )
);

export {useAuthStore};