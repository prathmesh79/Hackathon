export class GraphService {
  constructor() {
    this.graph = new Map(); // adjacency list
    this.accounts = new Set();
  }

  buildGraph(transactions) {
    this.graph.clear();
    this.accounts.clear();

    for (const tx of transactions) {
      this.accounts.add(tx.sender);
      this.accounts.add(tx.receiver);

      if (!this.graph.has(tx.sender)) {
        this.graph.set(tx.sender, []);
      }
      this.graph.get(tx.sender).push(tx.receiver);
    }

    console.log(`  📊 Built graph with ${this.accounts.size} accounts`);
  }

  getAccountCount() {
    return this.accounts.size;
  }

  getGraphData() {
    const nodes = Array.from(this.accounts).map(account => ({
      id: account,
      label: account
    }));

    const edgeMap = new Map();
    
    // Aggregate edges
    for (const [source, targets] of this.graph.entries()) {
      for (const target of targets) {
        const edgeKey = `${source}-${target}`;
        edgeMap.set(edgeKey, {
          source,
          target,
          count: (edgeMap.get(edgeKey)?.count || 0) + 1
        });
      }
    }

    const edges = Array.from(edgeMap.values());

    return { nodes, edges };
  }

  getConnectedAccounts(accountId, depth = 1) {
    const connected = new Set();
    const visited = new Set();
    
    const explore = (account, currentDepth) => {
      if (currentDepth > depth || visited.has(account)) return;
      visited.add(account);
      
      const neighbors = this.graph.get(account) || [];
      for (const neighbor of neighbors) {
        connected.add(neighbor);
        explore(neighbor, currentDepth + 1);
      }
    };

    explore(accountId, 0);
    return Array.from(connected);
  }
}
