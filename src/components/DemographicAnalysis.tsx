import React from "react";
import { Customer } from "../data/churnData";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Users2, ShieldAlert } from "lucide-react";

interface DemographicAnalysisProps {
  data: Customer[];
}

export default function DemographicAnalysis({ data }: DemographicAnalysisProps) {
  // Helper to compute churn metrics for any given filter condition
  const getGroupStats = (filterFn: (c: Customer) => boolean, name: string) => {
    const subset = data.filter(filterFn);
    const total = subset.length;
    const churned = subset.filter((c) => c.Churn === "Yes").length;
    const rate = total > 0 ? (churned / total) * 100 : 0;
    return { name, total, churned, rate };
  };

  // Gender demographics
  const femaleStats = getGroupStats((c) => c.gender === "Female", "Female");
  const maleStats = getGroupStats((c) => c.gender === "Male", "Male");

  // Senior Citizens
  const seniorStats = getGroupStats((c) => c.SeniorCitizen === 1, "Senior Citizen");
  const nonSeniorStats = getGroupStats((c) => c.SeniorCitizen === 0, "Non-Senior");

  // Partner status
  const partnerStats = getGroupStats((c) => c.Partner === "Yes", "With Partner");
  const noPartnerStats = getGroupStats((c) => c.Partner === "No", "No Partner");

  // Dependents
  const dependentsStats = getGroupStats((c) => c.Dependents === "Yes", "With Dependents");
  const noDependentsStats = getGroupStats((c) => c.Dependents === "No", "No Dependents");

  // Combine into chart data for Recharts
  const chartData = [
    {
      category: "Gender",
      "Retained Rate (%)": Number((100 - femaleStats.rate).toFixed(1)),
      "Churn Rate (%)": Number(femaleStats.rate.toFixed(1)),
      group: "Female"
    },
    {
      category: "Gender",
      "Retained Rate (%)": Number((100 - maleStats.rate).toFixed(1)),
      "Churn Rate (%)": Number(maleStats.rate.toFixed(1)),
      group: "Male"
    },
    {
      category: "Age Group",
      "Retained Rate (%)": Number((100 - seniorStats.rate).toFixed(1)),
      "Churn Rate (%)": Number(seniorStats.rate.toFixed(1)),
      group: "Senior Citizen"
    },
    {
      category: "Age Group",
      "Retained Rate (%)": Number((100 - nonSeniorStats.rate).toFixed(1)),
      "Churn Rate (%)": Number(nonSeniorStats.rate.toFixed(1)),
      group: "Non-Senior"
    },
    {
      category: "Relationship",
      "Retained Rate (%)": Number((100 - partnerStats.rate).toFixed(1)),
      "Churn Rate (%)": Number(partnerStats.rate.toFixed(1)),
      group: "With Partner"
    },
    {
      category: "Relationship",
      "Retained Rate (%)": Number((100 - noPartnerStats.rate).toFixed(1)),
      "Churn Rate (%)": Number(noPartnerStats.rate.toFixed(1)),
      group: "Single (No Partner)"
    },
    {
      category: "Family Profile",
      "Retained Rate (%)": Number((100 - dependentsStats.rate).toFixed(1)),
      "Churn Rate (%)": Number(dependentsStats.rate.toFixed(1)),
      group: "With Dependents"
    },
    {
      category: "Family Profile",
      "Retained Rate (%)": Number((100 - noDependentsStats.rate).toFixed(1)),
      "Churn Rate (%)": Number(noDependentsStats.rate.toFixed(1)),
      group: "No Dependents"
    }
  ];

  return (
    <div className="space-y-6" id="demographics-tab">
      {/* Intro info */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start space-x-4">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
          <Users2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">Demographic Churn Patterns</h2>
          <p className="text-xs text-slate-500 leading-relaxed mt-1">
            Historical indicators show that Senior Citizens (65+) and single accounts (No Partner, No Dependents) suffer from much higher churn distributions. 
            Understanding these patterns allows us to offer tailored companion packages or elderly assistance plans to bolster long-term retention.
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph representing churn by profile */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Churn Risk by Demographic Sub-segment</h3>
          <p className="text-xs text-slate-500 mb-6">Grouped representation comparing active retention against attrition risk.</p>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="group" 
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
                <Bar dataKey="Retained Rate (%)" fill="#10B981" radius={[4, 4, 0, 0]} name="Retained Rate (%)" stackId="a" />
                <Bar dataKey="Churn Rate (%)" fill="#EF4444" radius={[4, 4, 0, 0]} name="Churn Attrition Rate (%)" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insight Breakdown List */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Key Demographic Insights</h3>
          <p className="text-xs text-slate-500 mb-4">Core mathematical patterns parsed from customer records:</p>

          <div className="space-y-4 text-xs text-slate-600">
            {/* Gender split */}
            <div className="pb-3 border-b border-slate-50">
              <span className="font-semibold text-slate-700 block mb-1">Gender Dispersion:</span>
              <p className="leading-relaxed">
                Churn rate is almost identical between **Females ({femaleStats.rate.toFixed(1)}%)** and **Males ({maleStats.rate.toFixed(1)}%)**. Gender is not a statistically significant single predictor of attrition.
              </p>
            </div>

            {/* Age Split */}
            <div className="pb-3 border-b border-slate-50">
              <span className="font-semibold text-slate-700 flex items-center mb-1 text-red-600">
                <ShieldAlert className="h-4 w-4 mr-1" /> Senior Citizen Risk:
              </span>
              <p className="leading-relaxed">
                Senior Citizens exhibit an extremely high attrition rate of **{seniorStats.rate.toFixed(1)}%**, compared to only **{nonSeniorStats.rate.toFixed(1)}%** for younger accounts. They represent a high-vulnerability segment.
              </p>
            </div>

            {/* Support Systems */}
            <div>
              <span className="font-semibold text-slate-700 block mb-1">Family & Partnership Cushion:</span>
              <p className="leading-relaxed">
                Customers without a partner churn at **{noPartnerStats.rate.toFixed(1)}%** vs. **{partnerStats.rate.toFixed(1)}%** for those married. Similarly, having no dependents raises risk to **{noDependentsStats.rate.toFixed(1)}%**. Shared household accounts are much more stable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
