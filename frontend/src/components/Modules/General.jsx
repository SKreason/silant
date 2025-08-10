import React, { useEffect, useState } from 'react';
import { useSilantStore } from '../../store/useSilantStore.js';
import GeneralTable from "../Tables/GeneralTable.jsx";
import "../../styles/components/Modules/General.scss";
import ClockIcon from "../Elements/ClockIcon.jsx";
import PropTypes from 'prop-types';

/**
 * Компонент для отображения основной информации о машинах, который:
 * - Загружает данные о машинах, справочниках и сервисных организациях
 * - Обрабатывает состояния загрузки и ошибки
 * - Отображает таблицу с основной информацией
 *
 * @component
 * @example
 * return (
 *   <General />
 * )
 */
const General = () => {
    const {
        getGeneralInfo,
        getReferenceDirectory,
        getServiceOrganizations,
        generalInfoLoading,
        generalInfo,
        generalInfoError,
        referenceDirectory,
        serviceOrganizations
    } = useSilantStore();

    const [loadingState, setLoadingState] = useState({
        general: false,
        references: false,
        services: false
    });

    const [errorState, setErrorState] = useState({
        general: null,
        references: null,
        services: null
    });

    // Загрузка данных при монтировании компонента
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingState(prev => ({...prev, general: true}));
                if (!generalInfo) {
                    await getGeneralInfo();
                }
            } catch (error) {
                setErrorState(prev => ({...prev, general: error}));
            } finally {
                setLoadingState(prev => ({...prev, general: false}));
            }

            try {
                setLoadingState(prev => ({...prev, references: true}));
                if (!referenceDirectory) {
                    await getReferenceDirectory();
                }
            } catch (error) {
                setErrorState(prev => ({...prev, references: error}));
            } finally {
                setLoadingState(prev => ({...prev, references: false}));
            }

            try {
                setLoadingState(prev => ({...prev, services: true}));
                if (!serviceOrganizations) {
                    await getServiceOrganizations();
                }
            } catch (error) {
                setErrorState(prev => ({...prev, services: error}));
            } finally {
                setLoadingState(prev => ({...prev, services: false}));
            }
        };

        loadData();
    }, [generalInfo, referenceDirectory, serviceOrganizations,
        getGeneralInfo, getReferenceDirectory, getServiceOrganizations]);

    // Состояние загрузки
    if (loadingState.general || generalInfoLoading) {
        return (
            <div className="general-loading" aria-live="polite" data-testid="loading-state">
                <ClockIcon aria-hidden="true" />
                <p className="loading-text">Загрузка данных...</p>
            </div>
        );
    }

    // Состояние ошибки
    if (errorState.general || generalInfoError) {
        const error = errorState.general || generalInfoError;
        return (
            <div className="general-loading" aria-live="assertive" data-testid="error-state">
                <p className="notification-text">
                    Произошла ошибка при загрузке данных: {error.message}
                </p>
                <button
                    onClick={() => {
                        setErrorState({general: null, references: null, services: null});
                        getGeneralInfo();
                    }}
                    className="retry-button"
                    aria-label="Попробовать снова"
                >
                    Повторить попытку
                </button>
            </div>
        );
    }

    // Состояние отсутствия данных
    if (!generalInfo) {
        return (
            <div className="general-loading" aria-live="polite" data-testid="no-data-state">
                <p className="notification-text">
                    Нет доступных данных
                </p>
                <button
                    onClick={getGeneralInfo}
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
        <main className="general-information" data-testid="general-content">
            <GeneralTable />
        </main>
    );
};

General.propTypes = {
    /**
     * Дополнительные CSS-классы
     */
    className: PropTypes.string,

    /**
     * Функция для тестирования, заменяющая стандартные методы загрузки
     */
    mockLoaders: PropTypes.shape({
        getGeneralInfo: PropTypes.func,
        getReferenceDirectory: PropTypes.func,
        getServiceOrganizations: PropTypes.func,
    }),
};

export default React.memo(General);