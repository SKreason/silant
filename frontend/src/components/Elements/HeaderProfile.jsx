import React from 'react';
import { useAuthStore } from "../../store/useAuthStore.js";
import "../../styles/components/Elements/HeaderProfile.scss";

/**
 * Компонент профиля пользователя в шапке приложения.
 * Содержит кнопку выхода из системы.
 *
 * @component
 * @example
 * // Пример использования
 * <HeaderProfile />
 *
 * @description
 * Компонент использует хранилище аутентификации (useAuthStore)
 * для выполнения выхода пользователя из системы.
 */
const HeaderProfile = () => {
    // Получаем метод logout из хранилища аутентификации
    const { logout } = useAuthStore();

    /**
     * Обработчик выхода из системы
     * @async
     * @function handleLogout
     */
    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="profile-container" data-testid="header-profile">
            {/*
                Кнопка выхода из системы
                При клике вызывает handleLogout
            */}
            <button
                className="logout-btn"
                onClick={handleLogout}
                aria-label="Выйти из системы"
            >
                Выйти
            </button>
        </div>
    );
};

export default HeaderProfile;