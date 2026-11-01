
from pathlib import Path
from typing import Optional
from contextlib import asynccontextmanager

import pandas as pd
import numpy as np

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware


# ============================================================
# 1. FILE PATHS AND CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

TRANSACTIONS_FILE = DATA_DIR / "transactions.csv"
TRAFFIC_FILE = DATA_DIR / "traffic_summary.csv"
MODELS_FILE = DATA_DIR / "model_comparison.csv"

transactions_df = pd.DataFrame()
traffic_df = pd.DataFrame()
models_df = pd.DataFrame()


# ============================================================
# 2. HELPER FUNCTIONS
# ============================================================

def clean_records(df: pd.DataFrame):
    """
    Convert a DataFrame into JSON-safe records.
    Missing values are returned as null.
    """
    clean_df = df.replace([np.inf, -np.inf], np.nan)
    clean_df = clean_df.astype(object).where(
        pd.notna(clean_df), None
    )

    return clean_df.to_dict(orient="records")


def load_datasets():
    """
    Load all three precomputed analysis CSV files.
    """
    global transactions_df, traffic_df, models_df

    required_files = [
        TRANSACTIONS_FILE,
        TRAFFIC_FILE,
        MODELS_FILE
    ]

    missing_files = [
        str(path)
        for path in required_files
        if not path.is_file()
    ]

    if missing_files:
        raise RuntimeError(
            "Missing required data files: "
            + ", ".join(missing_files)
        )

    transactions_df = pd.read_csv(
        TRANSACTIONS_FILE,
        dtype={"class_code": "string"}
    )

    traffic_df = pd.read_csv(TRAFFIC_FILE)
    models_df = pd.read_csv(MODELS_FILE)

    # Validate required columns
    required_transaction_columns = {
        "tx_id",
        "time_step",
        "cluster",
        "lof_anomaly_score",
        "class_code",
        "class_name"
    }

    required_traffic_columns = {
        "time_step",
        "total_transactions",
        "mean_lof_score",
        "p95_lof_score",
        "known_illicit",
        "known_licit",
        "unknown",
        "cluster_0",
        "cluster_1",
        "known_illicit_rate_pct"
    }

    required_model_columns = {
        "model",
        "category",
        "validation_roc_auc",
        "validation_ap",
        "silhouette",
        "deployment_role"
    }

    for name, df, required in [
        (
            "transactions.csv",
            transactions_df,
            required_transaction_columns
        ),
        (
            "traffic_summary.csv",
            traffic_df,
            required_traffic_columns
        ),
        (
            "model_comparison.csv",
            models_df,
            required_model_columns
        )
    ]:
        missing_columns = required - set(df.columns)

        if missing_columns:
            raise RuntimeError(
                f"{name} missing columns: "
                f"{sorted(missing_columns)}"
            )

    print("=" * 60)
    print("BITCOIN TRANSACTION TRAFFIC ANALYSIS")
    print("=" * 60)
    print(
        f"Transactions loaded: {len(transactions_df):,}"
    )
    print(
        f"Traffic time steps: {len(traffic_df)}"
    )
    print(
        f"Model comparison rows: {len(models_df)}"
    )
    print("Backend datasets loaded successfully.")
    print("=" * 60)


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_datasets()
    yield


# ============================================================
# 3. FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Bitcoin Transaction Traffic Analysis API",
    description=(
        "Bitcoin transaction traffic analytics using "
        "unsupervised machine learning. "
        "Provides K-Means segmentation, LOF anomaly "
        "scores, temporal traffic trends, and "
        "offline model evaluation."
    ),
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"]
)


# ============================================================
# 4. HOME AND HEALTH ENDPOINTS
# ============================================================

@app.get("/")
def home():
    return {
        "project": "Bitcoin Transaction Traffic Analysis",
        "version": "1.0.0",
        "status": "running",
        "analysis_type": "Unsupervised Learning",
        "dataset": "Elliptic Bitcoin Transaction Dataset",
        "validation_time_steps": "31-39",
        "documentation": "/docs"
    }


@app.get("/api/health")
def health_check():

    file_status = {
        "transactions.csv": TRANSACTIONS_FILE.is_file(),
        "traffic_summary.csv": TRAFFIC_FILE.is_file(),
        "model_comparison.csv": MODELS_FILE.is_file()
    }

    ready = all(file_status.values())

    return {
        "status": "healthy" if ready else "missing_data",
        "files": file_status,
        "datasets_loaded": {
            "transactions": len(transactions_df),
            "traffic_steps": len(traffic_df),
            "models": len(models_df)
        }
    }


# ============================================================
# 5. DASHBOARD OVERVIEW
# ============================================================

@app.get("/api/dashboard/overview")
def dashboard_overview():

    total = len(transactions_df)

    class_counts = (
        transactions_df["class_name"]
        .value_counts()
        .to_dict()
    )

    cluster_counts = (
        transactions_df["cluster"]
        .value_counts()
        .to_dict()
    )

    known_illicit = int(
        class_counts.get("Illicit", 0)
    )

    known_licit = int(
        class_counts.get("Licit", 0)
    )

    unknown = int(
        class_counts.get("Unknown", 0)
    )

    known_total = known_illicit + known_licit

    known_illicit_rate = (
        round(100 * known_illicit / known_total, 2)
        if known_total > 0
        else None
    )

    return {
        "total_transactions": total,
        "time_step_range": {
            "start": int(
                transactions_df["time_step"].min()
            ),
            "end": int(
                transactions_df["time_step"].max()
            )
        },
        "observed_labels": {
            "known_illicit": known_illicit,
            "known_licit": known_licit,
            "unknown": unknown,
            "known_illicit_rate_pct": known_illicit_rate
        },
        "clusters": {
            "cluster_0": int(
                cluster_counts.get(0, 0)
            ),
            "cluster_1": int(
                cluster_counts.get(1, 0)
            )
        },
        "lof_anomaly_scores": {
            "mean": round(
                float(
                    transactions_df[
                        "lof_anomaly_score"
                    ].mean()
                ), 4
            ),
            "median": round(
                float(
                    transactions_df[
                        "lof_anomaly_score"
                    ].median()
                ), 4
            ),
            "p95": round(
                float(
                    transactions_df[
                        "lof_anomaly_score"
                    ].quantile(0.95)
                ), 4
            )
        },
        "important_note": (
            "LOF anomaly scores are not illicit "
            "probabilities. Observed labels are "
            "dataset annotations, not predictions."
        )
    }


# ============================================================
# 6. TRANSACTION SEARCH AND FILTERING
# ============================================================

@app.get("/api/transactions")
def get_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    time_step: Optional[int] = Query(None, ge=1),
    cluster: Optional[int] = Query(None, ge=0, le=1),
    class_name: Optional[str] = Query(None),
    min_lof_score: Optional[float] = Query(None)
):

    df = transactions_df

    if time_step is not None:
        df = df[df["time_step"] == time_step]

    if cluster is not None:
        df = df[df["cluster"] == cluster]

    if class_name is not None:
        normalized = class_name.strip().lower()

        allowed = {
            "illicit": "Illicit",
            "licit": "Licit",
            "unknown": "Unknown"
        }

        if normalized not in allowed:
            raise HTTPException(
                status_code=400,
                detail=(
                    "class_name must be Illicit, "
                    "Licit, or Unknown"
                )
            )

        df = df[
            df["class_name"] == allowed[normalized]
        ]

    if min_lof_score is not None:
        df = df[
            df["lof_anomaly_score"] >= min_lof_score
        ]

    total = len(df)

    start = (page - 1) * page_size
    end = start + page_size

    page_df = df.iloc[start:end]

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (
            (total + page_size - 1) // page_size
        ),
        "transactions": clean_records(page_df)
    }


# ============================================================
# 7. SINGLE TRANSACTION LOOKUP
# ============================================================

@app.get("/api/transactions/{tx_id}")
def get_transaction_by_id(tx_id: int):

    result = transactions_df[
        transactions_df["tx_id"] == tx_id
    ]

    if result.empty:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found in validation data"
        )

    return {
        "transaction": clean_records(result)[0],
        "interpretation": {
            "cluster": (
                "Unsupervised transaction segment"
            ),
            "lof_anomaly_score": (
                "Higher values indicate greater "
                "local feature-space unusualness; "
                "not an illicit probability."
            ),
            "class_name": (
                "Observed dataset label; "
                "not a model prediction."
            )
        }
    }


# ============================================================
# 8. TEMPORAL TRAFFIC ANALYSIS
# ============================================================

@app.get("/api/traffic")
def get_traffic_summary():

    return {
        "time_steps": len(traffic_df),
        "data": clean_records(
            traffic_df.sort_values("time_step")
        )
    }


@app.get("/api/traffic/{time_step}")
def get_traffic_by_step(time_step: int):

    result = traffic_df[
        traffic_df["time_step"] == time_step
    ]

    if result.empty:
        raise HTTPException(
            status_code=404,
            detail="Time step not found"
        )

    return clean_records(result)[0]


# ============================================================
# 9. K-MEANS CLUSTER ANALYSIS
# ============================================================

@app.get("/api/clusters")
def get_cluster_analysis():

    results = []

    for cluster_id, group in transactions_df.groupby(
        "cluster"
    ):

        class_counts = (
            group["class_name"]
            .value_counts()
            .to_dict()
        )

        results.append({
            "cluster": int(cluster_id),
            "transaction_count": len(group),
            "percentage": round(
                100 * len(group) / len(transactions_df),
                2
            ),
            "mean_lof_score": round(
                float(
                    group["lof_anomaly_score"].mean()
                ), 4
            ),
            "observed_labels": {
                "illicit": int(
                    class_counts.get("Illicit", 0)
                ),
                "licit": int(
                    class_counts.get("Licit", 0)
                ),
                "unknown": int(
                    class_counts.get("Unknown", 0)
                )
            }
        })

    return {
        "model": "K-Means",
        "k": 2,
        "clusters": results,
        "note": (
            "Cluster IDs describe feature-based "
            "segments and are not illicit/licit labels."
        )
    }


# ============================================================
# 10. ANOMALY ANALYSIS
# ============================================================

@app.get("/api/anomalies/summary")
def get_anomaly_summary():

    scores = transactions_df["lof_anomaly_score"]

    return {
        "model": "Local Outlier Factor",
        "score_type": "Unsupervised anomaly score",
        "transaction_count": len(scores),
        "statistics": {
            "minimum": round(float(scores.min()), 4),
            "mean": round(float(scores.mean()), 4),
            "median": round(float(scores.median()), 4),
            "p90": round(
                float(scores.quantile(0.90)), 4
            ),
            "p95": round(
                float(scores.quantile(0.95)), 4
            ),
            "p99": round(
                float(scores.quantile(0.99)), 4
            ),
            "maximum": round(float(scores.max()), 4)
        },
        "warning": (
            "Anomaly scores do not measure "
            "illicit transaction probability."
        )
    }


@app.get("/api/anomalies/top")
def get_top_anomalies(
    limit: int = Query(20, ge=1, le=100),
    time_step: Optional[int] = Query(None, ge=1)
):

    df = transactions_df

    if time_step is not None:
        df = df[df["time_step"] == time_step]

    top_df = df.nlargest(
        limit,
        "lof_anomaly_score"
    )

    return {
        "count": len(top_df),
        "transactions": clean_records(top_df),
        "note": (
            "These are the highest LOF anomaly "
            "scores, not confirmed illicit cases."
        )
    }


# ============================================================
# 11. MODEL COMPARISON
# ============================================================

@app.get("/api/models")
def get_model_comparison():

    return {
        "models_tested": len(models_df),
        "data": clean_records(models_df),
        "evaluation_notes": {
            "anomaly_detection": (
                "ROC-AUC and average precision were "
                "evaluated using known validation labels."
            ),
            "clustering": (
                "Silhouette scores describe internal "
                "cluster separation, not illicit detection."
            ),
            "limitations": (
                "Unknown labels are excluded from "
                "known-label evaluation. Current models "
                "have not demonstrated reliable illicit "
                "transaction detection."
            )
        }
    }


# ============================================================
# 12. API INFORMATION
# ============================================================

@app.get("/api/info")
def api_information():

    return {
        "project": "Bitcoin Transaction Traffic Analysis",
        "dataset": "Elliptic Bitcoin Transaction Dataset",
        "data_split": "Chronological validation",
        "time_steps": "31-39",
        "models": {
            "segmentation": "K-Means (K=2)",
            "anomaly_scoring": "Local Outlier Factor",
            "exploratory_clustering": "DBSCAN",
            "benchmark": "Isolation Forest"
        },
        "data_policy": {
            "observed_labels": (
                "Used for offline analysis only"
            ),
            "model_predictions": (
                "Cluster assignments and LOF scores "
                "were generated without transaction labels"
            ),
            "limitations": (
                "This is a research analytics system, "
                "not a validated illicit detection service."
            )
        }
    }
