import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { DocumentStats } from '../types/DashboardData';

type StatsChartProps = {
  myProjectDocuments: number;
  myTeamDocuments: number;
  sharedDocuments: number;
  documentsSharedWithMe: number;
  statsData?: DocumentStats[]; // optionnel, peut être undefined
};

const COLORS = ['#436E8C', '#4D4B4B'];

// Fonction pour transformer statsData en données pour Recharts
function aggregateStatsByDate(stats?: DocumentStats[]) {
  if (!stats || stats.length === 0) return [];

  const grouped: Record<string, number> = {};

  stats.forEach(item => {
    const dateKey = new Date(item.date).toLocaleDateString();
    const total = item.documentCount || 0;
    grouped[dateKey] = (grouped[dateKey] || 0) + total;
  });

  return Object.entries(grouped).map(([date, count]) => ({
    name: date,
    documents: count,
  }));
}

export default function StatsChart({
  myProjectDocuments,
  myTeamDocuments,
  sharedDocuments,
  documentsSharedWithMe,
  statsData,
}: StatsChartProps) {
  console.log('Raw statsData:', statsData);

  // Toujours passer un tableau, même vide, à la fonction d'agrégation
  const chartData = aggregateStatsByDate(statsData ?? []);

  console.log('Données bar chart:', chartData);

  const pieData = [
    { name: 'Documents Projets', value: myProjectDocuments },
    { name: 'Documents Équipes', value: myTeamDocuments },
  ];

  return (
    <div className="my-5">
      {/* <h5 className="mb-3">Statistiques Documents</h5> */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          gap: '2rem',
        }}
      >
        {/* Bar Chart : évolution du nombre de documents par date */}
        <div style={{ flex: '1 1 500px', height: 300, minWidth: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="documents" name="Documents" fill="#2a598fff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{ flex: '1 1 300px', height: 300, minWidth: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
    data={pieData}
    dataKey="value"
    nameKey="name"
    cx="50%"
    cy="50%"
    outerRadius={100}
    label={({ percent }) => `${(percent * 100).toFixed(0)}%`} // Seulement le pourcentage
    labelLine={false}
  >
    {pieData.map((entry, index) => (
      <Cell
        key={`cell-${index}`}
        fill={COLORS[index % COLORS.length]}
        stroke="#fff"
        strokeWidth={2}
      />
    ))}
  </Pie>
  <Tooltip 
    formatter={(value, name) => [`${value} documents`, name]} 
  />
  <Legend 
    layout="horizontal" 
    verticalAlign="bottom" 
    align="center"
    wrapperStyle={{ paddingTop: '20px' }}
    formatter={(value) => (
      <span style={{ 
        color: value === 'Documents Projets' ? COLORS[0] : COLORS[1],
        fontWeight: 500
      }}>
        {value}
      </span>
    )}
  />
              <Tooltip />
              
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
