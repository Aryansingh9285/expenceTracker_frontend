import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

// Format amount with Indian number system (commas)
const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);

export default function MonthlyBarChart({ transactions }) {
  // Group transactions by month
  const monthlyData = (transactions || []).reduce((acc, t) => {
    const date = t.date || t.createdAt ? new Date(t.date || t.createdAt) : new Date();
    // Fix potential future dates
    // eslint-disable-next-line react-hooks/purity
    const safeDate = new Date(Math.min(date.getTime(), Date.now()));
    const monthName = safeDate.toLocaleString('default', { month: 'short', year: '2-digit' });
    
    const existing = acc.find(item => item.month === monthName);
    if (existing) {
      if (t.type === 'income') {
        existing.income += t.amount || 0;
      } else {
        existing.expense += t.amount || 0;
      }
    } else {
      acc.push({
        month: monthName,
        income: t.type === 'income' ? (t.amount || 0) : 0,
        expense: t.type === 'expense' ? (t.amount || 0) : 0,
      });
    }
    return acc;
  }, []);

  // Sort by month
  monthlyData.sort((a, b) => {
    const [aMonth, aYear] = a.month.split(' ');
    const [bMonth, bYear] = b.month.split(' ');
    const aDate = new Date(`${aMonth} 20${aYear}`);
    const bDate = new Date(`${bMonth} 20${bYear}`);
    return aDate - bDate;
  });

  // Calculate insights
  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);

  if (monthlyData.length === 0) {
    return (
      <div className="chart-container bar-chart-section">
        <div className="chart-header">
          <h3>📊 Monthly Overview</h3>
        </div>
        <div className="chart-wrapper" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <div style={{ fontSize: '64px' }}>📈</div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No transaction data to display yet</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="tooltip-value">
              {entry.name}: ₹{formatAmount(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container bar-chart-section">
      <div className="chart-header">
        <h3>📊 Monthly Overview</h3>
        <span className="chart-badge">Income vs Expenses</span>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={370}>
          <BarChart 
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(226, 232, 240, 0.15)"
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              stroke="var(--text-tertiary)"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="var(--text-tertiary)"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar 
              dataKey="income" 
              fill="#10b981" 
              name="Income"
              radius={[8, 8, 0, 0]}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Bar 
              dataKey="expense" 
              fill="#ef4444" 
              name="Expense"
              radius={[8, 8, 0, 0]}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
     

      <div className="monthly-insights">
        <div className="insight-card">
          <div className="insight-icon">�</div>
          <div className="insight-label">Smart Tip</div>
          <div className="insight-value">Budget Goal</div>
          <div className="insight-desc">{totalExpense > totalIncome ? '⚠️ You spent more than earned. Cut expenses!' : '✅ Keep up the good savings rate!'}</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">📊</div>
          <div className="insight-label">Expense Ratio</div>
          <div className="insight-value">{((totalExpense / totalIncome) * 100).toFixed(0)}%</div>
          <div className="insight-desc">Of your income spent ({monthlyData.length} months)</div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">🎯</div>
          <div className="insight-label">Monthly Trend</div>
          <div className="insight-value">{monthlyData.length}</div>
          <div className="insight-desc">Months of data tracked</div>
        </div>
      </div>
    </div>
  );
}

