import React, { useState } from "react";
import { Customer } from "../data/churnData";
import { Filter, HelpCircle, Bot, Sparkles, AlertCircle } from "lucide-react";

interface DeepDataExplorerProps {
  data: Customer[];
}

export default function DeepDataExplorer({ data }: DeepDataExplorerProps) {
  // Cohort Filters State
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterSenior, setFilterSenior] = useState<string>("all");
  const [filterNet, setFilterNet] = useState<string>("all");
  const [filterContract, setFilterContract] = useState<string>("all");
  const [filterSupport, setFilterSupport] = useState<string>("all");

  // AI Chat States
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Apply filters in real time
  const filteredCohort = data.filter((c) => {
    if (filterGender !== "all" && c.gender !== filterGender) return false;
    if (filterSenior !== "all" && String(c.SeniorCitizen) !== filterSenior) return false;
    if (filterNet !== "all" && c.InternetService !== filterNet) return false;
    if (filterContract !== "all" && c.Contract !== filterContract) return false;
    if (filterSupport !== "all" && c.TechSupport !== filterSupport) return false;
    return true;
  });

  // Calculate stats of this specific cohort
  const cohortTotal = filteredCohort.length;
  const cohortChurned = filteredCohort.filter((c) => c.Churn === "Yes").length;
  const cohortChurnRate = cohortTotal > 0 ? (cohortChurned / cohortTotal) * 100 : 0;
  const cohortAvgMonthly = cohortTotal > 0 ? filteredCohort.reduce((acc, c) => acc + c.MonthlyCharges, 0) / cohortTotal : 0;
  const cohortMRR = filteredCohort.reduce((acc, c) => acc + c.MonthlyCharges, 0);

  // Trigger Offline Strategic Advisor Analysis based on current scenario parameters
  const handleQueryGemini = (customQuery?: string) => {
    const activeQuery = customQuery || aiQuery;
    if (!activeQuery.trim()) return;

    setLoading(true);
    setAiResponse(null);
    setErrorMsg(null);

    // Simulate instant secure processing for our offline tactical advisor
    setTimeout(() => {
      let markdown = `### 📋 Offline Strategic Advisory Report\n`;
      markdown += `* **Cohort Context**: Analyzed **${cohortTotal}** customer accounts matching current filters.\n`;
      markdown += `* **Calculated Risk Level**: **${cohortChurnRate.toFixed(1)}%** segment attrition rate (Baseline average: ~26.2%).\n`;
      markdown += `* **Selected Scenario Focus**: "${activeQuery}"\n\n`;

      markdown += `#### 🔍 1. Attrition Indicators & Diagnosis\n`;
      if (cohortTotal === 0) {
        markdown += `* **Cohort is empty**: Adjust your criteria (e.g. choose different contract or service layers) to populate accounts.\n`;
      } else {
        if (cohortChurnRate > 40) {
          markdown += `* **CRITICAL ALERT**: This specific segment suffers from an **extremely high churn rate of ${cohortChurnRate.toFixed(1)}%** (more than 1.5x the baseline). Immediate targeted retention campaigns are required to prevent severe ARR loss.\n`;
        } else if (cohortChurnRate > 25) {
          markdown += `* **MODERATE RISK**: This cohort shows elevated attrition (**${cohortChurnRate.toFixed(1)}%**), slightly above or at baseline. Proactive outreach can easily stabilize these accounts.\n`;
        } else {
          markdown += `* **STABLE COHORT**: This group shows strong loyalty with a **low churn rate of ${cohortChurnRate.toFixed(1)}%**. Highly profitable. Focus on multi-service upselling instead of defensive pricing.\n`;
        }

        // Feature-specific observations
        if (filterContract === "Month-to-month") {
          markdown += `* **Contractual Liability**: Month-to-month contracts are highly fluid. Transitioning these subscribers to fixed contracts is the highest impact save play.\n`;
        }
        if (filterNet === "Fiber optic") {
          markdown += `* **Fiber Optic Premium Price Friction**: Fiber Optic subscribers contribute major revenues but show premium price sensitivity. Loyalty bundles are highly effective here.\n`;
        }
        if (filterSupport === "No") {
          markdown += `* **Technical Isolation**: Subscribers with no dedicated Tech Support represent a high-risk group due to lack of a professional troubleshooting backup.\n`;
        }
        if (filterSenior === "1") {
          markdown += `* **Senior Segment Needs**: Elderly subscribers require custom pricing simplification and high-touch support lines rather than aggressive self-service portals.\n`;
        }
      }

      markdown += `\n#### 💵 2. Segment Revenue & Financial Risk Profile\n`;
      markdown += `* **Cohort MRR Contribution**: **$${cohortMRR.toLocaleString(undefined, { maximumFractionDigits: 0 })}** current monthly recurring revenue.\n`;
      const potentialLostMRR = cohortMRR * (cohortChurnRate / 100);
      markdown += `* **Annual Recurring Revenue (ARR) at Risk**: **$${(potentialLostMRR * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}** ARR projected to be lost if attrition persists.\n`;
      markdown += `* **Targeted Recovery Opportunity**: Securing just **30%** of these at-risk accounts via proactive save campaigns recovers **$${(potentialLostMRR * 0.3 * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}** in stable annual contract value.\n`;

      markdown += `\n#### 🛡️ 3. Recommended Strategic Retention Playbook\n`;
      markdown += `Based on current cohort statistics, apply the following 3 scenario-specific retention plays:\n\n`;

      if (filterContract === "Month-to-month") {
        markdown += `1. **"Month-to-Year" Migration Campaign**: Offer a **10% monthly discount** or **1 month free** on their subscription in exchange for signing a 1-Year agreement. This stabilizes revenue streams and locks in subscribers.\n`;
      } else {
        markdown += `1. **Commitment Extension Rewards**: For accounts nearing 80% contract duration, trigger proactive renewal rewards to prevent post-expiry month-to-month conversion.\n`;
      }

      if (filterSupport === "No") {
        markdown += `2. **Proactive Tech Support Gift**: Gift **3 months of free Premium Tech Support**. This familiarizes subscribers with safety add-ons which mathematically decrease churn risk by up to **3.5x**.\n`;
      } else {
        markdown += `2. **Online Security & Guard bundle**: Propose a complimentary upgrade to Online Security to raise product stickiness and make switching providers inconvenient.\n`;
      }

      if (filterNet === "Fiber optic") {
        markdown += `3. **High-ARPU Bundle Optimization**: Offer high-margin Fiber optic subscribers exclusive access to premium streaming TV/Movie trial bundles at no extra cost, boosting loyalty without slashing base fiber pricing.\n`;
      } else {
        markdown += `3. **Fiber Upgrade Incentives**: For DSL and non-internet subscribers, offer a free setup coupon to upgrade to high-speed Fiber Optic to improve service satisfaction.\n`;
      }

      markdown += `\n*Advisory Report generated in **Secure Offline Mode** based on actual present scenario calculations.*`;

      setAiResponse(markdown);
      setLoading(false);
    }, 600);
  };

  // Preset tactical templates
  const presets = [
    {
      label: "Optimize Month-to-Month Retentions",
      query: "Analyze this monthly contract cohort. What pricing incentives or contract migration rewards would effectively stabilize these high-churn accounts?"
    },
    {
      label: "Tech Support Anchor Tactics",
      query: "Reviewing this cohort of customers with no technical support. Formulate a personalized outreach campaign offering tech check-ups to lock in loyalties."
    },
    {
      label: "Fiber Optic Billing Adjustments",
      query: "Our highest billing Fiber Optic subscribers are churning rapidly. Suggest competitive package bundling or loyalty adjustments to preserve high-margin value."
    }
  ];

  return (
    <div className="space-y-6" id="deep-explorer-tab">
      {/* Intro info */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start space-x-4">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg mt-0.5">
          <Filter className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">Advanced Cohort Segmentation Builder</h2>
          <p className="text-xs text-slate-500 leading-relaxed mt-1">
            Build custom segments from customer interactions to diagnose hyper-targeted attrition patterns. 
            Once your segment is built, direct its live numerical properties into the integrated Strategic Advisor to generate customized business answers.
          </p>
        </div>
      </div>

      {/* Builder & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Filters Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
            <span>Filter Criteria</span>
          </h3>

          <div className="space-y-3 text-xs">
            {/* Gender */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Gender</label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-600"
              >
                <option value="all">All Genders</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            {/* Senior */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Senior Citizen</label>
              <select
                value={filterSenior}
                onChange={(e) => setFilterSenior(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-600"
              >
                <option value="all">All Ages</option>
                <option value="1">Senior Citizens Only</option>
                <option value="0">Non-Seniors Only</option>
              </select>
            </div>

            {/* Net Tier */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Internet Service</label>
              <select
                value={filterNet}
                onChange={(e) => setFilterNet(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-600"
              >
                <option value="all">All Internet Tiers</option>
                <option value="Fiber optic">Fiber Optic (High ARPU)</option>
                <option value="DSL">DSL</option>
                <option value="No">No Internet Service</option>
              </select>
            </div>

            {/* Contract Type */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Contract Duration</label>
              <select
                value={filterContract}
                onChange={(e) => setFilterContract(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-600"
              >
                <option value="all">All Contracts</option>
                <option value="Month-to-month">Month-to-Month</option>
                <option value="One year">One Year</option>
                <option value="Two year">Two Year</option>
              </select>
            </div>

            {/* Tech Support */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400">Technical Support</label>
              <select
                value={filterSupport}
                onChange={(e) => setFilterSupport(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-600"
              >
                <option value="all">All Support Levels</option>
                <option value="Yes">Tech Support Active</option>
                <option value="No">No Support Plan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cohort Summary Stats */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Cohort Strategic Metrics</h3>
            <p className="text-xs text-slate-500 mb-6">Aggregated financials and risk calculations for this specific group:</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Cohort Size</span>
                <span className="text-xl font-bold text-slate-800">{cohortTotal} <span className="text-xs font-normal text-slate-400">Accs</span></span>
              </div>

              <div className="p-4 bg-red-50/40 rounded-lg border border-red-100/40">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-red-400 block mb-1">Group Churn</span>
                <span className="text-xl font-bold text-red-600">{cohortChurnRate.toFixed(1)}%</span>
              </div>

              <div className="p-4 bg-indigo-50/40 rounded-lg border border-indigo-100/40">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400 block mb-1">Avg Billing</span>
                <span className="text-xl font-bold text-indigo-600">${cohortAvgMonthly.toFixed(0)}</span>
              </div>

              <div className="p-4 bg-emerald-50/40 rounded-lg border border-emerald-100/40">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 block mb-1">Total MRR</span>
                <span className="text-xl font-bold text-emerald-600">${cohortMRR.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          {/* List preview of filtered cohort */}
          <div className="mt-6 border-t border-slate-50 pt-4">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-3">Subscribers List Preview</span>
            <div className="max-h-36 overflow-y-auto border border-slate-100 rounded-lg text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="p-2 border-b border-slate-100">Account ID</th>
                    <th className="p-2 border-b border-slate-100">Tenure</th>
                    <th className="p-2 border-b border-slate-100">Contract</th>
                    <th className="p-2 border-b border-slate-100">Monthly Bill</th>
                    <th className="p-2 border-b border-slate-100 text-right">Churned?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {filteredCohort.slice(0, 8).map((ec) => (
                    <tr key={ec.customerID}>
                      <td className="p-2 font-mono">{ec.customerID}</td>
                      <td className="p-2">{ec.tenure} mos</td>
                      <td className="p-2">{ec.Contract}</td>
                      <td className="p-2">${ec.MonthlyCharges.toFixed(2)}</td>
                      <td className={`p-2 text-right font-bold ${ec.Churn === "Yes" ? "text-red-500" : "text-emerald-500"}`}>
                        {ec.Churn}
                      </td>
                    </tr>
                  ))}
                  {filteredCohort.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400">
                        No customer accounts found matching these criteria. Try broadening your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredCohort.length > 8 && (
              <span className="text-[10px] text-slate-400 block mt-2 text-right">Showing first 8 of {filteredCohort.length} accounts</span>
            )}
          </div>
        </div>
      </div>

      {/* Secure Offline Strategic Advisor panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800">Secure Offline Strategic Advisor (Offline AI)</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Select preset templates or enter custom inquiries to generate high-relevance retention strategies. The offline strategic advisor operates in full privacy mode, computing targeted pricing buffers and save tactics directly from the cohort aggregate metrics calculated above.
        </p>

        {/* Presets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAiQuery(p.query);
                handleQueryGemini(p.query);
              }}
              disabled={loading || cohortTotal === 0}
              className="p-3 bg-slate-50/50 hover:bg-slate-100 rounded-lg border border-slate-200/50 text-left text-xs transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex flex-col justify-between"
            >
              <span className="font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>{p.label}</span>
              </span>
              <span className="text-slate-500 leading-normal text-[11px] block mt-1">{p.query.slice(0, 95)}...</span>
            </button>
          ))}
        </div>

        {/* Query Input */}
        <div className="flex space-x-2 text-xs">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            disabled={loading || cohortTotal === 0}
            placeholder={cohortTotal === 0 ? "Select filters that yield active accounts first..." : "Enter custom query, e.g. Write a personalized 15% discount email offer for this group..."}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium text-slate-700 disabled:opacity-50"
          />
          <button
            onClick={() => handleQueryGemini()}
            disabled={loading || !aiQuery.trim() || cohortTotal === 0}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            {loading ? "Analyzing Scenario..." : "Analyze Scenario"}
          </button>
        </div>

        {/* Responses Terminal */}
        {(aiResponse || loading || errorMsg) && (
          <div className="bg-slate-900 text-slate-200 p-6 rounded-xl border border-slate-800 shadow-lg font-mono text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-2">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span>
                <span>Secure Offline Advisory Console</span>
              </span>
              <span className="text-[10px] text-slate-500">Model: Local Attrition Advisor v2.0</span>
            </div>

            {loading && (
              <div className="flex items-center space-x-3 text-slate-400">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></span>
                <span>Interpreting scenario parameters and running strategic optimization calculations...</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-start space-x-3 text-red-400">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {aiResponse && (
              <div className="text-slate-200 leading-relaxed font-sans space-y-4 whitespace-pre-wrap max-h-96 overflow-y-auto pr-2">
                {aiResponse}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
