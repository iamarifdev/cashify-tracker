import React from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const handleGoogleLogin = () => {
    // Simulating Google Auth
    setTimeout(() => {
      const mockUser: User = {
        id: '12345',
        name: 'Ariful Islam',
        email: 'ariful@example.com',
        photoUrl: 'https://picsum.photos/200'
      };
      localStorage.setItem('cashify_token', 'mock_token_123');
      localStorage.setItem('cashify_user', JSON.stringify(mockUser));
      onLogin(mockUser);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-50 flex-col justify-center items-center p-12 relative overflow-hidden">
         <div className="absolute top-8 left-8 flex items-center gap-2 text-blue-600">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">C</div>
            <span className="text-xl font-bold tracking-tight">CASHIFY</span>
        </div>
        
        <div className="relative z-10 text-center max-w-lg">
          <img 
            src="https://picsum.photos/600/400?grayscale" 
            alt="Dashboard Preview" 
            className="rounded-xl shadow-2xl mb-12 border-4 border-white"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Manage your finances together
          </h1>
          <p className="text-gray-600 text-lg">
            Add Team, Assign Roles & Manage Finances Transparently.
          </p>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
           <div className="lg:hidden flex justify-center mb-8">
             <div className="flex items-center gap-2 text-blue-600">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">C</div>
                <span className="text-xl font-bold tracking-tight">CASHIFY</span>
            </div>
           </div>

           <div className="text-center">
             <h2 className="text-3xl font-bold text-gray-900">Log In/Create Account</h2>
           </div>

           <div className="mt-8 space-y-4 border border-gray-200 rounded-xl p-8 shadow-sm">
             <p className="text-gray-600 font-medium mb-4">Choose one option to continue</p>
             
             <button 
               onClick={handleGoogleLogin}
               className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
             >
               <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 mr-3" alt="Google" />
               Continue With Google
             </button>

             <button 
               className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
             >
               <svg className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
               </svg>
               Continue With Email
             </button>

             <div className="pt-4 text-xs text-gray-500 text-center">
               By continuing, you are indicating that you accept our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
             </div>

             <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <button className="w-full text-center text-blue-600 font-medium py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                Other Ways To Login
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};