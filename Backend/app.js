// Backend/app.js

import express from 'express';
import cors from 'cors';
import multer from 'multer'; // 👈 1. Import multer
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Supabase Client ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// --- Multer Setup ---
// 👈 2. Configure multer to handle files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- API Endpoints ---

// Endpoint for uploading a new product (file + metadata)
// 👈 3. 'upload' variable is now defined and can be used here
app.post('/api/products', upload.single('modelFile'), async (req, res) => {
    try {
        const file = req.file;
        const { modelName, category, description, applications, features, specifications } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'Model file is required.' });
        }

        const filePath = `public/${Date.now()}_${file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('3d-models')
            .upload(filePath, file.buffer, { contentType: file.mimetype });

        if (uploadError) throw uploadError;

        const { data: insertData, error: insertError } = await supabase
            .from('models')
            .insert([{
                model_name: modelName,
                category: category,
                description: description,
                file_path: uploadData.path,
                applications: JSON.parse(applications),
                features: JSON.parse(features),
                specifications: JSON.parse(specifications),
            }])
            .select()
            .single();

        if (insertError) throw insertError;
        res.status(201).json(insertData);
    } catch (error) {
        console.error('Error handling product upload:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
});

// Endpoint to fetch all products
// app.get('/api/products', async (req, res) => {
//     try {
//         const { data, error } = await supabase.from('models').select('*').order('created_at', { ascending: false });
//         if (error) throw error;
//         res.json(data);
//     } catch (error) {
//         console.error('Error fetching products:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

app.get('/api/products', async (req, res) => {
    try {
        let { data, error } = await supabase
            .from('models')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // NEW: Data consistency check for all products
        if (data) {
            data = data.map(product => {
                if (product.applications && typeof product.applications === 'string') {
                    product.applications = product.applications.split(',').map(s => s.trim());
                }
                if (product.features && typeof product.features === 'string') {
                    product.features = product.features.split(',').map(s => s.trim());
                }
                return product;
            });
        }

        res.json(data);
    } catch (error) {
       console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to fetch a single product
// app.get('/api/products/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const { data, error } = await supabase.from('models').select('*').eq('id', id).single();
//         if (error) throw error;
//         if (!data) return res.status(404).json({ error: 'Product not found' });
//         res.json(data);
//     } catch (error) {
//         console.error('Error fetching product from Supabase:', error);
//         res.status(500).json({ error: 'An internal server error occurred' });
//     }
// });

app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let { data, error } = await supabase
            .from('models')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Product not found' });

        // NEW: Data consistency check for a single product
        if (data.applications && typeof data.applications === 'string') {
            data.applications = data.applications.split(',').map(s => s.trim());
        }
        if (data.features && typeof data.features === 'string') {
            data.features = data.features.split(',').map(s => s.trim());
        }

        res.json(data);
    } catch (error) {
                console.error('Error fetching product from Supabase:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
});