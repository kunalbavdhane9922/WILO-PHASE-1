import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import supabase from './../../utils/supabase';
import './GameifiedProductShowcase.css';
import { Maximize, Minimize } from 'lucide-react';
// import './GameifiedProductShowcase.css';
const GameifiedProductShowcase = () => {
    const { id } = useParams();
    const mountRef = useRef(null);
    const animationRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [productData, setProductData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data from your API
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/products/${id}`);
                if (!response.ok) throw new Error(`Product not found (ID: ${id})`);
                const data = await response.json();
                setProductData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // Set up the 3D scene
    useEffect(() => {
        if (!mountRef.current || !productData || !productData.file_path) return;

        const { data: urlData } = supabase.storage.from('3d-models').getPublicUrl(productData.file_path);
        const modelUrl = urlData.publicUrl;

        const container = mountRef.current;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.autoRotate = true;
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        scene.add(directionalLight);

        const loader = new GLTFLoader();
        loader.load(modelUrl, (gltf) => {
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3()).length();
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            camera.position.copy(center);
            camera.position.z += size * 1.5; // Move camera slightly further back
            camera.lookAt(center);
            controls.target.copy(center);
            scene.add(model);
        });
        
        const animate = () => {
            animationRef.current = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();
        
        const handleResize = () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };
        window.addEventListener('resize', handleResize);
        
        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', handleResize);
            controls.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [productData]);
    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    
const handleFullscreenToggle = () => {
        const viewerElement = mountRef.current;
        if (!viewerElement) return;

        if (!document.fullscreenElement) {
            viewerElement.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };
    if (loading) return <div className="loading-container">Loading Product...</div>;
    if (error) return <div className="error-container">Error: {error}</div>;
    if (!productData) return <div className="loading-container">Product data could not be loaded.</div>;

    return (
<div className="showcase-container">
            <header className="showcase-header">
                <h1>{productData.model_name}</h1>
                <p>{productData.category}</p>
            </header>
            
            <div className="showcase-grid">
                <div className="viewer-column">
                    {/* The ref is now on the outer container for fullscreen */}
                    <div ref={mountRef} className="three-canvas-container">
                        {/* NEW: Fullscreen Button */}
                        <button onClick={handleFullscreenToggle} className="fullscreen-btn" title="Toggle Fullscreen">
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                    </div>
                </div>
                <div className="details-column">
                    <section className="details-section">
                        <h2>Description</h2>
                        <p>{productData.description}</p>
                    </section>

                    <section className="details-section">
                        <h2>Applications</h2>
                        <ul>
                            {productData.applications?.map((app, index) => <li key={index}>{app}</li>)}
                        </ul>
                    </section>

                    <section className="details-section">
                        <h2>Key Features</h2>
                        <ul>
                            {productData.features?.map((feature, index) => <li key={index}>{feature}</li>)}
                        </ul>
                    </section>
                </div>
            </div>
            
            <div className="specs-section">
                <h2>Technical Specifications</h2>
                <table className="specs-table">
                    <tbody>
                        {productData.specifications && Object.entries(productData.specifications).map(([key, value]) => (
                            <tr key={key}>
                                <th>{key}</th>
                                <td>{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GameifiedProductShowcase;