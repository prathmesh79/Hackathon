export class ScoringService {
  constructor(weights = {}) {
    this.weights = {
      circularTransfer: weights.circularTransferWeight || 30,
      rapidMovement: weights.rapidMovementWeight || 20,
      suspiciousChain: weights.suspiciousChainWeight || 15,
      muleAccount: weights.muleAccountWeight || 20,
      unusualActivity: weights.unusualActivityWeight || 10,
      ...weights
    };
  }

  calculateRiskScore(flags) {
    let score = 0;

    if (flags.circularTransfer) score += this.weights.circularTransfer;
    if (flags.rapidMovement) score += this.weights.rapidMovement;
    if (flags.suspiciousChain) score += this.weights.suspiciousChain;
    if (flags.muleAccount) score += this.weights.muleAccount;
    if (flags.unusualActivity) score += this.weights.unusualActivity;

    return Math.min(score, 100);
  }

  getRiskBand(score) {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  }
}
