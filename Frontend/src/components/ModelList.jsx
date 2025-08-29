// src/components/ModelList.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ModelList.css'; // 👈 1. Import the new CSS file

const ModelList = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetch('/api/products');
                if (!response.ok) throw new Error('Failed to fetch models');
                const data = await response.json();
                setModels(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchModels();
    }, []);

    if (loading) return <div>Loading models...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        // 👇 2. Apply the new class names
        <div className="model-list-wrapper">
            <h2 className="model-list-title">My 3D Models</h2>
            <div className="model-list-grid">
                {models.map(model => (
                    <Link to={`/products/${model.id}`} key={model.id} className="model-card-link">
                        <div className="model-card">
                            <h3>{model.model_name}</h3>
                            <p><strong>Category:</strong> {model.category}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ModelList;