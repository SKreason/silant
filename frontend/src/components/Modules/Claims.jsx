import React, { useEffect } from 'react';
import { useSilantStore } from '../../store/useSilantStore.js';
import ClaimsTable from "../Tables/ClaimsTable.jsx";
import "../../styles/components/Modules/Claims.scss";
import ClockIcon from "../Elements/ClockIcon.jsx";
import PropTypes from 'prop-types';

/**
 * Компонент для отображения раздела рекламаций, который:
 * - Загружает данные о рекламациях
 * - Обрабатывает состояния загрузки и ошибки
 * - Отображает таблицу рекламаций
 *
 * @component
 * @example
 * return (
 *   <Claims />
 * )
 */
const Claims = () => {
    const {
        getClaimsInfo,
        claimsInfo,
        claimsInfoError,
        claimsInfoLoading
    } = useSilantStore();

    // Загружаем данные при монтировании компонента
    useEffect(() => {
        if (!claimsInfo && !claimsInfoLoading && !claimsInfoError) {
            getClaimsInfo();
        }
    }, [claimsInfo, claimsInfoLoading, claimsInfoError, getClaimsInfo]);

    // Состояние загрузки
    if (claimsInfoLoading) {
        return (
            <div className="claims-loading" aria-live="polite" data-testid="loading-state">
                <ClockIcon aria-hidden="true" />
                <p className="loading-text">Загрузка данных...</p>
            </div>
        );
    }

    // Состояние ошибки
    if (claimsInfoError) {
        return (
            <div className="claims-loading" aria-live="assertive" data-testid="error-state">
                <p className="notification-text">
                    Произошла ошибка при загрузке данных: {claimsInfoError.message}
                </p>
                <button
                    onClick={getClaimsInfo}
                    className="retry-button"
                    aria-label="Попробовать снова"
                >
                    Повторить попытку
                </button>
            </div>
        );
    }

    // Состояние отсутствия данных
    if (!claimsInfo) {
        return (
            <div className="claims-loading" aria-live="polite" data-testid="no-data-state">
                <p className="notification-text">
                    Нет доступных данных
                </p>
                <button
                    onClick={getClaimsInfo}
                    className="retry-button"
                    aria-label="Загрузить данные"
                >
                    Загрузить данные
                </button>
            </div>
        );
    }

    // Основное состояние - отображение таблицы
    return (
        <main className="claims-information" data-testid="claims-content">
            <ClaimsTable />
        </main>
    );
};

Claims.propTypes = {
    /**
     * Дополнительные CSS-классы
     */
    className: PropTypes.string,

    /**
     * Функция для тестирования, заменяющая стандартный getClaimsInfo
     */
    mockGetClaimsInfo: PropTypes.func,
};

export default React.memo(Claims);