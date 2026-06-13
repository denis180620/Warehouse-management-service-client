import { useState } from 'react';
import { checkTourniquest } from '../services/ApiTourniquest';

function CheckTourniquest() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handlerSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await checkTourniquest(name);
            
            setResult(data);
        } catch (err) {
            console.error("Ошибка:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3>Проверка состояния жгута</h3>
            </div>
            <div className="card-body">
                <form onSubmit={handlerSubmit}>
                    <div className="mb-3">
                        <label htmlFor="checkName" className="form-label">Наименование жгута для поиска</label>
                        <input
                            type="text"
                            className="form-control"
                            id="checkName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Например: ПХ 70.005.40.5027777"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Поиск...' : 'Найти жгут'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="alert alert-danger m-3">
                    <strong>Ошибка:</strong> {error.message || JSON.stringify(error)}
                </div>
            )}

            {result && result.success && result.data && (
                <div className="mt-3 px-3 pb-3">
                    <h5>Результат поиска</h5>
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>Параметр</th>
                                    <th>Значение</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Название жгута</strong></td>
                                    <td>{result.data.data.name}</td>
                                </tr>
                                <tr>
                                    <td><strong>Количество на складе</strong></td>
                                    <td>{result.data.data.quantityRemainder}</td>
                                </tr>
                                <tr>
                                    <td><strong>Гоотовая продукция</strong></td>
                                    <td>{result.data.data.quantityProduct}</td>
                                </tr>
                                <tr>
                                    <td><strong>Ячейка на складе</strong></td>
                                    <td>{result.data.data.composition?.name || '-'}</td>
                                </tr>
                                <tr>
                                    <td><strong>Оставшееся колчисество заготовок</strong></td>
                                    <td>{result.data.data.quantityWires}</td>
                                </tr>
                                <tr>
                                    <td><strong>Дата создания</strong></td>
                                    <td>{result.data.data.dateTime ? new Date(result.data.dateTime).toLocaleString() : '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {result && result.success && !result.data && (
                <div className="alert alert-info m-3">
                    <strong>Информация:</strong> Жгут с именем "{name}" не найден.
                </div>
            )}
        </div>
    );
}

export default CheckTourniquest;