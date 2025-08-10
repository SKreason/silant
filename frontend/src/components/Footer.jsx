import React from 'react';
import PropTypes from 'prop-types';
import '../styles/components/Footer.scss';

/**
 * Компонент подвала сайта, содержащий:
 * - Контактную информацию
 * - Копирайт
 *
 * @component
 * @example
 * return (
 *   <Footer />
 * )
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer" role="contentinfo">
            <div className="container">
                <div className="footer__content">
                    <div className="footer__content__contacts">
                        <a
                            href="tel:+78352201209"
                            className="footer__phone-link"
                            aria-label="Позвонить по телефону"
                        >
                            +7-8352-20-12-09
                        </a>
                        <span className="footer__separator">, </span>
                        <a
                            href="https://t.me/"
                            className="footer__telegram-link"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Написать в Telegram"
                        >
                            Telegram
                        </a>
                    </div>
                    <p className="footer__content__copyright">
                        &copy; {currentYear} Мой Силант. Все права защищены.
                    </p>
                </div>
            </div>
        </footer>
    );
};

Footer.propTypes = {
    /**
     * Дополнительные CSS-классы
     */
    className: PropTypes.string,

    /**
     * Дополнительные inline-стили
     */
    style: PropTypes.object,
};

export default React.memo(Footer);