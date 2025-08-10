import React, { useMemo } from 'react';
import { useSilantStore } from "../../store/useSilantStore.js";
import { Controller, useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import ru from "date-fns/locale/ru";
import { dataSilantApiService } from "../../service/dataSilantApiService.js";

/**
 * Компонент формы для создания/редактирования общей информации о технике
 * @component
 * @param {Object} props - Свойства компонента
 * @param {Object} [props.initialData] - Начальные данные для редактирования
 * @param {Function} [props.onClose] - Функция закрытия формы
 * @returns {JSX.Element} Форма для работы с общей информацией о технике
 */
const GeneralForm = ({ initialData, onClose }) => {
    // Получаем необходимые данные и методы из хранилища
    const {
        referenceDirectory,
        serviceOrganizations,
        clients,
        updateVehicleInfo,
        addVehicle,
    } = useSilantStore();

    // Фильтруем справочники для различных моделей
    const vehicleModel = useMemo(() => (
        referenceDirectory.filter(item => item.ref_type === 'model_tech')
    ), [referenceDirectory]);

    const engineModel = useMemo(() => (
        referenceDirectory.filter(item => item.ref_type === 'model_engine')
    ), [referenceDirectory]);

    const transmissionModel = useMemo(() => (
        referenceDirectory.filter(item => item.ref_type === 'model_transmission')
    ), [referenceDirectory]);

    const driveBridgeModel = useMemo(() => (
        referenceDirectory.filter(item => item.ref_type === 'model_drive_bridge')
    ), [referenceDirectory]);

    const controlBridgeModel = useMemo(() => (
        referenceDirectory.filter(item => item.ref_type === 'model_control_bridge')
    ), [referenceDirectory]);

    // Инициализация формы с react-hook-form
    const {
        control,
        register,
        formState: { errors, isSubmitting },
        handleSubmit,
        setError,
        reset,
    } = useForm({
        mode: "onSubmit",
        defaultValues: {
            factoryNumber: initialData?.factory_number || "",
            vehicleModel: initialData?.vehicle_model?.id || "",
            engineModel: initialData?.engine_model?.id || "",
            transmissionModel: initialData?.transmission_model?.id || "",
            driveBridgeModel: initialData?.drive_bridge_model?.id || "",
            controlBridgeModel: initialData?.control_bridge_model?.id || "",
            engineNumber: initialData?.engine_number || "",
            transmissionNumber: initialData?.transmission_number || "",
            driveBridgeNumber: initialData?.drive_bridge_number || "",
            controlBridgeNumber: initialData?.control_bridge_number || "",
            supplyContract: initialData?.supply_contract || "",
            shippingDate: initialData ? new Date(initialData.shipping_date) : "",
            recipient: initialData?.recipient || "",
            deliveryAddress: initialData?.delivery_address || "",
            equipment: initialData?.equipment || "",
            service: initialData?.service.id || "",
            client: initialData?.client.id || "",
        }
    });

    /**
     * Обработчик отправки формы
     * @param {Object} values - Значения формы
     */
    const onSubmit = async (values) => {
        try {
            if (initialData) {
                // Обновление существующей информации
                const response = await dataSilantApiService.updateVehicle(
                    initialData.factory_number,
                    values
                );
                updateVehicleInfo(response);
            } else {
                // Создание новой записи
                const response = await dataSilantApiService.createVehicle(values);
                addVehicle(response);
            }
            onClose?.();
        } catch (error) {
            console.error("Ошибка при сохранении информации:", error);
            const serverErrors = error.response?.data;

            // Маппинг полей сервера на поля формы
            const fieldMapping = {
                'drive_bridge_number': 'driveBridgeNumber',
                'engine_number': 'engineNumber',
                'factory_number': 'factoryNumber',
                'control_bridge_number': 'controlBridgeNumber',
                'transmission_number': 'transmissionNumber'
            };

            // Установка ошибок сервера в соответствующие поля формы
            if (serverErrors) {
                Object.keys(serverErrors).forEach(fieldName => {
                    const formField = fieldMapping[fieldName] || fieldName;
                    setError(formField, {
                        type: 'server',
                        message: serverErrors[fieldName]
                    });
                });

                // Сохранение введенных значений при наличии ошибок
                reset(values, {
                    keepErrors: true,
                    keepDirty: true,
                });
            }
        }
    };

    // Рендер формы
    return (
        <div className="modal-overlay">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-container">
                    <div className="form-header">
                        <div className="form-title">
                            {initialData ? 'Редактирование информации' : 'Добавление информации'}
                        </div>
                    </div>

                    <div className="form-body">
                        {/* Основная информация */}
                        <div className="form-group">
                            <label htmlFor="factoryNumber">Зав. № машины</label>
                            <div className="input-wrapper">
                                <input
                                    id="factoryNumber"
                                    {...register("factoryNumber", {
                                        required: "Обязательное поле",
                                        pattern: {
                                            value: /^\d+$/,
                                            message: "Должно быть числом"
                                        },
                                    })}
                                />
                                {errors.factoryNumber && (
                                    <span className="error-message">{errors.factoryNumber.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="vehicleModel">Модель техники</label>
                            <div className="input-wrapper">
                                <select
                                    id="select-vehicleModel"
                                    className="select-vehicleModel"
                                    {...register("vehicleModel", {
                                        required: "Обязательное поле",
                                    })}
                                >
                                    <option value="">Модель техники</option>
                                    {vehicleModel.map(model => (
                                        <option key={model.id} value={model.id}>
                                            {model.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.vehicleModel && (
                                    <span className="error-message">{errors.vehicleModel.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Информация о двигателе */}
                        <div className="form-group">
                            <label htmlFor="engineModel">Модель двигателя</label>
                            <div className="input-wrapper">
                                <select
                                    id="select-engineModel"
                                    className="select-engineModel"
                                    {...register("engineModel", {
                                        required: "Обязательное поле",
                                    })}
                                >
                                    <option value="">Модель двигателя</option>
                                    {engineModel.map(model => (
                                        <option key={model.id} value={model.id}>
                                            {model.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.engineModel && (
                                    <span className="error-message">{errors.engineModel.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="engineNumber">Зав. № двигателя</label>
                            <div className="input-wrapper">
                                <input
                                    id="engineNumber"
                                    {...register("engineNumber", {
                                        required: "Обязательное поле",
                                    })}
                                />
                                {errors.engineNumber && (
                                    <span className="error-message">{errors.engineNumber.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Информация о трансмиссии */}
                        <div className="form-group">
                            <label htmlFor="transmissionModel">Модель трансмиссии</label>
                            <div className="input-wrapper">
                                <select
                                    id="select-transmissionModel"
                                    className="select-transmissionModel"
                                    {...register("transmissionModel", {
                                        required: "Обязательное поле",
                                    })}
                                >
                                    <option value="">Модель трансмиссии</option>
                                    {transmissionModel.map(model => (
                                        <option key={model.id} value={model.id}>
                                            {model.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.transmissionModel && (
                                    <span className="error-message">{errors.transmissionModel.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="transmissionNumber">Зав. № трансмиссии</label>
                            <div className="input-wrapper">
                                <input
                                    id="transmissionNumber"
                                    {...register("transmissionNumber", {
                                        required: "Обязательное поле",
                                    })}
                                />
                                {errors.transmissionNumber && (
                                    <span className="error-message">{errors.transmissionNumber.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Информация о мостах */}
                        <div className="form-group">
                            <label htmlFor="driveBridgeModel">Модель ведущего моста</label>
                            <div className="input-wrapper">
                                <select
                                    id="select-driveBridgeModel"
                                    className="select-driveBridgeModel"
                                    {...register("driveBridgeModel", {
                                        required: "Обязательное поле",
                                    })}
                                >
                                    <option value="">Модель ведущего моста</option>
                                    {driveBridgeModel.map(model => (
                                        <option key={model.id} value={model.id}>
                                            {model.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.driveBridgeModel && (
                                    <span className="error-message">{errors.driveBridgeModel.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="driveBridgeNumber">Зав. № ведущего моста</label>
                            <div className="input-wrapper">
                                <input
                                    id="driveBridgeNumber"
                                    {...register("driveBridgeNumber", {
                                        required: "Обязательное поле",
                                    })}
                                />
                                {errors.driveBridgeNumber && (
                                    <span className="error-message">{errors.driveBridgeNumber.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="controlBridgeModel">Модель управляемого моста</label>
                            <div className="input-wrapper">
                                <select
                                    id="select-controlBridgeModel"
                                    className="select-controlBridgeModel"
                                    {...register("controlBridgeModel", {
                                        required: "Обязательное поле",
                                    })}
                                >
                                    <option value="">Модель управляемого моста</option>
                                    {controlBridgeModel.map(model => (
                                        <option key={model.id} value={model.id}>
                                            {model.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.controlBridgeModel && (
                                    <span className="error-message">{errors.controlBridgeModel.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="controlBridgeNumber">Зав. № управляемого моста</label>
                            <div className="input-wrapper">
                                <input
                                    id="controlBridgeNumber"
                                    {...register("controlBridgeNumber", {
                                        required: "Обязательное поле",
                                    })}
                                />
                                {errors.controlBridgeNumber && (
                                    <span className="error-message">{errors.controlBridgeNumber.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Информация о поставке */}
                        <div className="form-group">
                            <label htmlFor="supplyContract">Договор поставки, дата</label>
                            <div className="input-wrapper">
                                <input
                                    id="supplyContract"
                                    {...register("supplyContract", {
                                        required: "Обязательное поле",
                                    })}
                                />
                                {errors.supplyContract && (
                                    <span className="error-message">{errors.supplyContract.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="shippingDate">Дата отгрузки</label>
                            <div className="input-wrapper">
                                <Controller
                                    control={control}
                                    name="shippingDate"
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
                                {errors.shippingDate && (
                                    <span className="error-message">{errors.shippingDate.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="recipient">Грузополучатель</label>
                            <div className="input-wrapper">
                                <input
                                    id="recipient"
                                    {...register("recipient", {
                                        required: "Обязательное поле",
                                    })}
                                />
                                {errors.recipient && (
                                    <span className="error-message">{errors.recipient.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="deliveryAddress">Адрес поставки</label>
                            <div className="input-wrapper">
                                <input
                                    id="deliveryAddress"
                                    {...register("deliveryAddress", {
                                        required: "Обязательное поле",
                                    })}
                                />
                                {errors.deliveryAddress && (
                                    <span className="error-message">{errors.deliveryAddress.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="equipment">Комплектация</label>
                            <div className="input-wrapper">
                                <input
                                    id="equipment"
                                    {...register("equipment")}
                                />
                                {errors.equipment && (
                                    <span className="error-message">{errors.equipment.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Клиент и сервисная компания */}
                        <div className="form-group">
                            <label htmlFor="client">Клиент</label>
                            <div className="input-wrapper">
                                <select
                                    id="select-client"
                                    className="select-client"
                                    {...register("client", {
                                        required: "Обязательное поле",
                                    })}
                                >
                                    <option value="">Клиент</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.fullname}
                                        </option>
                                    ))}
                                </select>
                                {errors.client && (
                                    <span className="error-message">{errors.client.message}</span>
                                )}
                            </div>
                        </div>

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

export default GeneralForm;