import React, { useState, useEffect } from 'react';
import { MdWarning, MdClose } from 'react-icons/md';

const ExpenseWarning = ({ totalExpense, totalIncome, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [expenseRatio, setExpenseRatio] = useState(0);

  useEffect(() => {
    if (totalIncome > 0) {
      const ratio = (totalExpense / totalIncome) * 100;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpenseRatio(ratio);
      console.log('💰 Income:', totalIncome, '| 💸 Expense:', totalExpense, '| Ratio:', ratio.toFixed(1) + '%');
    }
  }, [totalExpense, totalIncome]);

  const handleClose = () => {
    setIsVisible(false);
    onClose && onClose();
  };

  // Show warning only if expense ratio > 50%
  if (!isVisible || !totalIncome || expenseRatio <= 50) {
    return null;
  }

  const remainingBudget = totalIncome - totalExpense;
  const advice = getAdvice(expenseRatio, totalIncome, totalExpense);

  return (
    <div className="warning-backdrop">
      <div className="expense-warning animate-slideDown">
      <div className="warning-header">
        <div className="warning-title">
          <MdWarning className="warning-icon" />
          <h3>⚠️ High Expense Ratio Alert!</h3>
        </div>
        <button className="close-warning" onClick={handleClose}>
          <MdClose />
        </button>
      </div>

      <div className="warning-content">
        <p className="warning-message">
          Your expenses are <strong>{expenseRatio.toFixed(1)}%</strong> of your income!
        </p>

        <div className="expense-breakdown">
          <div className="breakdown-item">
            <span className="label">Total Income:</span>
            <span className="value salary">₹{totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="breakdown-item">
            <span className="label">Total Expenses:</span>
            <span className="value expense">₹{totalExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="breakdown-item">
            <span className="label">Remaining Balance:</span>
            <span className={`value ${remainingBudget >= 0 ? 'positive' : 'negative'}`}>
              ₹{remainingBudget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        <div className="progress-indicator">
          <div className="progress-bar-warning">
            <div 
              className="progress-fill-warning" 
              style={{ width: Math.min(expenseRatio, 100) + '%' }}
            />
          </div>
          <p className="progress-text">{expenseRatio.toFixed(1)}% of income spent</p>
        </div>

        <div className="advice-section">
          <h4>💡 Friendly Advice:</h4>
          <ul className="advice-list">
            {advice.map((item, index) => (
              <li key={index} className="advice-item">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {expenseRatio > 100 && (
          <div className="critical-notice">
            <strong>⚠️ Critical Notice:</strong> Your expenses exceed your total income! Reduce spending immediately.
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

const getAdvice = (ratio, income, expense) => {
  const advice = [];

  if (ratio > 100) {
    advice.push('You are spending more than your total income - this is unsustainable');
    advice.push('Review all non-essential expenses immediately');
    advice.push('Consider cutting back on discretionary spending');
  } else if (ratio > 80) {
    advice.push('Your expense ratio is critically high (80%+)');
    advice.push('Cut back on non-essential expenses (dining, entertainment, shopping)');
    advice.push('Review subscriptions and cancel unused services');
    advice.push('Set stricter daily spending limits');
  } else if (ratio > 65) {
    advice.push('Your expense ratio is quite high (65%+)');
    advice.push('Avoid impulse purchases and unnecessary expenses');
    advice.push('Review your spending patterns');
    advice.push('Plan remaining budget for rest of month');
  } else if (ratio > 50) {
    advice.push('Your expense ratio has exceeded 50% of income');
    advice.push('Monitor your spending more carefully');
    advice.push('Consider planning your remaining expenses');
    advice.push('Try to reduce spending in coming period');
  }

  // Calculate remaining days safely
  if (expense > 0) {
    const dailyExpenseRate = expense / 30;
    const remainingDays = Math.ceil((income - expense) / dailyExpenseRate);

    if (remainingDays > 0 && remainingDays < 30) {
      advice.push(`At your current spending rate, your balance will last ${remainingDays} more days`);
    }
  }

  // Add positive suggestions
  if (ratio > 50) {
    advice.push('Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings');
    advice.push('Build an emergency fund for unexpected expenses');
    advice.push('Consider starting a savings plan for the remaining amount');
  }

  return advice;
};

export default ExpenseWarning;
