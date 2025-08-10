import React, { useMemo } from 'react';
import { Controller, useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ru from "date-fns/locale/ru";
import { useSilantStore } from "../../store/useSilantStore.js";
import { dataSilantApiService } from "../../service/dataSilantApiService.js";
import "../../styles/components/Forms/MaintenanceForm.scss";

/**
 * Компонент формы для создания/редактирования записей о техническом обслуживании
 * @component
 * @param {Object} props - Свойства компонента
 * @param {Object} [props.initialData] - Начальные данные для редактирования
 * @param {Function} [props.onClose] - Функция закрытия формы
 * @returns {JSX.Element} Форма технического обслуживания
 */
const MaintenanceForm = ({ initialData, onClose }) => {
    // Получаем данные и методы из хранилища
    const {
        referenceDirectory,
        uniqueVehicles,
        serviceOrganizations,
        updateMaintenance,
        addMaintenance,
    } = useSilantStore();

    // Фильтруем справочники для типов ТО
    const maintenanceTypes = useMemo(() => (
        referenceDirectory.filter(item => item.ref_type === 'type_maintenance')
    ), [referenceDirectory]);

    // Получаем список машин (используем мемоизацию)
    const vehicles = useMemo(() => uniqueVehicles, [uniqueVehicles]);

    // Инициализация формы
    const {
        control,
        register,
        setError,
        reset,
        formState: { errors, isSubmitting },
        handleSubmit,
        watch
    } = useForm({
        mode: "onSubmit",
        defaultValues: {
            vehicle: initialData?.vehicle.id || "",
            type: initialData?.maintenance_type?.id || "",
            maintenanceDate: initialData ? new Date(initialData.maintenance_date) : "",
            operatingTime: initialData?.operating_time || "",
            orderNumber: initialData?.order_number || "",
            orderDate: initialData ? new Date(initialData.order_date) : "",
            service: initialData?.service.id || "",
        }
    });

    // Получаем значение даты проведения ТО для валидации
    const maintenanceDateValue = watch("maintenanceDate");

    /**
     * Валидация даты заказ-наряда (не может быть позже даты проведения ТО)
     * @param {Date} value - Проверяемая дата
     * @returns {boolean|string} true если валидна, сообщение об ошибке если нет
     */
    const validateDate = (value) => {
        if (!value) return true;
        const selectedDate = new Date(value);
        if (maintenanceDateValue) {
            return selectedDate <= new Date(maintenanceDateValue)
                ? true
                : "Не может быть позднее даты проведения ТО";
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
                // Обновление существующего ТО
                const response = await dataSilantApiService.updateMaintenance(
                    initialData.id,
                    values
                );
                updateMaintenance(response);
            } else {
                // Создание нового ТО
                const response = await dataSilantApiService.createMaintenance(values);
                addMaintenance(response);
            }
            onClose?.();
        } catch (error) {
            console.error("Ошибка при сохранении ТО:", error);
            const serverErrors = error.response?.data;
            const fieldMapping = {
                'order_number': 'orderNumber'
            };

            // Устанавливаем ошибки сервера в соответствующие поля формы
            if (serverErrors) {
                Object.keys(serverErrors).forEach(fieldName => {
                    const formField = fieldMapping[fieldName] || fieldName;
                    setError(formField, {
                        type: 'server',
                        message: serverErrors[fieldName]
                    });
                });

                // Сохраняем введенные значения при наличии ошибок
                reset(values, {
                    keepErrors: true,
                    keepDirty: true,
                });
            }
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} onClick={e => e.stopPropagation()}>
                <div className="form-container">
                    <div className="form-header">
                        <h2 className="form-title">
                            {initialData ? 'Редактирование ТО' : 'Добавление ТО'}
                        </h2>
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
                                    aria-invalid={errors.vehicle ? "true" : "false"}
                                >
                                    <option value="">Зав. № машины</option>
                                    {vehicles.map(vehicle => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.number}
                                        </option>
                                    ))}
                                </select>
                                {errors.vehicle && (
                                    <span className="error-message" aria-live="assertive">
                                        {errors.vehicle.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Поле выбора типа ТО */}
                        <div className="form-group">
                            <label htmlFor="type">Вид ТО</label>
                            <div className="input-wrapper">
                                <select
                                    id="select-type"
                                    className="select-type"
                                    {...register("type", {
                                        required: "Обязательное поле",
                                    })}
                                    aria-invalid={errors.type ? "true" : "false"}
                                >
                                    <option value="">Вид ТО</option>
                                    {maintenanceTypes.map(type => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.type && (
                                    <span className="error-message" aria-live="assertive">
                                        {errors.type.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Поле даты проведения ТО */}
                        <div className="form-group">
                            <label htmlFor="maintenanceDate">Дата проведения ТО</label>
                            <div className="input-wrapper">
                                <Controller
                                    control={control}
                                    name="maintenanceDate"
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
                                            aria-invalid={errors.maintenanceDate ? "true" : "false"}
                                        />
                                    )}
                                />
                                {errors.maintenanceDate && (
                                    <span className="error-message" aria-live="assertive">
                                        {errors.maintenanceDate.message}
                                    </span>
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
                                            message: "Введите числовое значение"
                                        },
                                    })}
                                    aria-invalid={errors.operatingTime ? "true" : "false"}
                                />
                                {errors.operatingTime && (
                                    <span className="error-message" aria-live="assertive">
                                        {errors.operatingTime.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Поле номера заказ-наряда */}
                        <div className="form-group">
                            <label htmlFor="orderNumber">№ заказ-наряда</label>
                            <div className="input-wrapper">
                                <input
                                    id="orderNumber"
                                    {...register("orderNumber", {
                                        required: "Обязательное поле",
                                    })}
                                    aria-invalid={errors.orderNumber ? "true" : "false"}
                                />
                                {errors.orderNumber && (
                                    <span className="error-message" aria-live="assertive">
                                        {errors.orderNumber.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Поле даты заказ-наряда */}
                        <div className="form-group">
                            <label htmlFor="orderDate">Дата заказ-наряда</label>
                            <div className="input-wrapper">
                                <Controller
                                    control={control}
                                    name="orderDate"
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
                                            aria-invalid={errors.orderDate ? "true" : "false"}
                                        />
                                    )}
                                />
                                {errors.orderDate && (
                                    <span className="error-message" aria-live="assertive">
                                        {errors.orderDate.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Поле выбора сервисной организации */}
                        <div className="form-group">
                            <label htmlFor="service">Организация, проводившая ТО</label>
                            <div className="input-wrapper">
                                <select
                                    id="select-service"
                                    className="select-service"
                                    {...register("service")}
                                    aria-invalid={errors.service ? "true" : "false"}
                                >
                                    <option value="">Самостоятельно</option>
                                    {serviceOrganizations.map(service => (
                                        <option key={service.id} value={service.id}>
                                            {service.fullname}
                                        </option>
                                    ))}
                                </select>
                                {errors.service && (
                                    <span className="error-message" aria-live="assertive">
                                        {errors.service.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Кнопки отправки и отмены */}
                    <div className="submit-group">
                        <button
                            type="submit"
                            className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
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

export default MaintenanceForm;