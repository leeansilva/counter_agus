import { useEffect, useState } from 'react';
import { getStats, incrementAll, getYearlyStats } from './services/counterApi';
import type { CounterStats, MonthlyStat } from './services/counterApi';
import { Panel, Button, Loader, Grid, Row, Col, Stack } from 'rsuite';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PlusIcon from '@rsuite/icons/Plus';
import logoOca from './assets/logoOca.svg';
import './index.css';

function App() {
  const [stats, setStats] = useState<CounterStats | null>(null);
  const [yearlyStats, setYearlyStats] = useState<MonthlyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [incrementing, setIncrementing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const [statsData, yearlyData] = await Promise.all([getStats(), getYearlyStats()]);
    setStats(statsData);
    setYearlyStats(yearlyData);
    setLoading(false);
  };

  const handleIncrement = async () => {
    if (incrementing) return;
    setIncrementing(true);

    // Optistic update
    if (stats) {
      setStats({
        total: stats.total + 1,
        daily: stats.daily + 1,
        weekly: stats.weekly + 1,
        monthly: stats.monthly + 1,
      });
    }

    if (yearlyStats.length > 0) {
      const currentMonthIndex = new Date().getMonth();
      const newYearlyStats = [...yearlyStats];
      newYearlyStats[currentMonthIndex] = { ...newYearlyStats[currentMonthIndex], count: newYearlyStats[currentMonthIndex].count + 1 };
      setYearlyStats(newYearlyStats);
    }

    const newData = await incrementAll();
    setStats(newData);
    setIncrementing(false);
  };

  return (
    <div style={{ backgroundColor: '#EEE9F2', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
      <header style={{
        width: '100%',
        backgroundColor: 'var(--rs-primary-500)',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <Stack spacing={24} alignItems="center">
          <img src={logoOca} alt="OCA Logo" style={{ height: 50, filter: 'brightness(0) invert(1)' }} />
          <div style={{ width: 2, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <img src="/pngwing.com.png" alt="Teams Logo" style={{ height: 50 }} />
        </Stack>
      </header>

      <div style={{ padding: '40px 20px', maxWidth: 800, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ color: 'var(--rs-primary-500)', margin: '0 0 10px 0', textAlign: 'center' }}>
          Contador de veces que Teams Saca a Agus
        </h1>
        <p style={{ color: '#666', fontSize: '1.2rem', textAlign: 'center', marginBottom: 40 }}>
          Un tracker en tiempo real para un problema recurrente.
        </p>

        <div style={{ maxWidth: 800, width: '100%' }}>
          <Panel
            bordered
            shaded
            style={{ backgroundColor: '#fff', textAlign: 'center', marginBottom: 40, borderTop: '5px solid var(--rs-primary-500)' }}
          >
            <h2 style={{ marginBottom: 20, color: '#333' }}>¿Se volvió a caer?</h2>
            <Button
              appearance="primary"
              size="lg"
              onClick={handleIncrement}
              disabled={loading || incrementing}
              style={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                fontSize: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto',
                boxShadow: '0 8px 16px rgba(91,43,130,0.3)'
              }}
            >
              <PlusIcon style={{ fontSize: '3rem', marginBottom: 5 }} />
              <span>Sumar</span>
            </Button>
          </Panel>

          <Grid fluid>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <StatCard title="Hoy" value={stats?.daily} loading={loading} color="#2ecc71" />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard title="Esta Semana" value={stats?.weekly} loading={loading} color="#f39c12" />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard title="Este Mes" value={stats?.monthly} loading={loading} color="#3498db" />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <StatCard title="Histórico" value={stats?.total} loading={loading} color="var(--rs-primary-500)" />
              </Col>
            </Row>
          </Grid>

          <Panel bordered shaded style={{ backgroundColor: '#fff', marginTop: 40, borderTop: '5px solid #3498db' }}>
            <h3 style={{ textAlign: 'center', marginBottom: 30, color: '#333' }}>Caídas por Mes (Este Año)</h3>
            {loading ? (
              <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Loader size="md" content="Cargando estadísticas..." />
              </div>
            ) : (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(91,43,130,0.1)' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" fill="var(--rs-primary-500)" radius={[4, 4, 0, 0]} name="Caídas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, loading, color }: { title: string, value?: number, loading: boolean, color: string }) {
  return (
    <Panel
      shaded
      bordered
      style={{
        backgroundColor: '#fff',
        textAlign: 'center',
        marginBottom: 16,
        borderBottom: `4px solid ${color}`
      }}
    >
      <div style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>
        {title}
      </div>
      {loading ? (
        <Loader center={false} />
      ) : (
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: color }}>
          {value !== undefined ? value : '-'}
        </div>
      )}
    </Panel>
  );
}

export default App;
