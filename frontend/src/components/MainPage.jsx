import React from 'react';
import PropTypes from 'prop-types';
import "../styles/components/MainPage.scss";
import { useAuthStore } from "../store/useAuthStore.js";
import UserData from "./Modules/UserData.jsx";
import PublicData from "./Modules/PublicData.jsx";

/**
 * Главная страница приложения, которая отображает:
 * - Публичную информацию для неавторизованных пользователей (PublicData)
 * - Персональную информацию для авторизованных пользователей (UserData)
 *
 * @component
 * @example
 * return (<MainPage />)
 */
const MainPage = () => {
    // Получаем только статус аутентификации из хранилища
    const { isAuthenticated } = useAuthStore();

    return (
        <section
            className="data-section"
            aria-label={isAuthenticated ? "Информация пользователя " : "Информация по запросу"}
            data-testid="main-page-section"
        >
            <div className="container">
                <div className="data-section__content">
                    {isAuthenticated ? <UserData /> : <PublicData />}
                </div>
            </div>
        </section>
    );
};

// Проверка типов пропсов
MainPage.propTypes = {
    /**
     * Дополнительные CSS-классы для корневого элемента
     */
    className: PropTypes.string,

    /**
     * Дополнительные стили для корневого элемента
     */
    style: PropTypes.object,
};

export default React.memo(MainPage);