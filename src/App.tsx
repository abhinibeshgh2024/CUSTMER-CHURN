import React, { useState, useEffect } from "react";
import { churnData } from "./data/churnData";
import { trainModels, FeatureScaler } from "./utils/mlEngine";
import { DashboardTab, ModelTrainingResult } from "./types";

// Import subcomponents
import DashboardOverview from "./components/DashboardOverview";
import DemographicAnalysis from "./components/DemographicAnalysis";
import ServicePreferences from "./components/ServicePreferences";
import ProfitabilityAnalysis from "./components/ProfitabilityAnalysis";
import EnsembleFramework from "./components/EnsembleFramework";
import RetentionStrategy from "./components/RetentionStrategy";
import DeepDataExplorer from "./components/DeepDataExplorer";

// Icons
import {
  Layers,
  Users2,
  Cpu,
  LineChart,
  BrainCircuit,
  ShieldAlert,
  Search,
  CheckCircle2,
  Database
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  
  // ML state to pass down
  const [modelResult, setModelResult] = useState<ModelTrainingResult | null>(null);
  const [scaler, setScaler] = useState<FeatureScaler | null>(null);
  const [lrModel, setLrModel] = useState<{ weights: number[]; bias: number } | null>(null);
  const [rfModel, setRfModel] = useState<any[] | null>(null);
  const [gbModel, setGbModel] = useState<any | null>(null);
  const [trainingError, setTrainingError] = useState<string | null>(null);

  // Train models on mount
  useEffect(() => {
    try {
      const trained = trainModels(churnData);
      setModelResult(trained.result);
      setScaler(trained.scaler);
      setLrModel(trained.lrModel);
      setRfModel(trained.rfModel);
      setGbModel(trained.gbModel);
    } catch (err: any) {
      console.error(err);
      setTrainingError(err?.message || "ML Engine initialization failed.");
    }
  }, []);

  // Helper to render the currently selected tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardOverview data={churnData} />;
      case "demographics":
        return <DemographicAnalysis data={churnData} />;
      case "services":
        return <ServicePreferences data={churnData} />;
      case "profitability":
        return <ProfitabilityAnalysis data={churnData} />;
      case "ml-engine":
        return <EnsembleFramework data={churnData} />;
      case "retention":
        if (!lrModel || !rfModel || !gbModel || !scaler) {
          return (
            <div className="p-12 text-center text-slate-400 text-xs">
              Waiting for ML engine to initialize weights...
            </div>
          );
        }
        return (
          <RetentionStrategy
            data={churnData}
            lrModel={lrModel}
            rfModel={rfModel}
            gbModel={gbModel}
            scaler={scaler}
          />
        );
      case "deep-explorer":
        return <DeepDataExplorer data={churnData} />;
      default:
        return <DashboardOverview data={churnData} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation / Brand Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-600/20">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-800 tracking-tight">Customer Churn Ensemble Framework</h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Early Risk Detection & Retention Analytics</p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-4 mt-3 md:mt-0 text-xs font-semibold">
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/50 text-slate-500">
            <Database className="h-4 w-4 text-slate-400" />
            <span>Database Pipeline Secured</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Ensemble Active</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 lg:p-6 gap-6">
        
        {/* Navigation Sidebar */}
        <nav className="w-full lg:w-64 shrink-0 space-y-1.5">
          <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider px-3 block mb-2">Framework Modules</span>
          
          {/* Tab Button: Overview */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Executive Overview</span>
          </button>

          {/* Tab Button: Demographics */}
          <button
            onClick={() => setActiveTab("demographics")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === "demographics"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Users2 className="h-4 w-4" />
            <span>Demographic Trends</span>
          </button>

          {/* Tab Button: Service Preferences */}
          <button
            onClick={() => setActiveTab("services")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === "services"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>Service Preferences</span>
          </button>

          {/* Tab Button: Profitability Analysis */}
          <button
            onClick={() => setActiveTab("profitability")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === "profitability"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <LineChart className="h-4 w-4" />
            <span>Profitability & CLV</span>
          </button>

          {/* Tab Button: Ensemble Framework */}
          <button
            onClick={() => setActiveTab("ml-engine")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === "ml-engine"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <BrainCircuit className="h-4 w-4" />
            <span>Software Metrics & Validation</span>
          </button>

          {/* Tab Button: Retention Strategy */}
          <button
            onClick={() => setActiveTab("retention")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === "retention"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Targeted Tiers ROI</span>
          </button>

          {/* Tab Button: Cohort Deep Explorer */}
          <button
            onClick={() => setActiveTab("deep-explorer")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === "deep-explorer"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Cohort Scenario Explorer</span>
          </button>
        </nav>

        {/* Tab content workspace area */}
        <main className="flex-1 min-w-0">
          {trainingError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl flex items-center space-x-3 text-xs font-mono">
              <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
              <span>{trainingError}</span>
            </div>
          ) : (
            renderTabContent()
          )}
        </main>
      </div>

      {/* Corporate Footer */}
      <footer className="bg-white border-t border-slate-100 py-4 px-6 text-center text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
        © 2026 Customer Churn Ensemble Learning Framework • Service Industries Retention Hub
      </footer>
    </div>
  );
}
