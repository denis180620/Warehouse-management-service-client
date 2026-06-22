import React, { useState } from "react";
import { useAuth } from '../context/AuthContext';
import "../Content/bootstrap.css";
import "./App.css";
import AddToTourniquest from "../checkcomponent/AddToDoTourniquest";
import CheckTourniquestQuantity from "../checkcomponent/checktourniquest_quantity";
import CreateTourniquest from "../checkcomponent/createTourniquest";
import RemoveToTourniquest from "../checkcomponent/RemoveToDoTourniquest";
import CheckTourniquest from "../checkcomponent/checkTourniquestName";
import DeleteToueniquest from "../checkcomponent/DeleteTourniquest";
import CreateComposition from "../checkcomponent/CreateComposition";
import DeleteComposition from "../checkcomponent/DeleteComposition";
import GetFreeComposition from "../checkcomponent/CheckFreeComposition";
import AddWires from "../checkcomponent/AddToWires";
import HistoryOperations from "../checkcomponent/HistoryOperations";

function MainApp() {
    const [isMenuOpen, setisMenuOpen] = useState(false);
    const [activeComponent, setActiveComponent] = useState('create');
    const [openGroups, setOpenGroups] = useState({
        tourniquest: false,
        warehouse: false,
        history: false
    });
    const {user, logout} = useAuth();

    const toggleMenu = () => {
        setisMenuOpen(!isMenuOpen);
    };
    const toggleGroup = (group) => {
        setOpenGroups(prev => ({
            ...prev,
            [group]: !prev[group]
        }));
    };
    const handleMenuClick = (componentName) => {
        setActiveComponent(componentName);
        setisMenuOpen(false);
    };
    const renderComponent = () => {
        switch (activeComponent) {
            case 'check':
                return <CheckTourniquest />;
            case 'checkQuantity':
                return < CheckTourniquestQuantity />;
            case 'addToTourniquest':
                return <AddToTourniquest />;
            case 'removeToDoTourniquest':
                return <RemoveToTourniquest />;
            case 'create':
                return <CreateTourniquest />;
            case 'delete':
                return <DeleteToueniquest />;
            case 'createcomposition':
                return <CreateComposition />;
            case "deletes":
                return <DeleteComposition />;
            case "checkcomposition":
                return <GetFreeComposition />;
            case "wires":
                return <AddWires />;
            case "History":
                return <HistoryOperations />;
            default:
                return <CreateTourniquest />;
        }
    };
    return (
        <div className="main">
            <div className="background-gradient"></div>
        <div className="app">
            <button className="menu-button" onClick={toggleMenu}>
                ☰ Меню
            </button>
                <div className="user-info">
                    <span className="user-name">
                        👤 {user?.fullName || user?.email}
                    </span>
                    <button onClick={logout} className="logout-btn">
                        🚪 Выйти
                    </button>
                    </div>

            {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}

            <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
                <button className="close-button" onClick={toggleMenu}></button>
                <nav className="menu-nav">
                        <h3 className="menu-title">Пункт управления жгутами</h3>
                        <div className="menu-group">
                            <div
                                className={`group-header ${openGroups.tourniquest ? 'open' : ''}`}
                                onClick={() => toggleGroup('tourniquest')}
                                >
                                
                                <span className="group-arrow">{openGroups.tourniquest ? 'Работа со жгутами ▼' : 'Работа со жгутами ▶'}</span>
                            </div>
                            {openGroups.tourniquest && (
                                <ul className="menu-list">
                                    <li className="menu-item">
                                        <button className="menu-link" onClick={() => handleMenuClick("check")}>Проверить жгут</button>
                                    </li>
                                    <li className="menu-item">
                                        <button className="menu-link" onClick={() => handleMenuClick("checkQuantity")}>Проверка жгутов меньше определенного количества</button>
                                    </li>
                                    <li className="menu-item">
                                        <button className="menu-link" onClick={() => handleMenuClick("addToTourniquest")}>Добавить жгуты на склад</button>
                                    </li>
                                    <li className="menu-item">
                                        <button className="menu-link" onClick={() => handleMenuClick("removeToDoTourniquest")}>Списать жгуты со клада</button>
                                    </li>
                                    <li className="menu-item">
                                        <button className="menu-link" onClick={() => handleMenuClick("create")}>Создать жгут</button>
                                    </li>
                                    <li className="menu-item">
                                        <button className="menu-link" onClick={() => handleMenuClick("delete")}>Удалить жгут</button>
                                    </li>
                                    <li className="menu-item">
                                        <button className="menu-link" onClick={() => handleMenuClick("wires")}>Добавить заготовки</button>
                                    </li>
                                </ul>
                            )}
                        </div>
                        <div className="menu-group">
                            <div
                                className={`group-header ${openGroups.warehouse ? 'open' : ''}`}
                                onClick={() => toggleGroup('warehouse')}
                            >
                                <span className="group-arrow">{openGroups.warehouse ? 'Работа со складом▼' : 'Работа со складом▶'}</span>
                            </div>
                            {openGroups.warehouse && (
                                <ul className="menu-list">
                                    <li className="menu-item">
                                        <button className="menu-link" onClick={() => handleMenuClick("createcomposition")}>Создать ячейку</button>
                                    </li>
                                    <li className="menu-item">
                                        <button className="menu-link" onClick={() => handleMenuClick("checkcomposition")}>Свободные ячейки</button>
                                    </li>
                                    <li className="menu-item">
                                        <button className="menu-link" onClick={() => handleMenuClick("deletes")}>Удалить ячейку</button>
                                    </li>
                                </ul>
                            )}
                        </div>
                        <div className="menu-group">
                            <div 
                                className={`group-header ${openGroups.history ? 'open' : ''}`}
                                onClick={() => toggleGroup('history')}
                                >
                                <span className="group-arrow">{openGroups.history ? 'Проверка истории▼' : 'Проверка истории▶'}</span>
                                </div>
                            {openGroups.history && (
                                <ul className="menu-list">
                                    <li className="menu-item">
                                        <button className="menu-link" onClick={() => handleMenuClick("")}>Получение списка жгутов(Раздел в разработке)</button>
                                    </li>
                                    <li className="menu-item">
                                        <button className="menu-link" onClick={() => handleMenuClick("History")}>История</button>
                                    </li>
                                </ul>
                            )}
                        </div>
                </nav>
            </div>

                <div className="content-area">
                    <div className="component-wrapper">
                        {renderComponent()}
                    </div>
                {activeComponent && activeComponent !== "create" &&(
                    <button className="back-button"
                        onClick={() => setActiveComponent(null)}> ← Назад 
                    </button>
                )}
                
            </div>
            </div>
        </div>
    )
}

export default MainApp;