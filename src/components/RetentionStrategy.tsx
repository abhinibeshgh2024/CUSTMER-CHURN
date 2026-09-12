import React, { useState } from "react";
import { Customer } from "../data/churnData";
import { ChurnPredictionInput, RetentionTierCalculation } from "../types";
import {
  vectorizeCustomer,
  predictLogisticRegression,
  predictRandomForest,
  predictGradientBoosting
} from "../utils/mlEngine";
import { ShieldCheck, Flame, BellRing, Coins, HandCoins, BarChart3 } from "lucide-react";

interface RetentionStrategyProps {
  data: Customer[];
  lrModel: { weights: number[]; bias: number };
  rfModel: any[];
  gbModel: any;
  scaler: any;
}

export default function RetentionStrategy({ data, lrModel, rfModel, gbModel, scaler }: RetentionStrategyProps) {
  // Retention Campaign Configurations
  const [strategy, setStrategy] = useState<RetentionTierCalculation>({
    riskThresholdHigh: 70,       // 70% risk to trigger high tier
    riskThresholdMedium: 40,     // 40% risk to trigger medium tier
    costPerHighIntervention: 45, // $45 targeting cost (discount, upgrade)
    costPerMediumIntervention: 15, // $15 targeting cost (CSR call, small voucher)
    highSuccessRate: 45,        // 45% of targeted High Risk customers saved
    mediumSuccessRate: 25       // 25% of targeted Medium Risk customers saved
  });

  // Calculate prediction risk for every customer in our dataset
  const evaluatedCustomers = data.map((c) => {
    const x = vectorizeCustomer(c, scaler);
    const pLR = predictLogisticRegression(x, lrModel);
    const pRF = predictRandomForest(x, rfModel);
    const pGB = predictGradientBoosting(x, gbModel);
    
    // Average soft vote ensemble score
    const pEnsemble = (pLR * 0.2 + pRF * 0.3 + pGB * 0.5); // Fixed standard weights or use slider equivalents
    return {
      customer: c,
      riskScore: pEnsemble * 100 // Scale to percentage
    };
  });

  // Segment customers into Tiers
  const highRiskCohort = evaluatedCustomers.filter((ec) => ec.riskScore >= strategy.riskThresholdHigh);
  const mediumRiskCohort = evaluatedCustomers.filter((ec) => ec.riskScore >= strategy.riskThresholdMedium && ec.riskScore < strategy.riskThresholdHigh);
  const lowRiskCohort = evaluatedCustomers.filter((ec) => ec.riskScore < strategy.riskThresholdMedium);

  // Financial Computations
  const highRiskCount = highRiskCohort.length;
  const mediumRiskCount = mediumRiskCohort.length;
  const lowRiskCount = lowRiskCohort.length;

  const totalHighCost = highRiskCount * strategy.costPerHighIntervention;
  const totalMediumCost = mediumRiskCount * strategy.costPerMediumIntervention;
  const totalCampaignCost = totalHighCost + totalMediumCost;

  // Estimated Saved Customers
  const savedHighCount = Math.round(highRiskCount * (strategy.highSuccessRate / 100));
  const savedMediumCount = Math.round(mediumRiskCount * (strategy.mediumSuccessRate / 100));
  const totalSavedCount = savedHighCount + savedMediumCount;

  // Saved monthly recurring revenue (MRR)
  const avgHighMonthly = highRiskCohort.length > 0 ? highRiskCohort.reduce((acc, ec) => acc + ec.customer.MonthlyCharges, 0) / highRiskCount : 0;
  const avgMediumMonthly = mediumRiskCohort.length > 0 ? mediumRiskCohort.reduce((acc, ec) => acc + ec.customer.MonthlyCharges, 0) / mediumRiskCount : 0;

  const savedHighMRR = savedHighCount * avgHighMonthly;
  const savedMediumMRR = savedMediumCount * avgMediumMonthly;
  const totalSavedMRR = savedHighMRR + savedMediumMRR;
  const totalSavedARR = totalSavedMRR * 12;

  // Net Return on Investment (ROI)
  const netSavings = totalSavedMRR - totalCampaignCost; // Net month-1 savings
  const annualNetSavings = totalSavedARR - totalCampaignCost; // Net Year-1 savings

  return (
    <div className="space-y-6" id="retention-tab">
      {/* Overview */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Operational Decisions Matrix & Campaign Calculator</h2>
        <p className="text-slate-600 leading-relaxed text-sm">
          Translate predictions into bottom-line financial savings. Based on custom risk thresholds and intervention parameters, we segment your active subscribers into targeted campaigns to maximize recurring revenue preservation.
        </p>
      </div>

      {/* Decision Configuration Sliders */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="space-y-3 md:col-span-3 pb-3 border-b border-slate-200/60">
          <h3 className="font-bold text-slate-800 flex items-center space-x-2">
            <Coins className="h-4 w-4 text-emerald-600" />
            <span>Calibrate Intervention Parameters:</span>
          </h3>
        </div>

        {/* High Risk Target Cost */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 block flex justify-between">
            <span>High-Risk Campaign Cost (per user)</span>
            <span className="text-slate-800 font-extrabold">${strategy.costPerHighIntervention}</span>
          </label>
          <input
            type="range"
            min="5"
            max="150"
            step="5"
            value={strategy.costPerHighIntervention}
            onChange={(e) => setStrategy({ ...strategy, costPerHighIntervention: parseInt(e.target.value, 10) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Medium Risk Target Cost */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 block flex justify-between">
            <span>Medium-Risk Campaign Cost (per user)</span>
            <span className="text-slate-800 font-extrabold">${strategy.costPerMediumIntervention}</span>
          </label>
          <input
            type="range"
            min="2"
            max="50"
            step="1"
            value={strategy.costPerMediumIntervention}
            onChange={(e) => setStrategy({ ...strategy, costPerMediumIntervention: parseInt(e.target.value, 10) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Threshold limits */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 block flex justify-between">
            <span>High-Risk Threshold Trigger</span>
            <span className="text-slate-800 font-extrabold">{strategy.riskThresholdHigh}% risk</span>
          </label>
          <input
            type="range"
            min="50"
            max="90"
            step="5"
            value={strategy.riskThresholdHigh}
            onChange={(e) => setStrategy({ ...strategy, riskThresholdHigh: parseInt(e.target.value, 10) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* High Risk Success Rate */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 block flex justify-between">
            <span>High-Risk Save Success Rate</span>
            <span className="text-slate-800 font-extrabold">{strategy.highSuccessRate}% saved</span>
          </label>
          <input
            type="range"
            min="10"
            max="90"
            step="5"
            value={strategy.highSuccessRate}
            onChange={(e) => setStrategy({ ...strategy, highSuccessRate: parseInt(e.target.value, 10) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Medium Risk Success Rate */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 block flex justify-between">
            <span>Medium-Risk Save Success Rate</span>
            <span className="text-slate-800 font-extrabold">{strategy.mediumSuccessRate}% saved</span>
          </label>
          <input
            type="range"
            min="5"
            max="70"
            step="5"
            value={strategy.mediumSuccessRate}
            onChange={(e) => setStrategy({ ...strategy, mediumSuccessRate: parseInt(e.target.value, 10) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Medium trigger threshold */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-slate-400 block flex justify-between">
            <span>Medium-Risk Threshold Trigger</span>
            <span className="text-slate-800 font-extrabold">{strategy.riskThresholdMedium}% risk</span>
          </label>
          <input
            type="range"
            min="20"
            max="49"
            step="5"
            value={strategy.riskThresholdMedium}
            onChange={(e) => setStrategy({ ...strategy, riskThresholdMedium: parseInt(e.target.value, 10) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>
      </div>

      {/* Operational Tiers & Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tier Cards Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Operational Tiers Breakdown</h3>
          
          {/* High Risk Tier */}
          <div className="bg-white p-5 rounded-xl border-l-4 border-red-500 border border-slate-100 shadow-sm flex items-start space-x-4">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-lg shrink-0">
              <Flame className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">Critical High-Risk Tier</span>
                <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-semibold">{highRiskCount} Accounts</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Trigger immediate high-value upgrades or a minimum 20% billing discount tailored directly to current usage.
              </p>
              <div className="pt-2 text-[10px] uppercase tracking-wider text-slate-400 font-bold flex justify-between">
                <span>Intervention Budget: **${totalHighCost.toLocaleString()}**</span>
                <span>Targeting threshold: **&ge; {strategy.riskThresholdHigh}%**</span>
              </div>
            </div>
          </div>

          {/* Medium Risk Tier */}
          <div className="bg-white p-5 rounded-xl border-l-4 border-amber-500 border border-slate-100 shadow-sm flex items-start space-x-4">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
              <BellRing className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">Proactive Medium-Risk Tier</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">{mediumRiskCount} Accounts</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                CSR direct dial companion. Offer a technical check-up and a complimentary 1-month streaming voucher.
              </p>
              <div className="pt-2 text-[10px] uppercase tracking-wider text-slate-400 font-bold flex justify-between">
                <span>Intervention Budget: **${totalMediumCost.toLocaleString()}**</span>
                <span>Targeting threshold: **{strategy.riskThresholdMedium}% - {strategy.riskThresholdHigh}%**</span>
              </div>
            </div>
          </div>

          {/* Low Risk Tier */}
          <div className="bg-white p-5 rounded-xl border-l-4 border-emerald-500 border border-slate-100 shadow-sm flex items-start space-x-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">Stable Low-Risk Tier</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">{lowRiskCount} Accounts</span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Retain in default automated drip marketing campaigns. Offer high-profit contract upgrades at standard pricing.
              </p>
              <div className="pt-2 text-[10px] uppercase tracking-wider text-slate-400 font-bold flex justify-between">
                <span>Intervention Budget: **$0**</span>
                <span>Targeting threshold: **&lt; {strategy.riskThresholdMedium}%**</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial ROI Output Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center">
              <BarChart3 className="h-4 w-4 text-indigo-600 mr-1.5" />
              <span>Projected Savings Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">Calculates conserved ARR based on model precision.</p>

            <div className="space-y-4">
              {/* Preserved customers */}
              <div className="pb-3 border-b border-slate-50">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Subscribers Saved</span>
                <span className="text-2xl font-black text-slate-800">{totalSavedCount} <span className="text-xs text-slate-400 font-normal">Accounts</span></span>
              </div>

              {/* Total Cost */}
              <div className="pb-3 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Total Campaign Budget</span>
                  <span className="text-xl font-bold text-slate-800">${totalCampaignCost.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">High Risk share</span>
                  <span className="text-sm text-slate-600 font-semibold">${totalHighCost}</span>
                </div>
              </div>

              {/* Preserved MRR */}
              <div className="pb-3 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Saved Monthly Rev (MRR)</span>
                  <span className="text-xl font-bold text-emerald-600">+${totalSavedMRR.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Annualized (ARR)</span>
                  <span className="text-sm text-emerald-600 font-extrabold">+${totalSavedARR.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROI Metric */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center space-x-3 mt-4">
            <HandCoins className="h-6 w-6 text-emerald-600" />
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Est. Year 1 Net Savings (ARR - Budget)</span>
              <span className="text-base font-extrabold text-emerald-600">
                ${annualNetSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
