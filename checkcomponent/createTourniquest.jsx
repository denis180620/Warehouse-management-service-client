import React, { useState } from "react";
import { createTourniquest } from '../services/ApiTourniquest';

function CreateTourniquest() {
    const [formData, setFormData] = useState({
        name: '',
        quantity: 1,
        cell: 1,
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseFloat(value) || 0 : value

        }));
    };

    const handlerSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // ВАЖНО: Формируем правильную структуру для сервера
            const requestData = {
                name: formData.name,
                quantity: formData.quantity,  // ← правильное имя поля
                cell: formData.cell   // ← правильная структура

            };

            console.log("Отправляем данные:", requestData);

            const data = await createTourniquest(requestData);
            console.log("Ответ сервера:", data);

            setResult(data);

            setFormData(prev => ({
                ...prev,
                name: '',
                quantity: 1,
                cell: 1
            }));
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3>Создание нового жгута</h3>
            </div>
            <div className="card-body">
                <form onSubmit={handlerSubmit}>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Название жгута</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="quantity" className="form-label">Количество</label>
                        <input
                            type="number"
                            className="form-control"
                            id="quantity"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="composition" className="form-label">Ячейка на складе</label>
                        <input
                            type="number"
                            className="form-control"
                            id="cell"
                            name="cell"  // ← name для formData
                            step="0.01"         // ← шаг 0.01 (позволяет вводить дробные)
                            value={formData.cell}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Создание...' : 'Создать жгут'}
                    </button>
                </form>

                {error && (
                    <div className="alert alert-dange mt-3">
                        {error.message || JSON.stringify(error)}
                    </div>
                )}

                {result && (
                    <div className="alert alert-success mt-3">
                        <h5>Жгут успешно создан</h5>
                        <p>Название: {result.data.name}</p>
                        <p>Количество: {result.data.quantity}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
export default CreateTourniquest;