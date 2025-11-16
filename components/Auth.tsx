
import React, { useState } from 'react';
import { BoxIcon } from './icons';

interface AuthProps {
    onLogin: (email: string, password_plaintext: string) => Promise<void>;
    onSignup: (email: string, password_plaintext: string) => Promise<void>;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onSignup }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!email.trim() || !password.trim()) {
            setError('Email and password cannot be empty.');
            return;
        }
        
        setLoading(true);
        try {
            if (isLoginView) {
                await onLogin(email, password);
            } else {
                await onSignup(email, password);
            }
            // On success, parent component will detect auth change and re-render
        } catch (authError: any) {
            switch (authError.code) {
                case 'auth/invalid-email':
                    setError('Please enter a valid email address.');
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError('Invalid email or password.');
                    break;
                case 'auth/email-already-in-use':
                    setError('An account with this email already exists.');
                    break;
                case 'auth/weak-password':
                    setError('Password should be at least 6 characters.');
                    break;
                default:
                    setError('An unexpected error occurred. Please try again.');
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError('');
        setEmail('');
        setPassword('');
    };
    
    const inputClasses = "w-full bg-dark border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary";

    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
            <div className="w-full max-w-sm mx-auto bg-dark p-8 rounded-lg shadow-2xl">
                <div className="text-center mb-8">
                    <BoxIcon className="h-12 w-12 text-primary mx-auto" />
                    <h1 className="mt-4 text-3xl font-bold text-white">SoleSync</h1>
                    <p className="text-gray-400">Your Sneaker Inventory</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                            Email Address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-300">
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClasses}
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : (isLoginView ? 'Log In' : 'Sign Up')}
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                    {isLoginView ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button onClick={toggleView} className="font-medium text-primary hover:text-indigo-400 focus:outline-none">
                        {isLoginView ? 'Sign up' : 'Log in'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;
