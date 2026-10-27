import { test } from 'node:test';
import assert from 'node:assert';
import { FraudDetectionService } from '../src/services/fraudDetectionService.js';

/**
 * Test Suite for Fraud Detection Engine
 */

test('Circular Transfer Detection - should detect A → B → C → A cycle', () => {
  const transactions = [
    { id: 'TX1', sender: 'A', receiver: 'B', amount: 1000, timestamp: '2024-01-01T10:00:00Z', currency: 'USD' },
    { id: 'TX2', sender: 'B', receiver: 'C', amount: 950, timestamp: '2024-01-01T10:10:00Z', currency: 'USD' },
    { id: 'TX3', sender: 'C', receiver: 'A', amount: 900, timestamp: '2024-01-01T10:20:00Z', currency: 'USD' }
  ];

  const detector = new FraudDetectionService();
  const results = detector.analyzeTransactions(transactions);

  // Check that circular transfer alerts were generated
  const circularAlerts = results.alerts.filter(a => a.category === 'CIRCULAR_TRANSFER');
  assert.ok(circularAlerts.length > 0, 'Should detect at least one circular transfer alert');
  
  const hasCycle = circularAlerts.some(alert => 
    alert.accounts.includes('A') && 
    alert.accounts.includes('B') && 
    alert.accounts.includes('C')
  );
  assert.ok(hasCycle, 'Should detect the A → B → C → A cycle');
});

test('Circular Transfer Detection - should NOT falsely detect A → B → C without return', () => {
  const transactions = [
    { id: 'TX1', sender: 'A', receiver: 'B', amount: 1000, timestamp: '2024-01-01T10:00:00Z', currency: 'USD' },
    { id: 'TX2', sender: 'B', receiver: 'C', amount: 950, timestamp: '2024-01-01T10:10:00Z', currency: 'USD' }
  ];

  const detector = new FraudDetectionService();
  const cycles = detector.detectCircularTransfers(transactions);

  const hasFalseCycle = cycles.some(cycle => 
    cycle.accounts.length === 3 &&
    cycle.accounts.includes('A') && 
    cycle.accounts.includes('B') && 
    cycle.accounts.includes('C')
  );
  assert.ok(!hasFalseCycle, 'Should NOT detect incomplete cycle as circular transfer');
});

test('Rapid Fund Movement - should detect funds received and sent within time window', () => {
  const transactions = [
    { id: 'TX1', sender: 'A', receiver: 'B', amount: 5000, timestamp: '2024-01-01T10:00:00Z', currency: 'USD' },
    { id: 'TX2', sender: 'B', receiver: 'C', amount: 4800, timestamp: '2024-01-01T10:15:00Z', currency: 'USD' }
  ];

  const detector = new FraudDetectionService({ rapidTransferWindowMinutes: 30 });
  const rapidMovements = detector.detectRapidFundMovement(transactions);

  assert.ok(rapidMovements.length > 0, 'Should detect rapid fund movement');
  const hasMovement = rapidMovements.some(m => m.account === 'B');
  assert.ok(hasMovement, 'Should detect account B with rapid movement');
});

test('Rapid Fund Movement - should NOT trigger outside time window', () => {
  const transactions = [
    { id: 'TX1', sender: 'A', receiver: 'B', amount: 5000, timestamp: '2024-01-01T10:00:00Z', currency: 'USD' },
    { id: 'TX2', sender: 'B', receiver: 'C', amount: 4800, timestamp: '2024-01-01T12:00:00Z', currency: 'USD' }
  ];

  const detector = new FraudDetectionService({ rapidTransferWindowMinutes: 30 });
  const rapidMovements = detector.detectRapidFundMovement(transactions);

  const hasMovement = rapidMovements.some(m => 
    m.account === 'B' && 
    m.timeDiffMinutes <= 30
  );
  assert.ok(!hasMovement, 'Should NOT detect rapid movement outside time window');
});

test('Suspicious Chain Detection - should detect multi-hop transaction chain', () => {
  const transactions = [
    { id: 'TX1', sender: 'A', receiver: 'B', amount: 1000, timestamp: '2024-01-01T10:00:00Z', currency: 'USD' },
    { id: 'TX2', sender: 'B', receiver: 'C', amount: 950, timestamp: '2024-01-01T10:10:00Z', currency: 'USD' },
    { id: 'TX3', sender: 'C', receiver: 'D', amount: 900, timestamp: '2024-01-01T10:20:00Z', currency: 'USD' }
  ];

  const detector = new FraudDetectionService({ minChainLength: 3 });
  const chains = detector.detectSuspiciousChains(transactions);

  assert.ok(chains.length > 0, 'Should detect suspicious chain');
  const hasChain = chains.some(chain => chain.transactions.length >= 3);
  assert.ok(hasChain, 'Should detect chain with at least 3 transactions');
});

test('Mule Account Detection - should identify accounts with many incoming and outgoing connections', () => {
  const transactions = [
    { id: 'TX1', sender: 'A1', receiver: 'MULE', amount: 1000, timestamp: '2024-01-01T10:00:00Z', currency: 'USD' },
    { id: 'TX2', sender: 'A2', receiver: 'MULE', amount: 1000, timestamp: '2024-01-01T10:05:00Z', currency: 'USD' },
    { id: 'TX3', sender: 'A3', receiver: 'MULE', amount: 1000, timestamp: '2024-01-01T10:10:00Z', currency: 'USD' },
    { id: 'TX4', sender: 'A4', receiver: 'MULE', amount: 1000, timestamp: '2024-01-01T10:15:00Z', currency: 'USD' },
    { id: 'TX5', sender: 'A5', receiver: 'MULE', amount: 1000, timestamp: '2024-01-01T10:20:00Z', currency: 'USD' },
    { id: 'TX6', sender: 'MULE', receiver: 'B1', amount: 900, timestamp: '2024-01-01T10:25:00Z', currency: 'USD' },
    { id: 'TX7', sender: 'MULE', receiver: 'B2', amount: 900, timestamp: '2024-01-01T10:30:00Z', currency: 'USD' },
    { id: 'TX8', sender: 'MULE', receiver: 'B3', amount: 900, timestamp: '2024-01-01T10:35:00Z', currency: 'USD' },
    { id: 'TX9', sender: 'MULE', receiver: 'B4', amount: 900, timestamp: '2024-01-01T10:40:00Z', currency: 'USD' },
    { id: 'TX10', sender: 'MULE', receiver: 'B5', amount: 900, timestamp: '2024-01-01T10:45:00Z', currency: 'USD' }
  ];

  const detector = new FraudDetectionService();
  const muleAccounts = detector.detectPotentialMuleAccounts(transactions);

  assert.ok(muleAccounts.length > 0, 'Should detect potential mule accounts');
  const hasMule = muleAccounts.some(m => m.account === 'MULE');
  assert.ok(hasMule, 'Should identify MULE account as potential mule');
});

test('Transaction Burst Detection - should detect rapid burst of transactions', () => {
  const transactions = [];
  const baseTime = new Date('2024-01-01T10:00:00Z');
  
  for (let i = 0; i < 12; i++) {
    const time = new Date(baseTime.getTime() + i * 2 * 60000); // 2 minutes apart
    transactions.push({
      id: `TX${i}`,
      sender: 'BURSTER',
      receiver: `ACC${i}`,
      amount: 100,
      timestamp: time.toISOString(),
      currency: 'USD'
    });
  }

  const detector = new FraudDetectionService({ burstThreshold: 10 });
  const unusual = detector.detectUnusualActivity(transactions);

  const hasBurst = unusual.some(u => u.type === 'burst' && u.account === 'BURSTER');
  assert.ok(hasBurst, 'Should detect transaction burst');
});

test('High Value Detection - should flag unusually large transactions', () => {
  const transactions = [
    { id: 'TX1', sender: 'A', receiver: 'B', amount: 100000, timestamp: '2024-01-01T10:00:00Z', currency: 'USD' }
  ];

  const detector = new FraudDetectionService({ unusualAmountThreshold: 50000 });
  const unusual = detector.detectUnusualActivity(transactions);

  const hasHighValue = unusual.some(u => u.type === 'high_value');
  assert.ok(hasHighValue, 'Should detect high-value transaction');
});

test('Risk Scoring - should assign scores within 0-100 range', () => {
  const transactions = [
    { id: 'TX1', sender: 'A', receiver: 'B', amount: 1000, timestamp: '2024-01-01T10:00:00Z', currency: 'USD' },
    { id: 'TX2', sender: 'B', receiver: 'C', amount: 950, timestamp: '2024-01-01T10:10:00Z', currency: 'USD' },
    { id: 'TX3', sender: 'C', receiver: 'A', amount: 900, timestamp: '2024-01-01T10:20:00Z', currency: 'USD' }
  ];

  const detector = new FraudDetectionService();
  const results = detector.analyzeTransactions(transactions);

  assert.ok(results.alerts.length > 0, 'Should generate alerts');
  
  results.alerts.forEach(alert => {
    assert.ok(alert.riskScore >= 0, 'Risk score should be >= 0');
    assert.ok(alert.riskScore <= 100, 'Risk score should be <= 100');
    assert.ok(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(alert.riskBand), 'Should have valid risk band');
  });
});

test('Alert Evidence - every alert must reference real transaction IDs', () => {
  const transactions = [
    { id: 'REAL-TX1', sender: 'A', receiver: 'B', amount: 1000, timestamp: '2024-01-01T10:00:00Z', currency: 'USD' },
    { id: 'REAL-TX2', sender: 'B', receiver: 'C', amount: 950, timestamp: '2024-01-01T10:10:00Z', currency: 'USD' },
    { id: 'REAL-TX3', sender: 'C', receiver: 'A', amount: 900, timestamp: '2024-01-01T10:20:00Z', currency: 'USD' }
  ];

  const detector = new FraudDetectionService();
  const results = detector.analyzeTransactions(transactions);

  const txIds = new Set(transactions.map(tx => tx.id));
  
  results.alerts.forEach(alert => {
    assert.ok(Array.isArray(alert.transactions), 'Alert should have transactions array');
    alert.transactions.forEach(txId => {
      assert.ok(txIds.has(txId), `Alert references non-existent transaction: ${txId}`);
    });
  });
});

test('Risk Score Reproducibility - same inputs should produce same score', () => {
  const transactions = [
    { id: 'TX1', sender: 'A', receiver: 'B', amount: 1000, timestamp: '2024-01-01T10:00:00Z', currency: 'USD' },
    { id: 'TX2', sender: 'B', receiver: 'C', amount: 950, timestamp: '2024-01-01T10:10:00Z', currency: 'USD' },
    { id: 'TX3', sender: 'C', receiver: 'A', amount: 900, timestamp: '2024-01-01T10:20:00Z', currency: 'USD' }
  ];

  const detector1 = new FraudDetectionService();
  const detector2 = new FraudDetectionService();
  
  const results1 = detector1.analyzeTransactions(transactions);
  const results2 = detector2.analyzeTransactions(transactions);

  assert.strictEqual(results1.alerts.length, results2.alerts.length, 'Should generate same number of alerts');
  
  results1.alerts.forEach((alert1, i) => {
    const alert2 = results2.alerts[i];
    assert.strictEqual(alert1.riskScore, alert2.riskScore, 'Risk scores should be identical');
  });
});

test('Empty Dataset - should handle empty transaction array gracefully', () => {
  const transactions = [];
  const detector = new FraudDetectionService();
  
  const results = detector.analyzeTransactions(transactions);
  
  assert.strictEqual(results.alerts.length, 0, 'Should generate no alerts for empty dataset');
  assert.strictEqual(results.summary.totalTransactions, 0, 'Should report zero transactions');
});

test('Normal High-Value Transaction - should not automatically be marked as fraud', () => {
  const transactions = [
    { id: 'TX1', sender: 'CORP-A', receiver: 'CORP-B', amount: 150000, timestamp: '2024-01-01T10:00:00Z', currency: 'USD' }
  ];

  const detector = new FraudDetectionService({ unusualAmountThreshold: 50000 });
  const results = detector.analyzeTransactions(transactions);

  // High-value alone should not automatically result in CRITICAL or fraud verdict
  const alerts = results.alerts.filter(a => a.category === 'HIGH_VALUE');
  if (alerts.length > 0) {
    // Check that it's flagged for review, but not labeled as confirmed fraud
    assert.ok(alerts[0].evidence.includes('High-value') || alerts[0].evidence.includes('detected'));
    assert.ok(!alerts[0].evidence.toLowerCase().includes('confirmed fraud'));
  }
});

console.log('✅ All fraud detection tests completed');
