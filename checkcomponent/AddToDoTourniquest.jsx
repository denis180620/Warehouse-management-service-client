import { useState } from "react";
import { addToTourniquest } from '../services/ApiTourniquest';


function AddToTourniquest() {
    const [data, setData] = useState({
        name: '',
        quantity: 0
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value) || 0 : value
        }));
    };
    const submitChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const dataform = await addToTourniquest(data);
            setResult(dataform);
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="card">
            <div className="card-header">
                <h3>Добовление жгутов на склад</h3>
            </div>
            <div className="card-body">
                <form onSubmit={submitChange}>
                    <div className="mb-3">
                        <label htmlFor="updateName" className="form-label">Название жгута:</label>
                        <input type="text" className="form-control" id="updateName" name="name" value={data.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="updateQuantity" className="form-label">Количесвто добавляемых жгутов</label>
                        <input type="number" className="form-control" id="updateQuantity" name="quantity" value={data.quantity} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Обновление....' : 'Добавить на склад'}
                    </button>
                </form>

                {error && (
                    <div className="alert alert-dange mt-3">
                        {error.message || JSON.stringify(error)}
                    </div>
                )}

                {result && (
                    <div className="alert alert-success mt-3">
                        <h5>Успешно</h5>
                        <p>{result.composition}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
export default AddToTourniquest;