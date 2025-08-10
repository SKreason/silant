import React, { useState } from 'react';
import { LuX } from "react-icons/lu";
import "../../styles/components/Detailed/GeneralDetailed.scss";
import VehicleIcon from "../../assets/images/MainPage/vehicle-icon.svg?react";
import TransmissionIcon from "../../assets/images/MainPage/transmission-icon.svg?react";
import EngineIcon from "../../assets/images/MainPage/engine-icon.svg?react";
import DriveAxleIcon from "../../assets/images/MainPage/drive-bridge-icon.svg?react";
import ControlBridgeIcon from "../../assets/images/MainPage/control-bridge-icon.svg?react";
import LocationIcon from "../../assets/images/MainPage/location-icon.svg?react";
import ShippingIcon from "../../assets/images/MainPage/shipping-icon.svg?react";
import ServiceIcon from "../../assets/images/MainPage/service-icon.svg?react";
import GeneralForm from "../Forms/GeneralForm.jsx";
import { useSilantStore } from "../../store/useSilantStore.js";
import { dataSilantApiService } from "../../service/dataSilantApiService.js";
import PropTypes from 'prop-types';

/**
 * Компонент детализированного просмотра информации о машине
 * с возможностью редактирования и удаления
 * @component
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isOpen - Флаг открытия модального окна
 * @param {Function} props.onClose - Функция закрытия модального окна
 * @param {Object} props.data - Данные о машине
 * @param {boolean} props.eligible - Флаг наличия прав на редактирование
 * @example
 * <GeneralDetailed
 *   isOpen={true}
 *   onClose={() => {}}
 *   data={vehicleData}
 *   eligible={true}
 * />
 */
const GeneralDetailed = ({ isOpen, onClose, data, eligible }) => {
    // Состояния компонента
    const [showEditForm, setShowEditForm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Получение метода удаления из хранилища
    const { deleteVehicle } = useSilantStore();

    if (!isOpen) return null;

    /**
     * Обработчик открытия формы редактирования
     */
    const editVehicle = () => {
        setShowEditForm(true);
    };

    /**
     * Обработчик удаления машины
     * @async
     */
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const confirmed = window.confirm(
                'Вы уверены, что хотите удалить эту запись о машине, ' +
                'а также все связанные записи ТО и рекламаций?'
            );
            if (confirmed) {
                const success = await dataSilantApiService.deleteVehicle(data.factory_number);
                if (success) {
                    deleteVehicle(data.id);
                    onClose();
                }
            }
        } catch (error) {
            window.alert('Ошибка при удалении');
            console.error('Ошибка при удалении машины:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Данные для отображения в карточках
    const vehicleDetails = [
        {
            icon: <VehicleIcon className="modal-content__item-icon" aria-hidden="true" />,
            label: "Техника",
            number: `Зав. № ${data.factory_number}`,
            value: `Модель: ${data.vehicle_model?.name}`,
            description: data.vehicle_model?.description,
        },
        {
            icon: <EngineIcon className="modal-content__item-icon" aria-hidden="true" />,
            label: "Двигатель",
            number: `Зав. № ${data.engine_number}`,
            value: `Модель: ${data.engine_model?.name}`,
            description: data.engine_model?.description,
        },
        {
            icon: <TransmissionIcon className="modal-content__item-icon" aria-hidden="true" />,
            label: "Трансмиссия",
            number: `Зав. № ${data.transmission_number}`,
            value: `Модель: ${data.transmission_model?.name}`,
            description: data.transmission_model?.description,
        },
        {
            icon: <DriveAxleIcon className="modal-content__item-icon" aria-hidden="true" />,
            label: "Ведущий мост",
            number: `Зав. № ${data.drive_bridge_number}`,
            value: `Модель: ${data.drive_bridge_model?.name}`,
            description: data.drive_bridge_model?.description,
        },
        {
            icon: <ControlBridgeIcon className="modal-content__item-icon" aria-hidden="true" />,
            label: "Управляемый мост",
            number: `Зав. № ${data.control_bridge_number}`,
            value: `Модель: ${data.control_bridge_model?.name}`,
            description: data.control_bridge_model?.description,
        },
        {
            icon: <LocationIcon className="modal-content__item-icon" aria-hidden="true" />,
            label: "Поставка",
            number: `Договор №, дата: ${data.supply_contract}`,
            value: `Грузополучатель: ${data.recipient}`,
            description: `Адрес: ${data.delivery_address}`,
        },
        {
            icon: <ShippingIcon className="modal-content__item-icon" aria-hidden="true" />,
            label: "Отгрузка",
            number: `Дата: ${data.shipping_date}`,
            value: `Комплектация: ${data.equipment}`,
            description: ``,
        },
        {
            icon: <ServiceIcon className="modal-content__item-icon" aria-hidden="true" />,
            label: "Клиент",
            value: data.client.fullname
        },
        {
            icon: <ServiceIcon className="modal-content__item-icon" aria-hidden="true" />,
            label: "Сервисная компания",
            value: data.service.fullname
        }
    ];

    return (
        <>
            {!showEditForm ? (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-container">
                        {/* Заголовок модального окна */}
                        <div className="modal-header">
                            <h2 className="modal-header__title">
                                Информация о машине
                            </h2>
                            <button
                                onClick={onClose}
                                className="modal-header__close-btn"
                                aria-label="Закрыть окно информации о машине"
                            >
                                <LuX aria-hidden="true" />
                            </button>
                        </div>

                        {/* Основное содержимое модального окна */}
                        <div className="modal-content">
                            <div className="modal-content__grid">
                                {vehicleDetails.map((item, index) => (
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
                                        <div className="modal-content__item-value">
                                            {item.value}
                                        </div>
                                        {item.description && (
                                            <div className="modal-content__item-desc">
                                                {item.description}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Кнопки действий (если пользователь имеет права) */}
                        {eligible && (
                            <div className="action-buttons">
                                <div className="edit-btn">
                                    <button
                                        onClick={editVehicle}
                                        aria-label="Редактировать информацию о машине"
                                    >
                                        Редактировать
                                    </button>
                                </div>
                                <div className="delete-btn">
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className={isDeleting ? "deleting" : ""}
                                        aria-label={isDeleting ? "Идет удаление" : "Удалить информацию о машине"}
                                    >
                                        {isDeleting ? 'Удаление...' : 'Удалить'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <GeneralForm
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

GeneralDetailed.propTypes = {
    /** Флаг открытия модального окна */
    isOpen: PropTypes.bool.isRequired,
    /** Функция закрытия модального окна */
    onClose: PropTypes.func.isRequired,
    /** Данные о машине */
    data: PropTypes.shape({
        id: PropTypes.number.isRequired,
        factory_number: PropTypes.string.isRequired,
        vehicle_model: PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string
        }),
        engine_model: PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string
        }),
        engine_number: PropTypes.string.isRequired,
        transmission_model: PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string
        }),
        transmission_number: PropTypes.string.isRequired,
        drive_bridge_model: PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string
        }),
        drive_bridge_number: PropTypes.string.isRequired,
        control_bridge_model: PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string
        }),
        control_bridge_number: PropTypes.string.isRequired,
        supply_contract: PropTypes.string.isRequired,
        recipient: PropTypes.string.isRequired,
        delivery_address: PropTypes.string.isRequired,
        shipping_date: PropTypes.string.isRequired,
        equipment: PropTypes.string.isRequired,
        client: PropTypes.shape({
            fullname: PropTypes.string.isRequired
        }).isRequired,
        service: PropTypes.shape({
            fullname: PropTypes.string.isRequired
        }).isRequired
    }).isRequired,
    /** Флаг наличия прав на редактирование */
    eligible: PropTypes.bool.isRequired
};

export default GeneralDetailed;