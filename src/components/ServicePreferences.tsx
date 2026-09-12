import React, { useState } from "react";
import { Customer } from "../data/churnData";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Cpu, ShieldCheck, PhoneCall, HelpCircle } from "lucide-react";

interface ServicePreferencesProps {
  data: Customer[];
}

export default function ServicePreferences({ data }: ServicePreferencesProps) {
  const [selectedServiceType, setSelectedServiceType] = useState<"internet" | "addons" | "entertainment">("internet");

  // Helper to get stats for a service value
  const getServiceStats = (feature: keyof Customer, value: string, label: string) => {
    const subset = data.filter((c) => c[feature] === value);
    const total = subset.length;
    const churned = subset.filter((c) => c.Churn === "Yes").length;
    const rate = total > 0 ? (churned / total) * 100 : 0;
    return { name: label, total, churned, rate };
  };

  // 1. Internet Tiers Stats
  const fiberStats = getServiceStats("InternetService", "Fiber optic", "Fiber Optic");
  const dslStats = getServiceStats("InternetService", "DSL", "DSL");
  const noNetStats = getServiceStats("InternetService", "No", "No Internet");

  // 2. Add-ons Stats
  const techSupportYes = getServiceStats("TechSupport", "Yes", "With Tech Support");
  const techSupportNo = getServiceStats("TechSupport", "No", "No Tech Support");
  
  const securityYes = getServiceStats("OnlineSecurity", "Yes", "With Online Security");
  const securityNo = getServiceStats("OnlineSecurity", "No", "No Online Security");

  const backupYes = getServiceStats("OnlineBackup", "Yes", "With Online Backup");
  const backupNo = getServiceStats("OnlineBackup", "No", "No Online Backup");

  // 3. Phone & Lines Stats
  const phoneYes = getServiceStats("PhoneService", "Yes", "Phone Active");
  const phoneNo = getServiceStats("PhoneService", "No", "No Phone");
  
  const linesMulti = getServiceStats("MultipleLines", "Yes", "Multiple Lines");
  const linesSingle = getServiceStats("MultipleLines", "No", "Single Line");

  // Entertainment Stats
  const tvYes = getServiceStats("StreamingTV", "Yes", "Streaming TV");
  const tvNo = getServiceStats("StreamingTV", "No", "No Streaming TV");
  const moviesYes = getServiceStats("StreamingMovies", "Yes", "Streaming Movies");
  const moviesNo = getServiceStats("StreamingMovies", "No", "No Streaming Movies");

  // Prepare chart datasets based on selected category
  const getChartData = () => {
    switch (selectedServiceType) {
      case "internet":
        return [
          { name: "Fiber Optic", "Churn Rate (%)": Number(fiberStats.rate.toFixed(1)), "Active Rate (%)": Number((100 - fiberStats.rate).toFixed(1)) },
          { name: "DSL", "Churn Rate (%)": Number(dslStats.rate.toFixed(1)), "Active Rate (%)": Number((100 - dslStats.rate).toFixed(1)) },
          { name: "No Internet", "Churn Rate (%)": Number(noNetStats.rate.toFixed(1)), "Active Rate (%)": Number((100 - noNetStats.rate).toFixed(1)) }
        ];
      case "addons":
        return [
          { name: "Tech Support", "Churn Rate (%)": Number(techSupportYes.rate.toFixed(1)), "Active Rate (%)": Number((100 - techSupportYes.rate).toFixed(1)) },
          { name: "No Tech Support", "Churn Rate (%)": Number(techSupportNo.rate.toFixed(1)), "Active Rate (%)": Number((100 - techSupportNo.rate).toFixed(1)) },
          { name: "Online Security", "Churn Rate (%)": Number(securityYes.rate.toFixed(1)), "Active Rate (%)": Number((100 - securityYes.rate).toFixed(1)) },
          { name: "No Security", "Churn Rate (%)": Number(securityNo.rate.toFixed(1)), "Active Rate (%)": Number((100 - securityNo.rate).toFixed(1)) },
          { name: "Online Backup", "Churn Rate (%)": Number(backupYes.rate.toFixed(1)), "Active Rate (%)": Number((100 - backupYes.rate).toFixed(1)) },
          { name: "No Backup", "Churn Rate (%)": Number(backupNo.rate.toFixed(1)), "Active Rate (%)": Number((100 - backupNo.rate).toFixed(1)) }
        ];
      case "entertainment":
        return [
          { name: "Streaming TV", "Churn Rate (%)": Number(tvYes.rate.toFixed(1)), "Active Rate (%)": Number((100 - tvYes.rate).toFixed(1)) },
          { name: "No TV Streaming", "Churn Rate (%)": Number(tvNo.rate.toFixed(1)), "Active Rate (%)": Number((100 - tvNo.rate).toFixed(1)) },
          { name: "Streaming Movies", "Churn Rate (%)": Number(moviesYes.rate.toFixed(1)), "Active Rate (%)": Number((100 - moviesYes.rate).toFixed(1)) },
          { name: "No Movie Streaming", "Churn Rate (%)": Number(moviesNo.rate.toFixed(1)), "Active Rate (%)": Number((100 - moviesNo.rate).toFixed(1)) }
        ];
    }
  };

  return (
    <div className="space-y-6" id="services-tab">
      {/* Tab controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Service Preference Attrition Index</h2>
          <p className="text-xs text-slate-500">Examine how specific network setups and auxiliary features impact loyalty.</p>
        </div>
        
        {/* Toggle buttons */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg self-start">
          <button
            onClick={() => setSelectedServiceType("internet")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              selectedServiceType === "internet" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Internet Tiers
          </button>
          <button
            onClick={() => setSelectedServiceType("addons")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              selectedServiceType === "addons" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Safety Add-ons
          </button>
          <button
            onClick={() => setSelectedServiceType("entertainment")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              selectedServiceType === "entertainment" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Entertainment
          </button>
        </div>
      </div>

      {/* Main Analysis grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 mb-1 capitalize">{selectedServiceType} Subscription Attrition Breakdown</h3>
          <p className="text-xs text-slate-500 mb-6">Comparing loss ratios against positive retention across chosen category.</p>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getChartData()}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: "#64748B" }} 
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={{ stroke: "#CBD5E1" }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: "#64748B" }} 
                  axisLine={{ stroke: "#CBD5E1" }}
                  tickLine={{ stroke: "#CBD5E1" }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}
                  itemStyle={{ fontSize: "11px", fontFamily: "sans-serif" }}
                />
                <Legend 
                  iconSize={10} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", marginTop: "10px" }}
                />
                <Bar dataKey="Active Rate (%)" fill="#10B981" radius={[4, 4, 0, 0]} name="Retained Rate (%)" stackId="s" />
                <Bar dataKey="Churn Rate (%)" fill="#EF4444" radius={[4, 4, 0, 0]} name="Churn Attrition Rate (%)" stackId="s" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actionable Service Insights */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Service Preferences Diagnostics</h3>
            <p className="text-xs text-slate-500 mb-4">Critical risk triggers derived from current service allocations:</p>
            
            <div className="space-y-4 text-xs text-slate-600">
              {/* Fiber optic alert */}
              <div className="p-3 bg-red-50/50 rounded-lg border border-red-100 flex items-start space-x-3">
                <Cpu className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-red-800 block mb-0.5">Fiber Optic Churn Spike</span>
                  <p className="leading-relaxed">
                    Fiber optic internet has an astronomical churn rate of **{fiberStats.rate.toFixed(1)}%**, compared to only **{dslStats.rate.toFixed(1)}%** for DSL. Despite high speeds, these accounts represent critical attrition nodes.
                  </p>
                </div>
              </div>

              {/* Safety add-ons cushion */}
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-start space-x-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-800 block mb-0.5">Support & Security Anchor</span>
                  <p className="leading-relaxed">
                    Accounts **without** Online Security churn at **{securityNo.rate.toFixed(1)}%** (vs. **{securityYes.rate.toFixed(1)}%** with). Similarly, no Tech Support escalates churn to **{techSupportNo.rate.toFixed(1)}%** (vs. **{techSupportYes.rate.toFixed(1)}%** with). These serve as critical stabilization anchors.
                  </p>
                </div>
              </div>

              {/* Multiple Lines and Phone Service */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 flex items-start space-x-3">
                <PhoneCall className="h-5 w-5 text-slate-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">Phone Line Stability</span>
                  <p className="leading-relaxed">
                    Having basic phone service maintains a moderate churn rate of **{phoneYes.rate.toFixed(1)}%**, but multiple lines add minor stability (**{linesMulti.rate.toFixed(1)}%** churn).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
