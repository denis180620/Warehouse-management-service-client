import React, {useState, useEffect} from 'react';
import {getTourniquests} from '../services/ApiTourniquest';

const TourniquestList = () => {
    const [items, setItems] = useState ([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [ total, setTotal] = useState(0);
    const [sortBy, setSortBy] = useState("createAt");
    const [sortOrder, setSortOrder] = useState("desc");
    
    const loadData = async(cursor = null) =>{
        setLoading(true);
        setError(null);

        try{
            const response = await getTourniquests(cursor, 20, sortBy, srtOrder);

            if(response.success){
                if(cursor === null){
                    setItems(response.data);
            }else{
                setItems(prev => [...prev, ...response.data]);
            }
            setNextCursor(response.nextCursor);
            setHasMore(response.hasMore);
            setTotal(response.total);
        }else{
                setError(response.message || 'Ошибка загрузки');
        }
        } catch (err) {
            setError(err.message || 'Ошибка сети');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [sortBy, sortOrder]);

    const loadMore = () =>{
        if(nextCursor && !loading){
            loadData(nextCursor);
        }
    };

    const handleSort = (field) =>{
        if(sortBy === field){
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        }else{
            setSortBy(field);
            setSortOrder("asc");
        }
    };
    const getStatusBadge = (status) =>{
        const statusConfig = {
            'out_of_stock': { text: 'Нет в наличии', className: 'badge-danger' },
            'critical': { text: 'Критический остаток', className: 'badge-danger' },
            'low': { text: 'Мало', className: 'badge-warning' },
            'no_wires': { text: 'Нет заготовок', className: 'badge-warning' },
            'low_wires': { text: 'Мало заготовок', className: 'badge-info' },
            'ok': { text: 'В наличии', className: 'badge-success' }
        };
        const config = statusConfig[status] || { text: status, className: 'badge-secondary' };
        return <span className={`badge ${config.className}`}>{config.text}</span>;
    };

    return (
        <div className="component-container">
            <h2>Список жгутов</h2>

            <div className="sort-controls">
                <button
                    onClick={() => handleSort('name')}
                    className={sortBy === 'name' ? 'active' : ''}
                >
                    По имени {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                    onClick={() => handleSort('quantity')}
                    className={sortBy === 'quantity' ? 'active' : ''}
                >
                    По количеству {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                    onClick={() => handleSort('modified')}
                    className={sortBy === 'modified' ? 'active' : ''}
                >
                    По дате {sortBy === 'modified' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
            </div>

            {error && <div className="error-message">❌ {error}</div>}

            <div className="items-list">
                {items.map(item => (
                    <div key={item.id} className="item-card">
                        <div className="item-header">
                            <h3>{item.name}</h3>
                            {getStatusBadge(item.status)}
                        </div>
                        <div className="item-details">
                            <p>Остаток: <strong>{item.quantityRemainder}</strong> шт.</p>
                            <p>Заготовок: <strong>{item.quantityWires}</strong> шт.</p>
                            <p>Продукции: <strong>{item.quantityProduct}</strong> шт.</p>
                            {item.compositionName && <p>Ячейка: {item.compositionName}</p>}
                            <p className="date">Обновлён: {new Date(item.lastModified).toLocaleString()}</p>
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

            {!hasMore && items.length > 0 && (
                <p className="end-message">Всего жгутов: {total}</p>
            )}

            {items.length === 0 && !loading && (
                <p className="empty-message">Нет данных</p>
            )}
        </div>
    );
};

export default TourniquestList;
