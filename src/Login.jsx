import React, { useState } from 'react';
import { Lock, Users } from 'lucide-react';

// 管理者パスコード: 1234
// 閲覧者パスコード: 5678
const ADMIN_PASSCODE = '1234';
const VIEWER_PASSCODE = '5678';

function Login({ onLogin }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (passcode === ADMIN_PASSCODE) {
      onLogin('admin');
    } else if (passcode === VIEWER_PASSCODE) {
      onLogin('viewer');
    } else {
      setError('パスコードが正しくありません');
      setPasscode('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Little Brave Schedule管理Pro
          </h1>
          <p className="text-slate-500 text-sm">
            パスコードを入力してください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              4桁のパスコード
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength="4"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-center text-2xl tracking-widest font-mono"
              placeholder="••••"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            ログイン
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-400 text-center">
            管理者: 編集可能 | 閲覧者: 閲覧のみ
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
