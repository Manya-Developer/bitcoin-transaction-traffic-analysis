
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
  
  const [timeStep, setTimeStep] = useState("");
  const [clusterFilter, setClusterFilter] = useState("");
  const [labelFilter, setLabelFilter] = useState("");
  const [minLofScore, setMinLofScore] = useState("");

  const [searchTxId, setSearchTxId] = useState("");
  const [searchedTransaction, setSearchedTransaction] = useState(null);
  const [searchError, setSearchError] = useState("");


  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      setLoading(true);
      setError("");

      try {   
          const params = new URLSearchParams({
            page: String(page),
            page_size: "20",
          });

          if (timeStep !== "") {
            params.set("time_step", timeStep);
          }

          if (clusterFilter !== "") {
            params.set("cluster", clusterFilter);
          }

          if (labelFilter !== "") {
            params.set("class_name", labelFilter);
          }

          if (minLofScore !== "") {
            params.set("min_lof_score", minLofScore);
          }

          const response = await fetch(
            `${API_URL}/api/transactions?${params.toString()}`
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
  }, [page, timeStep, clusterFilter, labelFilter, minLofScore]);


      
    async function handleTransactionSearch() {
      const txId = searchTxId.trim();

      setSearchError("");
      setSearchedTransaction(null);

      if (!/^\d+$/.test(txId)) {
        setSearchError("Please enter a valid numeric Transaction ID.");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/transactions/${txId}`
        );

        if (response.status === 404) {
          setSearchError("Transaction not found in validation data.");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to search transaction.");
        }

        const data = await response.json();
        setSearchedTransaction(data.transaction);
      } catch (err) {
        setSearchError(err.message);
      }
    }


  return (
    <div className="chart-card">
      <div className="chart-heading">
        <h3>Transaction Explorer</h3>
        <p>
          Explore individual Bitcoin transactions,
          cluster assignments and LOF anomaly scores.
        </p>
      </div>

    
      {/* TRANSACTION ID SEARCH */}
      <form
        className="transaction-filters"
        onSubmit={(e) => {
          e.preventDefault();
          handleTransactionSearch();
        }}
      >
        <input
          type="text"
          inputMode="numeric"
          placeholder="Enter Transaction ID"
          value={searchTxId}
          onChange={(e) => {
            setSearchTxId(e.target.value);
            setSearchedTransaction(null);
            setSearchError("");
          }}
          style={{ width: "240px" }}
        />

        <button type="submit">
          Search Transaction
        </button>
      </form>

      {searchError && (
        <p style={{ color: "#dc2626", marginBottom: "12px" }}>
          {searchError}
        </p>
      )}

               
        {/* TRANSACTION SEARCH RESULT */}
        {searchedTransaction && (
          <div className="chart-card">
            <div className="chart-heading">
              <h3>Transaction Details</h3>
              <p>Search result from the validation dataset.</p>
            </div>

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
                  <tr>
                    <td>{searchedTransaction.tx_id}</td>
                    <td>{searchedTransaction.time_step}</td>
                    <td>Cluster {searchedTransaction.cluster}</td>
                    <td>
                      {Number(
                        searchedTransaction.lof_anomaly_score
                      ).toFixed(4)}
                    </td>
                    <td>{searchedTransaction.class_name}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p style={{ marginTop: "12px", color: "#64748b" }}>
              Cluster indicates a feature-based transaction segment.
              LOF measures unusual transaction behavior, not the
              probability of illicit activity. The observed label
              comes from the dataset, not from the ML model.
            </p>
          </div>
        )}


      {/* TRANSACTION FILTERS */}
      <div className="transaction-filters">

        <select
          value={timeStep}
          onChange={(e) => {
            setTimeStep(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Time Steps</option>
          {[31, 32, 33, 34, 35, 36, 37, 38, 39].map((step) => (
            <option key={step} value={step}>
              Time Step {step}
            </option>
          ))}
        </select>

        <select
          value={clusterFilter}
          onChange={(e) => {
            setClusterFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Clusters</option>
          <option value="0">Cluster 0</option>
          <option value="1">Cluster 1</option>
        </select>

        <select
          value={labelFilter}
          onChange={(e) => {
            setLabelFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Labels</option>
          <option value="Illicit">Illicit</option>
          <option value="Licit">Licit</option>
          <option value="Unknown">Unknown</option>
        </select>

        <input
          type="number"
          min="0"
          step="0.1"
          placeholder="Minimum LOF Score"
          value={minLofScore}
          onChange={(e) => {
            setMinLofScore(e.target.value);
            setPage(1);
          }}
        />

        <button
          type="button"
          onClick={() => {
            setTimeStep("");
            setClusterFilter("");
            setLabelFilter("");
            setMinLofScore("");
            setPage(1);
          }}
        >
          Reset Filters
        </button>

      </div>


      <p>Total transactions: {total.toLocaleString()}</p>

      {loading && <p>Loading transactions...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      
          {!loading && !error && (
            transactions.length === 0 ? (
              <div className="message">
                No transactions match the selected filters.
                Try changing or resetting your filters.
              </div>
            ) : (
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
      )
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
            Workspace <span>/</span> {activePage}
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
              <h1>
                {activePage === "Overview"
                  ? "Transaction Overview"
                  : activePage}
              </h1>

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

          {overview && activePage === "Overview" && (
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
        
        {/* TRAFFIC ANALYSIS PAGE */}
        
        
          {activePage === "Traffic Analysis" && (
            <>
              <TrafficChart traffic={traffic} />

              <div className="chart-card">
                <div className="chart-heading">
                  <h3>Time-Step Traffic Breakdown</h3>
                  <p>
                    Transaction volume across validation
                    time steps 31–39.
                  </p>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="transaction-table">
                    <thead>
                      <tr>
                        <th>Time Step</th>
                        <th>Total Transactions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {(traffic ?? []).map((row) => (
                        <tr key={row.time_step}>
                          <td>{row.time_step}</td>
                          <td>
                            {Number(
                              row.total_transactions
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

               {/* TRAFFIC INSIGHTS */}
              {traffic.length > 0 && (
                <div className="info-panel">
                  <Activity size={20} />

                  <div>
                    <h3>Traffic Insights</h3>

                    <p>
                      <strong>Peak Traffic:</strong>{" "}
                      Time Step{" "}
                      {[...traffic].sort(
                        (a, b) =>
                          b.total_transactions -
                          a.total_transactions
                      )[0].time_step}
                      {" "}recorded the highest transaction volume.
                    </p>

                    <p style={{ marginTop: "10px" }}>
                      <strong>Lowest Traffic:</strong>{" "}
                      Time Step{" "}
                      {[...traffic].sort(
                        (a, b) =>
                          a.total_transactions -
                          b.total_transactions
                      )[0].time_step}
                      {" "}recorded the lowest transaction volume.
                    </p>
                  </div>
                </div>
              )}

            </>
          )}

                
        {/* CLUSTERING PAGE */}
        {activePage === "Clustering" && overview && (
          <>
            <ClusterChart overview={overview} />

            <div className="chart-card">
              <div className="chart-heading">
                <h3>K-Means Cluster Comparison</h3>
                <p>
                  Transaction distribution across the two
                  feature-based clusters.
                </p>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>Cluster</th>
                      <th>Transactions</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[0, 1].map((cluster) => {
                      const count =
                        overview.clusters[`cluster_${cluster}`];

                      const percentage =
                        (count / overview.total_transactions) * 100;

                      return (
                        <tr key={cluster}>
                          <td>Cluster {cluster}</td>
                          <td>{count.toLocaleString()}</td>
                          <td>{percentage.toFixed(2)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="info-panel">
              <Network size={20} />

              <div>
                <h3>Clustering Interpretation</h3>

                <p>
                  K-Means groups transactions based on
                  similarities in their numerical features.
                  Cluster membership does not indicate
                  whether a transaction is illicit or licit.
                </p>

                <p style={{ marginTop: "10px" }}>
                  Cluster 0 contains{" "}
                  {overview.clusters.cluster_0.toLocaleString()}
                  {" "}transactions, while Cluster 1 contains{" "}
                  {overview.clusters.cluster_1.toLocaleString()}
                  {" "}transactions.
                </p>
              </div>
            </div>
          </>
        )}
               
        {/* ANOMALY ANALYSIS PAGE */}
        {activePage === "Anomaly Analysis" && (
          <>
            <LOFTrendChart traffic={traffic} />

            <div className="chart-card">
              <div className="chart-heading">
                <h3>Time-Step Anomaly Score Breakdown</h3>
                <p>
                  Mean and 95th percentile LOF scores
                  across validation time steps 31–39.
                </p>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>Time Step</th>
                      <th>Mean LOF Score</th>
                      <th>95th Percentile LOF</th>
                    </tr>
                  </thead>

                  <tbody>
                    {traffic.map((row) => (
                      <tr key={row.time_step}>
                        <td>{row.time_step}</td>
                        <td>
                          {Number(row.mean_lof_score).toFixed(4)}
                        </td>
                        <td>
                          {Number(row.p95_lof_score).toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="info-panel">
              <ShieldAlert size={20} />

              <div>
                <h3>Anomaly Analysis Interpretation</h3>
                <p>
                  Local Outlier Factor (LOF) measures how
                  unusual a transaction is relative to
                  nearby transactions in feature space.
                  Higher scores indicate stronger
                  anomalous behavior.
                </p>

                <p style={{ marginTop: "10px" }}>
                  Anomaly scores are not probabilities
                  of illicit activity. An anomalous
                  transaction is not necessarily illicit.
                </p>
              </div>
            </div>
          </>
        )}


        {/* TRANSACTIONS PAGE */}
        {activePage === "Transactions" && (
          <TransactionExplorer />
        )}

        {/* MODEL COMPARISON PAGE */}
        {activePage === "Model Comparison" && (
          <div className="chart-card">
            <div className="chart-heading">
              <h3>Unsupervised Model Comparison</h3>
              <p>
                Comparison of Isolation Forest, LOF,
                K-Means and DBSCAN models.
              </p>
            </div>

                      
          {/* ANOMALY DETECTION MODEL COMPARISON */}
          <div style={{ overflowX: "auto", marginTop: "20px" }}>
            <h3 style={{ marginBottom: "12px" }}>
              Anomaly Detection Models
            </h3>

            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Feature Set</th>
                  <th>ROC-AUC</th>
                  <th>Average Precision</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Isolation Forest</td>
                  <td>Feature Set A</td>
                  <td>0.1476</td>
                  <td>0.0637</td>
                </tr>

                <tr>
                  <td>Isolation Forest</td>
                  <td>Feature Set B</td>
                  <td>0.1565</td>
                  <td>0.0644</td>
                </tr>

                <tr>
                  <td>LOF</td>
                  <td>Original Features</td>
                  <td>0.4139</td>
                  <td>0.0888</td>
                </tr>

                <tr>
                  <td>LOF</td>
                  <td>Reduced Features</td>
                  <td>0.3981</td>
                  <td>0.0864</td>
                </tr>

                <tr>
                  <td>LOF</td>
                  <td>PCA Features</td>
                  <td>0.4121</td>
                  <td>0.0881</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="info-panel" style={{ marginTop: "20px" }}>
            <ShieldAlert size={20} />

            <div>
              <h3>Research Interpretation</h3>

              <p>
                These scores evaluate how well unsupervised
                anomaly rankings align with observed illicit
                labels in the validation dataset. Results
                indicate weak illicit-detection performance.
              </p>

              <p style={{ marginTop: "10px" }}>
                ROC-AUC and Average Precision are evaluation
                metrics, not transaction-level illicit
                probabilities. Unknown labels were excluded
                from this evaluation.
              
              </p>
            </div>
          </div>

          {/* CLUSTERING MODEL COMPARISON */}
          <div style={{ overflowX: "auto", marginTop: "28px" }}>
            <h3 style={{ marginBottom: "12px" }}>
              Clustering Models
            </h3>

            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Configuration</th>
                  <th>Silhouette Score</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>K-Means</td>
                  <td>k = 2, PCA (59 components)</td>
                  <td>0.4697</td>
                </tr>

                <tr>
                  <td>DBSCAN</td>
                  <td>eps = 9.0278</td>
                  <td>0.4064</td>
                </tr>

                <tr>
                  <td>DBSCAN</td>
                  <td>eps = 11.735</td>
                  <td>0.4955</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CLUSTERING INTERPRETATION */}
          <div className="info-panel" style={{ marginTop: "20px" }}>
            <Network size={20} />

            <div>
              <h3>Clustering Interpretation</h3>

              <p>
                Silhouette Score measures how well transactions
                are separated into clusters based on their
                feature representations.
              </p>

              <p style={{ marginTop: "10px" }}>
                DBSCAN silhouette scores were calculated
                excluding noise points. Therefore, these
                scores are not directly equivalent to
                the K-Means result.
              </p>

              <p style={{ marginTop: "10px" }}>
                K-Means is used for dashboard transaction
                segmentation. DBSCAN was evaluated as an
                exploratory clustering method. Neither
                model predicts illicit activity.
              </p>
            </div>
          </div>

          {/* END OF MODEL COMPARISON CARD */}
          </div>
        )}

        </div>

      </main>

    </div>
  );
}

export default App;
