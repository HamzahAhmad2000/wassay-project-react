import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// BarChart Component
const SimpleBarChart = ({ data, dataKey, xAxisKey = 'product_name', chartName = 'Bar Chart', width = 600, height = 300, fillColor = '#3b82f6' }) => {
  return (
    <BarChart
      width={width}
      height={height}
      data={data}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xAxisKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey={dataKey} fill={fillColor} name={chartName} />
    </BarChart>
  );
};

// PieChart Component
const SimplePieChart = ({ data, dataKey, nameKey = 'product_name', width = 600, height = 300 }) => {
  const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

  return (
    <PieChart width={width} height={height}>
      <Pie
        data={data}
        dataKey={dataKey}
        nameKey={nameKey}
        cx="50%"
        cy="50%"
        outerRadius={100}
        fill="#8884d8"
        label
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

// LineChart Component
const SimpleLineChart = ({ data, dataKey, xAxisKey = 'product_name', chartName = 'Line Chart', width = 600, height = 300, strokeColor = '#3b82f6' }) => {
  return (
    <LineChart
      width={width}
      height={height}
      data={data}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xAxisKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey={dataKey} stroke={strokeColor} name={chartName} />
    </LineChart>
  );
};

// MultiLineChart Component
const SimpleMultiLineChart = ({ data, dataKeys, xAxisKey = 'product_name', chartNames = [], width = 600, height = 300 }) => {
  const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

  return (
    <LineChart
      width={width}
      height={height}
      data={data}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xAxisKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      {dataKeys.map((key, index) => (
        <Line
          key={key}
          type="monotone"
          dataKey={key}
          stroke={COLORS[index % COLORS.length]}
          name={chartNames[index] || key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        />
      ))}
    </LineChart>
  );
};

export { SimpleBarChart, SimplePieChart, SimpleLineChart, SimpleMultiLineChart };