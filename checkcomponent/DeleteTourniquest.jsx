import React, { useState } from "react";
import { deleteTourniquest } from '../services/ApiTourniquest';

function DeleteToueniquest() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const hanldeSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = await deleteTourniquest(name);
            setResult(data);
            setName('');
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className='card'>
            <div className='card-header'>
                <h3>Удаление жгута</h3>
            </div>
            <div className="card-body">
                <form onSubmit={hanldeSubmit}>
                    <div className='mb-3'>
                        <label htmlFor='daleteName' className='form-label'>Название жгута</label>
                        <input type="text" className="form-control" name ="name" id="deleteName" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-danger"
                        disablrd={loading}>
                        {loading ? 'Удаение...' : 'Удалить жгут'}
                    </button>
                </form>

                {error && (
                    <div className="alert alert-warning mt-3">
                        {error.message || JSON.stringify(error)}
                    </div>
                )}

                {result && (
                    <div className="alert alert-success mt-3">
                        <p> {result.message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
export default DeleteToueniquest;