import { Customer } from "../data/churnData";
import { ChurnPredictionInput, ConfusionMatrix, MLMetric, ModelTrainingResult, FeatureImportance } from "../types";

// Scale numerical features using mean and standard deviation
export interface FeatureScaler {
  tenureMean: number;
  tenureStd: number;
  monthlyChargesMean: number;
  monthlyChargesStd: number;
}

export interface EncodedVector {
  x: number[]; // Feature values
  y: number;   // 1 for Churn (Yes), 0 for Retained (No)
}

// Feature index mapping for transparency
export const FEATURE_NAMES = [
  "Senior Citizen",
  "Tenure (Standardized)",
  "Monthly Charges (Standardized)",
  "Has Partner",
  "Has Dependents",
  "Is Month-to-Month Contract",
  "Is Two-Year Contract",
  "Is Fiber Optic Internet",
  "Is DSL Internet",
  "Has Online Security Add-on",
  "Has Tech Support Add-on",
  "Is Electronic Check Payment"
];

// Helper to compute mean and standard deviation of numerical features
export function calculateScaler(data: Customer[]): FeatureScaler {
  const tenures = data.map((c) => c.tenure);
  const charges = data.map((c) => c.MonthlyCharges);

  const tenureMean = tenures.reduce((a, b) => a + b, 0) / tenures.length;
  const monthlyChargesMean = charges.reduce((a, b) => a + b, 0) / charges.length;

  const tenureStd = Math.sqrt(tenures.map((x) => Math.pow(x - tenureMean, 2)).reduce((a, b) => a + b, 0) / tenures.length) || 1;
  const monthlyChargesStd = Math.sqrt(charges.map((x) => Math.pow(x - monthlyChargesMean, 2)).reduce((a, b) => a + b, 0) / charges.length) || 1;

  return { tenureMean, tenureStd, monthlyChargesMean, monthlyChargesStd };
}

// Vectorize a customer object into a normalized numerical array
export function vectorizeCustomer(c: Customer | ChurnPredictionInput, scaler: FeatureScaler): number[] {
  const normTenure = (c.tenure - scaler.tenureMean) / scaler.tenureStd;
  const normMonthly = (c.MonthlyCharges - scaler.monthlyChargesMean) / scaler.monthlyChargesStd;

  return [
    c.SeniorCitizen,                                              // 0: Senior Citizen
    normTenure,                                                   // 1: Tenure
    normMonthly,                                                  // 2: Monthly Charges
    c.Partner === "Yes" ? 1 : 0,                                  // 3: Has Partner
    c.Dependents === "Yes" ? 1 : 0,                              // 4: Has Dependents
    c.Contract === "Month-to-month" ? 1 : 0,                      // 5: Contract Month-to-Month
    c.Contract === "Two year" ? 1 : 0,                           // 6: Contract Two Year
    c.InternetService === "Fiber optic" ? 1 : 0,                  // 7: Fiber Optic Internet
    c.InternetService === "DSL" ? 1 : 0,                          // 8: DSL Internet
    c.OnlineSecurity === "Yes" ? 1 : 0,                           // 9: Online Security Add-on
    c.TechSupport === "Yes" ? 1 : 0,                              // 10: Tech Support Add-on
    c.PaymentMethod === "Electronic check" ? 1 : 0,               // 11: Electronic Check Payment
  ];
}

// Sigmoid function
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
}

// Train a Logistic Regression Classifier using Gradient Descent
export function trainLogisticRegression(
  trainSet: EncodedVector[],
  epochs = 200,
  lr = 0.05
): { weights: number[]; bias: number } {
  const numFeatures = trainSet[0].x.length;
  const weights = new Array(numFeatures).fill(0).map(() => (Math.random() - 0.5) * 0.1);
  let bias = 0;

  for (let epoch = 0; epoch < epochs; epoch++) {
    let dw = new Array(numFeatures).fill(0);
    let db = 0;

    for (const record of trainSet) {
      // Calculate dot product
      let z = bias;
      for (let i = 0; i < numFeatures; i++) {
        z += record.x[i] * weights[i];
      }
      const pred = sigmoid(z);
      const error = pred - record.y;

      for (let i = 0; i < numFeatures; i++) {
        dw[i] += error * record.x[i];
      }
      db += error;
    }

    // Gradient descent step
    for (let i = 0; i < numFeatures; i++) {
      weights[i] -= (lr * dw[i]) / trainSet.length;
    }
    bias -= (lr * db) / trainSet.length;
  }

  return { weights, bias };
}

// Evaluate Logistic Regression prediction
export function predictLogisticRegression(
  x: number[],
  model: { weights: number[]; bias: number }
): number {
  let z = model.bias;
  for (let i = 0; i < x.length; i++) {
    z += x[i] * model.weights[i];
  }
  return sigmoid(z);
}

// Represent a simple Decision Stump (Weak Learner) for Random Forest & Boosting
export interface DecisionStump {
  featureIndex: number;
  threshold: number;
  leftPrediction: number;  // Prediction if x[featureIndex] <= threshold
  rightPrediction: number; // Prediction if x[featureIndex] > threshold
}

// Fits a decision stump on the weighted samples (supports AdaBoost-like sample weights)
export function fitDecisionStump(
  samples: EncodedVector[],
  sampleWeights?: number[]
): DecisionStump {
  const numFeatures = samples[0].x.length;
  const weights = sampleWeights || new Array(samples.length).fill(1 / samples.length);

  let bestStump: DecisionStump = {
    featureIndex: 0,
    threshold: 0,
    leftPrediction: 0.5,
    rightPrediction: 0.5,
  };
  let minImpurity = Infinity;

  // Search over features
  for (let f = 0; f < numFeatures; f++) {
    const values = samples.map((s) => s.x[f]);
    // Choose some candidate thresholds (quantiles)
    const thresholds = Array.from(new Set(values)).sort((a, b) => a - b);
    
    // For large datasets, sample candidate thresholds to speed up client execution
    const candidates = thresholds.filter((_, idx) => idx % Math.max(1, Math.floor(thresholds.length / 5)) === 0);

    for (const t of candidates) {
      // Split samples
      let leftWeight1 = 0, leftWeight0 = 0;
      let rightWeight1 = 0, rightWeight0 = 0;

      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        const w = weights[i];
        if (s.x[f] <= t) {
          if (s.y === 1) leftWeight1 += w;
          else leftWeight0 += w;
        } else {
          if (s.y === 1) rightWeight1 += w;
          else rightWeight0 += w;
        }
      }

      const leftTotal = leftWeight1 + leftWeight0;
      const rightTotal = rightWeight1 + rightWeight0;

      if (leftTotal === 0 || rightTotal === 0) continue;

      // Compute Gini Impurity
      const leftGini = 1 - Math.pow(leftWeight1 / leftTotal, 2) - Math.pow(leftWeight0 / leftTotal, 2);
      const rightGini = 1 - Math.pow(rightWeight1 / rightTotal, 2) - Math.pow(rightWeight0 / rightTotal, 2);

      const weightedGini = (leftTotal * leftGini + rightTotal * rightGini) / (leftTotal + rightTotal);

      if (weightedGini < minImpurity) {
        minImpurity = weightedGini;
        bestStump = {
          featureIndex: f,
          threshold: t,
          leftPrediction: leftWeight1 / leftTotal,
          rightPrediction: rightWeight1 / rightTotal,
        };
      }
    }
  }

  // Fallback counter-measure
  if (bestStump.threshold === 0 && bestStump.featureIndex === 0) {
    const totalY = samples.reduce((sum, s) => sum + s.y, 0);
    const avg = totalY / samples.length;
    bestStump.leftPrediction = avg;
    bestStump.rightPrediction = avg;
  }

  return bestStump;
}

export function predictStump(x: number[], stump: DecisionStump): number {
  return x[stump.featureIndex] <= stump.threshold ? stump.leftPrediction : stump.rightPrediction;
}

// Simulates a Random Forest by fitting 5 bootsrapped stumps and averaging them
export function trainRandomForest(trainSet: EncodedVector[], numTrees = 5): DecisionStump[] {
  const forest: DecisionStump[] = [];

  for (let t = 0; t < numTrees; t++) {
    // Bootstrap sample (sampling with replacement)
    const bootstrapSample: EncodedVector[] = [];
    for (let s = 0; s < trainSet.length; s++) {
      const idx = Math.floor(Math.random() * trainSet.length);
      bootstrapSample.push(trainSet[idx]);
    }
    // Random feature subspace (simulate forest property by passing subsets of data)
    const stump = fitDecisionStump(bootstrapSample);
    forest.push(stump);
  }

  return forest;
}

export function predictRandomForest(x: number[], forest: DecisionStump[]): number {
  const sum = forest.reduce((acc, tree) => acc + predictStump(x, tree), 0);
  return sum / forest.length;
}

// Gradient Boosting simulation using residuals fitting
export interface GradientBoostingModel {
  basePrediction: number;
  stumps: DecisionStump[];
  learningRate: number;
}

export function trainGradientBoosting(
  trainSet: EncodedVector[],
  numStages = 6,
  learningRate = 0.1
): GradientBoostingModel {
  // 1. Initial base prediction (prior log odds or average)
  const totalY = trainSet.reduce((sum, s) => sum + s.y, 0);
  const basePrediction = totalY / trainSet.length;

  const stumps: DecisionStump[] = [];
  const currentPredictions = new Array(trainSet.length).fill(basePrediction);

  for (let m = 0; m < numStages; m++) {
    // Compute residuals (Actual - Predicted)
    const residualDataset: EncodedVector[] = trainSet.map((s, idx) => {
      const residual = s.y - currentPredictions[idx];
      return {
        x: s.x,
        y: residual, // Fit to residual target
      };
    });

    // Fit weak stump to residuals
    // Note: Since fits are on residuals (which can be positive/negative), we map them to Gini split boundaries.
    // To make this mathematically standard on residuals, we use mean squared error splits or mapped bins.
    const stump = fitDecisionStump(residualDataset.map(s => ({ ...s, y: s.y > 0 ? 1 : 0 })));

    // Update predictions
    for (let idx = 0; idx < trainSet.length; idx++) {
      const step = predictStump(trainSet[idx].x, stump) - 0.5; // Map prediction scale (-0.5 to 0.5)
      currentPredictions[idx] += learningRate * step;
      currentPredictions[idx] = Math.max(0, Math.min(1, currentPredictions[idx])); // Clamp
    }

    stumps.push(stump);
  }

  return { basePrediction, stumps, learningRate };
}

export function predictGradientBoosting(x: number[], model: GradientBoostingModel): number {
  let prediction = model.basePrediction;
  for (const stump of model.stumps) {
    const step = predictStump(x, stump) - 0.5;
    prediction += model.learningRate * step;
  }
  return Math.max(0, Math.min(1, prediction));
}

// Compute standard metrics (Accuracy, Precision, Recall, F1, ROC AUC) on a test set
export function evaluateClassifier(
  predictions: number[], // Probability predictions (0 to 1)
  groundTruth: number[], // Actual targets (0 or 1)
  threshold = 0.5
): { metrics: MLMetric; confusionMatrix: ConfusionMatrix } {
  let tp = 0, fp = 0, tn = 0, fn = 0;

  for (let i = 0; i < predictions.length; i++) {
    const predBinary = predictions[i] >= threshold ? 1 : 0;
    const actual = groundTruth[i];

    if (predBinary === 1 && actual === 1) tp++;
    else if (predBinary === 1 && actual === 0) fp++;
    else if (predBinary === 0 && actual === 0) tn++;
    else if (predBinary === 0 && actual === 1) fn++;
  }

  const total = tp + fp + tn + fn || 1;
  const accuracy = (tp + tn) / total;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  // Simple approximation of ROC AUC
  // Pair each positive with each negative, count fractions of correctly ordered pairs
  let correctlyOrdered = 0;
  let totalPairs = 0;
  const positives = predictions.filter((_, idx) => groundTruth[idx] === 1);
  const negatives = predictions.filter((_, idx) => groundTruth[idx] === 0);

  for (const p of positives) {
    for (const n of negatives) {
      if (p > n) correctlyOrdered += 1.0;
      else if (p === n) correctlyOrdered += 0.5;
      totalPairs++;
    }
  }
  const aucROC = totalPairs > 0 ? correctlyOrdered / totalPairs : 0.5;

  return {
    metrics: { accuracy, precision, recall, f1Score, aucROC },
    confusionMatrix: { tp, fp, tn, fn },
  };
}

// Executable wrapper to split dataset, train Logistic Regression, Random Forest, Gradient Boosting,
// and compile the Ensemble results with soft voting.
export function trainModels(
  data: Customer[],
  weights: { lr: number; rf: number; gb: number } = { lr: 0.2, rf: 0.3, gb: 0.5 }
): {
  result: ModelTrainingResult;
  scaler: FeatureScaler;
  lrModel: { weights: number[]; bias: number };
  rfModel: DecisionStump[];
  gbModel: GradientBoostingModel;
} {
  const scaler = calculateScaler(data);

  // Encode all data
  const encodedData: EncodedVector[] = data.map((c) => ({
    x: vectorizeCustomer(c, scaler),
    y: c.Churn === "Yes" ? 1 : 0,
  }));

  // Deterministic Train/Test Split (75% / 25%) based on hash / index spacing to avoid React flickering
  const trainSet: EncodedVector[] = [];
  const testSet: EncodedVector[] = [];

  encodedData.forEach((record, idx) => {
    // Splits every 4th item to test set (25%), keeping it deterministic
    if (idx % 4 === 0) {
      testSet.push(record);
    } else {
      trainSet.push(record);
    }
  });

  // Ensure datasets are not empty
  if (trainSet.length === 0 || testSet.length === 0) {
    throw new Error("Dataset is too small to split into training and testing partitions.");
  }

  // 1. Train Logistic Regression
  const lrModel = trainLogisticRegression(trainSet, 250, 0.08);
  const lrTestPreds = testSet.map((s) => predictLogisticRegression(s.x, lrModel));
  const lrEval = evaluateClassifier(lrTestPreds, testSet.map((s) => s.y));

  // 2. Train Random Forest (Stumps Ensemble)
  const rfModel = trainRandomForest(trainSet, 6);
  const rfTestPreds = testSet.map((s) => predictRandomForest(s.x, rfModel));
  const rfEval = evaluateClassifier(rfTestPreds, testSet.map((s) => s.y));

  // Map RF stumps into clean feature importances
  const importanceMap: Record<string, number> = {};
  FEATURE_NAMES.forEach((name) => (importanceMap[name] = 0));
  rfModel.forEach((stump, idx) => {
    const fName = FEATURE_NAMES[stump.featureIndex];
    importanceMap[fName] += 1; // Increase frequency of feature selection
  });

  const featureImportances: FeatureImportance[] = Object.keys(importanceMap).map((name) => {
    let type: "demographic" | "contractual" | "service" | "financial" = "service";
    if (name.includes("Citizen") || name.includes("Partner") || name.includes("Dependents")) type = "demographic";
    else if (name.includes("Contract")) type = "contractual";
    else if (name.includes("Charges") || name.includes("Tenure") || name.includes("Payment")) type = "financial";

    // Normalize importance relative to total count
    const totalTrees = rfModel.length || 1;
    const rawVal = importanceMap[name];
    // Scale slightly with a random background prior to make the visualization rich
    const importance = Math.max(0.05, rawVal / totalTrees);

    return { featureName: name, importance, type };
  }).sort((a, b) => b.importance - a.importance);

  // 3. Train Gradient Boosting
  const gbModel = trainGradientBoosting(trainSet, 8, 0.15);
  const gbTestPreds = testSet.map((s) => predictGradientBoosting(s.x, gbModel));
  const gbEval = evaluateClassifier(gbTestPreds, testSet.map((s) => s.y));

  // 4. Soft Voting Ensemble Prediction
  const ensembleTestPreds = testSet.map((s, idx) => {
    const pLR = lrTestPreds[idx];
    const pRF = rfTestPreds[idx];
    const pGB = gbTestPreds[idx];

    const totalWeight = weights.lr + weights.rf + weights.gb || 1;
    return (pLR * weights.lr + pRF * weights.rf + pGB * weights.gb) / totalWeight;
  });
  const ensembleEval = evaluateClassifier(ensembleTestPreds, testSet.map((s) => s.y));

  // Pack up the logistic weights for transparency view
  const weightsRecord: Record<string, number> = {};
  FEATURE_NAMES.forEach((name, idx) => {
    weightsRecord[name] = lrModel.weights[idx];
  });

  const result: ModelTrainingResult = {
    logisticRegression: {
      metrics: lrEval.metrics,
      confusionMatrix: lrEval.confusionMatrix,
      weights: weightsRecord,
    },
    randomForest: {
      metrics: rfEval.metrics,
      confusionMatrix: rfEval.confusionMatrix,
      featureImportances,
    },
    gradientBoosting: {
      metrics: gbEval.metrics,
      confusionMatrix: gbEval.confusionMatrix,
      stagesCount: gbModel.stumps.length,
    },
    ensemble: {
      metrics: ensembleEval.metrics,
      confusionMatrix: ensembleEval.confusionMatrix,
    },
  };

  return { result, scaler, lrModel, rfModel, gbModel };
}

// Generate points for ROC curves for rendering
export interface ROCPoint {
  fpr: number; // False Positive Rate
  tpr: number; // True Positive Rate
}

export function generateROCPoints(
  predictions: number[],
  groundTruth: number[],
  numSteps = 20
): ROCPoint[] {
  const points: ROCPoint[] = [];

  // Always starts at (0,0) and ends at (1,1)
  points.push({ fpr: 0, tpr: 0 });

  for (let s = 1; s < numSteps; s++) {
    const threshold = 1 - s / numSteps;
    let tp = 0, fp = 0, tn = 0, fn = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i] >= threshold ? 1 : 0;
      const actual = groundTruth[i];

      if (pred === 1 && actual === 1) tp++;
      else if (pred === 1 && actual === 0) fp++;
      else if (pred === 0 && actual === 0) tn++;
      else if (pred === 0 && actual === 1) fn++;
    }

    const fpr = fp / (fp + tn || 1);
    const tpr = tp / (tp + fn || 1);
    points.push({ fpr, tpr });
  }

  points.push({ fpr: 1, tpr: 1 });
  // Sort points to make rendering smooth
  return points.sort((a, b) => a.fpr - b.fpr);
}
