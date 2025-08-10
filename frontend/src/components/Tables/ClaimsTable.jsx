import React, { useEffect, useMemo, useState } from 'react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from "ag-grid-react";
import { myTheme } from "../../utils/agGridTheme.js";
import { useSilantStore } from "../../store/useSilantStore.js";
import { AG_GRID_LOCALE_RU_FLAT } from "../../utils/agGridLocale.js";
import "../../styles/components/Tables/ClaimsTable.scss";
import ClaimsDetailed from "../Detailed/ClaimsDetailed.jsx";
import { filterInfoByVehicle } from "../../utils/dataFilters.js";
import ClaimsForm from "../Forms/ClaimsForm.jsx";
import { useAuthStore } from "../../store/useAuthStore.js";

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Компонент таблицы рекламаций с возможностями:
 * - Фильтрации по машинам
 * - Просмотра деталей рекламации
 * - Создания новых рекламаций (для авторизованных пользователей)
 *
 * @component
 * @example
 * return (
 *   <ClaimsTable />
 * )
 */
const ClaimsTable = () => {
    const { claimsInfo, uniqueVehicles } = useSilantStore();
    const { type } = useAuthStore();

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isDetailedOpen, setDetailedOpen] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Определяем, может ли пользователь создавать рекламации
    const isEligibleUser = useMemo(() => type === 'MR' || type === 'SO', [type]);

    // Фильтруем данные по выбранной машине
    const filteredClaimsInfo = useMemo(() => (
        filterInfoByVehicle(claimsInfo, selectedVehicle)
    ), [claimsInfo, selectedVehicle]);

    // Конфигурация колонок таблицы
    const columnDefs = useMemo(() => [
        {
            headerName: "Зав. № машины",
            field: "vehicle.number",
            minWidth: 100,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Дата отказа",
            field: "failure_date",
            minWidth: 100,
            sort: 'asc',
            filter: "agTextColumnFilter",
            comparator: (date1, date2) => new Date(date1) - new Date(date2),
        },
        {
            headerName: "Наработка, м/час",
            field: "operating_time",
            minWidth: 100,
            filter: "agNumberColumnFilter",
        },
        {
            headerName: "Узел отказа",
            field: "node_fail.name",
            minWidth: 110,
            filter: "agTextColumnFilter",
            wrapText: true,
        },
        {
            headerName: "Описание отказа",
            field: "fail_description",
            minWidth: 130,
            filter: "agTextColumnFilter",
            wrapText: true,
        },
        {
            headerName: "Способ восстановления",
            field: "method_recovery.name",
            minWidth: 140,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Используемые запасные части",
            field: "spare_parts",
            minWidth: 130,
            filter: "agTextColumnFilter",
            wrapText: true,
        },
        {
            headerName: "Дата восстановления",
            field: "recovery_date",
            minWidth: 140,
            filter: "agTextColumnFilter",
            comparator: (date1, date2) => new Date(date1) - new Date(date2),
        },
        {
            headerName: "Время простоя техники",
            field: "downtime",
            minWidth: 100,
            filter: "agNumberColumnFilter",
        },
        {
            headerName: "Сервисная компания",
            field: "service.fullname",
            minWidth: 200,
            filter: "agTextColumnFilter",
        }
    ], []);

    // Настройки колонок по умолчанию
    const defaultColDef = useMemo(() => ({
        resizable: false,
        wrapHeaderText: true,
        autoHeaderHeight: true,
        flex: 1,
        sortable: true,
    }), []);

    const handleCreateClaim = () => setShowCreateForm(true);
    const handleCloseForm = () => setShowCreateForm(false);
    const handleCloseDetailed = () => setDetailedOpen(false);

    const handleRowClick = (params) => {
        setSelectedRow(params.data);
        setDetailedOpen(true);
    };

    const handleVehicleChange = (e) => {
        const value = e.target.value;
        setSelectedVehicle(
            value === ''
                ? null
                : uniqueVehicles.find(v => v.id === Number(value)) || null
        );
    };

    // Сбрасываем выбранную машину, если она больше не существует
    useEffect(() => {
        if (selectedVehicle && !uniqueVehicles.some(v => v.id === selectedVehicle.id)) {
            setSelectedVehicle(null);
        }
    }, [uniqueVehicles, selectedVehicle]);

    return (
        <div className="claims-info">
            <div className={`claims-info__header ${!isEligibleUser ? 'align-right' : ''}`}>
                {isEligibleUser && (
                    <div className="create">
                        <button
                            onClick={handleCreateClaim}
                            className="create-btn"
                            aria-label="Добавить новую рекламацию"
                        >
                            Добавить рекламацию
                        </button>
                    </div>
                )}

                <select
                    value={selectedVehicle?.id || ''}
                    onChange={handleVehicleChange}
                    className="vehicle-selector"
                    aria-label="Фильтр по машинам"
                >
                    <option value="">Все машины</option>
                    {uniqueVehicles?.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                            Зав. № {vehicle.number}
                        </option>
                    ))}
                </select>
            </div>

            <div className="claims-info__table">
                <AgGridReact
                    rowData={filteredClaimsInfo}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    className="ag-theme-material"
                    headerHeight={60}
                    suppressMovableColumns
                    suppressRowHoverHighlight={false}
                    domLayout="autoHeight"
                    theme={myTheme}
                    defaultSortModel={[{ colId: 'failure_date', sort: 'asc' }]}
                    localeText={AG_GRID_LOCALE_RU_FLAT}
                    onRowClicked={handleRowClick}
                    rowSelection="single"
                />
            </div>

            {/* Модальные окна */}
            {showCreateForm && (
                <ClaimsForm onClose={handleCloseForm} />
            )}

            <ClaimsDetailed
                isOpen={isDetailedOpen}
                onClose={handleCloseDetailed}
                data={selectedRow || {}}
                eligible={isEligibleUser}
            />
        </div>
    );
};

export default React.memo(ClaimsTable);