import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Plus, DollarSign, Filter, Wallet, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({ title: '', amount: '', category: '' });
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(res.data);
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/expenses`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData({ title: '', amount: '', category: '' });
      fetchExpenses(); // Refresh list
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchExpenses(); // Refresh list
    } catch (err) {
      console.error(err);
    }
  };

  const filteredExpenses = filterCategory 
    ? expenses.filter(exp => exp.category === filterCategory)
    : expenses;

  const totalExpense = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const categories = ['Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Other'];

  if (loading) return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Loading...</div>;

  return (
    <div className="container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Wallet size={32} color="var(--primary)" />
          <h1>Welcome, {user.name}</h1>
        </div>
        <div className="actions">
          <button onClick={handleLogout} className="btn btn-danger" style={{ display: 'flex', gap: '0.5rem', width: 'auto' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-title">Total Expenses</div>
          <div className="stat-card-value">${totalExpense.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Total Transactions</div>
          <div className="stat-card-value">{filteredExpenses.length}</div>
        </div>
      </div>

      <div className="main-content">
        <div>
          <div className="card" style={{ maxWidth: '100%' }}>
            <h2 className="card-title" style={{ fontSize: '1.25rem', textAlign: 'left', marginBottom: '1.5rem' }}>Add New Expense</h2>
            <form onSubmit={handleAddExpense}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                  type="text" 
                  name="title" 
                  className="form-input" 
                  placeholder="Grocery" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input 
                  type="number" 
                  name="amount" 
                  className="form-input" 
                  placeholder="50.00" 
                  value={formData.amount} 
                  onChange={handleChange} 
                  required 
                  min="0.01" 
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  name="category" 
                  className="form-select" 
                  value={formData.category} 
                  onChange={handleChange} 
                  required
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }}>
                <Plus size={18} /> Add Expense
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="filter-group">
            <Filter size={20} color="var(--text-secondary)" />
            <select 
              className="form-select" 
              style={{ width: 'auto' }} 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="expense-list">
            {filteredExpenses.length === 0 ? (
              <div className="empty-state">
                <DollarSign size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                <h3>No expenses found</h3>
                <p>Add some expenses to see them here.</p>
              </div>
            ) : (
              filteredExpenses.map(expense => (
                <div key={expense._id} className="expense-item">
                  <div className="expense-info">
                    <h3>{expense.title}</h3>
                    <div className="expense-meta">
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                      <span className="badge">{expense.category}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="expense-amount">
                      ${expense.amount.toFixed(2)}
                    </div>
                    <button 
                      onClick={() => handleDeleteExpense(expense._id)}
                      className="btn btn-danger"
                      style={{ padding: '0.5rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
