import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/**
 * Checks whether a JWT token exists and hasn't expired.
 * @param {string|null} token - The JWT string from localStorage.
 * @returns {boolean}
 */
const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const { exp } = jwtDecode(token);
        return exp * 1000 > Date.now(); // exp is in seconds, Date.now() is in ms
    } catch {
        return false; // malformed or tampered token
    }
};

/**
 * ProtectedRoute Component
 * Purpose: Restricts access to authenticated (and optionally, role-matched) users only.
 *
 * @param {JSX.Element} children     - The component to render if access is granted.
 * @param {string}      requiredRole - Optional. If provided, user's role must match (e.g. "vendor").
 */
const ProtectedRoute = ({ children, requiredRole }) => {
    // 1. Local state: are we still checking? is the token valid?
    const [checking, setChecking] = useState(true);
    const [valid, setValid]       = useState(false);
    const [userRole, setUserRole] = useState(null);

    // 2. Get the current location so we can redirect back after login
    const location = useLocation();

    // 3. VALIDATE TOKEN on mount (runs once, supports async upgrade later)
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (isTokenValid(token)) {
            try {
                const decoded = jwtDecode(token);
                setUserRole(decoded.role ?? null); // store role if present in token
            } catch {
                // token was valid for expiry but undecodable — treat as invalid
                setValid(false);
                setChecking(false);
                return;
            }
            setValid(true);
        } else {
            // Token missing, expired, or malformed — clear it from storage
            localStorage.removeItem('token');
            setValid(false);
        }

        setChecking(false);
    }, []);

    // 4. LOADING STATE: prevents flicker / premature redirect on page refresh
    if (checking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-400 text-sm animate-pulse">Verifying session...</p>
            </div>
        );
    }

    // 5. NOT AUTHENTICATED: redirect to login, save intended URL
    if (!valid) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    // 6. ROLE CHECK: if a requiredRole is specified, verify the user has it
    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    // 7. ACCESS GRANTED: render the requested page
    return children;
};

export default ProtectedRoute;