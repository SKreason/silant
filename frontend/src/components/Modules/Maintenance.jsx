import React, { useEffect, useState } from 'react';
import { useSilantStore } from '../../store/useSilantStore.js';
import MaintenanceTable from "../Tables/MaintenanceTable.jsx";
import ClockIcon from "../Elements/ClockIcon.jsx";
import PropTypes from 'prop-types';
import "../../styles/components/Modules/Maintenance.scss";

/**
 * Компонент для отображения информации о техническом обслуживании, который:
 * - Загружает данные о ТО
 * - Обрабатывает состояния загрузки и ошибки
 * - Отображает таблицу с информацией о ТО
 *
 * @component
 * @example
 * return (
 *   <Maintenance />
 * )
 */
const Maintenance = () => {
    const {
        getMaintenanceInfo,
        maintenanceInfo,
        maintenanceInfoLoading,
        maintenanceInfoError
    } = useSilantStore();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadMaintenanceData = async () => {
            if (maintenanceInfo) return;

            try {
                setIsLoading(true);
                setError(null);
                await getMaintenanceInfo();
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadMaintenanceData();
    }, [maintenanceInfo, getMaintenanceInfo]);

    // Состояние загрузки
    if (isLoading || maintenanceInfoLoading) {
        return (
            <div
                className="maintenance-loading"
                aria-live="polite"
                data-testid="loading-state"
            >
                <ClockIcon aria-hidden="true" />
                <p className="loading-text">Загрузка данных о ТО...</p>
            </div>
        );
    }

    // Состояние ошибки
    if (error || maintenanceInfoError) {
        const displayError = error || maintenanceInfoError;
        return (
            <div
                className="maintenance-loading"
                aria-live="assertive"
                data-testid="error-state"
            >
                <p className="notification-text">
                    Ошибка загрузки данных о ТО: {displayError.message}
                </p>
                <button
                    onClick={() => {
                        setError(null);
                        getMaintenanceInfo();
                    }}
                    className="retry-button"
                    aria-label="Повторить загрузку данных о ТО"
                >
                    Повторить попытку
                </button>
            </div>
        );
    }

    // Состояние отсутствия данных
    if (!maintenanceInfo) {
        return (
            <div
                className="maintenance-loading"
                aria-live="polite"
                data-testid="no-data-state"
            >
                <p className="notification-text">
                    Данные о ТО отсутствуют
                </p>
                <button
                    onClick={getMaintenanceInfo}
                    className="retry-button"
                    aria-label="Загрузить данные о ТО"
                >
                    Загрузить данные
                </button>
            </div>
        );
    }

    // Основное состояние - отображение таблицы
    return (
        <main
            className="maintenance-information"
            data-testid="maintenance-content"
        >
            <MaintenanceTable />
        </main>
    );
};

Maintenance.propTypes = {
    /**
     * Дополнительные CSS-классы
     */
    className: PropTypes.string,

    /**
     * Функция для тестирования, заменяющая стандартный getMaintenanceInfo
     */
    mockGetMaintenanceInfo: PropTypes.func,
};

export default React.memo(Maintenance);
