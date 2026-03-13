import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ExpensePieChart from "../components/charts/ExpensePieChart";
import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MdEdit, MdDelete } from 'react-icons/md';
import { FaSignOutAlt } from 'react-icons/fa';
import "./Dashboard.css";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterTab, setFilterTab] = useState('all');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const getGreeting = (name) => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return `☀️ Morning, ${name}!`;
    if (hour >= 12 && hour < 17) return `🌅 Afternoon, ${name}!`;
    if (hour >= 17 && hour < 21) return `🌙 Evening, ${name}!`;
    return `⭐ Welcome back, ${name}!`;
  };

const loadTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data || []);
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError("Failed to load transactions");
      }
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Removed loadUserProfile - using localStorage userName

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
    loadTransactions();
  }, [navigate]);

  const validateForm = () => {
    if (!amount.trim()) {
      setError("Amount is required");
      return false;
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError("Please enter a valid positive amount");
      return false;
    }
    if (!category.trim()) {
      setError("Category is required");
      return false;
    }
    return true;
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setAmount(transaction.amount.toString());
    setCategory(transaction.category);
    setType(transaction.type);
    setError("");
    setSuccessMessage("");
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setAmount("");
    setCategory("");
    setType("expense");
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      await api.put(`/transactions/${editingTransaction._id}`, {
        type,
        category: category.trim(),
        amount: parseFloat(amount),
      });
      setAmount("");
      setCategory("");
      setType("expense");
      setEditingTransaction(null);
      setSuccessMessage("Transaction updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      loadTransactions();
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      else setError(err.response?.data?.message || "Failed to update transaction");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      setSuccessMessage("Transaction deleted!");
      setTimeout(() => setSuccessMessage(""), 3000);
      loadTransactions();
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      else setError("Failed to delete");
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      await api.post("/transactions", {
        type,
        category: category.trim(),
        amount: parseFloat(amount),
      });
      setAmount("");
      setCategory("");
      setType("expense");
      setSuccessMessage("Added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      loadTransactions();
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      else setError("Failed to add");
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

// const getTransactionDate = (transaction) => {
//   try {
//     const dateStr = transaction.date || transaction.createdAt;
//     if (!dateStr) return new Date();
//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) {
//       // Invalid date - return raw string or today
//       console.warn('Invalid date from API:', dateStr);
//       return new Date();
//     }
//     // Cap future dates
//     return new Date(Math.min(date.getTime(), Date.now()));
//   } catch (e) {
//     console.error('Date parse error:', e);
//     return new Date();
//   }
// };

// const formatTransactionDate = (transaction) => {
//   const date = getTransactionDate(transaction);
//   return date.toLocaleDateString('en-IN');
// };

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);

  const generatePDF = async () => {
    const reportElement = document.getElementById('report-content');
    if (!reportElement) return;

    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`fintrack-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handlePrint = () => window.print();

  const getFilteredTransactions = () => {
    const filtered = transactions.filter(t => {
      if (filterTab === 'all') return true;
      return t.type === filterTab;
    });
    return filtered.slice(0, 10);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>FinTrack Dashboard</h1>
        </div>
        <div className="user-greeting">
          {transactions.length > 0 && transactions[0].userId?.name 
            ? getGreeting(transactions[0].userId.name) 
            : userName ? getGreeting(userName) : 'Loading...'}
        </div>
        <button onClick={handleLogout} className="logout-button" title="Logout">
          <FaSignOutAlt /> Logout
        </button>
      </header>

      {error && (
        <div className="error-message">
          {error}
          <button className="close-error" onClick={() => setError("")}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="summary-cards">
        <div className="summary-card income">
          <h3>Income</h3>
          <p className="amount">₹{formatAmount(totalIncome)}</p>
        </div>
        <div className="summary-card expense">
          <h3>Expense</h3>
          <p className="amount">₹{formatAmount(totalExpense)}</p>
        </div>
        <div className="summary-card balance">
          <h3>Balance</h3>
          <p className={`amount ${balance >= 0 ? "positive" : "negative"}`}>
            ₹{formatAmount(balance)}
          </p>
        </div>
      </div>

      <div className="charts-section">
        <ExpensePieChart transactions={transactions} />
        <MonthlyBarChart transactions={transactions} />
      </div>

      <div className="transaction-form">
        <h3>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</h3>
        <form onSubmit={editingTransaction ? handleUpdate : addTransaction}>
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          {editingTransaction ? (
            <>
              <button type="submit" className="update-button">Update</button>
              <button type="button" className="cancel-button" onClick={handleCancelEdit}>
                Cancel
              </button>
            </>
          ) : (
            <button type="submit" className="add-button">Add</button>
          )}
        </form>
      </div>

      <div className="savings-advice">
        <h3>Savings Advice</h3>
        <div className="advice-cards">
          <div className="advice-card">
            <h4>Monthly Savings Goal</h4>
            <p className="goal-amount">₹{formatAmount(totalIncome * 0.2)}</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min((balance / (totalIncome * 0.2)) * 100, 100)}%`,
                }}
              ></div>
            </div>
            <p className="progress-text">
              {Math.min((balance / (totalIncome * 0.2)) * 100, 100).toFixed(1)}% of goal
            </p>
          </div>
          <div className="advice-card">
            <h4>Current Savings Rate</h4>
            <p className="rate">{((balance / totalIncome) * 100).toFixed(1)}%</p>
            <div className="advice-text">
              {((balance / totalIncome) * 100) < 10 && (
                <p>
                  💡 <strong>Tip:</strong> Try to save at least 20%. Reduce non-essential spending.
                </p>
              )}
              {((balance / totalIncome) * 100) >= 10 &&
                ((balance / totalIncome) * 100) < 20 && (
                  <p>👍 Good start! Aim for 20-30% savings rate.</p>
                )}
              {((balance / totalIncome) * 100) >= 20 && (
                <p>🎉 Excellent! You're saving well. Consider investing.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div id="report-content" className="report-section">
        <h3>FinTrack Monthly Report - {new Date().toLocaleDateString('en-IN')}</h3>
        <div className="report-summary">
          <div className="summary-item">
            <span>Total Income:</span>
            <strong>₹{formatAmount(totalIncome)}</strong>
          </div>
          <div className="summary-item">
            <span>Total Expense:</span>
            <strong>₹{formatAmount(totalExpense)}</strong>
          </div>
          <div className="summary-item balance">
            <span>Balance:</span>
            <strong>₹{formatAmount(balance)}</strong>
          </div>
        </div>
        <div className="report-transactions">
          <h4>Recent Transactions ({transactions.length})</h4>
          <div className="trans-list">
            {transactions.slice(0, 10).map((t) => (
              <div key={t._id} className={`trans-row ${t.type}`}>
                <span>{t.type.toUpperCase()}</span>
                <span>{t.category}</span>
                <span>{t.type === "income" ? "+" : "-"}₹{formatAmount(t.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="report-buttons">
          <button className="report-btn download" onClick={generatePDF}>
            Download PDF
          </button>
          <button className="report-btn print" onClick={handlePrint}>
            Print
          </button>
        </div>
      </div>

      <div className="transactions-section">
        <div className="transactions-header">
          <h3>Recent Transactions</h3>
          <div className="filter-tabs">
            <button 
              className={`tab ${filterTab === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTab('all')}
            >
              All
            </button>
            <button 
              className={`tab ${filterTab === 'income' ? 'active' : ''}`}
              onClick={() => setFilterTab('income')}
            >
              Income
            </button>
            <button 
              className={`tab ${filterTab === 'expense' ? 'active' : ''}`}
              onClick={() => setFilterTab('expense')}
            >
              Expense
            </button>
          </div>
        </div>
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>No transactions yet. Add your first transaction!</p>
          </div>
        ) : (
          <div className="transactions-grid">
            {getFilteredTransactions().map((t, index) => (
              <div
                key={t._id}
                className={`transaction-card ${t.type}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="transaction-icon">
                  {t.type === 'income' ? '💰' : '💸'}
                </div>
                <div className="transaction-info">
                  <span className="category">{t.category}</span>
                  <span className="type">{t.type.toUpperCase()}</span>
                </div>
                <div className="transaction-amount">
                  {t.type === "income" ? "+" : "-"}₹{formatAmount(t.amount)}
                </div>
                <div className="transaction-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEdit(t)}
                    title="Edit"
                  >
                    <MdEdit />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(t._id)}
                    title="Delete"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
