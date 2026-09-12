import React from "react";
import { Customer } from "../data/churnData";
import { Users, UserX, TrendingUp, DollarSign } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface DashboardOverviewProps {
  data: Customer[];
}

export default function DashboardOverview({ data }: DashboardOverviewProps) {
  const totalCount = data.length;
  const churnedCount = data.filter((c) => c.Churn === "Yes").length;
  const activeCount = totalCount - churnedCount;
  
  const churnRate = (churnedCount / totalCount) * 100;
  const retentionRate = (activeCount / totalCount) * 100;

  const averageTenure = data.reduce((acc, c) => acc + c.tenure, 0) / totalCount;
  const averageMonthly = data.reduce((acc, c) => acc + c.MonthlyCharges, 0) / totalCount;

  // Pie chart data represented as rates to avoid exposing dataset size
  const pieData = [
    { name: "Retained (Active) %", value: Number(retentionRate.toFixed(1)), color: "#10B981" }, // Emerald 500
    { name: "Churned (Left) %", value: Number(churnRate.toFixed(1)), color: "#EF4444" }    // Red 500
  ];

  return (
    <div className="space-y-6" id="overview-tab">
      {/* Intro section */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Executive Business Summary</h2>
        <p className="text-slate-600 leading-relaxed max-w-4xl text-sm">
          Acquiring a new subscriber is substantially more expensive than retaining an existing account. 
          Universal campaigns are financially unfeasible; hence, early predictive modeling allows us to focus retention budgets exclusively on high-risk, high-value accounts. Below are the key baseline metrics parsed directly from your multi-channel interaction dataset.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Framework Accuracy Benchmark */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Accuracy</p>
            <h3 className="text-2xl font-bold text-slate-800">84.5%</h3>
          </div>
        </div>

        {/* Churn Rate */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <UserX className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Churn Rate</p>
            <h3 className="text-2xl font-bold text-slate-800">{churnRate.toFixed(1)}%</h3>
          </div>
        </div>

        {/* Average Tenure */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Tenure</p>
            <h3 className="text-2xl font-bold text-slate-800">{averageTenure.toFixed(1)} mos</h3>
          </div>
        </div>

        {/* Average Monthly Charges */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Monthly Bill</p>
            <h3 className="text-2xl font-bold text-slate-800">${averageMonthly.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Main visual summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Retention breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-2">Customer Retention vs. Churn Rates</h3>
            <p className="text-xs text-slate-500 mb-6">Proportion of active, loyal subscribers compared directly to lost subscribers.</p>
            
            {/* Visual stacked bar */}
            <div className="h-8 w-full bg-slate-100 rounded-full flex overflow-hidden mb-6">
              <div 
                className="bg-emerald-500 h-full flex items-center justify-center text-white text-xs font-bold transition-all duration-500"
                style={{ width: `${retentionRate}%` }}
                title={`Retained: ${retentionRate.toFixed(1)}%`}
              >
                {retentionRate > 15 && `${retentionRate.toFixed(1)}% Retained`}
              </div>
              <div 
                className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-bold transition-all duration-500"
                style={{ width: `${churnRate}%` }}
                title={`Churned: ${churnRate.toFixed(1)}%`}
              >
                {churnRate > 15 && `${churnRate.toFixed(1)}% Churned`}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
            <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
              <span className="block text-xs font-medium text-emerald-800 mb-1">Active Subscribers Rate</span>
              <span className="text-xl font-extrabold text-emerald-600">{retentionRate.toFixed(1)}%</span>
              <span className="text-xs text-slate-500 block mt-1">Proportion of customers contributing to monthly recurring revenue.</span>
            </div>
            <div className="p-4 bg-red-50/50 rounded-lg border border-red-100/50">
              <span className="block text-xs font-medium text-red-800 mb-1">Churned Subscribers Rate</span>
              <span className="text-xl font-extrabold text-red-600">{churnRate.toFixed(1)}%</span>
              <span className="text-xs text-slate-500 block mt-1">Proportion of subscribers who have cancelled or ceased business.</span>
            </div>
          </div>
        </div>

        {/* Pie Chart Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center">
          <h3 className="text-base font-bold text-slate-800 self-start mb-1">Distribution Chart</h3>
          <p className="text-xs text-slate-500 self-start mb-4">Baseline breakdown represented in a radial layout.</p>
          
          <div className="h-64 w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}
                  itemStyle={{ fontSize: "12px", fontFamily: "sans-serif" }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => <span className="text-xs font-medium text-slate-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
