import React, {useEffect, useState} from 'react';
import {useSilantStore} from "../../store/useSilantStore.js";
import {useForm} from "react-hook-form";
import {dataSilantApiService} from "../../service/dataSilantApiService.js";
import {getUniqueTypes} from "../../utils/dataFilters.js";

/**
 * Компонент формы для добавления или редактирования записи в справочнике
 *
 * @param {Object} props - Свойства компонента
 * @param {Object} [props.initialData] - Начальные данные для редактирования (если есть - режим редактирования)
 * @param {Function} props.onClose - Функция закрытия формы
 * @param {Function} props.setSelectedType - Функция установки выбранного типа
 * @param {Function} props.setSelectedName - Функция установки выбранного имени
 * @returns {JSX.Element} - Возвращает JSX элемент формы
 */
const ReferenceDirectoryForm = ({ initialData, onClose, setSelectedType, setSelectedName }) => {
    // Инициализация формы с помощью react-hook-form
    const {
        register,
        formState: { errors, isSubmitting},
        handleSubmit,
    } = useForm({
        mode: "onSubmit",
        defaultValues: {
            refType: initialData?.type || "",     // Тип справочника
            refName: initialData?.name || "",    // Название
            refDescription: initialData?.description || "", // Описание
        }
    });

    // Получение методов работы со справочником из хранилища
    const {
        referenceDirectory,
        updateReferenceDirectory,
        addReferenceDirectory,
    } = useSilantStore();

    // Состояние для хранения уникальных типов справочника
    const [refTypes, setRefTypes] = useState(getUniqueTypes(referenceDirectory));

    // Эффект для обновления списка типов при изменении справочника
    useEffect(() => {
        setRefTypes(getUniqueTypes(referenceDirectory));
    }, [referenceDirectory]);

    /**
     * Обработчик отправки формы
     * @param {Object} values - Значения формы
     * @returns {Promise<void>}
     */
    const onSubmit = async (values) => {
        try {
            if (initialData) {
                // Режим редактирования существующей записи
                const response = await dataSilantApiService.updateReferenceDirectory(
                    initialData?.id,
                    values
                );
                updateReferenceDirectory(response);
            } else {
                // Режим добавления новой записи
                const response = await dataSilantApiService.createReferenceDirectory(values);
                addReferenceDirectory(response);
            }

            // Сброс выбранных значений и закрытие формы
            setSelectedName('');
            setSelectedType('');
            onClose?.();
        } catch (error) {
            console.error('Ошибка при сохранении справочника:', error);
        }
    };

    return (
        <div className="modal-overlay">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-container">
                    <div className="form-header">
                        <div className="form-title">
                            {initialData ? 'Редактирование справочника' : 'Добавление справочника'}
                        </div>
                    </div>

                    <div className="form-body reference">
                        {/* Поле выбора типа справочника */}
                        <div className="form-group">
                            <label htmlFor="refType">
                                Тип справочника
                            </label>
                            <div className="input-wrapper">
                                <select
                                    id="select-refType"
                                    className="select-refType"
                                    {...register("refType", {
                                        required: "Обязательное поле",
                                    })}
                                >
                                    <option value="">Тип справочника</option>
                                    {refTypes.map(type => (
                                        <option key={type.type} value={type.type}>
                                            {type.display}
                                        </option>
                                    ))}
                                </select>
                                <div className="error-container">
                                    {errors.refType && (
                                        <span className="error-message">{errors.refType.message}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Поле ввода названия */}
                        <div className="form-group">
                            <label htmlFor="refName">
                                Название
                            </label>
                            <div className="input-wrapper">
                                <input
                                    id="refName"
                                    {...register("refName", {
                                        required: "Обязательное поле",
                                    })}
                                />
                                <div className="error-container">
                                    {errors.refName && (
                                        <span className="error-message">{errors.refName.message}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Поле ввода описания */}
                        <div className="form-group">
                            <label htmlFor="refDescription">
                                Описание
                            </label>
                            <div className="input-wrapper">
                                <textarea
                                    id="refDescription"
                                    {...register("refDescription", {
                                        required: "Обязательное поле",
                                    })}
                                />
                                <div className="error-container">
                                    {errors.refDescription && (
                                        <span className="error-message">{errors.refDescription.message}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Кнопки отправки формы и отмены */}
                    <div className="submit-group">
                        <button
                            type='submit'
                            className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="close-button"
                        >
                            Отменить
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ReferenceDirectoryForm;