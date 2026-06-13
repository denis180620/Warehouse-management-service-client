import React, { useState } from "react";
import { createComposition } from '../services/ApiComposition';

function CreateComposition() {
    const [formData, setFromData] = useState({
        name: '',
        nameTourniquest: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    
    
        const handlerSubmit = async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);

            try {
                const data = await createComposition(formData);
                setResult(data);
                setFromData({ name: '', nameTourniquest: null });
            } catch (err) {
                setError(err);
            } finally {
                
                setLoading(false);
            }
        };
        return (
            <div className="card">
                <div className="card-header">
                    <h3>Создание новой ячейки</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={handlerSubmit}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Имя ячейки</label>
                            <input
                                type="number"
                                className="form-control"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={(e) => setFromData({ ...formData, name: e.target.value })}
                                required />
                        </div>
                        <button type="submit"
                            className="btn btn-primary"
                            disabled={loading}>
                            {loading ? 'Создание...' : 'Создать ячейку'}
                        </button>
                    </form>
                    {error && (
                        <div className="alert alert-dange mt-3">
                            {error.message || JSON.stringify(error)}
                        </div>
                    )}
                    {result && (
                        <div className="alert alert-success mt-3">
                            <h5>Ячейка создана</h5>
                            <p><strong>Название:</strong> {result.data?.data.name || result.data?.data.Name}</p>
                            
                        </div>
                    )}
                </div>
            </div>
        );
    }

export default CreateComposition;
