import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Toaster} from 'sonner';
import './index.css';
import {CompaniesPage} from './pages/admin/CompaniesPage';
import {CompanyDetailPage} from './pages/admin/CompanyDetailPage';
import {UsersPage} from './pages/admin/UsersPage';
import {UserDetailPage} from './pages/admin/UserDetailPage';
import {LoginPage} from './pages/login/LoginPage';
import {AuthProvider, useAuth} from './contexts/AuthContext';
import {ProtectedRoute} from './components/ProtectedRoute';

function RootRedirect() {
    const {user, isLoading} = useAuth();
    if (isLoading) return null;
    return <Navigate to={user ? `/admin/users/${user.slug}` : '/login'} replace />;
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
                        <Route path="/admin/companies" element={<ProtectedRoute><CompaniesPage /></ProtectedRoute>} />
                        <Route path="/admin/companies/:companySlug" element={<ProtectedRoute><CompanyDetailPage /></ProtectedRoute>} />
                        <Route path="/admin/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
                        <Route path="/admin/users/:userSlug" element={<ProtectedRoute><UserDetailPage /></ProtectedRoute>} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>,
);
