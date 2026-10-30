import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

function AppContent() {
  const { user, role, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">SIPBAJA Frontend</h1>
        <p className="text-slate-600 text-sm mb-4">
          Vite + React 19 + TypeScript + Tailwind CSS v4
        </p>
        <div className="text-xs text-slate-500 bg-slate-100 p-3 rounded-lg">
          {isLoading ? (
            <span>Memeriksa sesi login...</span>
          ) : user ? (
            <span>
              Masuk sebagai: <strong>{user.nama}</strong> ({role || 'Tanpa Role'})
            </span>
          ) : (
            <span>Belum login</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

