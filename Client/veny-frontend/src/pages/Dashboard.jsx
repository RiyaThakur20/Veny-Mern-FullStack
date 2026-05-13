import { useEffect, useState } from 'react';
import VendorDashboard from './VendorDashboard';
import CustomerDashboard from './CustomerDashboard';

const Dashboard = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) setUser(storedUser);
    }, []);

    if (!user) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-veny-primary/20 border-t-veny-primary rounded-full animate-spin" />
        </div>
    );

    return user.role === 'vendor'
        ? <VendorDashboard user={user} />
        : <CustomerDashboard user={user} />;
};

export default Dashboard;