import React, { useEffect, useMemo, useState } from 'react';
import { LuX } from "react-icons/lu";
import { useSilantStore } from "../../store/useSilantStore.js";
import { filterNamesByType, getUniqueTypes } from "../../utils/dataFilters.js";
import "../../styles/components/Modules/ReferenceDirectory.scss";
import { useAuthStore } from "../../store/useAuthStore.js";
import ReferenceDirectoryForm from "../Forms/ReferenceDirectoryForm.jsx";
import { dataSilantApiService } from "../../service/dataSilantApiService.js";
import PropTypes from 'prop-types';

/**
 * Компонент модального окна для работы со справочниками.
 * Позволяет просматривать, редактировать, удалять и добавлять записи справочников.
 * Доступ к редактированию ограничен для пользователей с определенными правами.
 *
 * @component
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.isOpen - Флаг открытия модального окна
 * @param {Function} props.onClose - Функция закрытия модального окна
 */
const ReferenceDirectory = ({ isOpen, onClose }) => {
    const {
        referenceDirectory,
        deleteReferenceDirectory
    } = useSilantStore();

    const { type } = useAuthStore();

    // Состояния компонента
    const [selectedType, setSelectedType] = useState('');
    const [selectedName, setSelectedName] = useState('');
    const [eligibleUser, setEligibleUser] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Мемоизированные данные
    const refTypes = useMemo(() => {
        return referenceDirectory ? getUniqueTypes(referenceDirectory) : [];
    }, [referenceDirectory]);

    const filteredReferenceDirectory = useMemo(() => {
        return selectedType ? filterNamesByType(referenceDirectory, selectedType) : null;
    }, [selectedType, referenceDirectory]);

    const currentReferenceDirectory = useMemo(() => {
        if (!selectedName || !filteredReferenceDirectory) return null;
        return filteredReferenceDirectory.find(item => item.name === selectedName);
    }, [selectedName, filteredReferenceDirectory]);

    // Проверка прав пользователя
    useEffect(() => {
        setEligibleUser(type === 'MR');
    }, [type]);

    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
        setSelectedName('');
    };

    const handleNameChange = (event) => {
        setSelectedName(event.target.value);
    };

    const editReferenceDirectory = () => {
        if (!currentReferenceDirectory) return;

        setInitialData({
            id: currentReferenceDirectory.id,
            type: selectedType,
            name: currentReferenceDirectory.name,
            description: currentReferenceDirectory.description,
        });
        setShowEditForm(true);
    };

    const createReferenceDirectory = () => {
        setInitialData(null);
        setShowEditForm(true);
    };

    const handleDelete = async () => {
        if (!currentReferenceDirectory) return;

        setIsDeleting(true);
        try {
            const confirmed = window.confirm('Вы уверены, что хотите удалить эту запись?');
            if (confirmed) {
                const success = await dataSilantApiService.deleteReferenceDirectory(currentReferenceDirectory.id);
                if (success) {
                    deleteReferenceDirectory(currentReferenceDirectory.id);
                    onClose();
                    setSelectedName('');
                    setSelectedType('');
                }
            }
        } catch (error) {
            window.alert('Ошибка при удалении');
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {!showEditForm ? (
                <div className="modal-overlay">
                    <div className="modal-container reference">
                        <div className="modal-header">
                            <h2 className="modal-header__title">
                                Справочники
                            </h2>
                            <button
                                onClick={onClose}
                                className="modal-header__close-btn"
                                aria-label="Закрыть"
                            >
                                <LuX/>
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="modal-content__wrapper">
                                <div className="reference">
                                    <div className="reference__type">
                                        <label className="label">
                                            Тип справочника
                                        </label>
                                        <select
                                            value={selectedType}
                                            onChange={handleTypeChange}
                                            aria-label="Выберите тип справочника"
                                        >
                                            <option value="">Выберите тип</option>
                                            {refTypes.map(type => (
                                                <option key={type.type} value={type.type}>
                                                    {type.display}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="reference__name">
                                        <label className="label">
                                            Название справочника
                                        </label>
                                        <select
                                            value={selectedName}
                                            onChange={handleNameChange}
                                            disabled={!selectedType}
                                            aria-label="Выберите название справочника"
                                        >
                                            <option value="">Выберите название</option>
                                            {filteredReferenceDirectory?.map(name => (
                                                <option key={name.name} value={name.name}>
                                                    {name.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {selectedName && (
                                        <div className="reference__description">
                                            <label className="label">
                                                Описание
                                            </label>
                                            <p className="description">
                                                {currentReferenceDirectory?.description}
                                            </p>
                                            {eligibleUser && (
                                                <div className="action-buttons">
                                                    <div className="edit-btn">
                                                        <button
                                                            onClick={editReferenceDirectory}
                                                            aria-label="Редактировать запись"
                                                        >
                                                            Редактировать
                                                        </button>
                                                    </div>
                                                    <div className="delete-btn">
                                                        <button
                                                            onClick={handleDelete}
                                                            disabled={isDeleting}
                                                            className={isDeleting ? "deleting" : ""}
                                                            aria-label={isDeleting ? "Идет удаление" : "Удалить запись"}
                                                        >
                                                            {isDeleting ? 'Удаление...' : 'Удалить'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {eligibleUser && (
                            <div className="action-buttons">
                                <div className="edit-btn">
                                    <button
                                        onClick={createReferenceDirectory}
                                        aria-label="Добавить новый справочник"
                                    >
                                        Добавить справочник
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <ReferenceDirectoryForm
                    initialData={initialData}
                    onClose={() => {
                        setShowEditForm(false);
                        onClose();
                    }}
                    setSelectedType={setSelectedType}
                    setSelectedName={setSelectedName}
                />
            )}
        </>
    );
};

ReferenceDirectory.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default React.memo(ReferenceDirectory);