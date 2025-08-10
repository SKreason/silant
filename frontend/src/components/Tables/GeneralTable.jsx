import React, { useEffect, useMemo, useState } from 'react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from "ag-grid-react";
import { myTheme } from "../../utils/agGridTheme.js";
import { useSilantStore } from "../../store/useSilantStore.js";
import { AG_GRID_LOCALE_RU_FLAT } from "../../utils/agGridLocale.js";
import "../../styles/components/Tables/GeneralTable.scss";
import GeneralDetailed from "../Detailed/GeneralDetailed.jsx";
import { useAuthStore } from "../../store/useAuthStore.js";
import GeneralForm from "../Forms/GeneralForm.jsx";

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Компонент таблицы основной информации о машинах с возможностями:
 * - Просмотра детальной информации
 * - Добавления новых машин (для менеджеров)
 * - Сортировки и фильтрации данных
 *
 * @component
 * @example
 * return (
 *   <GeneralTable />
 * )
 */
const GeneralTable = () => {
    const { generalInfo, getClients, clients } = useSilantStore();
    const { type } = useAuthStore();

    const [selectedRow, setSelectedRow] = useState(null);
    const [isDetailedOpen, setDetailedOpen] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Проверяем права пользователя
    const isManager = useMemo(() => type === 'MR', [type]);

    // Загружаем клиентов при необходимости
    useEffect(() => {
        if (isManager && !clients) {
            getClients();
        }
    }, [isManager, clients, getClients]);

    // Конфигурация колонок таблицы
    const columnDefs = useMemo(() => [
        {
            headerName: "Зав. № машины",
            field: "factory_number",
            minWidth: 100,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Модель техники",
            field: "vehicle_model.name",
            minWidth: 110,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Модель двигателя",
            field: "engine_model.name",
            minWidth: 110,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Зав. № двигателя",
            field: "engine_number",
            minWidth: 110,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Модель трансмиссии",
            field: "transmission_model.name",
            minWidth: 120,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Зав. № трансмиссии",
            field: "transmission_number",
            minWidth: 120,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Модель ведущего моста",
            field: "drive_bridge_model.name",
            minWidth: 110,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Зав. № ведущего моста",
            field: "drive_bridge_number",
            minWidth: 110,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Модель управляемого моста",
            field: "control_bridge_model.name",
            minWidth: 130,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Зав. № управляемого моста",
            field: "control_bridge_number",
            minWidth: 130,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Договор поставки №, дата",
            field: "supply_contract",
            minWidth: 170,
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Дата отгрузки с завода",
            field: "shipping_date",
            minWidth: 120,
            maxWidth: 180,
            sort: 'asc',
            comparator: (date1, date2) => new Date(date1) - new Date(date2),
        },
        {
            headerName: "Грузополучатель",
            field: "recipient",
            minWidth: 170,
            maxWidth: 180,
            filter: "agTextColumnFilter",
            tooltipField: "recipient",
        },
        {
            headerName: "Адрес поставки",
            field: "delivery_address",
            minWidth: 170,
            wrapText: true,
            filter: "agTextColumnFilter",
            tooltipField: "delivery_address",
        },
        {
            headerName: "Комплектация",
            field: "equipment",
            minWidth: 170,
            wrapText: true,
            valueFormatter: params =>
                params.value?.length > 45
                    ? `${params.value.slice(0, 45)}...`
                    : params.value,
            tooltipField: "equipment",
            filter: "agTextColumnFilter",
        },
        {
            headerName: "Клиент",
            field: "client.fullname",
            minWidth: 170,
            maxWidth: 180,
            filter: "agTextColumnFilter",
            tooltipField: "client.fullname",
        },
        {
            headerName: "Сервисная компания",
            field: "service.fullname",
            minWidth: 170,
            maxWidth: 180,
            filter: "agTextColumnFilter",
            tooltipField: "service.fullname",
        },
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

    const handleCreateVehicle = () => setShowCreateForm(true);
    const handleCloseForm = () => setShowCreateForm(false);
    const handleCloseDetailed = () => setDetailedOpen(false);

    const handleRowClick = ({ data }) => {
        setSelectedRow(data);
        setDetailedOpen(true);
    };

    return (
        <div className="general-info">
            <div className="general-info__header">
                {isManager && (
                    <div className="create">
                        <button
                            onClick={handleCreateVehicle}
                            className="create-btn"
                            aria-label="Добавить новую машину"
                        >
                            Добавить машину
                        </button>
                    </div>
                )}
            </div>

            <div className="general-info__table">
                <AgGridReact
                    rowData={generalInfo}
                    defaultColDef={defaultColDef}
                    columnDefs={columnDefs}
                    className="ag-theme-material"
                    headerHeight={60}
                    suppressMovableColumns
                    suppressRowHoverHighlight={false}
                    domLayout="autoHeight"
                    theme={myTheme}
                    defaultSortModel={[{ colId: 'shipping_date', sort: 'asc' }]}
                    localeText={AG_GRID_LOCALE_RU_FLAT}
                    onRowClicked={handleRowClick}
                    rowSelection="single"
                    tooltipShowDelay={500}
                />
            </div>

            {/* Модальные окна */}
            {showCreateForm && (
                <GeneralForm onClose={handleCloseForm} />
            )}

            <GeneralDetailed
                isOpen={isDetailedOpen}
                onClose={handleCloseDetailed}
                data={selectedRow || {}}
                eligible={isManager}
            />
        </div>
    );
};

export default React.memo(GeneralTable);