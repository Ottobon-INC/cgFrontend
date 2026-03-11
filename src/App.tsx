import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import HomePage from './app/page';
import LoginPage from './app/login/page';
import RegisterPage from './app/register/page';
import ForgotPasswordPage from './app/forgot-password/page';
import ResetPasswordPage from './app/reset-password/page';
import AdminPage from './app/admin/page';
import PendingApprovalPage from './app/pending-approval/page';
import ComponentDetailPage from './app/components/[id]/page';

// Dashboard Routes
import DashboardPage from './app/(dashboard)/page';
import AnalyticsPage from './app/analytics/page';
import BountiesPage from './app/bounties/page';
// Layout Helper
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { status, user } = useAuth();
    if (status === 'loading') return <div>Loading...</div>;
    if (status === 'unauthenticated') return <Navigate to="/login" />;
    if (user && !user.is_approved) return <Navigate to="/pending-approval" />;
    return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { status, user } = useAuth();
    if (status === 'loading') return <div>Loading...</div>;
    if (status === 'unauthenticated' || !user?.is_admin) return <Navigate to="/" />;
    return <>{children}</>;
};

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="bg-hub-bg text-hub-text min-h-screen selection:bg-hub-accent/20">
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        
                        <Route path="/pending-approval" element={<PendingApprovalPage />} />

                        <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                        <Route path="/components/:id" element={<PrivateRoute><ComponentDetailPage /></PrivateRoute>} />

                        {/* Dashboard Routes */}
                        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                        <Route path="/analytics" element={<AdminRoute><AnalyticsPage /></AdminRoute>} />
                        <Route path="/bounties" element={<PrivateRoute><BountiesPage /></PrivateRoute>} />
                        {/* Admin */}
                        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}
