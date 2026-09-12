import React from "react";
import { Customer } from "../data/churnData";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Banknote, TrendingUp, ShieldAlert, Award } from "lucide-react";

interface ProfitabilityAnalysisProps {
  data: Customer[];
}

export default function ProfitabilityAnalysis({ data }: ProfitabilityAnalysisProps) {
  const totalCount = data.length;

  // Helper to compute average financial metrics for segments
  const getFinanceStats = (filterFn: (c: Customer) => boolean) => {
    const subset = data.filter(filterFn);
    const count = subset.length;
    const avgMonthly = count > 0 ? subset.reduce((acc, c) => acc + c.MonthlyCharges, 0) / count : 0;
    const avgTenure = count > 0 ? subset.reduce((acc, c) => acc + c.tenure, 0) / count : 0;
    // Estimated Customer Lifetime Value: Avg Monthly * Avg Tenure
    const estCLV = avgMonthly * avgTenure;
    const totalMonthlyRevenue = subset.reduce((acc, c) => acc + c.MonthlyCharges, 0);

    return { count, avgMonthly, avgTenure, estCLV, totalMonthlyRevenue };
  };

  // Service Configurations Financials
  const fiberFin = getFinanceStats((c) => c.InternetService === "Fiber optic");
  const dslFin = getFinanceStats((c) => c.InternetService === "DSL");
  const noNetFin = getFinanceStats((c) => c.InternetService === "No");

  // Contract Duration Financials
  const m2mFin = getFinanceStats((c) => c.Contract === "Month-to-month");
  const annualFin = getFinanceStats((c) => c.Contract === "One year");
  const biennialFin = getFinanceStats((c) => c.Contract === "Two year");

  // Prepare Chart Data: Avg Monthly Charges & Estimated CLV per Internet Service Tier
  const tierFinanceData = [
    {
      name: "Fiber Optic",
      "Avg Monthly Charge ($)": Number(fiberFin.avgMonthly.toFixed(2)),
      "Est. Life Value (CLV, $)": Number(fiberFin.estCLV.toFixed(2)),
      "Total Monthly Rev ($)": Number(fiberFin.totalMonthlyRevenue.toFixed(0))
    },
    {
      name: "DSL",
      "Avg Monthly Charge ($)": Number(dslFin.avgMonthly.toFixed(2)),
      "Est. Life Value (CLV, $)": Number(dslFin.estCLV.toFixed(2)),
      "Total Monthly Rev ($)": Number(dslFin.totalMonthlyRevenue.toFixed(0))
    },
    {
      name: "No Internet",
      "Avg Monthly Charge ($)": Number(noNetFin.avgMonthly.toFixed(2)),
      "Est. Life Value (CLV, $)": Number(noNetFin.estCLV.toFixed(2)),
      "Total Monthly Rev ($)": Number(noNetFin.totalMonthlyRevenue.toFixed(0))
    }
  ];

  // Prepare Contract Chart Data
  const contractFinanceData = [
    {
      name: "Month-to-Month",
      "Avg Monthly Charge ($)": Number(m2mFin.avgMonthly.toFixed(2)),
      "Est. Life Value (CLV, $)": Number(m2mFin.estCLV.toFixed(2)),
      "Active Share (%)": Number(((m2mFin.count / totalCount) * 100).toFixed(1))
    },
    {
      name: "One Year",
      "Avg Monthly Charge ($)": Number(annualFin.avgMonthly.toFixed(2)),
      "Est. Life Value (CLV, $)": Number(annualFin.estCLV.toFixed(2)),
      "Active Share (%)": Number(((annualFin.count / totalCount) * 100).toFixed(1))
    },
    {
      name: "Two Year",
      "Avg Monthly Charge ($)": Number(biennialFin.avgMonthly.toFixed(2)),
      "Est. Life Value (CLV, $)": Number(biennialFin.estCLV.toFixed(2)),
      "Active Share (%)": Number(((biennialFin.count / totalCount) * 100).toFixed(1))
    }
  ];

  return (
    <div className="space-y-6" id="profitability-tab">
      {/* Intro section */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start space-x-4">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mt-0.5">
          <Banknote className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">Financial Profitability & Margin Optimization</h2>
          <p className="text-xs text-slate-500 leading-relaxed mt-1">
            Isolating our highest margin services and assessing their retention parameters helps the business design premium preservation workflows. Fiber Optic represents our highest ARPU (Average Revenue Per User) product but also suffers from maximum leakage, making it our primary target for strategic preservation.
          </p>
        </div>
      </div>

      {/* Main charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Financials */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Financial Profiles by Internet Service Tier</h3>
          <p className="text-xs text-slate-500 mb-6">Compares Average Monthly Bill against Estimated Customer Lifetime Value (CLV).</p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tierFinanceData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}
                  itemStyle={{ fontSize: "11px", fontFamily: "sans-serif" }}
                />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Avg Monthly Charge ($)" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Avg Monthly Charge ($)" />
                <Bar dataKey="Est. Life Value (CLV, $)" fill="#10B981" radius={[4, 4, 0, 0]} name="Est. Lifetime Value (CLV, $)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Contract Financials */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Financial Profiles by Contract Type</h3>
          <p className="text-xs text-slate-500 mb-6">Illustrates how predictable locked-in contract duration drives account valuation.</p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contractFinanceData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}
                  itemStyle={{ fontSize: "11px", fontFamily: "sans-serif" }}
                />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Avg Monthly Charge ($)" fill="#6366F1" radius={[4, 4, 0, 0]} name="Avg Monthly Charge ($)" />
                <Bar dataKey="Est. Life Value (CLV, $)" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Est. Lifetime Value (CLV, $)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Structured Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* High Profitability */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg mt-1">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">High-Profit Service Tier</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              **Fiber Optic** generates the highest Average Monthly Billing of **${fiberFin.avgMonthly.toFixed(2)}**. It accounts for a massive **${fiberFin.totalMonthlyRevenue.toFixed(0)} / mo** in total revenue share. This is the company's highest margin offering.
            </p>
          </div>
        </div>

        {/* High Risk Attrition */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg mt-1">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">The High-Value Leakage</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Month-to-month contracts have high monthly charges (**${m2mFin.avgMonthly.toFixed(2)}**) but are deeply plagued by low tenure (**{m2mFin.avgTenure.toFixed(1)} mos**), collapsing their Estimated Lifetime Value to just **${m2mFin.estCLV.toFixed(0)}**.
            </p>
          </div>
        </div>

        {/* Locked-in contracts value */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg mt-1">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Contract Locking Advantage</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Moving month-to-month customers to **Two-Year Contracts** expands average tenure to **{biennialFin.avgTenure.toFixed(1)} mos**, resulting in an Estimated CLV of **${biennialFin.estCLV.toFixed(0)}**—nearly **10x** standard transactional values!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
