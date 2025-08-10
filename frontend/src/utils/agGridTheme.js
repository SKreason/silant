import { themeMaterial } from 'ag-grid-community';

/**
 * Цветовая палитра проекта для AG-Grid
 * @type {Object}
 */
export const COLORS = {
    primary: "#163E6C",
    accent: "#D20A11",
    textLight: "#FFFFFF",
    border: "#949494",
    oddRow: "#EBE6D6",
    wrapperBorder: true
};

/**
 * Кастомная тема AG-Grid на основе Material Design
 * @type {import('ag-grid-community').Theme}
 */
export const myTheme = themeMaterial.withParams({
    // Границы заголовков
    headerColumnBorder: {
        color: COLORS.border,
        height: '100%'
    },
    headerRowBorder: false,

    // Цветовая схема
    headerBackgroundColor: COLORS.primary,
    accentColor: COLORS.accent,
    headerTextColor: COLORS.textLight,

    // Границы и строки
    columnBorder: true,
    borderColor: COLORS.border,
    oddRowBackgroundColor: COLORS.oddRow,

    // Общие параметры
    wrapperBorder: COLORS.wrapperBorder
});

/**
 * Опционально: темная тема
 * @type {import('ag-grid-community').Theme}
 */
export const darkTheme = themeMaterial.withParams({
    headerBackgroundColor: "#1E1E1E",
    oddRowBackgroundColor: "#2D2D2D",
    headerTextColor: "#FFFFFF",
    borderColor: "#555555"
});