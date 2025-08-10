import React, { useMemo } from 'react';
import { useSilantStore } from "../../store/useSilantStore.js";
import { Controller, useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import ru from "date-fns/locale/ru";
import { dataSilantApiService } from "../../service/dataSilantApiService.js";

/**
 * Компонент формы для создания/редактирования рекламаций
 * @component
 * @param {Object} props - Свойства компонента
 * @param {Object} [props.initialData] - Начальные данные для редактирования (если есть)
 * @param {Function} [props.onClose] - Функция закрытия формы
 * @returns {JSX.Element} Форма для работы с рекламациями
 */
const ClaimsForm = ({ initialData, onClose }) => {
    // Получаем необходимые данные и методы из хранилища
    const {
        referenceDirectory,
        uniqueVehicles,
        serviceOrganizations,
        updateClaims,
        addClaims
    } = useSilantStore();

    // Фильтруем справочники для узлов отказа и методов восстановления
    const nodeFail = useMemo(() => (
        referenceDirectory.filter(item => item.ref_type === 'node_fail')
    ), [referenceDirectory]);

    const methodsRecovery = useMemo(() => (
        referenceDirectory.filter(item => item.ref_type === 'method_recovery')
    ), [referenceDirectory]);

    // Инициализация формы с react-hook-form
    const {
        control,
        register,
        formState: { errors, isSubmitting },
        handleSubmit,
        watch
    } = useForm({
        mode: "onSubmit",
        defaultValues: {
            vehicle: initialData?.vehicle.id || "",
            failureDate: initialData ? new Date(initialData.failure_date) : "",
            operatingTime: initialData?.operating_time || "",
            nodeFail: initialData?.node_fail?.id || "",
            failDescription: initialData?.fail_description || "",
            methodRecovery: initialData?.method_recovery?.id || "",
            spareParts: initialData?.spare_parts || "",
            recoveryDate: initialData ? new Date(initialData.recovery_date) : "",
            service: initialData?.service.id || "",
        }
    });

    // Получаем значение даты отказа для валидации
    const failureDateValue = watch("failureDate");

    /**
     * Валидация даты восстановления (должна быть не раньше даты отказа)
     * @param {Date} value - Проверяемая дата
     * @returns {boolean|string} true если валидна, сообщение об ошибке если нет
     */
    const validateDate = (value) => {
        if (!value) return true;
        const selectedDate = new Date(value);
        if (failureDateValue) {
            return selectedDate >= new Date(failureDateValue)
                ? true
                : "Не может быть ранее даты отказа";
        }
        return true;
    };

    /**
     * Обработчик отправки формы
     * @param {Object} values - Значения формы
     */
    const onSubmit = async (values) => {
        try {
            if (initialData) {
                // Обновление существующей рекламации
                const response = await dataSilantApiService.updateClaims(initialData.id, values);
                updateClaims(response);
            } else {
                // Создание новой рекламации
                const response = await dataSilantApiService.createClaims(values);
                addClaims(response);
            }
            onClose?.();
        } catch (error) {
            console.error("Ошибка при сохранении рекламации:", error);
        }
    };

    // Рендер формы
    return (
        <div className="modal-overlay">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-container">
                    <div className="form-header">
                        <div className="form-title">
                            {initialData ? 'Редактирование рекламации' : 'Добавление рекламации'}
                        </div>
                    </div>

                    <div className="form-body">
                        {/* Поле выбора машины */}
                        <div className="form-group">
                            <label htmlFor="vehicle">Зав. № машины</label>
                            <div className="input-wrapper">
                                <select
                                    id="select-vehicle"
                                    className="select-vehicle"
                                    {...register("vehicle", {
                                        required: "Обязательное поле",
                                    })}
                                >
                                    <option value="">Зав. № машины</option>
                                    {uniqueVehicles.map(vehicle => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.number}
                                        </option>
                                    ))}
                                </select>
                                {errors.vehicle && (
                                    <span className="error-message">{errors.vehicle.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Поле даты отказа */}
                        <div className="form-group">
                            <label htmlFor="failureDate">Дата отказа</label>
                            <div className="input-wrapper">
                                <Controller
                                    control={control}
                                    name="failureDate"
                                    rules={{ required: "Обязательное поле" }}
                                    render={({ field }) => (
                                        <DatePicker
                                            selected={field.value}
                                            onChange={(date) => {
                                                field.onChange(date);
                                                field.onBlur();
                                            }}
                                            onBlur={field.onBlur}
                                            locale={ru}
                                            dateFormat="dd.MM.yyyy"
                                            maxDate={new Date()}
                                            showMonthDropdown
                                            showYearDropdown
                                            yearDropdownItemNumber={5}
                                            dropdownMode="scroll"
                                            enableTabLoop={false}
                                            showIcon
                                            popperProps={{ strategy: 'fixed' }}
                                        />
                                    )}
                                />
                                {errors.failureDate && (
                                    <span className="error-message">{errors.failureDate.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Поле наработки */}
                        <div className="form-group">
                            <label htmlFor="operatingTime">Наработка, м/час</label>
                            <div className="input-wrapper">
                                <input
                                    id="operatingTime"
                                    {...register("operatingTime", {
                                        required: "Обязательное поле",
                                        pattern: {
                                            value: /^\d+$/,
                                            message: "Должно быть числом"
                                        },
                                    })}
                                />
                                {errors.operatingTime && (
                                    <span className="error-message">{errors.operatingTime.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Поле узла отказа */}
                        <div className="form-group">
                            <label htmlFor="nodeFail">Узел отказа</label>
                            <div className="input-wrapper">
                                <select
                                    id="select-nodeFail"
                                    className="select-nodeFail"
                                    {...register("nodeFail", {
                                        required: "Обязательное поле",
                                    })}
                                >
                                    <option value="">Узел отказа</option>
                                    {nodeFail.map(node => (
                                        <option key={node.id} value={node.id}>
                                            {node.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.nodeFail && (
                                    <span className="error-message">{errors.nodeFail.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Поле описания отказа */}
                        <div className="form-group">
                            <label htmlFor="failDescription">Описание отказа</label>
                            <div className="input-wrapper">
                                <input
                                    id="failDescription"
                                    {...register("failDescription", {
                                        required: "Обязательное поле",
                                    })}
                                />
                                {errors.failDescription && (
                                    <span className="error-message">{errors.failDescription.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Поле способа восстановления */}
                        <div className="form-group">
                            <label htmlFor="methodRecovery">Способ восстановления</label>
                            <div className="input-wrapper">
                                <select
                                    id="select-methodRecovery"
                                    className="select-methodRecovery"
                                    {...register("methodRecovery", {
                                        required: "Обязательное поле",
                                    })}
                                >
                                    <option value="">Способ восстановления</option>
                                    {methodsRecovery.map(method => (
                                        <option key={method.id} value={method.id}>
                                            {method.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.methodRecovery && (
                                    <span className="error-message">{errors.methodRecovery.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Поле запасных частей */}
                        <div className="form-group">
                            <label htmlFor="spareParts">Используемые запасные части</label>
                            <div className="input-wrapper">
                                <input
                                    id="spareParts"
                                    {...register("spareParts")}
                                />
                                {errors.spareParts && (
                                    <span className="error-message">{errors.spareParts.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Поле даты восстановления */}
                        <div className="form-group">
                            <label htmlFor="recoveryDate">Дата восстановления</label>
                            <div className="input-wrapper">
                                <Controller
                                    control={control}
                                    name="recoveryDate"
                                    rules={{
                                        required: "Обязательное поле",
                                        validate: validateDate
                                    }}
                                    render={({ field }) => (
                                        <DatePicker
                                            selected={field.value}
                                            onChange={(date) => {
                                                field.onChange(date);
                                                field.onBlur();
                                            }}
                                            onBlur={field.onBlur}
                                            locale={ru}
                                            dateFormat="dd.MM.yyyy"
                                            maxDate={new Date()}
                                            showMonthDropdown
                                            showYearDropdown
                                            yearDropdownItemNumber={5}
                                            dropdownMode="scroll"
                                            enableTabLoop={false}
                                            showIcon
                                            popperProps={{ strategy: 'fixed' }}
                                        />
                                    )}
                                />
                                {errors.recoveryDate && (
                                    <span className="error-message">{errors.recoveryDate.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Поле сервисной компании */}
                        <div className="form-group">
                            <label htmlFor="service">Сервисная компания</label>
                            <div className="input-wrapper">
                                <select
                                    id="select-service"
                                    className="select-service"
                                    {...register("service", {
                                        required: "Обязательное поле",
                                    })}
                                >
                                    <option value="">Сервисная компания</option>
                                    {serviceOrganizations.map(service => (
                                        <option key={service.id} value={service.id}>
                                            {service.fullname}
                                        </option>
                                    ))}
                                </select>
                                {errors.service && (
                                    <span className="error-message">{errors.service.message}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Кнопки отправки и отмены */}
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

export default ClaimsForm;