import React, { useState } from 'react';
import { LuX } from "react-icons/lu";
import MaintenanceIcon from "../../assets/images/MainPage/maintenance-icon.svg?react";
import ComplaintsIcon from "../../assets/images/MainPage/claims-icon.svg?react";
import DocsIcon from "../../assets/images/MainPage/info-icon.svg?react";
import ClaimsForm from "../Forms/ClaimsForm.jsx";
import { useSilantStore } from "../../store/useSilantStore.js";
import { dataSilantApiService } from "../../service/dataSilantApiService.js";
import PropTypes from 'prop-types';

/**
 * Компонент детализированного просмотра рекламации с возможностью редактирования и удаления
 * @component
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isOpen - Флаг открытия модального окна
 * @param {Function} props.onClose - Функция закрытия модального окна
 * @param {Object} props.data - Данные рекламации
 * @param {boolean} props.eligible - Флаг наличия прав на редактирование
 * @example
 * <ClaimsDetailed
 *   isOpen={true}
 *   onClose={() => {}}
 *   data={claimData}
 *   eligible={true}
 * />
 */
const ClaimsDetailed = ({ isOpen, onClose, data, eligible }) => {
    // Состояния компонента
    const [showEditForm, setShowEditForm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Получение метода удаления из хранилища
    const { deleteClaims } = useSilantStore();

    if (!isOpen) return null;

    /**
     * Обработчик открытия формы редактирования
     */
    const editClaims = () => {
        setShowEditForm(true);
    };

    /**
     * Обработчик удаления рекламации
     * @async
     */
    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const confirmed = window.confirm('Вы уверены, что хотите удалить эту запись?');
            if (confirmed) {
                const success = await dataSilantApiService.deleteClaims(data.id);
                if (success) {
                    deleteClaims(data.id);
                    onClose();
                }
            }
        } catch (error) {
            window.alert('Ошибка при удалении');
            console.error('Ошибка при удалении рекламации:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Данные для отображения в карточках
    const claimDetails = [
        {
            icon: <MaintenanceIcon className="modal-content__item-icon" aria-hidden="true" />,
            label: "Отказ",
            number: `Дата: ${data.failure_date}`,
            value: `Узел: ${data.node_fail?.name}`,
            description: `Описание отказа: ${data.fail_description}.
                    Описание узла: ${data.node_fail?.description}`,
        },
        {
            icon: <ComplaintsIcon className="modal-content__item-icon" aria-hidden="true" />,
            label: "Восстановление",
            number: `Дата: ${data.recovery_date}`,
            value: `Способ восстановления: ${data.method_recovery?.name}`,
            description: `Описание: ${data.method_recovery?.description} 
                    ${data.spare_parts ? 'Используемые запасные части: ' + data.spare_parts : ''}`,
        },
        {
            icon: <DocsIcon className="modal-content__item-icon" aria-hidden="true" />,
            label: "Доп. информация",
            number: `Наработка, м/час: ${data.operating_time}`,
            value: `Время простоя техники: ${data.downtime}`,
            description: `Сервисная компания: ${data.service.fullname}`,
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
                                Рекламация на машину с зав.№ {data.vehicle.number}
                            </h2>
                            <button
                                onClick={onClose}
                                className="modal-header__close-btn"
                                aria-label="Закрыть окно рекламации"
                            >
                                <LuX aria-hidden="true" />
                            </button>
                        </div>

                        {/* Основное содержимое модального окна */}
                        <div className="modal-content">
                            <div className="modal-content__grid">
                                {claimDetails.map((item, index) => (
                                    <div key={index} className="modal-content__item">
                                        {item.icon}
                                        <div className="modal-content__item-label">
                                            {item.label}
                                        </div>
                                        <div className="modal-content__item-number">
                                            {item.number}
                                        </div>
                                        <div className="modal-content__item-value">
                                            {item.value}
                                        </div>
                                        <div className="modal-content__item-desc">
                                            {item.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Кнопки действий (если пользователь имеет права) */}
                        {eligible && (
                            <div className="action-buttons">
                                <div className="edit-btn">
                                    <button
                                        onClick={editClaims}
                                        aria-label="Редактировать рекламацию"
                                    >
                                        Редактировать
                                    </button>
                                </div>
                                <div className="delete-btn">
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className={isDeleting ? "deleting" : ""}
                                        aria-label={isDeleting ? "Идет удаление" : "Удалить рекламацию"}
                                    >
                                        {isDeleting ? 'Удаление...' : 'Удалить'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <ClaimsForm
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

ClaimsDetailed.propTypes = {
    /** Флаг открытия модального окна */
    isOpen: PropTypes.bool.isRequired,
    /** Функция закрытия модального окна */
    onClose: PropTypes.func.isRequired,
    /** Данные рекламации */
    data: PropTypes.shape({
        id: PropTypes.number.isRequired,
        vehicle: PropTypes.shape({
            number: PropTypes.string.isRequired
        }).isRequired,
        failure_date: PropTypes.string.isRequired,
        node_fail: PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string
        }),
        fail_description: PropTypes.string,
        recovery_date: PropTypes.string.isRequired,
        method_recovery: PropTypes.shape({
            name: PropTypes.string,
            description: PropTypes.string
        }),
        spare_parts: PropTypes.string,
        operating_time: PropTypes.number.isRequired,
        downtime: PropTypes.string.isRequired,
        service: PropTypes.shape({
            fullname: PropTypes.string.isRequired
        }).isRequired
    }).isRequired,
    /** Флаг наличия прав на редактирование */
    eligible: PropTypes.bool.isRequired
};

export default ClaimsDetailed;