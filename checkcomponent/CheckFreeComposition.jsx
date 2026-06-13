import { useState, useEffect, useCallback } from 'react';
import { getFreeComposition } from '../services/ApiComposition';

function GetFreeComposition() {

    const [data, setData] = useState(null); // Сырые данные с сервера
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getFreeComposition();
            setData(response); // Сохраняем ответ как есть, без обработки
        } catch (err) {
            setError(err.message || 'Ошибка при загрузке');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    

    return (
        <div className="card">
            <div className="card-header">
                <h3>Свободные ячеки на складе</h3>
            </div>
            {error && (
                <div className="alert alert-danger">
                    {error.message || JSON.stringify(error)}
                </div>
            )}

            {data && Array.isArray(data.data) && (
                <div className="mt-3 px-3 pb-3">
                    <h5>Результат поиска</h5>
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>Имя ячейки</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.Name || item.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="text-muted mt-2">
                            Всего записей: {data.data.length}
                        </div>
                    </div>
                </div>
            )}
            {/*если ответ не массив то выводим как объект */}
            {data && data.data && !Array.isArray(data.data) && (
                <div className="alert alert-info mt-3 mx-3">
                    <h5>Результат:</h5>
                    <pre>{JSON.stringify(data.data, null, 2)}</pre>
                </div>
            )}

            <div className="card-footer">
                <button
                    onClick={loadData}
                    className="btn btn-primary btn-sm"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-1"></span>
                            Загрузка...
                        </>
                    ) : (
                        '🔄 Обновить'
                    )}
                </button>
            </div>
        </div>

    );
}

export default GetFreeComposition;