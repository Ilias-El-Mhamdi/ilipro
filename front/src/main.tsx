import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Toaster} from 'sonner';
import './index.css';
import {CompaniesPage} from './pages/admin/CompaniesPage';
import {CompanyDetailPage} from './pages/admin/CompanyDetailPage';
import {UsersPage} from './pages/admin/UsersPage';
import {UserDetailPage as AdminUserDetailPage} from './pages/admin/UserDetailPage';
import {UserDetailPage as UserDetailPage} from './pages/user/UserDetailPage';
import {LoginPage} from './pages/login/LoginPage';
import {AuthProvider, useAuth} from './contexts/AuthContext';
import {ProtectedRoute, AdminRoute} from './components/ProtectedRoute';

function RootRedirect() {
    const {user, isLoading} = useAuth();
    if (isLoading) return null;
    if (!user) return <Navigate to="/login" replace />;
    return <Navigate to={user.isAdmin ? `/admin/users/${user.slug}` : `/user/${user.slug}`} replace />;
}

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <Toaster theme="dark" position="bottom-right" richColors />
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/" element={<RootRedirect />} />

                        {/* Routes admin */}
                        <Route path="/admin/companies" element={<AdminRoute><CompaniesPage /></AdminRoute>} />
                        <Route path="/admin/companies/:companySlug" element={<AdminRoute><CompanyDetailPage /></AdminRoute>} />
                        <Route path="/admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
                        <Route path="/admin/users/:userSlug" element={<AdminRoute><AdminUserDetailPage /></AdminRoute>} />

                        {/* Route utilisateur */}
                        <Route path="/user/:userSlug" element={<ProtectedRoute><UserDetailPage /></ProtectedRoute>} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>,
);
