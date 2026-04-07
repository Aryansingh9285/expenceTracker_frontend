import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ExpensePieChart from "../components/charts/ExpensePieChart";
import MonthlyBarChart from "../components/charts/MonthlyBarChart";
import ExpenseWarning from "../components/ExpenseWarning";
import { MdEdit, MdDelete, MdWarning, MdDownload } from 'react-icons/md';
import { FaSignOutAlt } from 'react-icons/fa';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || null);
  const [userSalary] = useState(localStorage.getItem("userSalary") ? parseFloat(localStorage.getItem("userSalary")) : 0);
  const [showWarning, setShowWarning] = useState(true);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterTab, setFilterTab] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/");
  };

  // const handleSalarySave = (salary) => {
  //   if (salary > 0) {
  //     localStorage.setItem("userSalary", salary);
  //     setUserSalary(salary);
  //     setSuccessMessage("Monthly salary saved successfully!");
  //     setTimeout(() => setSuccessMessage(""), 3000);
  //   }
  // };

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
      console.log('Raw API response:', res.data);
      
      // Backend returns {success: true, transactions: [...]}
      const transactionsData = res.data?.transactions || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      
      console.log('Fixed transactions count:', transactionsData.length, transactionsData.slice(0,2));
      setTransactions(transactionsData);
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
    
    // Scroll to edit form
    const form = document.querySelector('.transaction-form');
    form?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    setUpdating(true);

    if (!validateForm()) {
      setUpdating(false);
      return;
    }

    const transactionId = editingTransaction._id || editingTransaction.id;
    console.log('Update - ID:', transactionId, 'Payload:', {type, category: category.trim(), amount: parseFloat(amount)});

    try {
      const response = await api.put(`/transactions/${transactionId}`, {
        type,
        category: category.trim(),
        amount: parseFloat(amount),
      });
      console.log('Update success:', response.data);
      setAmount("");
      setCategory("");
      setType("expense");
      setEditingTransaction(null);
      setSuccessMessage("Transaction updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      loadTransactions();
    } catch (err) {
      console.error('Update failed:', err.response?.status, err.response?.data);
      if (err.response?.status === 401) handleLogout();
      else setError(err.response?.data?.message || "Failed to update transaction");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    console.log('Delete - ID:', id);
    try {
      const response = await api.delete(`/transactions/${id}`);
      console.log('Delete success:', response.data);
      setSuccessMessage("Transaction deleted!");
      setTimeout(() => setSuccessMessage(""), 3000);
      loadTransactions();
    } catch (err) {
      console.error('Delete failed:', err.response?.status, err.response?.data);
      if (err.response?.status === 401) handleLogout();
      else setError("Failed to delete: " + (err.response?.data?.message || err.message));
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



  const handleDownloadAllData = () => {
    const reportWindow = window.open('', '_blank');
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN');
    const monthStr = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    
    // Create comprehensive HTML report
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FinTrack Complete Report</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f8fafc;
            padding: 40px;
            line-height: 1.6;
          }
          
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            max-width: 1200px;
            margin: 0 auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
          }
          
          .header h1 {
            color: #1e293b;
            font-size: 32px;
            margin-bottom: 10px;
          }
          
          .header-info {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-top: 20px;
            text-align: center;
          }
          
          .info-item {
            padding: 15px;
            background: #f1f5f9;
            border-radius: 8px;
          }
          
          .info-label {
            color: #64748b;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 5px;
          }
          
          .info-value {
            color: #1e293b;
            font-size: 16px;
            font-weight: 700;
          }
          
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 40px;
          }
          
          .summary-card {
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          }
          
          .summary-card.income {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1));
            border: 2px solid #10b981;
          }
          
          .summary-card.expense {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.1));
            border: 2px solid #ef4444;
          }
          
          .summary-card.balance {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.1));
            border: 2px solid #3b82f6;
          }
          
          .summary-card h3 {
            color: #64748b;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 8px;
            font-weight: 600;
          }
          
          .summary-card .value {
            font-size: 24px;
            font-weight: 700;
          }
          
          .summary-card.income .value {
            color: #10b981;
          }
          
          .summary-card.expense .value {
            color: #ef4444;
          }
          
          .summary-card.balance .value {
            color: #3b82f6;
          }
          
          h2 {
            color: #1e293b;
            font-size: 20px;
            margin: 30px 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background: white;
          }
          
          th {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          td {
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
          }
          
          tr:nth-child(even) {
            background: #f8fafc;
          }
          
          tr:hover {
            background: #f1f5f9;
          }
          
          .type-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .type-badge.income {
            background: #d1fae5;
            color: #065f46;
          }
          
          .type-badge.expense {
            background: #fee2e2;
            color: #7f1d1d;
          }
          
          .amount-cell {
            font-weight: 600;
            text-align: right;
          }
          
          .amount-cell.income {
            color: #10b981;
          }
          
          .amount-cell.expense {
            color: #ef4444;
          }
          
          .print-button {
            display: flex;
            justify-content: center;
            margin: 40px 0 20px 0;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
          }
          
          .print-btn {
            padding: 12px 32px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }
          
          .print-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          }
          
          .print-btn:active {
            transform: translateY(0);
          }
          
          @media print {
            body {
              padding: 0;
              background: white;
            }
            
            .container {
              box-shadow: none;
              padding: 20px;
            }
            
            .print-button {
              display: none;
            }
          }
          
          @media (max-width: 768px) {
            .header-info {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .summary-cards {
              grid-template-columns: 1fr;
            }
            
            table {
              font-size: 12px;
            }
            
            th, td {
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 FinTrack Complete Report</h1>
            <div class="header-info">
              <div class="info-item">
                <div class="info-label">Date</div>
                <div class="info-value">${dateStr}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Time</div>
                <div class="info-value">${timeStr}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Month</div>
                <div class="info-value">${monthStr}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Total Transactions</div>
                <div class="info-value">${transactions.length}</div>
              </div>
            </div>
          </div>
          
          <h2>Summary</h2>
          <div class="summary-cards">
            <div class="summary-card income">
              <h3>Total Income</h3>
              <div class="value">₹${formatAmount(totalIncome)}</div>
            </div>
            <div class="summary-card expense">
              <h3>Total Expense</h3>
              <div class="value">₹${formatAmount(totalExpense)}</div>
            </div>
            <div class="summary-card balance">
              <h3>Net Balance</h3>
              <div class="value">₹${formatAmount(balance)}</div>
            </div>
          </div>
          
          <h2>All Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(t => `
                <tr>
                  <td>${new Date(t.date || t.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><span class="type-badge ${t.type}">${t.type.toUpperCase()}</span></td>
                  <td>${t.category}</td>
                  <td>${t.notes || '-'}</td>
                  <td class="amount-cell ${t.type}">${t.type === 'income' ? '+' : '-'}₹${formatAmount(t.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="print-button">
            <button class="print-btn" onclick="window.print()">🖨️ Print Report</button>
          </div>
        </div>
      </body>
      </html>
    `;
    
    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
  };

  const getFilteredTransactions = () => {
    const filtered = (transactions ?? []).filter(t => {
      if (filterTab !== 'all' && t.type !== filterTab) return false;
      if (searchInput.trim()) {
        const search = searchInput.toLowerCase();
        const matchesCategory = t.category?.toLowerCase().includes(search);
        const matchesNotes = t.notes?.toLowerCase().includes(search);
        const matchesType = t.type?.toLowerCase().includes(search);
        const matchesAmount = formatAmount(t.amount)?.includes(search);
        return matchesCategory || matchesNotes || matchesType || matchesAmount;
      }
      return true;
    });
    return filtered;
  };

  const getPaginatedTransactions = () => {
    const filtered = getFilteredTransactions();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filtered = getFilteredTransactions();
    return Math.ceil(filtered.length / itemsPerPage);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>FinTrack Dashboard</h1>
        </div>
        <div className="user-greeting">
{(transactions ?? []).length > 0 && transactions[0]?.userId?.name 
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

      {showWarning && totalIncome > 0 && (
        <ExpenseWarning 
          totalExpense={totalExpense} 
          totalIncome={totalIncome}
          onClose={() => setShowWarning(false)}
        />
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
              <button type="submit" className="update-button" disabled={updating}>
                {updating ? 'Updating...' : 'Update'}
              </button>
              <button type="button" className="cancel-button" onClick={handleCancelEdit} disabled={updating}>
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
{(transactions ?? []).slice(0, 10).map((t) => (
              <div key={t._id} className={`trans-row ${t.type}`}>
                <span>{t.type.toUpperCase()}</span>
                <span>{t.category}</span>
                <span style={{color: t.type === "income" ? "blue" : "red"}}>{t.type === "income" ? "+" : "-"}₹{formatAmount(t.amount)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="report-buttons">
          <button className="report-btn download" onClick={handleDownloadAllData}>
            <MdDownload size={20} />
            Download All Expense Records
          </button>
        </div>
      </div>

      <div className="transactions-section">
        <div className="transactions-header">
          <h3>Recent Transactions ({getFilteredTransactions().length})</h3>
          <div className="search-and-filter">
            <input
              type="text"
              placeholder="Search by category, amount, or type..."
              className="search-input"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setCurrentPage(1);
              }}
            />
            <div className="filter-tabs">
              <button 
                className={`tab ${filterTab === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setFilterTab('all');
                  setCurrentPage(1);
                }}
              >
                All
              </button>
              <button 
                className={`tab ${filterTab === 'income' ? 'active' : ''}`}
                onClick={() => {
                  setFilterTab('income');
                  setCurrentPage(1);
                }}
              >
                Income
              </button>
              <button 
                className={`tab ${filterTab === 'expense' ? 'active' : ''}`}
                onClick={() => {
                  setFilterTab('expense');
                  setCurrentPage(1);
                }}
              >
                Expense
              </button>
            </div>
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
        ) : getFilteredTransactions().length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>No transactions match your search.</p>
          </div>
        ) : (
          <>
            <div className="transactions-grid">
              {getPaginatedTransactions().map((t, index) => (
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
                  <div className="transaction-amount" style={{color:t.type === "income" ? '#10b981' : '#ef4444'}}>
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
                      onClick={() => handleDelete(t._id || t.id)}
                      title="Delete"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {getTotalPages()}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))}
                disabled={currentPage === getTotalPages()}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
