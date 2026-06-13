import { useState } from "react";
import { addWires } from '../services/ApiTourniquest';

function AddWires() {
    const [data, SetData] = useState({
        name: '',
        quantity: 0
    });
    const [loading, SetLoading] = useState(false);
    const [result, SetResult] = useState(null);
    const [error, SetError] = useState(null);

    const handlerSubmit = (e) => {
        const { name, value } = e.target;
        SetData(prev => ({
            ...prev,
            [name]: name === "quantity" ? parseInt(value) || 0 : value
        }));
    };
    const submitChange = async (e) => {
        e.preventDefault();
        SetLoading(true);
        SetError(null);

        try {
            const dataform = await addWires(data);
            SetResult(dataform);
        } catch (err) {
            SetError(err);
        } finally {
            SetLoading(false);
        }
    }
    return (
        <div className="card">
            <div className="card-header">
                <h3>Добовление заготовок на склад</h3>
            </div>
            <div className="card-body">
                <form onSubmit={submitChange}>
                    <div className="mb-3">
                        <label htmlFor="updateName" className="form-label">Название жгута:</label>
                        <input type="text" className="form-control" id="updateName" name="name" value={data.name} onChange={handlerSubmit} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="updateQuantity" className="form-label">Количесвто добавляемых заготовок</label>
                        <input type="number" className="form-control" id="updateQuantity" name="quantity" value={data.quantity} onChange={handlerSubmit} required />
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
    )
}
export default AddWires;