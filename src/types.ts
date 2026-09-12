import { Customer } from "./data/churnData";

export type DashboardTab = 
  | "overview" 
  | "demographics" 
  | "services" 
  | "profitability" 
  | "ml-engine" 
  | "retention" 
  | "deep-explorer";

export interface MLMetric {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  aucROC: number;
}

export interface ConfusionMatrix {
  tp: number; // True Positive (Churn predicted, actually Churn)
  fp: number; // False Positive (Churn predicted, actually Retained)
  tn: number; // True Negative (Retained predicted, actually Retained)
  fn: number; // False Negative (Retained predicted, actually Churn)
}

export interface FeatureImportance {
  featureName: string;
  importance: number; // Weight or relative split importance
  type: "demographic" | "contractual" | "service" | "financial";
}

export interface ModelTrainingResult {
  logisticRegression: {
    metrics: MLMetric;
    confusionMatrix: ConfusionMatrix;
    weights: Record<string, number>;
  };
  randomForest: {
    metrics: MLMetric;
    confusionMatrix: ConfusionMatrix;
    featureImportances: FeatureImportance[];
  };
  gradientBoosting: {
    metrics: MLMetric;
    confusionMatrix: ConfusionMatrix;
    stagesCount: number;
  };
  ensemble: {
    metrics: MLMetric;
    confusionMatrix: ConfusionMatrix;
  };
}

export interface ChurnPredictionInput {
  gender: "Female" | "Male";
  SeniorCitizen: number;
  Partner: "Yes" | "No";
  Dependents: "Yes" | "No";
  tenure: number;
  PhoneService: "Yes" | "No";
  MultipleLines: "Yes" | "No" | "No phone service";
  InternetService: "DSL" | "Fiber optic" | "No";
  OnlineSecurity: "Yes" | "No" | "No internet service";
  OnlineBackup: "Yes" | "No" | "No internet service";
  DeviceProtection: "Yes" | "No" | "No internet service";
  TechSupport: "Yes" | "No" | "No internet service";
  StreamingTV: "Yes" | "No" | "No internet service";
  StreamingMovies: "Yes" | "No" | "No internet service";
  Contract: "Month-to-month" | "One year" | "Two year";
  PaperlessBilling: "Yes" | "No";
  PaymentMethod: "Electronic check" | "Mailed check" | "Bank transfer (automatic)" | "Credit card (automatic)";
  MonthlyCharges: number;
  TotalCharges: number;
}

export interface RetentionTierCalculation {
  riskThresholdHigh: number; // e.g. 70
  riskThresholdMedium: number; // e.g. 40
  costPerHighIntervention: number; // Cost of targeting high risk customer ($)
  costPerMediumIntervention: number; // Cost of targeting medium risk customer ($)
  highSuccessRate: number; // % of targeted high risk customers saved (e.g. 50%)
  mediumSuccessRate: number; // % of targeted medium risk customers saved (e.g. 30%)
}
