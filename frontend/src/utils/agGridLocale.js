/**
 * Локализация AG-Grid на русском языке
 * Оптимизированная версия с группировкой по функциональности
 * @type {import('ag-grid-community').LocaleText}
 */
export const AG_GRID_LOCALE_RU = {
    // ==================== Фильтрация ====================
    filter: {
        // Общие
        searchOoo: 'Поиск...',
        filterOoo: 'Фильтрация...',
        blanks: '(Пусто)',
        noMatches: 'Нет совпадений',
        apply: 'Применить',
        reset: 'Сбросить',
        clear: 'Очистить',
        cancel: 'Отменить',

        // Выбор
        selectAll: '(Выделить все)',
        selectAllSearchResults: '(Выделить все результаты поиска)',
        empty: 'Выберите один',

        // Условия
        andCondition: 'И',
        orCondition: 'ИЛИ',

        // Типы фильтров
        text: 'Текстовый фильтр',
        number: 'Числовой фильтр',
        date: 'Фильтр по дате',
        set: 'Выбрать фильтр',

        // Операторы
        operators: {
            equals: 'Равно',
            notEqual: 'Не равно',
            lessThan: 'Меньше, чем',
            greaterThan: 'Больше, чем',
            lessThanOrEqual: 'Меньше или равно',
            greaterThanOrEqual: 'Больше или равно',
            inRange: 'В промежутке',
            inRangeStart: 'от',
            inRangeEnd: 'до',
            contains: 'Содержит',
            notContains: 'Не содержит',
            startsWith: 'Начинается с',
            endsWith: 'Кончается на',
            blank: 'Пустое',
            notBlank: 'Непустое',
            before: 'До',
            after: 'После'
        }
    },

    // ==================== Таблица ====================
    table: {
        noRowsToShow: 'Нет данных',
        loadingOoo: 'Загрузка...',
        enabled: 'Включено',

        // Пагинация
        page: 'Страница',
        pageSizeSelectorLabel: "Показывать по",
        firstPage: 'Первая страница',
        previousPage: 'Предыдущая страница',
        nextPage: 'Следующая страница',
        lastPage: 'Последняя страница',

        // Строки
        selectedRows: 'Выбрано',
        totalRows: 'Всего строк',
        filteredRows: 'Отфильтровано',
        totalAndFilteredRows: 'Строки',

        // Группировка
        group: 'Группа',
        groupedColumnMessage: 'Перетащите сюда для группировки',
        valuesColumnMessage: 'Перетащите сюда для агрегации',
        pivotColumnMessage: 'Перетащите сюда для задания заголовков'
    },

    // ==================== Меню ====================
    menu: {
        // Столбцы
        pinColumn: 'Закрепить столбец',
        pinLeft: 'Закрепить слева',
        pinRight: 'Закрепить справа',
        noPin: 'Не закреплять',
        autosizeThis: 'Автоматически задавать размер этого столбца',
        autosizeAll: 'Автоматически задавать размер всем столбцам',
        resetColumns: 'Сбросить столбцы',

        // Группировка
        groupBy: 'Группировать по',
        ungroupBy: 'Разгруппировать по',

        // Действия
        copy: 'Копировать',
        copyWithHeaders: 'Копировать с заголовками',
        paste: 'Вставить',
        export: 'Экспорт',
        csvExport: 'Экспорт в CSV',
        excelExport: 'Экспорт в Excel',
        expandAll: 'Развернуть все',
        collapseAll: 'Свернуть все'
    },

    // ==================== Агрегация ====================
    aggregation: {
        sum: 'Сумма',
        min: 'Минимум',
        max: 'Максимум',
        none: 'Пусто',
        count: 'Количество',
        avg: 'Среднее',
        more: 'многих',
        to: 'по',
        of: 'из'
    },

    // ==================== Диаграммы ====================
    charts: {
        // Типы
        column: 'Столбиковая',
        bar: 'Панель',
        pie: 'Круговая',
        line: 'Линия',
        scatter: 'Диаграмма рассеяния',
        area: 'Область',
        histogram: 'Гистограмма',

        // Варианты
        grouped: 'Сгруппированная',
        stacked: 'Сложенная',
        normalized: '100% Сложенная',
        doughnut: 'Кольцевая',
        bubble: 'Пузырьковая',

        // Общие
        title: 'Заголовок',
        noData: 'Нет данных для диаграммы',
        settings: 'Настройки',
        data: 'Данные',
        format: 'Формат',
        categories: 'Категории',
        series: 'Серии',

        // Ошибки
        pivotChartRequiresPivotMode: 'Включите режим сводной таблицы'
    },

    // ==================== ARIA ====================
    aria: {
        hidden: 'скрытый',
        visible: 'видимый',
        checked: 'проверенный',
        unchecked: 'непроверенный',
        indeterminate: 'неопределенный',
        columnSelectAll: 'Выделить все столбцы',
        rowSelect: 'Выделить строку',
        rowDeselect: 'Снять выделение строки',
        search: 'Поиск',
        filterValue: 'Значение фильтра'
    }
};

// Деструктуризация для обратной совместимости
export const AG_GRID_LOCALE_RU_FLAT = {
    ...AG_GRID_LOCALE_RU.filter,
    ...AG_GRID_LOCALE_RU.filter.operators,
    ...AG_GRID_LOCALE_RU.table,
    ...AG_GRID_LOCALE_RU.menu,
    ...AG_GRID_LOCALE_RU.aggregation,
    ...AG_GRID_LOCALE_RU.charts,
    ...AG_GRID_LOCALE_RU.aria,

    // Сохраняем оригинальные ключи для совместимости
    dateFormatOoo: 'dd-mm-yyyy',
    ctrlC: 'Ctrl+C',
    ctrlV: 'Ctrl+V'
};
