import React, { useState, useEffect, useRef } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '' });
    
    // Updated formData state
    const [formData, setFormData] = useState({
        modelName: '',
        category: '',
        description: '',
        applications: '', // Will be a comma-separated string
        features: '',     // Will be a comma-separated string
    });
    
    // New state for dynamic specifications
    const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);

    const fileInputRef = useRef(null);
    const isFormValid = selectedFile && formData.modelName.trim() && formData.category && formData.description.trim();

    // Effect to hide notification
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => setNotification({ show: false, message: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // --- Event Handlers ---
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedFile(file);
    };
    
    // Handlers for dynamic specifications
    const handleSpecChange = (index, field, value) => {
        const newSpecs = [...specifications];
        newSpecs[index][field] = value;
        setSpecifications(newSpecs);
    };

    const addSpecField = () => {
        setSpecifications([...specifications, { key: '', value: '' }]);
    };

    const removeSpecField = (index) => {
        const newSpecs = specifications.filter((_, i) => i !== index);
        setSpecifications(newSpecs);
    };

    // Main submission logic
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;
        setIsUploading(true);

        const submissionData = new FormData();
        
        // Process and append data
        submissionData.append('modelFile', selectedFile);
        submissionData.append('modelName', formData.modelName);
        submissionData.append('category', formData.category);
        submissionData.append('description', formData.description);

        // Convert comma-separated strings to arrays
        const applicationsArray = formData.applications.split(',').map(item => item.trim()).filter(Boolean);
        const featuresArray = formData.features.split(',').map(item => item.trim()).filter(Boolean);
        
        // Convert array of {key, value} to a single JSON object
        const specsObject = specifications.reduce((obj, item) => {
            if (item.key && item.value) {
                obj[item.key] = item.value;
            }
            return obj;
        }, {});
        
        // Stringify arrays and objects for submission
        submissionData.append('applications', JSON.stringify(applicationsArray));
        submissionData.append('features', JSON.stringify(featuresArray));
        submissionData.append('specifications', JSON.stringify(specsObject));

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                body: submissionData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }
            
            setNotification({ show: true, message: '✅ Model uploaded successfully!' });
            // ... reset form logic ...
        } catch (error) {
            console.error("Error uploading model:", error);
            setNotification({ show: true, message: `❌ Error: ${error.message}` });
        } finally {
            setIsUploading(false);
        }
    };
    
    return (
        <div className="container">
            <header className="header">
                <h1>Admin Panel</h1>
                <p>Upload new 3D models and their technical data.</p>
            </header>

            <section className="upload-section">
                <form onSubmit={handleSubmit}>
                    {/* File Input */}
                    <div className="form-group">
                        <label className="form-label">3D Model File</label>
                        <input type="file" className="form-input" onChange={handleFileSelect} required accept=".obj,.fbx,.gltf,.glb"/>
                        {selectedFile && <p className="file-preview-text">Selected: {selectedFile.name}</p>}
                    </div>

                    {/* Standard Inputs */}
                    <div className="form-group">
                        <label className="form-label">Model Name</label>
                        <input type="text" id="modelName" className="form-input" required value={formData.modelName} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <input type="text" id="category" className="form-input" required value={formData.category} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea id="description" className="form-input" required value={formData.description} onChange={handleInputChange}></textarea>
                    </div>

                    {/* Array Inputs */}
                    <div className="form-group">
                        <label className="form-label">Applications</label>
                        <textarea id="applications" className="form-input" placeholder="Enter applications, separated by commas" value={formData.applications} onChange={handleInputChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Features</label>
                        <textarea id="features" className="form-input" placeholder="Enter features, separated by commas" value={formData.features} onChange={handleInputChange}></textarea>
                    </div>

                    {/* Dynamic Key-Value Inputs for Specifications */}
                    <div className="form-group">
                        <label className="form-label">Specifications</label>
                        {specifications.map((spec, index) => (
                            <div className="spec-row" key={index}>
                                <input type="text" placeholder="Key (e.g., Weight)" value={spec.key} onChange={(e) => handleSpecChange(index, 'key', e.target.value)} />
                                <input type="text" placeholder="Value (e.g., 2.5kg)" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} />
                                <button type="button" className="remove-btn" onClick={() => removeSpecField(index)}>–</button>
                            </div>
                        ))}
                        <button type="button" className="add-btn" onClick={addSpecField}>+ Add Specification</button>
                    </div>
                    
                    <button type="submit" className="upload-btn" disabled={!isFormValid || isUploading}>
                        {isUploading ? 'Uploading...' : 'Upload Model'}
                    </button>
                </form>
            </section>
            
            <div className={`notification ${notification.show ? 'show' : ''}`}>{notification.message}</div>
        </div>
    );
};

export default AdminPanel;