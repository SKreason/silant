import React, { useState } from 'react';
import { LuX } from "react-icons/lu";
import MaintenanceIcon from "../../assets/images/MainPage/maintenance-icon.svg?react";
import DocsIcon from "../../assets/images/MainPage/info-icon.svg?react";
import ServiceIcon from "../../assets/images/MainPage/service-icon.svg?react";
import MaintenanceForm from "../Forms/MaintenanceForm.jsx";
import { useSilantStore } from "../../store/useSilantStore.js";
import { dataSilantApiService } from "../../service/dataSilantApiService.js";
import PropTypes from 'prop-types';

/**
 * Компонент детализированного просмотра информации о техническом обслуживании (ТО)
 * с возможностью редактирования и удаления записи
 * @component
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isOpen - Флаг открытия модального окна
 * @param {Function} props.onClose - Функция закрытия модального окна
 * @param {Object} props.data - Данные о техническом обслуживании
 * @example
 * <MaintenanceDetailed
 *   isOpen={true}
 *   onClose={() => {}}
 *   data={maintenanceData}
 * />
 */
const MaintenanceDetailed = ({ isOpen, onClose, data }) => {
    // Состояния компонента
    const [showEditForm, setShowEditForm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Получение метода удаления из хранилища
    const { deleteMaintenance } = useSilantStore();

    if (!isOpen) return null;

    /**
     * Обработчик открытия формы редактирования
     */
    const editMaintenance = () => {
        setShowEditForm(true);
    };

    /**
     * Обработчик удаления записи о ТО
     * @async
     */
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const confirmed = window.confirm('Вы уверены, что хотите удалить эту запись?');
            if (confirmed) {
                const success = await dataSilantApiService.deleteMaintenance(data.id);
                if (success) {
                    deleteMaintenance(data.id);
                    onClose();
                }
            }
        } catch (error) {
            window.alert('Ошибка при удалении');
            console.error('Ошибка при удалении записи ТО:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Данные для отображения в карточках
    const maintenanceDetails = [
        {
            icon: <MaintenanceIcon className="modal-content__item-icon" aria-hidden="true" />,
            label: "Тех. обслуживание",
            number: `Вид: ${data.maintenance_type?.name}`,
            value: `Дата: ${data.maintenance_date}`,
            description: data.maintenance_type?.description,
        },
        {
            icon: <DocsIcon className="modal-content__item-icon" aria-hidden="true" />,
            label: "Заказ-наряд",
            number: `№ ${data.order_number}`,
            value: `Дата: ${data.order_date}`,
            description: ``,
        },
        {
            icon: <ServiceIcon className="modal-content__item-icon" aria-hidden="true" />,
            label: "Доп. информация",
            number: `Наработка, м/час: ${data.operating_time}`,
            value: ``,
            description: `Организация, проводившая ТО: ${data.service.fullname}`,
        },
    ];

    return (
        <>
            {!showEditForm ? (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-container">
                        {/* Заголовок модального окна */}
                        <div className="modal-header">
                            <h2 className="modal-header__title">
                                Информация о ТО машины с зав.№ {data.vehicle.number}
                            </h2>
                            <button
                                onClick={onClose}
                                className="modal-header__close-btn"
                                aria-label="Закрыть окно информации о ТО"
                            >
                                <LuX aria-hidden="true" />
                            </button>
                        </div>

                        {/* Основное содержимое модального окна */}
                        <div className="modal-content">
                            <div className="modal-content__grid">
                                {maintenanceDetails.map((item, index) => (
                                    <div key={index} className="modal-content__item">
                                        {item.icon}
                                        <div className="modal-content__item-label">
                                            {item.label}
                                        </div>
                                        {item.number && (
                                            <div className="modal-content__item-number">
                                                {item.number}
                                            </div>
                                        )}
                                        {item.value && (
                                            <div className="modal-content__item-value">
                                                {item.value}
                                            </div>
                                        )}
                                        {item.description && (
                                            <div className="modal-content__item-desc">
                                                {item.description}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Кнопки действий */}
                        <div className="action-buttons">
                            <div className="edit-btn">
                                <button
                                    onClick={editMaintenance}
                                    aria-label="Редактировать информацию о ТО"
                                >
                                    Редактировать
                                </button>
                            </div>
                            <div className="delete-btn">
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className={isDeleting ? "deleting" : ""}
                                    aria-label={isDeleting ? "Идет удаление" : "Удалить информацию о ТО"}
                                >
                                    {isDeleting ? 'Удаление...' : 'Удалить'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <MaintenanceForm
                    initialData={data}
                    onClose={() => {
                        setShowEditForm(false);
                        onClose();
                    }}
                />
            )}
        </>
    );
};

MaintenanceDetailed.propTypes = {
    /** Флаг открытия модального окна */
    isOpen: PropTypes.bool.isRequired,
    /** Функция закрытия модального окна */
    onClose: PropTypes.func.isRequired,
    /** Данные о техническом обслуживании */
    data: PropTypes.shape({
        id: PropTypes.number.isRequired,
        vehicle: PropTypes.shape({
            number: PropTypes.string.isRequired
        }).isRequired,
        maintenance_type: PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string
        }),
        maintenance_date: PropTypes.string.isRequired,
        order_number: PropTypes.string.isRequired,
        order_date: PropTypes.string.isRequired,
        operating_time: PropTypes.number.isRequired,
        service: PropTypes.shape({
            fullname: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default MaintenanceDetailed;
