import React, { useEffect, useMemo, useState } from 'react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from "ag-grid-react";
import { myTheme } from "../../utils/agGridTheme.js";
import { useSilantStore } from "../../store/useSilantStore.js";
import { AG_GRID_LOCALE_RU_FLAT } from "../../utils/agGridLocale.js";
import "../../styles/components/Tables/MaintenanceTable.scss";
import MaintenanceDetailed from "../Detailed/MaintenanceDetailed.jsx";
import { filterInfoByVehicle } from "../../utils/dataFilters.js";
import MaintenanceForm from "../Forms/MaintenanceForm.jsx";

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Компонент таблицы технического обслуживания с возможностями:
 * - Фильтрации по машинам
 * - Просмотра детальной информации о ТО
 * - Добавления новых записей о ТО
 *
 * @component
 * @example
 * return (
 *   <MaintenanceTable />
 * )
 */
const MaintenanceTable = () => {
    const { maintenanceInfo, uniqueVehicles } = useSilantStore();

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isDetailedOpen, setDetailedOpen] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Фильтруем данные по выбранной машине
    const filteredMaintenanceInfo = useMemo(() => (
        filterInfoByVehicle(maintenanceInfo, selectedVehicle)
    ), [maintenanceInfo, selectedVehicle]);

    // Конфигурация колонок таблицы
    const columnDefs = useMemo(() => [
        {
            headerName: "Зав. № машины",
            field: "vehicle.number",
            minWidth: 100,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Вид ТО",
            field: "maintenance_type.name",
            minWidth: 100,
            filter: "agTextColumnFilter",
            tooltipField: "maintenance_type.name",
        },
        {
            headerName: "Дата проведения ТО",
            field: "maintenance_date",
            minWidth: 110,
            sort: 'asc',
            filter: "agDateColumnFilter",
            comparator: (date1, date2) => new Date(date1) - new Date(date2),
        },
        {
            headerName: "Наработка, м/час",
            field: "operating_time",
            minWidth: 110,
            filter: "agNumberColumnFilter",
        },
        {
            headerName: "№ заказ-наряда",
            field: "order_number",
            minWidth: 120,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Дата заказ-наряда",
            field: "order_date",
            minWidth: 140,
            filter: "agDateColumnFilter",
            comparator: (date1, date2) => new Date(date1) - new Date(date2),
        },
        {
            headerName: "Сервисная организация",
            field: "service.fullname",
            minWidth: 200,
            filter: "agTextColumnFilter",
            tooltipField: "service.fullname",
        }
    ], []);

    // Настройки колонок по умолчанию
    const defaultColDef = useMemo(() => ({
        resizable: false,
        wrapHeaderText: true,
        autoHeaderHeight: true,
        flex: 1,
        sortable: true,
        filter: true,
    }), []);

    const handleCreateMaintenance = () => setShowCreateForm(true);
    const handleCloseForm = () => setShowCreateForm(false);
    const handleCloseDetailed = () => setDetailedOpen(false);

    const handleRowClick = ({ data }) => {
        setSelectedRow(data);
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
        <div className="maintenance-info">
            <div className="maintenance-info__header">
                <div className="create">
                    <button
                        onClick={handleCreateMaintenance}
                        className="create-btn"
                        aria-label="Добавить информацию о ТО"
                    >
                        Добавить ТО
                    </button>
                </div>

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

            <div className="maintenance-info__table">
                <AgGridReact
                    rowData={filteredMaintenanceInfo}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    className="ag-theme-material"
                    headerHeight={60}
                    suppressMovableColumns
                    suppressRowHoverHighlight={false}
                    domLayout="autoHeight"
                    theme={myTheme}
                    defaultSortModel={[{ colId: 'maintenance_date', sort: 'asc' }]}
                    localeText={AG_GRID_LOCALE_RU_FLAT}
                    onRowClicked={handleRowClick}
                    rowSelection="single"
                    tooltipShowDelay={500}
                />
            </div>

            {/* Модальные окна */}
            {showCreateForm && (
                <MaintenanceForm onClose={handleCloseForm} />
            )}

            <MaintenanceDetailed
                isOpen={isDetailedOpen}
                onClose={handleCloseDetailed}
                data={selectedRow || {}}
            />
        </div>
    );
};

export default React.memo(MaintenanceTable);