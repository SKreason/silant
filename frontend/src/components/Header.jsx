import React from 'react';
import PropTypes from 'prop-types';
import '../styles/components/Header.scss';
import Logo from '../assets/images/Header/Logotype-accent-RGB.svg?react';
import AltLogo from '../assets/images/Header/AltLogotype.svg?react';
import LoginForm from "./Forms/LoginForm.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import HeaderProfile from "./Elements/HeaderProfile.jsx";

/**
 * Компонент шапки сайта, содержащий:
 * - Логотипы
 * - Контактную информацию
 * - Кнопку авторизации / профиль пользователя
 * - Модальное окно авторизации
 *
 * @component
 * @example
 * return (
 *   <Header />
 * )
 */
const Header = () => {
    const {
        type,
        fullname,
        isAuthenticated,
        showLoginModal,
        setShowLoginModal
    } = useAuthStore();

    /**
     * Возвращает описание типа пользователя
     * @param {string} type - Тип пользователя (CL, SO, MR)
     * @returns {string} Описание типа пользователя
     */
    const getUserTypeDescription = (type) => {
        const typeDescriptions = {
            CL: 'Клиент',
            SO: 'Сервисная организация',
            MR: 'Менеджер'
        };
        return typeDescriptions[type] || '';
    };

    const handleModalClose = () => setShowLoginModal(false);
    const handleLoginClick = () => setShowLoginModal(true);

    return (
        <header className="header" role="banner">
            <div className="container">
                <div className="header__content">
                    {/* Верхняя часть шапки */}
                    <div className="header__content__top">
                        <Logo
                            className="header__content__logo"
                            aria-label="Логотип Мой Силант"
                        />
                        <AltLogo
                            className="header__content__alt-logo"
                            aria-label="Альтернативный логотип"
                        />

                        <div className="header__content__contacts">
                            <a href="tel:+78352201209" className="number">+7-8352-20-12-09</a>
                            <a
                                href="https://t.me/"
                                className="telegram-link"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Telegram
                            </a>
                        </div>

                        {isAuthenticated ? (
                            <HeaderProfile />
                        ) : (
                            <button
                                className="header__content__btn"
                                onClick={handleLoginClick}
                                aria-label="Открыть форму авторизации"
                            >
                                Авторизация
                            </button>
                        )}
                    </div>

                    {/* Информация о пользователе */}
                    {isAuthenticated && (
                        <div className="header__username" aria-live="polite">
                            <p className="description">Вы авторизованы как:</p>
                            <p className="user-data">
                                {getUserTypeDescription(type)} - {fullname}
                            </p>
                        </div>
                    )}

                    {/* Нижняя часть шапки */}
                    <div className="header__content__bottom">
                        <h1 className="header__content__title">
                            Электронная сервисная книжка "Мой Силант"
                        </h1>
                    </div>

                    {/* Модальное окно авторизации */}
                    {showLoginModal && (
                        <LoginForm handleModalClose={handleModalClose} />
                    )}
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    /**
     * Дополнительные классы для стилизации
     */
    className: PropTypes.string,
};

export default React.memo(Header);