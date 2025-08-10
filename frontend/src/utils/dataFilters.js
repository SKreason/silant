/**
 * Утилиты для работы с данными транспортных средств и справочников
 */

/**
 * Получает уникальные транспортные средства в формате {id, number}
 * @param {Array} data - Массив данных транспортных средств
 * @returns {Array<{id: number, number: string}>} Массив уникальных ТС
 */
export const getUniqueVehicles = (data = []) => {
    return data.map(({id, factory_number}) => ({
        id,
        number: factory_number
    }));
};

/**
 * Фильтрует информацию по выбранному транспортному средству
 * @param {Array} info - Массив информации для фильтрации
 * @param {Object|null} selectedVehicle - Выбранное ТС или null
 * @returns {Array} Отфильтрованный массив
 */
export const filterInfoByVehicle = (info = [], selectedVehicle = null) => {
    return selectedVehicle
        ? info.filter(item => item.vehicle?.id === selectedVehicle.id)
        : info;
};

/**
 * Получает уникальные типы справочников с отображаемыми названиями
 * @param {Array} data - Массив данных справочников
 * @returns {Array<{type: string, display: string}>} Массив уникальных типов
 */
export const getUniqueTypes = (data = []) => {
    const typeMap = new Map();

    data.forEach(item => {
        if (!typeMap.has(item.ref_type)) {
            typeMap.set(item.ref_type, {
                type: item.ref_type,
                display: item.ref_type_display || item.ref_type
            });
        }
    });

    return Array.from(typeMap.values());
};

/**
 * Фильтрует наименования справочника по типу
 * @param {Array} data - Массив данных справочника
 * @param {string} type - Тип для фильтрации
 * @returns {Array<{id: number, name: string, description: string}>} Отфильтрованный массив
 */
export const filterNamesByType = (data = [], type) => {
    return data
        .filter(item => item.ref_type === type)
        .map(({id, name, description}) => ({id, name, description}));
};
