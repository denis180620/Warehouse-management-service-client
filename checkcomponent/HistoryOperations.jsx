import React, { useState, useEffect } from 'react';
import { Historyget, DeleteHistory } from '../services/ApiHistiry';

const HistoryOperations = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [period, setPeriod] = useState({ from: null, to: null });
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Загрузка при монтировании
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (cursor = null) => {
        setLoading(true);
        setError(null);

        try {
            const from = fromDate ? new Date(fromDate) : null;
            const to = toDate ? new Date(toDate) : null;

            const response = await Historyget(from, to, cursor, 50);

            if (response.success && response.data) {
                const newItems = response.data.items || [];

                if (cursor === null) {
                    setItems(newItems);
                } else {
                    setItems(prev => [...prev, ...newItems]);
                }

                if (response.data.period) {
                    setPeriod(response.data.period);
                }

                if (response.data.nextCursor) {
                    setNextCursor(response.data.nextCursor);
                    setHasMore(true);
                } else {
                    setNextCursor(null);
                    setHasMore(false);
                }
            } else {
                setError(response.message || 'Ошибка загрузки');
            }
        } catch (err) {
            console.error('Ошибка загрузки:', err);
            setError(err.message || 'Ошибка сети');
        } finally {
            setLoading(false);
        }
    };

    // ИСПРАВЛЕНО: функция принимает id и возвращает функцию для обработчика клика
    const handleDelete = (id) => {
        return async () => {
            
            setDeletingId(id);
            try {
                const response = await DeleteHistory(id);
                if (response.success) {
                    // Удаляем запись из списка
                    setItems(prev => prev.filter(item => item.id !== id));
                    setError(null);
                } else {
                    setError(response.message || 'Ошибка удаления');
                }
            } catch (err) {
                console.error('Ошибка удаления:', err);
                setError(err.message || 'Ошибка сети');
            } finally {
                setDeletingId(null);
            }
        };
    };

    const handleSearch = () => {
        setItems([]);
        setNextCursor(null);
        setHasMore(false);
        loadData();
    };

    const loadMore = () => {
        if (nextCursor && !loading) {
            loadData(nextCursor);
        }
    };

    const operationName = (item) => {
        if (!item.tourniquestName || item.tourniquestName === "") {
            return `Ячейка ${item.compositionCell}`;
        }
        return item.tourniquestName;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPeriod = (date) => {
        if (!date) return 'всё время';
        return formatDate(date);
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
                    {loading ? 'Загрузка...' : 'Поиск'}
                </button>
                <button onClick={() => {
                    setFromDate('');
                    setToDate('');
                    setItems([]);
                    setNextCursor(null);
                    loadData();
                }} disabled={loading}>
                    Сбросить
                </button>
            </div>

            {error && <div className="error-message">❌ {error}</div>}

            {items.length > 0 && (
                <div className="mt-3 px-3 pb-3">
                    <h5>
                        История операций за период {
                            period?.from ? formatPeriod(period.from) : 'всё время'
                        } - {
                            period?.to ? formatPeriod(period.to) : 'настоящее время'
                        }
                    </h5>

                    <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Операция</th>
                                    <th>Название жгута или ячейки</th>
                                    <th>Количество</th>
                                    <th>Пользователь</th>
                                    <th>Время проведения операции</th>
                                    <th>Удалить</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={item.id || index}>
                                        <td>{item.id || index + 1}</td>
                                        <td>{item.operationType}</td>
                                        <td>{operationName(item)}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.userName}</td>
                                        <td>{formatDate(item.occurredAt)}</td>
                                        <td>
                                            {/* ИСПРАВЛЕНО: передаем функцию, а не вызываем ее */}
                                            <button
                                                onClick={handleDelete(item.id)}
                                                disabled={loading || deletingId === item.id}
                                                className="btn btn-danger btn-sm"
                                            >
                                                {deletingId === item.id ? 'Удаление...' : 'Удалить'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {hasMore && (
                        <div className="text-center mt-3">
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="btn btn-primary"
                            >
                                {loading ? 'Загрузка...' : 'Загрузить еще'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!loading && items.length === 0 && !error && (
                <div className="text-center mt-4">
                    <p>Нет записей для отображения</p>
                </div>
            )}

            {loading && <div className="loading">Загрузка...</div>}
        </div>
    );
};

export default HistoryOperations;