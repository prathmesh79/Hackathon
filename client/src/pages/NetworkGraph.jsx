import { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Search, Filter, Info, Play, Pause } from 'lucide-react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Badge from '../components/shared/Badge';
import { analysisAPI, alertsAPI } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';

// Register dagre layout
cytoscape.use(dagre);

export default function NetworkGraph() {
  const [graphData, setGraphData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [animationPlaying, setAnimationPlaying] = useState(true);
  const [filters, setFilters] = useState({
    showNormal: true,
    riskLevel: 'all'
  });
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const { showError } = useNotifications();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (graphData && containerRef.current) {
      initializeGraph();
    }
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [graphData]);

  async function loadData() {
    try {
      setLoading(true);
      const [graph, alertsData] = await Promise.all([
        analysisAPI.getGraph(),
        alertsAPI.getAll()
      ]);
      setGraphData(graph);
      setAlerts(alertsData.alerts || []);
    } catch (error) {
      showError(`Failed to load network data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function initializeGraph() {
    if (!graphData || !containerRef.current) return;

    // Get suspicious accounts from alerts
    const suspiciousAccounts = new Set();
    const suspiciousEdges = new Map();
    
    alerts.forEach(alert => {
      alert.accounts.forEach(acc => suspiciousAccounts.add(acc));
      // Mark edges involved in alerts
      if (alert.category === 'CIRCULAR_TRANSFER' || alert.category === 'SUSPICIOUS_CHAIN') {
        alert.accounts.forEach((acc, i) => {
          if (i < alert.accounts.length - 1) {
            const edgeKey = `${acc}-${alert.accounts[i + 1]}`;
            suspiciousEdges.set(edgeKey, alert.riskBand);
          }
        });
      }
    });

    // Build Cytoscape elements
    const elements = [
      // Nodes
      ...graphData.nodes.map(node => ({
        data: {
          id: node.id,
          label: node.id,
          suspicious: suspiciousAccounts.has(node.id)
        }
      })),
      // Edges
      ...graphData.edges.map(edge => ({
        data: {
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          weight: edge.count || 1,
          suspicious: suspiciousEdges.has(`${edge.source}-${edge.target}`),
          riskLevel: suspiciousEdges.get(`${edge.source}-${edge.target}`) || 'NORMAL'
        }
      }))
    ];

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#64748b',
            'label': 'data(label)',
            'color': '#ffffff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'font-weight': '600',
            'width': '50px',
            'height': '50px',
            'border-width': 3,
            'border-color': '#475569',
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: 'node[suspicious]',
          style: {
            'background-color': '#ef4444',
            'border-color': '#dc2626',
            'border-width': 4,
            'width': '60px',
            'height': '60px',
            'font-weight': 'bold',
            'box-shadow': '0 0 20px #ef4444'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#3b82f6',
            'border-width': 5,
            'box-shadow': '0 0 30px #3b82f6'
          }
        },
        {
          selector: 'node:hover',
          style: {
            'background-color': '#3b82f6',
            'border-color': '#2563eb'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#475569',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1.5,
            'transition-property': 'line-color, width',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: 'edge[suspicious]',
          style: {
            'line-color': '#f97316',
            'target-arrow-color': '#f97316',
            'width': 4,
            'line-style': 'solid'
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#3b82f6',
            'target-arrow-color': '#3b82f6',
            'width': 5
          }
        },
        {
          selector: 'edge:hover',
          style: {
            'line-color': '#06b6d4',
            'target-arrow-color': '#06b6d4',
            'width': 5
          }
        },
        {
          selector: '.highlighted',
          style: {
            'background-color': '#06b6d4',
            'line-color': '#06b6d4',
            'target-arrow-color': '#06b6d4',
            'border-color': '#0891b2',
            'box-shadow': '0 0 30px #06b6d4'
          }
        }
      ],
      layout: {
        name: 'dagre',
        rankDir: 'TB',
        nodeSep: 80,
        rankSep: 120,
        animate: true,
        animationDuration: 1000
      },
      minZoom: 0.3,
      maxZoom: 3
    });

    // Event listeners
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode(node.data());
      setSelectedEdge(null);
    });

    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      setSelectedEdge(edge.data());
      setSelectedNode(null);
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    });

    cyRef.current = cy;

    // Start animation after layout is ready
    cy.ready(() => {
      startAnimation();
    });
  }

  // Animated traveling arrows
  function startAnimation() {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    const canvas = cy.container().querySelector('canvas');
    const ctx = canvas.getContext('2d');
    
    // Store arrow positions for each edge
    const arrowStates = new Map();
    
    cy.edges().forEach(edge => {
      arrowStates.set(edge.id(), {
        progress: Math.random(), // Random starting position
        speed: 0.005 + Math.random() * 0.003 // Varying speeds
      });
    });

    function animate() {
      if (!animationPlaying) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      cy.edges().forEach(edge => {
        const state = arrowStates.get(edge.id());
        if (!state) return;

        // Update progress
        state.progress += state.speed;
        if (state.progress > 1) {
          state.progress = 0;
        }

        // Get edge coordinates
        const sourcePos = edge.source().renderedPosition();
        const targetPos = edge.target().renderedPosition();
        
        // Calculate arrow position along the curve
        const t = state.progress;
        const x = sourcePos.x + (targetPos.x - sourcePos.x) * t;
        const y = sourcePos.y + (targetPos.y - sourcePos.y) * t;

        // Calculate arrow angle
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        const angle = Math.atan2(dy, dx);

        // Determine color based on edge type
        let color, glowColor;
        if (edge.data('suspicious')) {
          color = 'rgba(249, 115, 22, 0.9)'; // Orange for suspicious
          glowColor = 'rgba(249, 115, 22, 0.5)';
        } else {
          color = 'rgba(59, 130, 246, 0.7)'; // Blue for normal
          glowColor = 'rgba(59, 130, 246, 0.3)';
        }

        // Draw animated arrow
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = glowColor;

        // Arrow body (diamond shape)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(0, -4);
        ctx.lineTo(-8, 0);
        ctx.lineTo(0, 4);
        ctx.closePath();
        ctx.fill();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(4, -5);
        ctx.lineTo(4, 5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();
  }

  function toggleAnimation() {
    setAnimationPlaying(!animationPlaying);
  }

  function handleZoomIn() {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2);
      cyRef.current.center();
    }
  }

  function handleZoomOut() {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8);
      cyRef.current.center();
    }
  }

  function handleFit() {
    if (cyRef.current) {
      cyRef.current.fit();
    }
  }

  function handleSearch() {
    if (!cyRef.current || !searchTerm) return;

    const node = cyRef.current.getElementById(searchTerm);
    if (node.length > 0) {
      cyRef.current.animate({
        fit: {
          eles: node.neighborhood().add(node),
          padding: 50
        },
        duration: 500
      });
      node.select();
      setSelectedNode(node.data());
    } else {
      showError(`Account ${searchTerm} not found in graph`);
    }
  }

  function highlightAlert(alert) {
    if (!cyRef.current) return;

    cyRef.current.elements().removeClass('highlighted');
    
    const nodes = cyRef.current.nodes().filter(node => 
      alert.accounts.includes(node.data('id'))
    );
    
    nodes.addClass('highlighted');
    nodes.neighborhood().addClass('highlighted');

    cyRef.current.animate({
      fit: {
        eles: nodes,
        padding: 50
      },
      duration: 500
    });

    setSelectedAlert(alert);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="card p-12 text-center max-w-md">
          <Info className="w-12 h-12 text-navy-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Graph Data</h3>
          <p className="text-navy-400 mb-4">
            Run the fraud detection analysis from the Overview Dashboard to generate the transaction network graph.
          </p>
        </div>
      </div>
    );
  }

  const suspiciousAlerts = alerts.filter(a => a.riskBand === 'HIGH' || a.riskBand === 'CRITICAL');

  return (
    <div className="h-full flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar - Narrower */}
      <div className="w-full lg:w-72 bg-slate-900/80 backdrop-blur-xl border-b lg:border-r lg:border-b-0 border-slate-700/50 p-4 space-y-4 overflow-y-auto smooth-scroll">
        <div>
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
            Network Investigation
          </h2>
          <p className="text-xs text-slate-400 mb-4">AI-Powered Transaction Analysis</p>
          
          {/* Search */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Search Account</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ACC001"
                className="input flex-1 text-sm"
              />
              <button onClick={handleSearch} className="btn-primary px-3">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="card p-3 space-y-2 focus-highlight">
          <h3 className="text-xs font-semibold text-white mb-2 uppercase tracking-wide">Legend</h3>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-slate-500 border-2 border-slate-600"></div>
            <span className="text-slate-300">Normal Account</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-600 shadow-lg shadow-red-500/50"></div>
            <span className="text-slate-300">Suspicious Account</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex-1 h-0.5 bg-slate-600"></div>
            <span className="text-slate-300">Normal Flow</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex-1 h-1 bg-orange-500 shadow-sm shadow-orange-500/50"></div>
            <span className="text-slate-300">Suspicious Flow</span>
          </div>
        </div>

        {/* Stats */}
        <div className="card p-3 space-y-2 focus-highlight">
          <h3 className="text-xs font-semibold text-white mb-2 uppercase tracking-wide">Network Stats</h3>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Accounts:</span>
            <span className="text-white font-semibold">{graphData.nodes.length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Connections:</span>
            <span className="text-white font-semibold">{graphData.edges.length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">High-Risk Alerts:</span>
            <span className="text-orange-400 font-semibold">{suspiciousAlerts.length}</span>
          </div>
        </div>

        {/* High-Risk Alerts */}
        {suspiciousAlerts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wide">High-Risk Alerts</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto smooth-scroll">
              {suspiciousAlerts.slice(0, 5).map(alert => (
                <button
                  key={alert.id}
                  onClick={() => highlightAlert(alert)}
                  className={`w-full text-left card-hover p-2.5 transition-all text-xs ${
                    selectedAlert?.id === alert.id ? 'border-blue-500 ai-highlight' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="font-mono text-xs text-blue-400">{alert.id}</p>
                    <Badge variant={alert.riskBand === 'CRITICAL' ? 'critical' : 'high'}>
                      {alert.riskBand}
                    </Badge>
                  </div>
                  <p className="text-xs text-white line-clamp-2">{alert.category.replace(/_/g, ' ')}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Node Details */}
        {selectedNode && (
          <div className="card p-3 space-y-2.5 ai-highlight animate-slide-in-right">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Account Details</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-400">Account ID</p>
                <p className="font-mono text-sm text-white">{selectedNode.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <Badge variant={selectedNode.suspicious ? 'danger' : 'success'}>
                  {selectedNode.suspicious ? 'Suspicious' : 'Normal'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Edge Details */}
        {selectedEdge && (
          <div className="card p-3 space-y-2.5 ai-highlight animate-slide-in-right">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Connection Details</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-400">From</p>
                <p className="font-mono text-sm text-white">{selectedEdge.source}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">To</p>
                <p className="font-mono text-sm text-white">{selectedEdge.target}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Transaction Count</p>
                <p className="text-sm text-white">{selectedEdge.weight}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <Badge variant={selectedEdge.suspicious ? 'danger' : 'success'}>
                  {selectedEdge.suspicious ? 'Suspicious' : 'Normal'}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Graph Container - Larger */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div ref={containerRef} className="w-full h-full" />
        
        {/* Animation Info Banner */}
        <div className="absolute top-4 left-4 glass px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-white font-medium">Live Transaction Flow</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={toggleAnimation}
            className={`btn-secondary w-10 h-10 flex items-center justify-center transition-all ${
              animationPlaying ? 'bg-blue-600 hover:bg-blue-500' : ''
            }`}
            title={animationPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {animationPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={handleZoomIn}
            className="btn-secondary w-10 h-10 flex items-center justify-center focus-highlight"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="btn-secondary w-10 h-10 flex items-center justify-center focus-highlight"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleFit}
            className="btn-secondary w-10 h-10 flex items-center justify-center focus-highlight"
            title="Fit to Screen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 glass px-6 py-3 rounded-lg">
          <div className="flex items-center gap-6 text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <span className="text-blue-400">●</span> Blue arrows = Normal transactions
            </span>
            <span className="flex items-center gap-2">
              <span className="text-orange-400">●</span> Orange arrows = Suspicious flows
            </span>
            <span className="flex items-center gap-2">
              🖱️ Click nodes/edges for details
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
