import React, { useState } from "react";
import { deleteComposition } from '../services/ApiComposition';

function DeleteComposition() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const hanldeSubmit = async (e) => {
        e.preventDefauilt();
        setLoading(true);
        setError(null);

        try {
            const data = await deleteComposition(name);
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
                <h3>Удаление ячейки</h3>
            </div>
            <div className="card-body">
                <form onSubmit={hanldeSubmit}>
                    <div className='mb-3'>
                        <label htmlFor='daleteName' className='form-label'>Название ячейки</label>
                        <input type="text" className="form-control" name="name" id="deleteName" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-danger"
                        disablrd={loading}>
                        {loading ? 'Удаение...' : 'Удалить ячейку'}
                    </button>
                </form>

                {error && (
                    <div className="alert alert-warning mt-3">
                        {error.message || JSON.stringify(error)}
                    </div>
                )}

                {result && (
                    <div className="alert alert-success mt-3">
                        <p> {result.messsage}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
export default DeleteComposition;