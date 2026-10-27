import { GraphService } from './graphService.js';
import { ScoringService } from './scoringService.js';

export class FraudDetectionService {
  constructor(settings = {}) {
    this.settings = {
      rapidTransferWindowMinutes: settings.rapidTransferWindowMinutes || 30,
      minChainLength: settings.minChainLength || 3,
      maxCycleLength: settings.maxCycleLength || 5,
      unusualAmountThreshold: settings.unusualAmountThreshold || 50000,
      burstThreshold: settings.burstThreshold || 10,
      ...settings
    };
    this.graphService = new GraphService();
    this.scoringService = new ScoringService(this.settings);
  }

  /**
   * Main analysis entry point
   */
  analyzeTransactions(transactions) {
    const startTime = Date.now();
    console.log(`🔍 Starting fraud detection analysis on ${transactions.length} transactions...`);

    // Build graph
    this.graphService.buildGraph(transactions);
    
    // Run all detection rules
    const circularTransfers = this.detectCircularTransfers(transactions);
    const rapidMovements = this.detectRapidFundMovement(transactions);
    const suspiciousChains = this.detectSuspiciousChains(transactions);
    const muleAccounts = this.detectPotentialMuleAccounts(transactions);
    const unusualActivity = this.detectUnusualActivity(transactions);

    // Generate alerts with risk scores
    const alerts = this.generateAlerts({
      circularTransfers,
      rapidMovements,
      suspiciousChains,
      muleAccounts,
      unusualActivity
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Analysis complete in ${duration}ms. Found ${alerts.length} alerts.`);

    return {
      alerts,
      summary: {
        totalTransactions: transactions.length,
        totalAccounts: this.graphService.getAccountCount(),
        alertsGenerated: alerts.length,
        highRiskAlerts: alerts.filter(a => a.riskBand === 'HIGH' || a.riskBand === 'CRITICAL').length,
        analysisTime: duration
      },
      graphData: this.graphService.getGraphData()
    };
  }

  /**
   * Rule 1: Detect circular transfers (A → B → C → A)
   */
  detectCircularTransfers(transactions) {
    const cycles = [];
    const graph = this.graphService.graph;
    const visited = new Set();
    const maxCycles = 100; // Prevent combinatorial explosion

    // Find cycles using DFS with path tracking
    for (const startAccount of graph.keys()) {
      if (cycles.length >= maxCycles) break;
      
      const foundCycles = this.findCyclesFromAccount(
        startAccount,
        [startAccount],
        new Set([startAccount]),
        this.settings.maxCycleLength
      );
      
      // Add unique cycles
      for (const cycle of foundCycles) {
        if (cycles.length >= maxCycles) break;
        
        const cycleKey = this.normalizeCycle(cycle);
        if (!visited.has(cycleKey)) {
          visited.add(cycleKey);
          
          // Get supporting transactions
          const txs = this.getTransactionsForPath(cycle, transactions);
          
          if (txs.length > 0) {
            cycles.push({
              accounts: cycle,
              transactions: txs,
              totalAmount: txs.reduce((sum, tx) => sum + tx.amount, 0),
              timeSpan: this.calculateTimeSpan(txs)
            });
          }
        }
      }
    }

    console.log(`  🔄 Found ${cycles.length} circular transfer patterns`);
    return cycles;
  }

  findCyclesFromAccount(current, path, visited, maxDepth) {
    if (path.length > maxDepth) return [];
    
    const cycles = [];
    const neighbors = this.graphService.graph.get(current) || [];
    
    for (const neighbor of neighbors) {
      if (neighbor === path[0] && path.length >= 3) {
        // Found a cycle back to start
        cycles.push([...path]);
      } else if (!visited.has(neighbor) && path.length < maxDepth) {
        // Continue exploring
        visited.add(neighbor);
        const subCycles = this.findCyclesFromAccount(
          neighbor,
          [...path, neighbor],
          visited,
          maxDepth
        );
        cycles.push(...subCycles);
        visited.delete(neighbor);
      }
    }
    
    return cycles;
  }

  normalizeCycle(cycle) {
    // Normalize cycle to handle different starting points
    const minIndex = cycle.indexOf(Math.min(...cycle.map(c => String(c))));
    const normalized = [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)];
    return normalized.join('→');
  }

  /**
   * Rule 2: Detect rapid fund movement
   */
  detectRapidFundMovement(transactions) {
    const rapidMovements = [];
    const accountTxs = this.groupByAccount(transactions);
    const windowMs = this.settings.rapidTransferWindowMinutes * 60 * 1000;

    for (const [accountId, txs] of Object.entries(accountTxs)) {
      const incoming = txs.filter(tx => tx.receiver === accountId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const outgoing = txs.filter(tx => tx.sender === accountId)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Check for rapid outgoing after incoming
      for (const inTx of incoming) {
        const inTime = new Date(inTx.timestamp).getTime();
        
        for (const outTx of outgoing) {
          const outTime = new Date(outTx.timestamp).getTime();
          const timeDiff = outTime - inTime;
          
          if (timeDiff > 0 && timeDiff <= windowMs) {
            rapidMovements.push({
              account: accountId,
              incomingTx: inTx,
              outgoingTx: outTx,
              timeDiffMinutes: Math.round(timeDiff / 60000),
              amountIn: inTx.amount,
              amountOut: outTx.amount
            });
          }
        }
      }
    }

    console.log(`  ⚡ Found ${rapidMovements.length} rapid fund movement patterns`);
    return rapidMovements;
  }

  /**
   * Rule 3: Detect suspicious transaction chains
   */
  detectSuspiciousChains(transactions) {
    const chains = [];
    const sortedTxs = [...transactions].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    const windowMs = this.settings.rapidTransferWindowMinutes * 60 * 1000;

    // Build chains by following connected transactions in time
    const processed = new Set();
    
    for (const tx of sortedTxs) {
      if (processed.has(tx.id)) continue;
      
      const chain = this.buildChainFrom(tx, sortedTxs, windowMs, processed);
      
      if (chain.length >= this.settings.minChainLength) {
        chains.push({
          transactions: chain,
          accounts: this.extractAccountsFromChain(chain),
          totalAmount: chain.reduce((sum, t) => sum + t.amount, 0),
          timeSpan: this.calculateTimeSpan(chain)
        });
      }
    }

    console.log(`  🔗 Found ${chains.length} suspicious transaction chains`);
    return chains;
  }

  buildChainFrom(startTx, allTxs, windowMs, processed) {
    const chain = [startTx];
    processed.add(startTx.id);
    let current = startTx;

    while (true) {
      const currentTime = new Date(current.timestamp).getTime();
      
      // Find next transaction in chain
      const next = allTxs.find(tx => 
        !processed.has(tx.id) &&
        tx.sender === current.receiver &&
        new Date(tx.timestamp).getTime() - currentTime <= windowMs &&
        new Date(tx.timestamp).getTime() > currentTime
      );

      if (!next) break;
      
      chain.push(next);
      processed.add(next.id);
      current = next;

      if (chain.length >= 10) break; // Limit chain length
    }

    return chain;
  }

  extractAccountsFromChain(chain) {
    const accounts = new Set();
    chain.forEach(tx => {
      accounts.add(tx.sender);
      accounts.add(tx.receiver);
    });
    return Array.from(accounts);
  }

  /**
   * Rule 4: Detect potential mule accounts
   */
  detectPotentialMuleAccounts(transactions) {
    const muleAccounts = [];
    const accountStats = this.calculateAccountStats(transactions);

    for (const [accountId, stats] of Object.entries(accountStats)) {
      const score = this.calculateMuleScore(stats);
      
      if (score > 0.6) { // Threshold for potential mule account
        muleAccounts.push({
          account: accountId,
          stats,
          score,
          reasons: this.getMuleReasons(stats)
        });
      }
    }

    console.log(`  👤 Found ${muleAccounts.length} potential mule-account patterns`);
    return muleAccounts;
  }

  calculateAccountStats(transactions) {
    const stats = {};

    for (const tx of transactions) {
      // Initialize stats
      if (!stats[tx.sender]) {
        stats[tx.sender] = {
          incomingCount: 0,
          outgoingCount: 0,
          incomingAmount: 0,
          outgoingAmount: 0,
          uniqueIncoming: new Set(),
          uniqueOutgoing: new Set(),
          rapidTransfers: 0
        };
      }
      if (!stats[tx.receiver]) {
        stats[tx.receiver] = {
          incomingCount: 0,
          outgoingCount: 0,
          incomingAmount: 0,
          outgoingAmount: 0,
          uniqueIncoming: new Set(),
          uniqueOutgoing: new Set(),
          rapidTransfers: 0
        };
      }

      // Update stats
      stats[tx.sender].outgoingCount++;
      stats[tx.sender].outgoingAmount += tx.amount;
      stats[tx.sender].uniqueOutgoing.add(tx.receiver);

      stats[tx.receiver].incomingCount++;
      stats[tx.receiver].incomingAmount += tx.amount;
      stats[tx.receiver].uniqueIncoming.add(tx.sender);
    }

    // Convert sets to counts
    for (const accountStats of Object.values(stats)) {
      accountStats.uniqueIncomingCount = accountStats.uniqueIncoming.size;
      accountStats.uniqueOutgoingCount = accountStats.uniqueOutgoing.size;
      delete accountStats.uniqueIncoming;
      delete accountStats.uniqueOutgoing;
    }

    return stats;
  }

  calculateMuleScore(stats) {
    let score = 0;
    
    // High incoming from many sources
    if (stats.uniqueIncomingCount >= 5) score += 0.3;
    
    // High outgoing to many destinations
    if (stats.uniqueOutgoingCount >= 5) score += 0.3;
    
    // High volume
    if (stats.incomingAmount > 100000 || stats.outgoingAmount > 100000) score += 0.2;
    
    // Balanced in/out
    const ratio = Math.min(stats.incomingAmount, stats.outgoingAmount) / 
                  Math.max(stats.incomingAmount, stats.outgoingAmount);
    if (ratio > 0.7) score += 0.2;

    return Math.min(score, 1.0);
  }

  getMuleReasons(stats) {
    const reasons = [];
    if (stats.uniqueIncomingCount >= 5) reasons.push('Multiple funding sources');
    if (stats.uniqueOutgoingCount >= 5) reasons.push('Multiple destinations');
    if (stats.incomingAmount > 100000) reasons.push('High incoming volume');
    if (stats.outgoingAmount > 100000) reasons.push('High outgoing volume');
    return reasons;
  }

  /**
   * Rule 5: Detect unusual activity
   */
  detectUnusualActivity(transactions) {
    const unusual = [];
    const accountTxs = this.groupByAccount(transactions);

    for (const [accountId, txs] of Object.entries(accountTxs)) {
      // Check for transaction bursts
      const bursts = this.detectBursts(txs);
      if (bursts.length > 0) {
        unusual.push({
          type: 'burst',
          account: accountId,
          bursts,
          transactions: bursts.flatMap(b => b.transactions)
        });
      }

      // Check for unusual amounts
      const highValue = txs.filter(tx => tx.amount > this.settings.unusualAmountThreshold);
      if (highValue.length > 0) {
        unusual.push({
          type: 'high_value',
          account: accountId,
          transactions: highValue
        });
      }
    }

    console.log(`  ⚠️  Found ${unusual.length} unusual activity patterns`);
    return unusual;
  }

  detectBursts(transactions) {
    const bursts = [];
    const sorted = [...transactions].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    const windowMs = 60 * 60 * 1000; // 1 hour

    for (let i = 0; i < sorted.length; i++) {
      const windowStart = new Date(sorted[i].timestamp).getTime();
      const windowTxs = sorted.filter(tx => {
        const txTime = new Date(tx.timestamp).getTime();
        return txTime >= windowStart && txTime < windowStart + windowMs;
      });

      if (windowTxs.length >= this.settings.burstThreshold) {
        bursts.push({
          startTime: sorted[i].timestamp,
          count: windowTxs.length,
          transactions: windowTxs
        });
        i += windowTxs.length - 1; // Skip processed transactions
      }
    }

    return bursts;
  }

  /**
   * Generate alerts from detection results
   */
  generateAlerts(detectionResults) {
    const alerts = [];
    let alertId = 1;

    // Circular transfer alerts
    for (const cycle of detectionResults.circularTransfers) {
      const alert = {
        id: `ALERT-${String(alertId++).padStart(6, '0')}`,
        category: 'CIRCULAR_TRANSFER',
        accounts: cycle.accounts,
        transactions: cycle.transactions.map(tx => tx.id),
        evidence: `Circular transfer detected: ${cycle.accounts.join(' → ')} → ${cycle.accounts[0]}`,
        details: {
          totalAmount: cycle.totalAmount,
          timeSpan: cycle.timeSpan,
          path: cycle.accounts
        },
        triggeredRules: ['Circular Transfer Detection'],
        riskScore: this.scoringService.calculateRiskScore({ circularTransfer: true }),
        detectedAt: new Date().toISOString(),
        status: 'NEW'
      };
      alert.riskBand = this.scoringService.getRiskBand(alert.riskScore);
      alerts.push(alert);
    }

    // Rapid movement alerts
    for (const movement of detectionResults.rapidMovements) {
      const alert = {
        id: `ALERT-${String(alertId++).padStart(6, '0')}`,
        category: 'RAPID_MOVEMENT',
        accounts: [movement.account],
        transactions: [movement.incomingTx.id, movement.outgoingTx.id],
        evidence: `Rapid fund movement: ${movement.amountIn} received and ${movement.amountOut} sent within ${movement.timeDiffMinutes} minutes`,
        details: movement,
        triggeredRules: ['Rapid Fund Movement Detection'],
        riskScore: this.scoringService.calculateRiskScore({ rapidMovement: true }),
        detectedAt: new Date().toISOString(),
        status: 'NEW'
      };
      alert.riskBand = this.scoringService.getRiskBand(alert.riskScore);
      alerts.push(alert);
    }

    // Suspicious chain alerts
    for (const chain of detectionResults.suspiciousChains) {
      const alert = {
        id: `ALERT-${String(alertId++).padStart(6, '0')}`,
        category: 'SUSPICIOUS_CHAIN',
        accounts: chain.accounts,
        transactions: chain.transactions.map(tx => tx.id),
        evidence: `Suspicious transaction chain involving ${chain.accounts.length} accounts`,
        details: {
          chainLength: chain.transactions.length,
          totalAmount: chain.totalAmount,
          timeSpan: chain.timeSpan
        },
        triggeredRules: ['Suspicious Chain Detection'],
        riskScore: this.scoringService.calculateRiskScore({ suspiciousChain: true }),
        detectedAt: new Date().toISOString(),
        status: 'NEW'
      };
      alert.riskBand = this.scoringService.getRiskBand(alert.riskScore);
      alerts.push(alert);
    }

    // Mule account alerts
    for (const mule of detectionResults.muleAccounts) {
      const alert = {
        id: `ALERT-${String(alertId++).padStart(6, '0')}`,
        category: 'POTENTIAL_MULE',
        accounts: [mule.account],
        transactions: [],
        evidence: `Potential mule-account pattern: ${mule.reasons.join(', ')}`,
        details: {
          ...mule.stats,
          muleScore: mule.score,
          reasons: mule.reasons
        },
        triggeredRules: ['Mule Account Detection'],
        riskScore: this.scoringService.calculateRiskScore({ muleAccount: true }),
        detectedAt: new Date().toISOString(),
        status: 'NEW'
      };
      alert.riskBand = this.scoringService.getRiskBand(alert.riskScore);
      alerts.push(alert);
    }

    // Unusual activity alerts
    for (const activity of detectionResults.unusualActivity) {
      const alert = {
        id: `ALERT-${String(alertId++).padStart(6, '0')}`,
        category: activity.type === 'burst' ? 'TRANSACTION_BURST' : 'HIGH_VALUE',
        accounts: [activity.account],
        transactions: activity.transactions.map(tx => tx.id),
        evidence: activity.type === 'burst' 
          ? `Transaction burst detected: ${activity.bursts[0].count} transactions in short period`
          : `High-value transactions detected`,
        details: activity,
        triggeredRules: ['Unusual Activity Detection'],
        riskScore: this.scoringService.calculateRiskScore({ unusualActivity: true }),
        detectedAt: new Date().toISOString(),
        status: 'NEW'
      };
      alert.riskBand = this.scoringService.getRiskBand(alert.riskScore);
      alerts.push(alert);
    }

    return alerts;
  }

  // Helper methods
  groupByAccount(transactions) {
    const grouped = {};
    for (const tx of transactions) {
      if (!grouped[tx.sender]) grouped[tx.sender] = [];
      if (!grouped[tx.receiver]) grouped[tx.receiver] = [];
      grouped[tx.sender].push(tx);
      grouped[tx.receiver].push(tx);
    }
    return grouped;
  }

  getTransactionsForPath(path, transactions) {
    const txs = [];
    for (let i = 0; i < path.length; i++) {
      const from = path[i];
      const to = path[(i + 1) % path.length];
      const tx = transactions.find(t => t.sender === from && t.receiver === to);
      if (tx) txs.push(tx);
    }
    return txs;
  }

  calculateTimeSpan(transactions) {
    if (transactions.length === 0) return 0;
    const times = transactions.map(tx => new Date(tx.timestamp).getTime());
    return (Math.max(...times) - Math.min(...times)) / 1000; // seconds
  }
}
