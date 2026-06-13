import { useState } from "react";
import { checkTourniquestQuantity } from '../services/ApiTourniquest';

function CheckTourniquestQuantity() {
    const [numMax, setnumMax] = useState(1);
    const [loading, setLoading] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);


    const handlerSudmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await checkTourniquestQuantity(numMax);
            setResult(data);
        }
        catch (err) {
            setError(err);
            setResult(null);
        } finally {
            setLoading(false);
        }
    };
    return (

        <div className="card">
            <div className="card-header">
                <h3>Поиск по числу жгутов меньше заданного </h3>
            </div>
            <div className="card-body">
                <form onSubmit={handlerSudmit}>
                    <div className="mb-3">
                        <label htmlFor="checkQuantity" className="form-label">Количество жгутов</label>
                        <input type="number" className="form-control" id="searchQuantity" value={numMax} onChange={(e) => setnumMax(e.target.value)} min="1" required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Поиск...' : 'Найти жгуты'}
                    </button>
                </form>
            </div>

            {error && (
                <div className="alert alert-dange">
                    {error.message || JSON.stringify(error)}
                </div>
            )}

            {result && Array.isArray(result.data) && (
                <div className="mt-3 px-3 pb-3">
                    <h5>Результат поиска</h5>
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>Имя</th>
                                    <th>Оставшееся количество</th>
                                    <th>Ячейка</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name}</td>
                                        <td>{item.quantityRemainder}</td>
                                        <td>{item.cell}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table> 
                        <div className="text-muthed mt-2">
                            Всего записей: {result.data.length}
                        </div>
                    </div>
                </div>
            )}

            {result && result.data && !Array.isArray(result.data) && (
                <div className="alert alert-info mt-3 mx-3">
                    <h5>Результат поиска</h5>
                    <pre>{JSON.stringify(result.data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default CheckTourniquestQuantity 