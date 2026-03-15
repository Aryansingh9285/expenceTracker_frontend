import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function MonthlyBarChart({ transactions }) {
  // Group transactions by month
  const monthlyData = (transactions || []).reduce((acc, t) => {
    const date = t.date || t.createdAt ? new Date(t.date || t.createdAt) : new Date();
    // Fix potential future dates
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

  if (monthlyData.length === 0) {
    return (
      <div className="chart-container">
        <h3>Monthly Overview</h3>
        <p className="no-data">No transaction data to display</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3>Monthly Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
          <Legend />
          <Bar dataKey="income" fill="#22c55e" name="Income" />
          <Bar dataKey="expense" fill="#ef4444" name="Expense" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

