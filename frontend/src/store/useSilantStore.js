import {create} from "zustand";
import {createJSONStorage, persist} from 'zustand/middleware';
import {dataSilantApiService} from "../service/dataSilantApiService.js";
import {getUniqueVehicles} from "../utils/dataFilters.js";

/**
 * Начальное состояние хранилища Silant
 * @type {Object}
 * @property {Array|null} generalInfo - Основная информация о транспортных средствах
 * @property {boolean} generalInfoLoading - Флаг загрузки основной информации
 * @property {Error|null} generalInfoError - Ошибка при загрузке основной информации
 * @property {Array|null} maintenanceInfo - Информация о ТО
 * @property {boolean} maintenanceInfoLoading - Флаг загрузки информации о ТО
 * @property {Error|null} maintenanceInfoError - Ошибка при загрузке информации о ТО
 * @property {Array|null} claimsInfo - Информация о рекламациях
 * @property {boolean} claimsInfoLoading - Флаг загрузки информации о рекламациях
 * @property {Error|null} claimsInfoError - Ошибка при загрузке информации о рекламациях
 * @property {Array|null} referenceDirectory - Справочник
 * @property {Error|null} referenceDirectoryError - Ошибка при загрузке справочника
 * @property {Array|null} uniqueVehicles - Уникальные транспортные средства
 * @property {Array|null} serviceOrganizations - Сервисные организации
 * @property {Error|null} serviceOrganizationsError - Ошибка при загрузке сервисных организаций
 * @property {Array|null} clients - Клиенты
 * @property {Error|null} clientsError - Ошибка при загрузке клиентов
 */
const initialState = {
    generalInfo: null,
    generalInfoLoading: false,
    generalInfoError: null,
    maintenanceInfo: null,
    maintenanceInfoLoading: false,
    maintenanceInfoError: null,
    claimsInfo: null,
    claimsInfoLoading: false,
    claimsInfoError: null,
    referenceDirectory: null,
    referenceDirectoryError: null,
    uniqueVehicles: null,
    serviceOrganizations: null,
    serviceOrganizationsError: null,
    clients: null,
    clientsError: null,
}

/**
 * Хранилище Zustand для работы с данными системы Silant
 * Включает методы для работы с:
 * - транспортными средствами
 * - техническим обслуживанием
 * - рекламациями
 * - справочниками
 * - сервисными организациями
 * - клиентами
 *
 * Состояние сохраняется в localStorage с помощью middleware persist
 */
const useSilantStore = create(
    persist(
        (set, get) => ({
            ...initialState,


            setGeneralInfo: (generalInfo) => set({generalInfo}),
            setGeneralInfoLoading: (generalInfoLoading) => set({generalInfoLoading}),
            setGeneralInfoError: (generalInfoError) => set({generalInfoError}),
            setMaintenanceInfo: (maintenanceInfo) => set({maintenanceInfo}),
            setMaintenanceInfoLoading: (maintenanceInfoLoading) => set({maintenanceInfoLoading}),
            setMaintenanceInfoError: (maintenanceInfoError) => set({maintenanceInfoError}),
            setClaimsInfo: (claimsInfo) => set({claimsInfo}),
            setClaimsInfoLoading: (claimsInfoLoading) => set({claimsInfoLoading}),
            setClaimsInfoError: (claimsInfoError) => set({claimsInfoError}),
            setReferenceDirectory: (referenceDirectory) => set({referenceDirectory}),
            setReferenceDirectoryError: (referenceDirectoryError) => set({referenceDirectoryError}),
            setUniqueVehicles: (uniqueVehicles) => set({uniqueVehicles}),
            setServiceOrganizations: (serviceOrganizations) => set({serviceOrganizations}),
            setServiceOrganizationsError: (serviceOrganizationsError) => set({serviceOrganizationsError}),
            setClients: (clients) => set({clients}),
            setClientsError: (clients) => set({clients}),

            /* ========== Методы для работы с транспортными средствами ========== */

            /**
             * Загружает основную информацию о транспортных средствах с сервера
             * @async
             * @returns {Promise<boolean>} Успешность выполнения операции
             */
            getGeneralInfo: async () => {
                const {setGeneralInfo, setGeneralInfoLoading, setGeneralInfoError, setUniqueVehicles} = get();

                try {
                    setGeneralInfoError(null);
                    setGeneralInfoLoading(true);
                    const response = await dataSilantApiService.getVehicles();
                    setGeneralInfo(response);
                    setUniqueVehicles(getUniqueVehicles(response));
                } catch (error) {
                    setGeneralInfoError(error);
                    return false;
                } finally {
                    setGeneralInfoLoading(false);
                }
                return true;
            },

            /**
             * Обновляет информацию о транспортном средстве
             * @param {Object} updatedVehicle - Обновленные данные транспортного средства
             */
            updateVehicleInfo: (updatedVehicle) =>
                set((state) => ({
                    generalInfo: state.generalInfo.map(item =>
                        item.id === updatedVehicle.id ? updatedVehicle : item
                    )
                })),

            /**
             * Добавляет новое транспортное средство
             * @param {Object} vehicle - Данные нового транспортного средства
             */
            addVehicle: (vehicle) =>
                set((state) => ({
                    generalInfo: [...state.generalInfo, vehicle],
                    uniqueVehicles: [...state.uniqueVehicles, {
                        id: vehicle.id,
                        number: vehicle.factory_number
                    }],
                })),

            /**
             * Удаляет транспортное средство по ID
             * @param {string|number} deletedVehicle - ID удаляемого транспортного средства
             */
            deleteVehicle: (deletedVehicle) =>
                set((state) => ({
                    generalInfo: state.generalInfo.filter(item => item.id !== deletedVehicle),
                    maintenanceInfo: state.maintenanceInfo.filter(item => item.vehicle_id !== deletedVehicle),
                    claimsInfo: state.claimsInfo.filter(item => item.vehicle_id !== deletedVehicle),
                    uniqueVehicles: state.uniqueVehicles.filter(item => item.id !== deletedVehicle),
                })),

            /* ========== Методы для работы с ТО ========== */

            /**
             * Загружает информацию о техническом обслуживании с сервера
             * @async
             * @returns {Promise<boolean>} Успешность выполнения операции
             */
            getMaintenanceInfo: async () => {
                const {
                    setMaintenanceInfo,
                    setMaintenanceInfoLoading,
                    setMaintenanceInfoError,

                } = get();

                try {
                    setMaintenanceInfoError(null);
                    setMaintenanceInfoLoading(true);
                    const response = await dataSilantApiService.getMaintenances();
                    setMaintenanceInfo(response);
                } catch (error) {
                    setMaintenanceInfoError(error);
                    return false;
                } finally {
                    setMaintenanceInfoLoading(false);
                }
                return true;
            },

            /**
             * Обновляет информацию о ТО
             * @param {Object} updatedMaintenance - Обновленные данные ТО
             */
            updateMaintenance: (updatedMaintenance) =>
                set((state) => ({
                    maintenanceInfo: state.maintenanceInfo.map(item =>
                        item.id === updatedMaintenance.id ? updatedMaintenance : item
                    )
                })),

            /**
             * Добавляет новую запись ТО
             * @param {Object} maintenance - Данные нового ТО
             */
            addMaintenance: (maintenance) =>
                set((state) => ({
                    maintenanceInfo: [...state.maintenanceInfo, maintenance],
                })),

            /**
             * Удаляет запись ТО по ID
             * @param {string|number} deletedMaintenance - ID удаляемого ТО
             */
            deleteMaintenance: (deletedMaintenance) =>
                set((state) => ({
                    maintenanceInfo: state.maintenanceInfo.filter(item => item.id !== deletedMaintenance)
                })),

            /* ========== Методы для работы с рекламациями ========== */

            /**
             * Загружает информацию о рекламациях с сервера
             * @async
             * @returns {Promise<boolean>} Успешность выполнения операции
             */
            getClaimsInfo: async () => {
                const {setClaimsInfo, setClaimsInfoLoading, setClaimsInfoError} = get();

                try {
                    setClaimsInfoError(null);
                    setClaimsInfoLoading(true);

                    const response = await dataSilantApiService.getClaims();
                    setClaimsInfo(response);
                } catch (error) {
                    setClaimsInfoError(error);
                    return false;
                } finally {
                    setClaimsInfoLoading(false);
                }

                return true;
            },

            /**
             * Обновляет информацию о рекламации
             * @param {Object} updatedClaims - Обновленные данные рекламации
             */
            updateClaims: (updatedClaims) =>
                set((state) => ({
                    claimsInfo: state.claimsInfo.map(item =>
                        item.id === updatedClaims.id ? updatedClaims : item
                    )
                })),

            /**
             * Добавляет новую рекламацию
             * @param {Object} claims - Данные новой рекламации
             */
            addClaims: (claims) =>
                set((state) => ({
                    claimsInfo: [...state.claimsInfo, claims],
                })),

            /**
             * Удаляет рекламацию по ID
             * @param {string|number} deletedClaims - ID удаляемой рекламации
             */
            deleteClaims: (deletedClaims) =>
                set((state) => ({
                    claimsInfo: state.claimsInfo.filter(item => item.id !== deletedClaims)
                })),


            /* ========== Методы для работы со справочниками ========== */

            /**
             * Загружает справочник с сервера
             * @async
             * @returns {Promise<boolean>} Успешность выполнения операции
             */
            getReferenceDirectory: async () => {
                const {setReferenceDirectory, setReferenceDirectoryError} = get();

                try {
                    setReferenceDirectoryError(null);

                    const response = await dataSilantApiService.getReferenceDirectory();
                    setReferenceDirectory(response);
                } catch (error) {
                    setReferenceDirectoryError(error);
                    return false;
                }

                return true;
            },

            /**
             * Обновляет запись в справочнике
             * @param {Object} updatedReferenceDirectory - Обновленные данные справочника
             */
            updateReferenceDirectory: (updatedReferenceDirectory) =>
                set((state) => ({
                    referenceDirectory: state.referenceDirectory.map(item =>
                        item.id === updatedReferenceDirectory.id ? updatedReferenceDirectory : item
                    )
                })),

            /**
             * Добавляет новую запись в справочник
             * @param {Object} referenceDirectory - Данные новой записи справочника
             */
            addReferenceDirectory: (referenceDirectory) =>
                set((state) => ({
                    referenceDirectory: [...state.referenceDirectory, referenceDirectory],
                })),

            /**
             * Удаляет запись из справочника по ID
             * @param {string|number} deletedReferenceDirectory - ID удаляемой записи
             */
            deleteReferenceDirectory: (deletedReferenceDirectory) =>
                set((state) => ({
                    referenceDirectory: state.referenceDirectory.filter(item => item.id !== deletedReferenceDirectory)
                })),

            /* ========== Методы для работы с сервисными организациями ========== */

            /**
             * Загружает список сервисных организаций с сервера
             * @async
             * @returns {Promise<boolean>} Успешность выполнения операции
             */
            getServiceOrganizations: async () => {
                const {setServiceOrganizations, setServiceOrganizationsError} = get();

                try {
                    setServiceOrganizationsError(null);

                    const response = await dataSilantApiService.getServiceOrganizations();
                    setServiceOrganizations(response);
                } catch (error) {
                    setServiceOrganizationsError(error);
                    return false;
                }

                return true;
            },

            /* ========== Методы для работы с клиентами ========== */

            /**
             * Загружает список клиентов с сервера
             * @async
             * @returns {Promise<boolean>} Успешность выполнения операции
             */
            getClients: async () => {
                const {setClients, setClientsError} = get();

                try {
                    setClientsError(null);

                    const response = await dataSilantApiService.getClients();
                    setClients(response);
                } catch (error) {
                    setClientsError(error);
                    return false;
                }

                return true;
            },

            /* ========== Общие методы ========== */

            /**
             * Сбрасывает хранилище в начальное состояние
             */
            clearSilantStore: () => {
                set(initialState);
            },
        }),
        {
            name: 'Silant-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                generalInfo: state.generalInfo,
                maintenanceInfo: state.maintenanceInfo,
                claimsInfo: state.claimsInfo,
                uniqueVehicles: state.uniqueVehicles,
                serviceOrganizations: state.serviceOrganizations,
                referenceDirectory: state.referenceDirectory,
                clients: state.clients,
            })
        }
    )
);

export {useSilantStore};