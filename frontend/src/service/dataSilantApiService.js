import api from '../api/api.js';
import {formatDate} from "../utils/formatUtils.js";

/**
 * Сервис для работы с API данных системы Silant.
 * Предоставляет методы для CRUD операций с:
 * - транспортными средствами
 * - техническим обслуживанием
 * - рекламациями
 * - справочниками
 * - сервисными организациями
 * - клиентами
 */
export const dataSilantApiService = {

    /**
     * Получает данные о конкретном транспортном средстве по заводскому номеру
     * @async
     * @param {string} factoryNumber - Заводской номер машины
     * @returns {Promise<Object>} Данные транспортного средства
     * @throws {Error} Ошибка с сообщением "Данные не найдены" или кастомным текстом
     */
    async getVehicle(factoryNumber) {
        try {
            const response = await api.get(`/vehicles/${factoryNumber}/`);
            return response.data;
        } catch (error) {
            throw new Error(error.status === 404
                ? 'Данные не найдены'
                : `Ошибка получения данных о машине с номером ${factoryNumber}`);
        }
    },

    /**
     * Получает список всех транспортных средств пользователя
     * @async
     * @returns {Promise<Array>} Массив транспортных средств
     * @throws {Error} Ошибка с сообщением от сервера или стандартным текстом
     */
    async getVehicles() {
        try {
            const response = await api.get(`/vehicles`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка получения данных о машинах пользователя')
        }
    },

    /**
     * Обновляет данные транспортного средства
     * @async
     * @param {number} id - ID транспортного средства
     * @param {Object} data - Новые данные
     * @returns {Promise<Object>} Обновленные данные транспортного средства
     * @throws {Error} Ошибка при обновлении данных
     */
    async updateVehicle(id, data) {
        try {
            const prepareData = {
                factory_number: data.factoryNumber,
                vehicle_model_id: data.vehicleModel,
                engine_model_id: data.engineModel,
                engine_number: data.engineNumber,
                transmission_model_id: data.transmissionModel,
                transmission_number: data.transmissionNumber,
                drive_bridge_model_id: data.driveBridgeModel,
                drive_bridge_number: data.driveBridgeNumber,
                control_bridge_model_id: data.controlBridgeModel,
                control_bridge_number: data.controlBridgeNumber,
                supply_contract: data.supplyContract,
                shipping_date: formatDate(data.shippingDate),
                recipient: data.recipient,
                delivery_address: data.deliveryAddress,
                equipment: data.equipment,
                client_id: data.client,
                service_id: data.service,
            };

            const response = await api.put(`/vehicles/${id}/`, prepareData);
            return response.data;
    } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка обновления данных транспортного средства');
    }
    },

    /**
     * Создает новое транспортное средство
     * @async
     * @param {Object} data - Данные нового транспортного средства
     * @returns {Promise<Object>} Созданное транспортное средство
     * @throws {Error} Ошибка при создании
     */
    async createVehicle(data) {
        try {
            const prepareData = {
                factory_number: data.factoryNumber,
                vehicle_model_id: parseInt(data.vehicleModel),
                engine_model_id: parseInt(data.engineModel),
                engine_number: data.engineNumber,
                transmission_model_id: parseInt(data.transmissionModel),
                transmission_number: data.transmissionNumber,
                drive_bridge_model_id: parseInt(data.driveBridgeModel),
                drive_bridge_number: data.driveBridgeNumber,
                control_bridge_model_id: parseInt(data.controlBridgeModel),
                control_bridge_number: data.controlBridgeNumber,
                supply_contract: data.supplyContract,
                shipping_date: formatDate(data.shippingDate),
                recipient: data.recipient,
                delivery_address: data.deliveryAddress,
                equipment: data.equipment,
                client_id: parseInt(data.client),
                service_id: parseInt(data.service),
            };

            const response = await api.post(`/vehicles/`, prepareData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка создания транспортного средства');
        }
    },

    /**
     * Удаляет транспортное средство
     * @async
     * @param {number} id - ID транспортного средства
     * @returns {Promise<boolean>} true при успешном удалении
     * @throws {Error} Ошибка при удалении
     */
    async deleteVehicle(id){
        try {
            await api.delete(`/vehicles/${id}/`);
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка удаления транспортного средства');
        }
    },

    /* ========== Методы для работы с ТО ========== */

    /**
     * Получает список всех ТО пользователя
     * @async
     * @returns {Promise<Array>} Массив ТО
     * @throws {Error} Ошибка при получении данных
     */
    async getMaintenances() {
        try {
            const response = await api.get(`/maintenances`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка получения данных о ТО техники пользователя')
        }
    },

    /**
     * Обновляет данные ТО
     * @async
     * @param {number} id - ID ТО
     * @param {Object} data - Новые данные ТО
     * @returns {Promise<Object>} Обновленные данные ТО
     * @throws {Error} Ошибка при обновлении
     */
    async updateMaintenance(id, data) {
        try {
            const prepareData = {
                vehicle_id: data.vehicle,
                maintenance_type_id: data.type,
                maintenance_date: formatDate(data.maintenanceDate),
                operating_time: data.operatingTime,
                order_number: data.orderNumber,
                order_date: formatDate(data.orderDate),
                service: data.service,
            };

            const response = await api.put(`/maintenances/${id}/`, prepareData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка обновления данных ТО');
        }
    },

    /**
     * Создает новую запись ТО
     * @async
     * @param {Object} data - Данные нового ТО
     * @returns {Promise<Object>} Созданная запись ТО
     * @throws {Error} Ошибка при создании
     */
    async createMaintenance(data) {
        try{
            const prepareData = {
                vehicle_id: parseInt(data.vehicle),
                maintenance_type_id: parseInt(data.type),
                maintenance_date: formatDate(data.maintenanceDate),
                operating_time: parseInt(data.operatingTime),
                order_number: data.orderNumber,
                order_date: formatDate(data.orderDate),
                service: data.service ? parseInt(data.service) : '',
            };

            const response = await api.post(`/maintenances/`, prepareData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка создания записи ТО');
        }
    },

    /**
     * Удаляет запись ТО
     * @async
     * @param {number} id - ID ТО
     * @returns {Promise<boolean>} true при успешном удалении
     * @throws {Error} Ошибка при удалении
     */
    async deleteMaintenance(id){
        try {
            await api.delete(`/maintenances/${id}/`);
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка удаления записи ТО');
        }
    },

    /* ========== Методы для работы с рекламациями ========== */

    /**
     * Получает список всех рекламаций пользователя
     * @async
     * @returns {Promise<Array>} Массив рекламаций
     * @throws {Error} Ошибка при получении данных
     */
    async getClaims() {
        try {
            const response = await api.get(`/claims`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка получения данных о рекламациях на технику пользователя')
        }
    },

    /**
     * Обновляет данные рекламации
     * @async
     * @param {number} id - ID рекламации
     * @param {Object} data - Новые данные рекламации
     * @returns {Promise<Object>} Обновленные данные рекламации
     * @throws {Error} Ошибка при обновлении
     */
    async updateClaims(id, data) {
        try {
            const prepareData = {
                vehicle_id: data.vehicle,
                node_fail_id: data.nodeFail,
                method_recovery_id: data.methodRecovery,
                failure_date: formatDate(data.failureDate),
                operating_time: data.operatingTime,
                fail_description: data.failDescription,
                recovery_date: formatDate(data.recoveryDate),
                spare_parts: data.spareParts,
                service_id: data.service,
            };

            const response = await api.put(`/claims/${id}/`, prepareData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка обновления данных рекламации');
        }
    },

    /**
     * Создает новую рекламацию
     * @async
     * @param {Object} data - Данные новой рекламации
     * @returns {Promise<Object>} Созданная рекламация
     * @throws {Error} Ошибка при создании
     */
    async createClaims(data) {
        try {
            const prepareData = {
                vehicle_id: parseInt(data.vehicle),
                node_fail_id: parseInt(data.nodeFail),
                method_recovery_id: parseInt(data.methodRecovery),
                failure_date: formatDate(data.failureDate),
                operating_time: parseInt(data.operatingTime),
                fail_description: data.failDescription,
                recovery_date: formatDate(data.recoveryDate),
                spare_parts: data.spareParts,
                service_id: parseInt(data.service),
            };

            const response = await api.post(`/claims/`, prepareData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка создания рекламации');
        }
    },

    /**
     * Удаляет рекламацию
     * @async
     * @param {number} id - ID рекламации
     * @returns {Promise<boolean>} true при успешном удалении
     * @throws {Error} Ошибка при удалении
     */
    async deleteClaims(id) {
        try {
            await api.delete(`/claims/${id}/`);
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка удаления рекламации');
        }
    },

    /* ========== Методы для работы со справочниками ========== */

    /**
     * Получает данные справочников
     * @async
     * @returns {Promise<Object>} Данные справочников
     * @throws {Error} Ошибка при получении данных
     */
    async getReferenceDirectory() {
        try {
            const response = await api.get(`/references`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка получения справочников')
        }
    },

    /**
     * Обновляет запись в справочнике
     * @async
     * @param {number} id - ID записи
     * @param {Object} data - Новые данные записи
     * @returns {Promise<Object>} Обновленная запись
     * @throws {Error} Ошибка при обновлении
     */
    async updateReferenceDirectory(id, data) {
        try {
            const prepareData = {
                ref_type: data.refType,
                name: data.refName,
                description: data.refDescription,
            };

            const response = await api.put(`/references/${id}/`, prepareData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка обновления справочника');
        }
    },

    /**
     * Создает новую запись в справочнике
     * @async
     * @param {Object} data - Данные новой записи
     * @returns {Promise<Object>} Созданная запись
     * @throws {Error} Ошибка при создании
     */
    async createReferenceDirectory(data) {
        try {
            const prepareData = {
                ref_type: data.refType,
                name: data.refName,
                description: data.refDescription,
            };

            const response = await api.post(`/references/`, prepareData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка создания записи в справочнике');
        }
    },

    /**
     * Удаляет запись из справочника
     * @async
     * @param {number} id - ID записи
     * @returns {Promise<boolean>} true при успешном удалении
     * @throws {Error} Ошибка при удалении
     */
    async deleteReferenceDirectory(id) {
        try {
            await api.delete(`/references/${id}/`);
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка удаления записи из справочника');
        }
    },

    /* ========== Методы для работы с сервисными организациями ========== */

    /**
     * Получает список сервисных организаций
     * @async
     * @returns {Promise<Array>} Массив сервисных организаций
     * @throws {Error} Ошибка при получении данных
     */
    async getServiceOrganizations() {
        try {
            const response = await api.get(`/services`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка получения сервисных организаций')
        }
    },

    /* ========== Методы для работы с клиентами ========== */

    /**
     * Получает список клиентов
     * @async
     * @returns {Promise<Array>} Массив клиентов
     * @throws {Error} Ошибка при получении данных
     */
    async getClients() {
        try {
            const response = await api.get(`/clients`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Ошибка получения списка клиентов')
        }
    },
};