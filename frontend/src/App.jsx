
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { useEffect, useState } from "react";

import {
  Activity,
  Bitcoin,
  Database,
  LayoutDashboard,
  Network,
  ShieldAlert,
  BarChart3,
  Search,
  CircleHelp,
} from "lucide-react";


import "./App.css";

// ============================================================
// API CONFIGURATION
// ============================================================

const API_URL = "http://127.0.0.1:8000";

// ============================================================
// SIDEBAR NAVIGATION
// ============================================================

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Traffic Analysis", icon: Activity },
  { label: "Clustering", icon: Network },
  { label: "Anomaly Analysis", icon: ShieldAlert },
  { label: "Transactions", icon: Search },
  { label: "Model Comparison", icon: BarChart3 },
];

// ============================================================
// REUSABLE METRIC CARD
// ============================================================

function MetricCard({ title, value, description, icon: Icon }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{title}</span>
        <Icon size={20} />
      </div>

      <div className="metric-value">{value}</div>

      <div className="metric-description">
        {description}
      </div>
    </div>
  );
}

// ============================================================
// TRANSACTION TRAFFIC CHART
// ============================================================

function TrafficChart({ traffic }) {
  return (
    <div className="chart-card">
      <div className="chart-heading">
        <h3>Bitcoin Transaction Traffic</h3>
        <p>
          Transaction volume across validation time steps 31–39
        </p>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={traffic}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5eaf1"
            />

            <XAxis
              dataKey="time_step"
              tick={{
                fill: "#64748b",
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tick={{
                fill: "#64748b",
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                value.toLocaleString()
              }
            />

            <Tooltip
              formatter={(value) => [
                Number(value).toLocaleString(),
                "Transactions",
              ]}
              labelFormatter={(label) =>
                `Time Step ${label}`
              }
            />

            <Line
              type="monotone"
              dataKey="total_transactions"
              name="Transactions"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#2563eb",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}



function ClusterChart({ overview }) {
  const clusterData = [
    {
      name: "Cluster 0",
      value: overview.clusters.cluster_0,
    },
    {
      name: "Cluster 1",
      value: overview.clusters.cluster_1,
    },
  ];

  const colors = ["#f59e0b", "#2563eb"];

  const total = clusterData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="chart-card">
      <div className="chart-heading">
        <h3>K-Means Cluster Distribution</h3>
        <p>Feature-based segmentation of validation transactions</p>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={clusterData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={75}
              outerRadius={110}
              paddingAngle={3}
            >
              {clusterData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={colors[index]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, name) => [
                `${Number(value).toLocaleString()} (${(
                  (Number(value) / total) *
                  100
                ).toFixed(2)}%)`,
                name,
              ]}
            />

            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}



function LOFTrendChart({ traffic }) {
  return (
    <div className="chart-card">
      <div className="chart-heading">
        <h3>LOF Anomaly Score Trend</h3>
        <p>
          Mean and 95th percentile anomaly scores across
          validation time steps 31–39
        </p>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={traffic}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5eaf1"
            />

            <XAxis
              dataKey="time_step"
              tick={{ fill: "#64748b", fontSize: 12 }}
            />

            <YAxis
              tick={{ fill: "#64748b", fontSize: 12 }}
              domain={["auto", "auto"]}
            />

            <Tooltip
              formatter={(value, name) => [
                Number(value).toFixed(4),
                name,
              ]}
              labelFormatter={(label) => `Time Step ${label}`}
            />

            <Legend />

            <Line
              type="monotone"
              dataKey="mean_lof_score"
              name="Mean LOF Score"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4 }}
            />

            <Line
              type="monotone"
              dataKey="p95_lof_score"
              name="95th Percentile LOF Score"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}



function TransactionExplorer() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/api/transactions?page=${page}&page_size=20`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch transactions");
        }

        const data = await response.json();

        if (!cancelled) {
          setTransactions(data.transactions);
          setTotalPages(data.total_pages);
          setTotal(data.total);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="chart-card">
      <div className="chart-heading">
        <h3>Transaction Explorer</h3>
        <p>
          Explore individual Bitcoin transactions,
          cluster assignments and LOF anomaly scores.
        </p>
      </div>

      <p>Total transactions: {total.toLocaleString()}</p>

      {loading && <p>Loading transactions...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Time Step</th>
                  <th>Cluster</th>
                  <th>LOF Score</th>
                  <th>Observed Label</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.tx_id}>
                    <td>{tx.tx_id}</td>
                    <td>{tx.time_step}</td>
                    <td>Cluster {tx.cluster}</td>
                    <td>
                      {Number(tx.lof_anomaly_score).toFixed(4)}
                    </td>
                    <td>{tx.class_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}



// ============================================================
// MAIN APPLICATION
// ============================================================

function App() {
  const [overview, setOverview] = useState(null);
  const [traffic, setTraffic] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("Overview");
  // ----------------------------------------------------------
  // FETCH DASHBOARD OVERVIEW
  // ----------------------------------------------------------

  useEffect(() => {
    fetch(`${API_URL}/api/dashboard/overview`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Unable to load dashboard overview"
          );
        }

        return response.json();
      })
      .then((data) => {
        setOverview(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ----------------------------------------------------------
  // FETCH TRANSACTION TRAFFIC DATA
  // ----------------------------------------------------------

  useEffect(() => {
    fetch(`${API_URL}/api/traffic`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Unable to load transaction traffic"
          );
        }

        return response.json();
      })
      .then((data) => {
        setTraffic(data.data);
      })
      .catch((err) => {
        console.error(
          "Traffic API Error:",
          err
        );
      });
  }, []);

  // ----------------------------------------------------------
  // MAIN UI
  // ----------------------------------------------------------

  return (
    <div className="app-layout">

      {/* ====================================================
          SIDEBAR
      ==================================================== */}

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            <Bitcoin size={26} />
          </div>

          <div>
            <h2>BTC Traffic</h2>
            <span>Analytics Platform</span>
          </div>
        </div>

        <div className="nav-heading">
          WORKSPACE
        </div>

       
        <nav className="navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className={`nav-item ${
                activePage === label ? "active" : ""
              }`}
              onClick={() => setActivePage(label)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>


        <div className="sidebar-bottom">
          <CircleHelp size={18} />
          <span>Research Analytics System</span>
        </div>

      </aside>

      {/* ====================================================
          MAIN CONTENT
      ==================================================== */}

      <main className="main-content">

        {/* TOP NAVIGATION BAR */}

        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> Overview
          </div>

          <div className="topbar-right">
            <span className="status-dot"></span>
            <span>Validation Dataset</span>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}

        <div className="dashboard-content">

          {/* PAGE HEADING */}

          <div className="page-heading">

            <div>
              <h1>Transaction Overview</h1>

              <p>
                Bitcoin transaction traffic analysis
                using unsupervised machine learning.
              </p>
            </div>

            <div className="dataset-badge">
              <Database size={16} />
              Elliptic Dataset
            </div>

          </div>

          {/* LOADING STATE */}

          {loading && (
            <div className="message">
              Loading dashboard statistics...
            </div>
          )}

          {/* ERROR STATE */}

          {error && (
            <div className="message error">
              API Error: {error}
            </div>
          )}

          {/* ==================================================
              DASHBOARD DATA
          ================================================== */}

          {overview && (
            <>

              {/* ==============================================
                  KPI CARDS — ALL 8 IN ONE GRID
              ============================================== */}

              <div className="metrics-grid">

                <MetricCard
                  title="Total Transactions"
                  value={overview.total_transactions.toLocaleString()}
                  description="Validation time steps 31–39"
                  icon={Database}
                />

                <MetricCard
                  title="Known Illicit"
                  value={overview.observed_labels.known_illicit.toLocaleString()}
                  description="Observed dataset labels"
                  icon={ShieldAlert}
                />

                <MetricCard
                  title="Known Licit"
                  value={overview.observed_labels.known_licit.toLocaleString()}
                  description="Observed dataset labels"
                  icon={Activity}
                />

                <MetricCard
                  title="Unknown Labels"
                  value={overview.observed_labels.unknown.toLocaleString()}
                  description="Unlabeled transactions"
                  icon={CircleHelp}
                />

                <MetricCard
                  title="Cluster 0"
                  value={overview.clusters.cluster_0.toLocaleString()}
                  description="K-Means segment"
                  icon={Network}
                />

                <MetricCard
                  title="Cluster 1"
                  value={overview.clusters.cluster_1.toLocaleString()}
                  description="K-Means segment"
                  icon={Network}
                />

                <MetricCard
                  title="Mean LOF Score"
                  value={overview.lof_anomaly_scores.mean.toFixed(4)}
                  description="Unsupervised anomaly score"
                  icon={BarChart3}
                />

                <MetricCard
                  title="Known Illicit Rate"
                  value={`${overview.observed_labels.known_illicit_rate_pct}%`}
                  description="Among known labels only"
                  icon={Activity}
                />

              </div>
              {/* END OF METRICS GRID */}

              {/* ==============================================
                  TRAFFIC CHART — OUTSIDE THE KPI GRID
              ============================================== */}

              <TrafficChart traffic={traffic} />
              <ClusterChart overview={overview} />
              <LOFTrendChart traffic={traffic} />
              <TransactionExplorer />

              {/* ==============================================
                  RESEARCH INTERPRETATION
              ============================================== */}

              <div className="info-panel">

                <ShieldAlert size={20} />

                <div>
                  <h3>Research Interpretation</h3>

                  <p>
                    K-Means cluster assignments represent
                    feature-based transaction segments.
                    Local Outlier Factor scores measure
                    unusual transaction patterns and are
                    not illicit probabilities.
                  </p>

                  <p style={{ marginTop: "10px" }}>
                    Illicit and licit counts are observed
                    dataset annotations, not predictions
                    made by the unsupervised models.
                    Unknown labels must not be interpreted
                    as licit or illicit transactions.
                  </p>
                </div>

              </div>

            </>
          )}

        </div>

      </main>

    </div>
  );
}

export default App;
