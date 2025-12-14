import React from 'react';
import { useAuth } from '@/features/auth';
import { GoogleLoginButton } from './GoogleLoginButton';

export const Login: React.FC = () => {
  const { error } = useAuth();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans">
      {/* Left Side - Hero / Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#eff6ff] flex-col relative overflow-hidden">
        
        {/* Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-2 text-blue-600 z-20">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-sm">C</div>
            <span className="text-xl font-bold tracking-tight">CASHBOOK</span>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-12 relative z-10">
          <div className="relative w-full max-w-lg mb-12">
            {/* Mockup Composition */}
             <div className="relative">
               {/* Main tablet view */}
               <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-white transform -rotate-1">
                 <div className="h-6 bg-gray-100 border-b flex items-center gap-1 px-2">
                   <div className="w-2 h-2 rounded-full bg-red-400"></div>
                   <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                   <div className="w-2 h-2 rounded-full bg-green-400"></div>
                 </div>
                 <div className="bg-slate-800 p-2 h-48 flex">
                    {/* Abstract sidebar */}
                    <div className="w-12 bg-slate-700 rounded-l-md mr-2"></div>
                    {/* Abstract content */}
                    <div className="flex-1 bg-white rounded-md p-2">
                       <div className="h-2 w-20 bg-gray-200 rounded mb-2"></div>
                       <div className="h-16 w-full bg-blue-50 rounded mb-2"></div>
                       <div className="h-16 w-full bg-gray-50 rounded"></div>
                    </div>
                 </div>
               </div>
               
               {/* Phone view overlay */}
               <div className="absolute -bottom-8 -left-8 w-32 bg-white rounded-xl shadow-xl border-4 border-white p-2 transform rotate-3">
                  <div className="h-1 w-8 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-blue-100 rounded"></div>
                    <div className="h-8 bg-green-50 rounded"></div>
                    <div className="h-8 bg-red-50 rounded"></div>
                  </div>
               </div>

                {/* Floating Elements */}
                <div className="absolute top-1/2 -right-8 bg-white p-3 rounded-lg shadow-lg animate-bounce duration-[3000ms]">
                   <div className="text-xs text-gray-500">Net Bal</div>
                   <div className="text-lg font-bold text-blue-600">29,000</div>
                </div>
             </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 text-center mb-4 leading-tight">
            Add Team, Assign Roles & <br/> Manage Finances Transparently
          </h1>
          
          {/* Pagination Dots */}
          <div className="flex gap-2 mt-8">
            <div className="w-2 h-2 rounded-full border border-blue-600"></div>
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <div className="w-2 h-2 rounded-full border border-blue-600"></div>
          </div>
        </div>

        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white relative">
        <div className="w-full max-w-md">
           
           {/* Mobile Logo */}
           <div className="lg:hidden flex justify-center mb-8">
             <div className="flex items-center gap-2 text-blue-600">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">C</div>
                <span className="text-xl font-bold tracking-tight">CASHBOOK</span>
            </div>
           </div>

           <div className="text-center mb-10">
             <div className="flex justify-center mb-4 lg:hidden">
                {/* Placeholder for icon if needed */}
             </div>
             <div className="hidden lg:flex justify-center mb-6">
                <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">C</div>
                    <span className="text-xl font-bold tracking-tight">CASHBOOK</span>
                </div>
             </div>
             <h2 className="text-2xl font-bold text-gray-900">Log In/Create Account</h2>
           </div>

           <div className="border border-gray-200 rounded-xl p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] bg-white">
             <p className="text-gray-900 font-medium mb-6">Choose one option to continue</p>
             
             <div className="space-y-4">
               <div className="w-full">
                 <GoogleLoginButton />
               </div>

               <button 
                 className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-100"
               >
                 <svg className="h-5 w-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                 </svg>
                 Continue With Email
               </button>
             </div>

             <div className="mt-6 text-xs text-gray-500 leading-relaxed">
               By continuing, you are indicating that you accept our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
             </div>

             <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 uppercase">OR</span>
                </div>
              </div>

              <button className="w-full text-center text-blue-600 font-medium py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                Other Ways To Login
              </button>
           </div>

           {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
