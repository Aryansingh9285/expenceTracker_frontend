import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

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

  if (categoryData.length === 0) {
    return (
      <div className="chart-container">
        <h3>Expense Breakdown</h3>
        <p className="no-data">No expense data to display</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3>Expense Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

