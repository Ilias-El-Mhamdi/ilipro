import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import './index.css';
import {CompaniesPage} from './pages/admin/CompaniesPage';
import {CompanyDetailPage} from './pages/admin/CompanyDetailPage';
import {UsersPage} from './pages/admin/UsersPage';
import {UserDetailPage} from './pages/admin/UserDetailPage';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/admin/companies" replace/>}/>
                    <Route path="/admin/companies" element={<CompaniesPage/>}/>
                    <Route path="/admin/companies/:companySlug" element={<CompanyDetailPage/>}/>
                    <Route path="/admin/users" element={<UsersPage/>}/>
                    <Route path="/admin/users/:userSlug" element={<UserDetailPage/>}/>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>,
);
