import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/products'); // После входа переходим к товарам
    } catch (err) {
      setError(err.error || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <h1 className="title">Вход в систему</h1>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label className="label">
              Email
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </label>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label className="label">
              Пароль
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="********"
              />
            </label>
          </div>
          
          <button 
            type="submit" 
            className="btn btn--primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}