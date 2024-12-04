import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function DataCharts() {
  const data = [
    { time: '06:00', stressLevel: 2, incidents: 0 },
    { time: '07:00', stressLevel: 3, incidents: 1 },
    { time: '08:00', stressLevel: 4, incidents: 1 },
    // Add more data points
  ]

  return (
    <div className="prison-card">
      <h2>Data Analysis</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                color: '#D1D5DB'
              }}
              labelStyle={{ color: '#D1D5DB' }}
            />
            <Line type="monotone" dataKey="stressLevel" stroke="#8B5CF6" />
            <Line type="monotone" dataKey="incidents" stroke="#10B981" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 