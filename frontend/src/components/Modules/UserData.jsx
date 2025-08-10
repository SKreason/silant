import React, { useState } from 'react';
import "../../styles/components/Modules/UserData.scss";
import General from "./General.jsx";
import Maintenance from "./Maintenance.jsx";
import Claims from "./Claims.jsx";
import GeneralIcon from "../../assets/images/MainPage/info-icon.svg?react";
import MaintenanceIcon from "../../assets/images/MainPage/maintenance-icon.svg?react";
import ComplaintsIcon from "../../assets/images/MainPage/claims-icon.svg?react";
import ReferenceDirectory from "./ReferenceDirectory.jsx";

/**
 * Компонент для отображения пользовательских данных с вкладками
 * @component
 * @returns {JSX.Element} Компонент UserData
 */
const UserData = () => {
    // Состояние активной вкладки
    const [activeTab, setActiveTab] = useState('general');

    // Состояние видимости справочника
    const [isReferenceDirectoryOpen, setReferenceDirectoryOpen] = useState(false);

    // Обработчик открытия справочника
    const handleOpenReferenceDirectory = () => {
        setReferenceDirectoryOpen(true);
    };

    // Получение заголовка в зависимости от активной вкладки
    const getTitle = () => {
        const titles = {
            general: 'Информация о комплектации и технических характеристиках Вашей техники',
            maintenance: 'Информация о проведенных ТО Вашей техники',
            claims: 'Информация о рекламациях на Вашу технику'
        };
        return titles[activeTab] || titles.general;
    };

    // Конфигурация вкладок
    const tabs = [
        {
            id: 'general',
            label: 'Общая информация',
            icon: <GeneralIcon className="tab-icon" />
        },
        {
            id: 'maintenance',
            label: 'ТО',
            icon: <MaintenanceIcon className="tab-icon" />
        },
        {
            id: 'claims',
            label: 'Рекламации',
            icon: <ComplaintsIcon className="tab-icon" />
        }
    ];

    return (
        <div className="user-info">
            <h1 className="user-info__title">{getTitle()}</h1>

            <div className="user-info__wrapper">
                {/* Навигация по вкладкам */}
                <div className="user-info__tabs">
                    <nav className="user-info__tabs-nav">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`user-info__tabs-btn ${
                                    tab.id === activeTab
                                        ? 'user-info__tabs-btn--active'
                                        : 'user-info__tabs-btn--inactive'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Контент вкладок */}
                <div className="user-info__content">
                    {/* Кнопка открытия справочника */}
                    <button
                        onClick={handleOpenReferenceDirectory}
                        className="user-info__content reference-btn"
                    >
                        Справочники
                    </button>

                    {/* Секция общей информации */}
                    <div className={`user-info__content-section ${
                        activeTab === 'general' ? 'user-info__content-section--active' : ''
                    }`}>
                        {activeTab === 'general' && <General />}
                    </div>

                    {/* Секция технического обслуживания */}
                    <div className={`user-info__content-section ${
                        activeTab === 'maintenance' ? 'user-info__content-section--active' : ''
                    }`}>
                        {activeTab === 'maintenance' && <Maintenance />}
                    </div>

                    {/* Секция рекламаций */}
                    <div className={`user-info__content-section ${
                        activeTab === 'claims' ? 'user-info__content-section--active' : ''
                    }`}>
                        {activeTab === 'claims' && <Claims />}
                    </div>

                    {/* Модальное окно справочника */}
                    <ReferenceDirectory
                        isOpen={isReferenceDirectoryOpen}
                        onClose={() => setReferenceDirectoryOpen(false)}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserData;