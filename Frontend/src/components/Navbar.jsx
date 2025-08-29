// src/components/Navbar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <NavLink to="/" className="navbar-logo-link">
                <div className="navbar-logo" style={{display : "flex", alignItems : "center", justifyContent : "center"}}><img src="/logo.png" alt="Company Logo" height={"100%"}/></div>
                <h2 className="navbar-brand-text"  style={{color : "white"}}>3D Model Showcase</h2>
            </NavLink>

            <div className="navbar-links">
                <NavLink 
                    to="/" 
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                    end // Use 'end' to prevent it from matching other routes like /products/2
                >
                    Showcase
                </NavLink>
                <NavLink 
                    to="/admin" 
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                    Admin Panel
                </NavLink>
            </div>
        </nav>
    );
};

export default Navbar;