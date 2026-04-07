/* eslint-disable react-hooks/static-components */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#8b5cf6', '#a855f7'];

// Format amount with Indian number system (commas)
const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);

export default function ExpensePieChart({ transactions }) {
  // Filter only expenses and group by category
  console.log('Pie chart - total transactions:', transactions?.length || 0);
  const expenses = (transactions || []).filter(t => 
    t.type?.toLowerCase() === 'expense' || 
    t.type?.toLowerCase() === 'expenses'
  );
  console.log('Pie chart - expense count:', expenses.length);
  
  const categoryData = expenses.reduce((acc, t) => {
    const existing = acc.find(item => item.name === t.category);
    const safeAmount = Number(t.amount) || 0;
    if (existing) {
      existing.value += safeAmount;
    } else {
      acc.push({ name: t.category, value: safeAmount });
    }
    return acc;
  }, []).filter(item => item.value > 0);

  const totalExpense = categoryData.reduce((sum, item) => sum + item.value, 0);

  if (categoryData.length === 0) {
    return (
      <div className="chart-container pie-chart-section">
        <div className="chart-header">
          <h3>💸 Expense Breakdown</h3>
          <span className="chart-badge">Total: ₹0.00</span>
        </div>
        <div className="chart-wrapper" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <div style={{ fontSize: '64px' }}>📊</div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No expense data to display yet</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalExpense) * 100).toFixed(1);
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.name}</p>
          <p className="tooltip-value">₹{formatAmount(data.value)}</p>
          <p className="tooltip-percentage">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container pie-chart-section">
      <div className="chart-header">
        <h3>💸 Expense Breakdown</h3>
        <span className="chart-badge">Total: ₹{formatAmount(totalExpense)}</span>
      </div>
      <div className="chart-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
        <ResponsiveContainer width="100%" height={Math.max(400, categoryData.length * 40)}>
          <BarChart 
            data={categoryData} 
            layout="vertical"
            margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis type="number" stroke="var(--text-secondary)" />
            <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" width={140} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#8884d8" radius={[0, 8, 8, 0]}>
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="category-stats">
        {categoryData.map((item, index) => (
          <div key={index} className="stat-item">
            <div className="stat-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
            <div className="stat-info">
              <span className="stat-category">{item.name}</span>
              <span className="stat-percentage">₹{formatAmount(item.value)} ({((item.value / totalExpense) * 100).toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      
      
      </div>
    </div>
  );
}

