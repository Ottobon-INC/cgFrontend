import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from './page';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn() as jest.Mock;

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({ login: jest.fn() });
    });

    it('renders the login form correctly', () => {
        render(<LoginPage />);

        expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('submits the form and calls login', async () => {
        const mockNavigate = jest.fn();
        const mockLogin = jest.fn();
        
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, data: { user: { email: 'admin@ottobon.com' } } }),
        });

        render(<LoginPage />);

        const emailInput = screen.getByPlaceholderText('you@company.com');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'admin@ottobon.com' } });
        fireEvent.change(passwordInput, { target: { value: 'supersecret' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('displays an error message on invalid credentials', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ success: false, error: 'Invalid credentials' }),
        });

        render(<LoginPage />);

        const emailInput = screen.getByPlaceholderText('you@company.com');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { value: 'wrong@user.com' } });
        fireEvent.change(passwordInput, { target: { value: 'badpass' } });
        fireEvent.click(submitButton);

        const errorMessage = await screen.findByText('Invalid credentials');
        expect(errorMessage).toBeInTheDocument();
    });
});
