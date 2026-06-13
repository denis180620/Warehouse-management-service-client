import React, { useState } from 'react';
import { getHistory } from '../services/ApiTourniquest';

const HistoryOperations = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const loadData = async (cursor = null) => {
        setLoading(true);
        setError(null);

        try {
            const from = fromDate ? new Date(fromDate) : null;
            const to = toDate ? new Date(toDate) : null;

            const response = await getHistory(from, to, cursor, 50);

            if (response.success) {
                if (cursor === null) {
                    setItems(response.data);
                } else {
                    setItems(prev => [...prev, ...response.data]);
                }
                setNextCursor(response.nextCursor);
                setHasMore(response.hasMore);
            } else {
                setError(response.message || 'Ошибка загрузки');
            }
        } catch (err) {
            setError(err.message || 'Ошибка сети');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setItems([]);
        setNextCursor(null);
        loadData();
    };

    const loadMore = () => {
        if (nextCursor && !loading) {
            loadData(nextCursor);
        }
    };

    const getOperationTypeText = (type) => {
        const types = {
            'create': 'Создание',
            'add': 'Добавление',
            'remove': 'Списание',
            'update_wires': 'Обновление заготовок'
        };
        return types[type] || type;
    };

    return (
        <div className="component-container">
            <h2>История операций</h2>

            <div className="filter-controls">
                <div className="date-filter">
                    <label>С:</label>
                    <input
                        type="datetime-local"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </div>
                <div className="date-filter">
                    <label>По:</label>
                    <input
                        type="datetime-local"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>
                <button onClick={handleSearch} disabled={loading}>
                    Поиск
                </button>
            </div>

            {error && <div className="error-message">❌ {error}</div>}

            <div className="history-list">
                {items.map(item => (
                    <div key={item.id} className="history-item">
                        <div className="history-header">
                            <strong>{item.tourniquestName}</strong>
                            <span className={`operation-type ${item.operationType}`}>
                                {getOperationTypeText(item.operationType)}
                            </span>
                        </div>
                        <div className="history-details">
                            <p>Количество: <strong>{item.quantity}</strong></p>
                            <p>Версия: {item.oldVersion} → {item.newVersion}</p>
                            <p>Время: {new Date(item.occurredAt).toLocaleString()}</p>
                            {item.userName && <p>Пользователь: {item.userName}</p>}
                        </div>
                    </div>
                ))}
            </div>

            {loading && <div className="loading">Загрузка...</div>}

            {hasMore && !loading && (
                <button onClick={loadMore} className="load-more-btn">
                    Загрузить ещё
                </button>
            )}

            {items.length === 0 && !loading && (
                <p className="empty-message">Нет операций за выбранный период</p>
            )}
        </div>
    );
};

export default HistoryOperations;