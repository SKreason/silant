import React, { useMemo, useState } from 'react';
import { useForm } from "react-hook-form";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, themeMaterial } from 'ag-grid-community';
import { dataSilantApiService } from "../../service/dataSilantApiService.js";
import DocsIcon from "../../assets/images/MainPage/info-icon.svg?react";
import ClockIcon from "../Elements/ClockIcon.jsx";
import "../../styles/components/Modules/PublicData.scss";
import PropTypes from 'prop-types';

// Регистрация модулей AG Grid
ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Компонент для отображения публичной информации о технике.
 * Позволяет искать технику по заводскому номеру и отображает её характеристики.
 *
 * @component
 * @example
 * return <PublicData />
 */
const PublicData = () => {
    // Состояния компонента
    const [vehicleData, setVehicleData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Конфигурация AG Grid
    const defaultColDef = useMemo(() => ({
        resizable: false,
        wrapHeaderText: true,
        autoHeaderHeight: true,
        sortable: false,
        flex: 1,
    }), []);

    const colDefs = useMemo(() => [
        {
            headerName: "Зав. № машины",
            field: "factory_number",
            minWidth: 100
        },
        {
            headerName: "Модель техники",
            field: "vehicle_model",
            minWidth: 100
        },
        {
            headerName: "Модель двигателя",
            field: "engine_model",
            minWidth: 110
        },
        {
            headerName: "Зав. № двигателя",
            field: "engine_number",
            minWidth: 110
        },
        {
            headerName: "Модель трансмиссии",
            field: "transmission_model",
            minWidth: 120
        },
        {
            headerName: "Зав. № трансмиссии",
            field: "transmission_number",
            minWidth: 140
        },
        {
            headerName: "Модель ведущего моста",
            field: "drive_bridge_model",
            minWidth: 140
        },
        {
            headerName: "Зав. № ведущего моста",
            field: "drive_bridge_number",
            minWidth: 150
        },
        {
            headerName: "Модель управляемого моста",
            field: "control_bridge_model",
            minWidth: 170
        },
        {
            headerName: "Зав. № управляемого моста",
            field: "control_bridge_number",
            minWidth: 170
        },
    ], []);

    const gridTheme = useMemo(() => themeMaterial.withParams({
        headerColumnBorder: { color: '#949494' },
        headerColumnBorderHeight: '100%',
        headerRowBorder: false,
        headerBackgroundColor: "#163E6C",
        headerTextColor: "#FFFFFF",
        columnBorder: true,
        borderColor: "#949494",
        wrapperBorder: true
    }), []);

    // Настройка формы
    const {
        register,
        formState: { errors },
        handleSubmit,
        watch
    } = useForm({
        mode: "onSubmit",
        defaultValues: { factoryNumber: "" }
    });

    const factoryNumberValue = watch("factoryNumber");

    /**
     * Обработчик поиска техники
     * @param {Object} data - Данные формы {factoryNumber: string}
     */
    const handleSearch = async (data) => {
        if (isLoading) return;

        setIsLoading(true);
        setError(null);
        setVehicleData(null);

        try {
            const response = await dataSilantApiService.getVehicle(data.factoryNumber);
            setVehicleData(response);
        } catch (err) {
            setError(err?.message || "Ошибка при загрузке данных. Попробуйте позже.");
            console.error("Search error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="public-info" data-testid="public-info-component">
            <h1 className="public-info__title">
                Проверьте комплектацию и технические характеристики техники Силант
            </h1>

            {/* Форма поиска */}
            <form
                onSubmit={handleSubmit(handleSearch)}
                className="public-info__form"
                aria-label="Форма поиска техники"
            >
                <DocsIcon className="docs-icon" aria-hidden="true" />
                <div className="form-group">
                    <div className="input-wrapper">
                        <input
                            id="factoryNumber"
                            type="text"
                            placeholder="Заводской номер"
                            className={factoryNumberValue && errors.factoryNumber ? "error" : ""}
                            aria-invalid={!!errors.factoryNumber}
                            aria-describedby="factoryNumberError"
                            {...register("factoryNumber", {
                                required: "Обязательное поле",
                            })}
                        />
                        <div id="factoryNumberError" className="error-container">
                            {errors.factoryNumber && (
                                <span className="error-message" role="alert">
                                    {errors.factoryNumber.message}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    className="submit-btn"
                    disabled={isLoading}
                    aria-label={isLoading ? "Идет поиск" : "Найти технику"}
                >
                    {isLoading ? 'Поиск...' : 'Поиск'}
                </button>
            </form>

            {/* Состояние загрузки */}
            {isLoading && (
                <div
                    className="public-info__loading"
                    aria-live="polite"
                    data-testid="loading-indicator"
                >
                    <ClockIcon aria-hidden="true" />
                    <p className="loading-text">Загрузка данных...</p>
                </div>
            )}

            {/* Таблица с результатами */}
            {vehicleData && !isLoading && (
                <div
                    className="public-info__table"
                    aria-live="polite"
                    data-testid="vehicle-data-table"
                >
                    <AgGridReact
                        rowData={[vehicleData]}
                        defaultColDef={defaultColDef}
                        columnDefs={colDefs}
                        className="ag-theme-material"
                        headerHeight={50}
                        rowHeight={30}
                        suppressMovableColumns
                        suppressRowHoverHighlight={false}
                        domLayout="autoHeight"
                        theme={gridTheme}
                        aria-label="Технические характеристики"
                    />
                </div>
            )}

            {/* Сообщение об ошибке */}
            {error && (
                <div
                    className="public-info__error"
                    role="alert"
                    aria-live="assertive"
                    data-testid="error-message"
                >
                    {error}
                </div>
            )}
        </div>
    );
};

PublicData.propTypes = {
    /**
     * Мок-функция для тестирования (заменяет dataSilantApiService.getVehicle)
     */
    mockGetVehicle: PropTypes.func,
};

export default React.memo(PublicData);