# Bitcoin Transaction Traffic Analysis Using Unsupervised Learning

### An End-to-End Machine Learning Research and Interactive Analytics Platform

A research-oriented machine learning project that analyzes Bitcoin transaction traffic using **unsupervised learning techniques**, including **K-Means, DBSCAN, Isolation Forest, and Local Outlier Factor (LOF)**.

The project explores how Bitcoin transactions behave over time, identifies groups of transactions with similar numerical characteristics, and investigates unusual transaction patterns without requiring transaction labels during model training.

It integrates a complete machine learning experimentation workflow with a **FastAPI REST backend** and an **interactive React dashboard** to make the analytical results accessible, interpretable, and explorable.

**Core focus:** Transaction traffic analysis, unsupervised clustering, anomaly detection, chronological evaluation, and interactive research visualization.

---

## 1. Project Overview

Bitcoin is a decentralized cryptocurrency network in which transactions are recorded on a public blockchain. As blockchain activity grows, understanding transaction patterns becomes increasingly important for blockchain analytics and financial research.

Bitcoin transaction datasets contain complex numerical relationships that can be difficult to understand through manual inspection alone.

Traditional supervised machine learning approaches depend on labeled training data. However, blockchain transaction datasets may contain substantial amounts of unlabeled information, making unsupervised learning a useful approach for exploring underlying patterns.

This project investigates three primary questions:

1. **Transaction Traffic:** How does Bitcoin transaction activity change across different time steps?
2. **Transaction Segmentation:** Can transactions be grouped according to similarities in their numerical features?
3. **Anomalous Behavior:** Which transactions exhibit unusual feature-space behavior compared with other transactions?

To answer these questions, the project applies clustering and anomaly detection techniques to the Elliptic Bitcoin Transaction Dataset.

The resulting analytical outputs are presented through a web-based dashboard that allows users to explore transaction statistics, clustering results, anomaly scores, and individual transaction records.

### What Makes This Project Different?

The project is designed as a research and analytics system rather than a conventional transaction classification application.

It does not simply assign an illicit or licit label to each transaction.

Instead, it separates:

- **Observed dataset labels**, which are annotations provided by the dataset.
- **Cluster assignments**, which describe feature-based transaction groups.
- **Anomaly scores**, which measure how unusual transactions appear under a particular model.

This distinction helps prevent misleading interpretations of unsupervised machine learning results.

---

## 2. Problem Statement

Bitcoin transaction data presents several analytical challenges:

**High-dimensional data:** Transactions are represented through numerous numerical features, making direct analysis difficult.

**Limited label availability:** A large proportion of transactions have unknown labels, limiting the applicability of purely supervised approaches.

**Complex transaction behavior:** Transactions may exhibit different patterns across time steps and feature distributions.

**Difficulty interpreting anomalies:** An unusual transaction is not necessarily illicit, and a transaction with a known illicit label is not necessarily an outlier.

**Limited accessibility of model results:** Machine learning experiments are often stored in notebooks and numerical reports, making them difficult for nontechnical users to explore.

### Proposed Solution

Develop an end-to-end analytics platform that:

- Processes and profiles Bitcoin transaction data.
- Preserves chronological separation between training and evaluation data.
- Applies unsupervised learning to discover transaction patterns.
- Compares clustering and anomaly detection approaches.
- Exposes analytical results through REST APIs.
- Provides an interactive dashboard for exploration and interpretation.

---

## 3. Project Objectives

The primary objectives are:

1. Understand the structure, distributions, and label availability of Bitcoin transaction data.
2. Analyze transaction volumes across chronological time steps.
3. Apply preprocessing and dimensionality reduction techniques to high-dimensional numerical features.
4. Perform transaction clustering using K-Means and DBSCAN.
5. Detect unusual transaction behavior using Isolation Forest and LOF.
6. Evaluate anomaly rankings against available observed labels without using those labels for unsupervised model training.
7. Compare model configurations using ROC-AUC, Average Precision, and Silhouette Score where appropriate.
8. Develop a backend API for serving analytical results.
9. Build an interactive dashboard for transaction-level and aggregate analysis.
10. Clearly communicate model limitations and avoid presenting anomaly scores as illicit probabilities.

---

## 4. Dataset Description

### Elliptic Bitcoin Transaction Dataset

The project uses the **Elliptic Bitcoin Transaction Dataset**, a publicly available research dataset containing Bitcoin transactions represented through numerical features and chronological time steps.

### Dataset Statistics

| Property | Description |
|---|---|
| Total transactions | 203,769 |
| Numerical features | 165 transaction features |
| Feature columns in the source feature file | 166, including transaction ID |
| Total chronological time steps | 49 |
| Known illicit transactions | 4,545 |
| Known licit transactions | 42,019 |
| Unknown-label transactions | 157,205 |
| Dataset type | High-dimensional transaction data |

The project also considers a feature representation with 181 numerical features, incorporating additional aggregated information.

### Transaction Labels

The dataset contains three label categories:

| Code | Observed Label | Meaning |
|---|---|---|
| 1 | Illicit | Transaction annotated as illicit |
| 2 | Licit | Transaction annotated as licit |
| 3 | Unknown | Transaction without an available illicit/licit annotation |

**Important:** Unknown does not mean licit. Unknown transactions are retained as a separate category.

### Chronological Data Split

To preserve the temporal structure of the dataset, transactions are divided according to time steps rather than randomly.

| Dataset Partition | Time Steps | Transactions |
|---|---|---:|
| Training | 1–30 | 123,287 |
| Validation | 31–39 | 33,835 |
| Testing | 40–49 | 46,647 |
| **Total** | **1–49** | **203,769** |

This design reduces the risk of future transaction information leaking into earlier training periods.

The current interactive dashboard primarily presents **validation dataset results from time steps 31–39**.

### Why Chronological Splitting Matters

Random splitting can mix transactions from different time periods. In temporal datasets, this may produce an evaluation setting that does not reflect how models would encounter new transactions.

Chronological splitting provides a more realistic experimental structure:

**Earlier transactions → Model development → Later transactions → Evaluation**

---

## 5. Machine Learning Methodology

The project follows a structured experimentation workflow.

### Stage 1 — Data Profiling and Exploration

Initial analysis examines:

- Dataset dimensions and column structure.
- Transaction identifiers and chronological time steps.
- Label distributions.
- Numerical feature availability.
- Feature distributions and relationships.
- Differences between known and unknown transaction labels.

The objective is to understand the data before training models.

### Stage 2 — Data Preprocessing

Transaction identifiers and chronological time steps are treated separately from numerical model inputs.

Preprocessing prepares numerical transaction features for machine learning and supports consistent transformation of training and validation data.

Feature representations explored include:

- **Feature Set A:** 165 numerical features.
- **Feature Set B:** 181 numerical features.
- **Reduced feature representations:** Selected numerical features.
- **PCA representations:** Lower-dimensional feature spaces.

Preprocessing transformations must be fitted using training data and then applied consistently to later partitions.

### Stage 3 — Dimensionality Reduction

High-dimensional transaction features can introduce computational and statistical challenges.

**Principal Component Analysis (PCA)** is explored to reduce dimensionality while retaining major patterns of numerical variation.

For the selected K-Means configuration, the project uses a PCA representation containing **59 components**.

Dimensionality reduction is evaluated as part of the model experimentation process rather than assumed to improve every algorithm.

### Stage 4 — Unsupervised Clustering

Clustering groups transactions according to numerical similarities without using illicit or licit labels to define the groups.

Two clustering approaches are investigated.

#### K-Means Clustering

K-Means partitions transactions into a predefined number of clusters by minimizing within-cluster distances.

The selected configuration uses:

- Algorithm: K-Means
- Number of clusters: 2
- Feature representation: PCA with 59 components
- Silhouette Score: 0.4697

K-Means is used for transaction segmentation in the dashboard.

**Interpretation:** Cluster 0 and Cluster 1 are numerical transaction segments. They do not represent illicit and licit classes.

#### DBSCAN Clustering

Density-Based Spatial Clustering of Applications with Noise (DBSCAN) groups observations according to local density.

Unlike K-Means, DBSCAN can identify noise points and does not require the number of clusters to be specified beforehand.

Two explored configurations are:

| Configuration | Silhouette Score |
|---|---:|
| DBSCAN, eps = 9.0278 | 0.4064 |
| DBSCAN, eps = 11.735 | 0.4955 |

DBSCAN is included as an exploratory clustering method.

**Evaluation limitation:** The DBSCAN silhouette scores were calculated excluding noise points. Consequently, these scores should not be treated as directly equivalent to the K-Means score.

### Stage 5 — Unsupervised Anomaly Detection

Anomaly detection investigates transactions that appear unusual relative to the numerical patterns represented in the dataset.

Two methods are explored.

#### Isolation Forest

Isolation Forest identifies unusual observations through randomized partitioning.

Transactions that are easier to isolate may receive stronger anomaly indications under the model's scoring convention.

The project evaluates Isolation Forest using different feature representations.

#### Local Outlier Factor (LOF)

Local Outlier Factor measures how unusual an observation is relative to the density of neighboring observations in feature space.

LOF focuses on local differences rather than assuming that all anomalies must be globally isolated.

The project explores LOF using:

- Original numerical features.
- Reduced numerical features.
- PCA-transformed features.

LOF anomaly scores are also used for transaction-level exploration and time-step analysis in the dashboard.

**Critical distinction:** A high LOF score indicates unusual numerical behavior under the fitted model. It is not a probability that a transaction is illicit.

---

## 6. Model Evaluation and Experimental Results

The project evaluates clustering quality and anomaly ranking performance using different metrics because these tasks have different objectives.

### 6.1 Anomaly Detection Results

Anomaly rankings are compared against available observed illicit and licit labels in the validation dataset.

Transactions with unknown labels are excluded from this label-based evaluation.

| Model | Feature Representation | ROC-AUC | Average Precision |
|---|---|---:|---:|
| Isolation Forest | Feature Set A | 0.1476 | 0.0637 |
| Isolation Forest | Feature Set B | 0.1565 | 0.0644 |
| LOF | Original Features | 0.4139 | 0.0888 |
| LOF | Reduced Features | 0.3981 | 0.0864 |
| LOF | PCA Features | 0.4121 | 0.0881 |

### Understanding the Metrics

**ROC-AUC (Receiver Operating Characteristic Area Under the Curve)** evaluates how well anomaly scores rank known illicit transactions relative to known licit transactions across different thresholds.

**Average Precision (AP)** summarizes precision-recall performance and is useful when evaluating rankings involving imbalanced labels.

These metrics are used only for evaluation. The unsupervised models are not trained to predict illicit or licit labels.

### Key Findings

- LOF achieved higher ROC-AUC values than the tested Isolation Forest configurations.
- LOF with original features achieved the highest reported ROC-AUC and Average Precision among these anomaly detection experiments.
- The overall results show weak alignment between the tested anomaly rankings and observed illicit labels.
- Dimensionality reduction did not consistently improve anomaly ranking performance.

**Research conclusion:** Unusual numerical transaction behavior should not be assumed to correspond directly to illicit activity.

### 6.2 Clustering Results

| Algorithm | Configuration | Silhouette Score |
|---|---|---:|
| K-Means | k = 2, PCA (59 components) | 0.4697 |
| DBSCAN | eps = 9.0278 | 0.4064 |
| DBSCAN | eps = 11.735 | 0.4955 |

The clustering experiments explore numerical structure within transaction data, not supervised classification accuracy.

The selected K-Means model is used to provide consistent cluster assignments for dashboard analysis.

---

## 7. Validation Dataset Analysis

The interactive dashboard currently analyzes **33,835 transactions** from validation time steps 31–39.

### Validation Statistics

| Metric | Value |
|---|---:|
| Total Transactions | 33,835 |
| Known Illicit | 955 |
| Known Licit | 7,520 |
| Unknown Labels | 25,360 |
| Cluster 0 Transactions | 1,594 |
| Cluster 1 Transactions | 32,241 |
| Mean LOF Anomaly Score | Approximately 1.5281 |
| Known Illicit Rate | 11.27% |

The known illicit rate is calculated using transactions with known labels only:

**Known Illicit Rate = Known Illicit / (Known Illicit + Known Licit) × 100**

Unknown-label transactions are excluded from the denominator.

### Cluster Distribution

Within the validation dataset:

- **Cluster 0:** 1,594 transactions, approximately 4.71%.
- **Cluster 1:** 32,241 transactions, approximately 95.29%.

This indicates an imbalanced distribution between the two feature-based transaction segments.

The imbalance alone does not establish whether either cluster is associated with illicit activity.

### Transaction Traffic Analysis

Transaction volume is analyzed across validation time steps 31–39.

The dashboard displays:

- Transaction counts for individual time steps.
- Changes in transaction activity over time.
- Peak and minimum transaction volume.
- Time-step-level anomaly score trends.

For the current validation partition:

- **Highest transaction volume:** Time Step 36, with 6,393 transactions.
- **Lowest transaction volume:** Time Step 34, with 2,486 transactions.

These observations describe the dataset's recorded transaction activity, not real-time Bitcoin network traffic.

---

## 8. System Architecture

The project combines machine learning experimentation, data preparation, API services, and frontend visualization.

### High-Level Workflow

```text
Elliptic Bitcoin Transaction Dataset
                 |
                 v
       Data Profiling and EDA
                 |
                 v
     Preprocessing and Features
                 |
                 v
      Chronological Data Split
                 |
                 v
       Unsupervised Learning
                 |
        +--------+--------+
        |                 |
        v                 v
    Clustering       Anomaly Detection
    K-Means          Isolation Forest
    DBSCAN           Local Outlier Factor
        |                 |
        +--------+--------+
                 |
                 v
       Model Evaluation
                 |
                 v
      Validation Result Files
                 |
                 v
         FastAPI Backend
                 |
                 v
         React Dashboard
                 |
                 v
     Interactive Data Exploration
```

### Architecture Components

**Machine Learning Layer**

Handles dataset exploration, feature processing, unsupervised model experimentation, and evaluation.

**Data Serving Layer**

Stores prepared validation results, including transaction records, time-step summaries, and model comparison information.

**Backend Layer**

Uses FastAPI to expose data through REST endpoints.

**Frontend Layer**

Uses React and Recharts to visualize statistics, transaction traffic, cluster distributions, anomaly score trends, and individual transaction details.

### Technology Stack

| Layer | Technologies |
|---|---|
| Programming | Python, JavaScript |
| Data Analysis | Pandas, NumPy |
| Machine Learning | Scikit-learn |
| Experimentation | Jupyter Notebook |
| Backend | FastAPI, Uvicorn |
| Frontend | React, Vite |
| Visualization | Recharts |
| Icons | Lucide React |
| Version Control | Git, GitHub |
| Development Environment | VS Code, Conda |

---

## 9. Interactive Dashboard Features

The React dashboard is organized into six primary sections.

### 9.1 Overview

The Overview page provides a consolidated summary of the validation dataset.

It includes:

- Total transaction count.
- Known illicit and licit counts.
- Unknown-label count.
- Cluster membership counts.
- Mean LOF anomaly score.
- Known illicit rate.
- Visual summaries and research interpretation.

The Overview page is intended for users who want a quick understanding of the dataset and analytical results.

### 9.2 Traffic Analysis

The Traffic Analysis page focuses on transaction activity across time steps.

Features include:

- Interactive transaction volume line chart.
- Time-step traffic breakdown table.
- Peak traffic identification.
- Lowest traffic identification.
- Traffic interpretation.

This page helps users understand how recorded transaction volume changes across the validation period.

### 9.3 Clustering

The Clustering page presents the selected K-Means segmentation results.

Features include:

- Interactive cluster distribution chart.
- Cluster membership counts.
- Cluster percentage comparison.
- Explanation of what cluster assignments represent.

This page supports feature-based transaction segmentation analysis.

### 9.4 Anomaly Analysis

The Anomaly Analysis page presents LOF anomaly score behavior.

Features include:

- Time-step mean LOF score trend.
- Time-step 95th percentile LOF score trend.
- Numerical anomaly score breakdown.
- Research interpretation of unusual transaction behavior.

The 95th percentile provides a view of the higher end of the score distribution for each time step.

Anomaly scores are not treated as illicit probabilities.

### 9.5 Transactions

The Transactions page allows users to explore individual transaction records.

**Transaction Explorer features:**

- Paginated transaction table.
- Time-step filtering.
- Cluster filtering.
- Observed-label filtering.
- Minimum LOF score filtering.
- Combined filters.
- Filter reset.
- Empty-result handling.

**Transaction ID Search:**

Users can search for a specific transaction ID within the validation dataset.

A matching transaction displays:

- Transaction ID.
- Time step.
- Assigned cluster.
- LOF anomaly score.
- Observed dataset label.
- Explanation of the analytical fields.

The Transaction Explorer is designed for detailed investigation of individual records without loading the entire validation dataset into the browser at once.

### 9.6 Model Comparison

The Model Comparison page summarizes the machine learning experiments.

It contains:

**Anomaly Detection Comparison**

- Isolation Forest configurations.
- LOF configurations.
- ROC-AUC scores.
- Average Precision scores.
- Interpretation of label-based evaluation results.

**Clustering Comparison**

- K-Means configuration.
- DBSCAN configurations.
- Silhouette Scores.
- Interpretation of clustering results and evaluation limitations.

This page makes the research findings accessible without requiring users to inspect individual experiment notebooks.

---

## 10. Backend API

The FastAPI backend provides REST endpoints for accessing analytical results.

### Core Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend availability |
| GET | `/api/dashboard/overview` | Retrieve dashboard summary statistics |
| GET | `/api/transactions` | Retrieve paginated and filtered transactions |
| GET | `/api/transactions/{tx_id}` | Retrieve a transaction by ID |

### Transaction Filtering

The `/api/transactions` endpoint supports the following query parameters:

| Parameter | Description |
|---|---|
| `page` | Page number |
| `page_size` | Number of transactions per page, up to 100 |
| `time_step` | Filter by chronological time step |
| `cluster` | Filter by K-Means cluster |
| `class_name` | Filter by observed Illicit, Licit, or Unknown label |
| `min_lof_score` | Filter transactions by minimum LOF score |

### Example API Requests

Retrieve the first 20 transactions:

```http
GET /api/transactions?page=1&page_size=20
```

Retrieve transactions assigned to Cluster 0:

```http
GET /api/transactions?cluster=0
```

Retrieve transactions with observed illicit labels:

```http
GET /api/transactions?class_name=Illicit
```

Combine multiple filters:

```http
GET /api/transactions?time_step=35&cluster=1&min_lof_score=2
```

Retrieve an individual transaction:

```http
GET /api/transactions/8482106
```

The API returns transaction information from the prepared validation dataset.

### API Documentation

FastAPI provides interactive Swagger documentation at:

`http://127.0.0.1:8000/docs`

---

## 11. Running the Project Locally

### Prerequisites

Install:

- Python 3.11
- Node.js and npm
- Git
- Conda (recommended)

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Manya-Developer/bitcoin-transaction-traffic-analysis.git
cd bitcoin-transaction-traffic-analysis
```

### Step 2 — Prepare the Python Environment

Create and activate a Conda environment:

```bash
conda create -n btc-analysis python=3.11 -y
conda activate btc-analysis
```

Install the Python dependencies required by the project.

For example:

```bash
python -m pip install fastapi uvicorn pandas numpy scikit-learn jupyter
```

Additional dependencies may be needed for running the research notebooks.

### Step 3 — Start the Backend

From the project root:

```bash
python -m uvicorn backend.main:app --reload
```

The backend will be available at:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### Step 4 — Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the application at:

`http://localhost:5173`

Both the backend and frontend must be running for the dashboard to retrieve API data.

### Step 5 — Explore the Dashboard

Navigate between:

1. Overview
2. Traffic Analysis
3. Clustering
4. Anomaly Analysis
5. Transactions
6. Model Comparison

Use the Transactions page to search by transaction ID or apply filters to explore the validation dataset.

**Data availability note:** The dashboard requires the prepared backend data files. If these files are not included in the repository, they must be generated or supplied before the application can serve the corresponding results.

---

## 12. Research Findings

The experiments support several important observations.

### Finding 1 — Transaction Traffic Varies Across Time

The validation dataset shows substantial variation in transaction volume across time steps.

Time Step 36 contains the highest number of transactions in the current validation partition.

### Finding 2 — Feature-Based Clusters Are Unevenly Distributed

The selected K-Means model produces two clusters with markedly different transaction counts.

This demonstrates that the fitted feature-space segmentation is imbalanced.

It does not demonstrate that one cluster is illicit or more dangerous.

### Finding 3 — Anomalies and Illicit Labels Are Not Equivalent

The tested anomaly detection methods show weak alignment with observed illicit labels.

Anomaly detection identifies unusual numerical patterns, while illicit labels describe an external annotation.

These are different concepts.

### Finding 4 — Feature Representation Influences Model Performance

Model results differ across original, reduced, and PCA-transformed feature representations.

This highlights the importance of evaluating preprocessing and feature selection decisions rather than assuming a particular representation is optimal.

### Finding 5 — Model Evaluation Requires Careful Interpretation

Clustering quality and illicit-label ranking performance answer different questions.

Silhouette Score measures cluster separation, while ROC-AUC and Average Precision evaluate how anomaly rankings align with available labels.

A model performing well on one metric should not automatically be considered superior for a different task.

---

## 13. Limitations

This project has several important limitations.

**1. High proportion of unknown labels**

Many transactions do not have illicit or licit annotations, restricting label-based evaluation.

**2. Weak illicit-label ranking performance**

The tested unsupervised anomaly detection configurations do not provide strong evidence of reliable illicit transaction identification.

**3. Anomaly scores are not probabilities**

LOF and Isolation Forest scores must not be interpreted as calibrated illicit probabilities.

**4. Cluster IDs are not transaction classes**

K-Means cluster assignments represent numerical groupings rather than supervised illicit/licit predictions.

**5. DBSCAN evaluation differences**

DBSCAN silhouette scores exclude noise points and should not be directly equated with the selected K-Means result.

**6. Historical research dataset**

The system analyzes a prepared historical dataset rather than continuously ingesting live Bitcoin blockchain transactions.

**7. Validation-focused dashboard**

The current interactive dashboard primarily presents results for validation time steps 31–39.

These limitations are important when interpreting the analytical findings.

---

## 14. Future Enhancements

Potential future improvements include:

- Interactive comparison across training, validation, and test periods.
- Additional transaction traffic visualizations.
- More detailed cluster profiling.
- Feature-level explanations of anomalous transactions.
- Alternative unsupervised and graph-based methods.
- Model evaluation across different chronological periods.
- Automated generation of analytical reports.
- Improved frontend performance through code splitting and lazy loading.
- Containerized deployment.
- Optional integration with additional blockchain datasets.

These are potential extensions and are not presented as currently implemented functionality.

---

## 15. Conclusion

**Bitcoin Transaction Traffic Analysis Using Unsupervised Learning** demonstrates how machine learning can support exploratory analysis of complex blockchain transaction data.

By combining transaction profiling, chronological evaluation, clustering, anomaly detection, REST APIs, and an interactive dashboard, the project provides an end-to-end workflow for investigating Bitcoin transaction patterns.

A central finding is that **unusual transaction behavior is not equivalent to illicit activity**. The project therefore emphasizes careful interpretation of unsupervised learning outputs, observed labels, and evaluation metrics.

The resulting platform serves as a research-oriented foundation for further work in blockchain analytics, unsupervised learning, and interpretable machine learning.

---

## 16. Repository

**GitHub Repository:**  
https://github.com/Manya-Developer/bitcoin-transaction-traffic-analysis

**Project Category:** Machine Learning · Unsupervised Learning · Blockchain Analytics · Full-Stack Data Analytics

**Dataset:** Elliptic Bitcoin Transaction Dataset

**Primary Technologies:** Python · Scikit-learn · FastAPI · React · Recharts