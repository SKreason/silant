/**
 * Форматирует дату в строку формата YYYY-MM-DD
 * @param {string|Date} dateInput - Дата в формате строки или объекта Date
 * @returns {string} Дата в формате YYYY-MM-DD
 * @throws {Error} Если входные данные не могут быть преобразованы в дату
 */
export const formatDate = (dateInput) => {
    // Обработка случаев, когда dateInput не передали
    if (!dateInput) {
        throw new Error('Не передана дата для форматирования');
    }

    let date;

    // Если уже объект Date
    if (dateInput instanceof Date) {
        date = dateInput;
    }
    // Если строка или число
    else {
        date = new Date(dateInput);

        // Проверка на валидность даты
        if (isNaN(date.getTime())) {
            throw new Error(`Невозможно преобразовать "${dateInput}" в дату`);
        }
    }

    // Форматирование в YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Альтернативный форматтер для даты (опционально)
 * @param {string|Date} dateInput - Входная дата
 * @param {string} format - Желаемый формат (по умолчанию 'YYYY-MM-DD')
 * @returns {string} Отформатированная дата
 */
export const formatDateFlexible = (dateInput, format = 'YYYY-MM-DD') => {
    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${dateInput}`);
    }

    const replacements = {
        'YYYY': date.getFullYear(),
        'MM': String(date.getMonth() + 1).padStart(2, '0'),
        'DD': String(date.getDate()).padStart(2, '0'),
        'HH': String(date.getHours()).padStart(2, '0'),
        'mm': String(date.getMinutes()).padStart(2, '0'),
        'ss': String(date.getSeconds()).padStart(2, '0')
    };

    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => replacements[match]);
};