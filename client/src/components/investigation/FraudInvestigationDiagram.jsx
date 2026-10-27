import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

// Demo dataset for the investigation scenario - Dense network with many connections
const DEMO_DATA = {
  accounts: [
    // Central hub nodes (high traffic)
    { id: 'HUB01', label: 'Payment Gateway', type: 'normal', x: 600, y: 350, hub: true },
    { id: 'HUB02', label: 'Exchange Platform', type: 'suspicious', x: 400, y: 250, hub: true },
    { id: 'HUB03', label: 'Merchant Account', type: 'normal', x: 800, y: 250, hub: true },
    
    // Outer ring - left side
    { id: 'ACC001', label: 'Account 001', type: 'normal', x: 200, y: 150, color: '#8b5cf6' },
    { id: 'ACC002', label: 'Account 002', type: 'normal', x: 220, y: 220, color: '#ec4899' },
    { id: 'ACC003', label: 'Account 003', type: 'normal', x: 200, y: 300, color: '#10b981' },
    { id: 'ACC004', label: 'Account 004', type: 'normal', x: 220, y: 380, color: '#06b6d4' },
    { id: 'ACC005', label: 'Account 005', type: 'normal', x: 200, y: 450, color: '#f59e0b' },
    { id: 'ACC006', label: 'Account 006', type: 'normal', x: 220, y: 520, color: '#3b82f6' },
    
    // Top arc
    { id: 'ACC007', label: 'Account 007', type: 'normal', x: 300, y: 120, color: '#ef4444' },
    { id: 'ACC008', label: 'Account 008', type: 'normal', x: 400, y: 100, color: '#14b8a6' },
    { id: 'ACC009', label: 'Account 009', type: 'normal', x: 500, y: 100, color: '#8b5cf6' },
    { id: 'ACC010', label: 'Account 010', type: 'normal', x: 600, y: 120, color: '#f59e0b' },
    { id: 'ACC011', label: 'Account 011', type: 'normal', x: 700, y: 100, color: '#ec4899' },
    { id: 'ACC012', label: 'Account 012', type: 'normal', x: 800, y: 120, color: '#10b981' },
    { id: 'ACC013', label: 'Account 013', type: 'normal', x: 900, y: 150, color: '#06b6d4' },
    
    // Right side
    { id: 'ACC014', label: 'Account 014', type: 'normal', x: 980, y: 220, color: '#8b5cf6' },
    { id: 'ACC015', label: 'Account 015', type: 'normal', x: 1000, y: 300, color: '#f59e0b' },
    { id: 'ACC016', label: 'Account 016', type: 'normal', x: 980, y: 380, color: '#ec4899' },
    { id: 'ACC017', label: 'Account 017', type: 'normal', x: 1000, y: 450, color: '#10b981' },
    { id: 'ACC018', label: 'Account 018', type: 'high-risk', x: 980, y: 520, color: '#ef4444' },
    
    // Bottom arc
    { id: 'ACC019', label: 'Account 019', type: 'normal', x: 900, y: 580, color: '#3b82f6' },
    { id: 'ACC020', label: 'Account 020', type: 'normal', x: 800, y: 600, color: '#14b8a6' },
    { id: 'ACC021', label: 'Account 021', type: 'normal', x: 700, y: 600, color: '#8b5cf6' },
    { id: 'ACC022', label: 'Account 022', type: 'normal', x: 600, y: 580, color: '#f59e0b' },
    { id: 'ACC023', label: 'Account 023', type: 'normal', x: 500, y: 600, color: '#ec4899' },
    { id: 'ACC024', label: 'Account 024', type: 'normal', x: 400, y: 600, color: '#10b981' },
    { id: 'ACC025', label: 'Account 025', type: 'normal', x: 300, y: 580, color: '#06b6d4' },
    
    // Middle ring for extra density
    { id: 'MID01', label: 'Account M01', type: 'normal', x: 350, y: 200, color: '#8b5cf6' },
    { id: 'MID02', label: 'Account M02', type: 'suspicious', x: 450, y: 180, color: '#f59e0b' },
    { id: 'MID03', label: 'Account M03', type: 'normal', x: 550, y: 200, color: '#ec4899' },
    { id: 'MID04', label: 'Account M04', type: 'normal', x: 650, y: 180, color: '#10b981' },
    { id: 'MID05', label: 'Account M05', type: 'normal', x: 750, y: 200, color: '#06b6d4' },
    { id: 'MID06', label: 'Account M06', type: 'normal', x: 850, y: 250, color: '#3b82f6' },
    { id: 'MID07', label: 'Account M07', type: 'normal', x: 850, y: 450, color: '#14b8a6' },
    { id: 'MID08', label: 'Account M08', type: 'normal', x: 750, y: 500, color: '#8b5cf6' },
    { id: 'MID09', label: 'Account M09', type: 'normal', x: 650, y: 520, color: '#f59e0b' },
    { id: 'MID10', label: 'Account M10', type: 'normal', x: 550, y: 500, color: '#ec4899' },
    { id: 'MID11', label: 'Account M11', type: 'normal', x: 450, y: 520, color: '#10b981' },
    { id: 'MID12', label: 'Account M12', type: 'normal', x: 350, y: 500, color: '#06b6d4' },
  ],
  transactions: [] // Will be generated dynamically
};

// Generate dense mesh of transactions - everyone connects to hubs and some to each other
function generateDenseTransactions() {
  const transactions = [];
  let txId = 0;
  
  const colors = [
    'rgba(139, 92, 246, 0.4)', // purple
    'rgba(236, 72, 153, 0.4)', // pink
    'rgba(16, 185, 129, 0.4)', // green
    'rgba(6, 182, 212, 0.4)',  // cyan
    'rgba(245, 158, 11, 0.4)', // orange/gold
    'rgba(59, 130, 246, 0.4)', // blue
    'rgba(239, 68, 68, 0.4)',  // red
    'rgba(20, 184, 166, 0.4)', // teal
  ];
  
  // All outer nodes connect to hubs (creates the dense web)
  DEMO_DATA.accounts.forEach(acc => {
    if (!acc.hub) {
      // Connect to all 3 hubs
      ['HUB01', 'HUB02', 'HUB03'].forEach((hub, idx) => {
        transactions.push({
          from: acc.id,
          to: hub,
          amount: Math.floor(Math.random() * 5000) + 500,
          timestamp: new Date().toISOString(),
          suspicious: acc.type === 'suspicious' || Math.random() < 0.15,
          color: colors[txId % colors.length],
          id: txId++
        });
        
        // Some reverse flows
        if (Math.random() < 0.6) {
          transactions.push({
            from: hub,
            to: acc.id,
            amount: Math.floor(Math.random() * 3000) + 300,
            timestamp: new Date().toISOString(),
            suspicious: Math.random() < 0.1,
            color: colors[txId % colors.length],
            id: txId++
          });
        }
      });
    }
  });
  
  // Hubs connect to each other
  transactions.push(
    { from: 'HUB01', to: 'HUB02', amount: 15000, suspicious: true, color: 'rgba(245, 158, 11, 0.6)', id: txId++ },
    { from: 'HUB02', to: 'HUB03', amount: 14500, suspicious: true, color: 'rgba(245, 158, 11, 0.6)', id: txId++ },
    { from: 'HUB03', to: 'HUB01', amount: 12000, suspicious: false, color: 'rgba(59, 130, 246, 0.5)', id: txId++ },
  );
  
  // Some peer-to-peer for extra density
  const outerAccounts = DEMO_DATA.accounts.filter(a => !a.hub);
  for (let i = 0; i < 20; i++) {
    const from = outerAccounts[Math.floor(Math.random() * outerAccounts.length)];
    const to = outerAccounts[Math.floor(Math.random() * outerAccounts.length)];
    if (from.id !== to.id) {
      transactions.push({
        from: from.id,
        to: to.id,
        amount: Math.floor(Math.random() * 2000) + 200,
        timestamp: new Date().toISOString(),
        suspicious: Math.random() < 0.2,
        color: colors[txId % colors.length],
        id: txId++
      });
    }
  }
  
  return transactions;
}

DEMO_DATA.transactions = generateDenseTransactions();

const STAGES = [
  { id: 1, name: 'Monitor', description: 'Monitoring transaction activity' },
  { id: 2, name: 'Detect & Trace', description: 'Detecting fraud and tracing connections' },
  { id: 3, name: 'Investigate', description: 'Investigation complete - High risk confirmed' }
];

export default function FraudInvestigationDiagram() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeoutRef = useRef(null);
  const intervalsRef = useRef([]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [filter, setFilter] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Animation state
  const [particles, setParticles] = useState([]);
  const [highlightedPath, setHighlightedPath] = useState([]);
  const [stageProgress, setStageProgress] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [liveTransactions, setLiveTransactions] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Continuous render loop
    function render() {
      drawGraph(ctx);
      animationRef.current = requestAnimationFrame(render);
    }
    
    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Clear all intervals
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current = [];
    };
  }, [zoom, pan, currentStage, particles, highlightedPath, selectedNode, filter, riskScore]);

  function drawGraph(ctx) {
    const canvas = ctx.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid background
    drawGrid(ctx, canvas.width, canvas.height);
    
    // Apply transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    // Filter accounts
    const visibleAccounts = filter === 'suspicious' 
      ? DEMO_DATA.accounts.filter(a => a.type !== 'normal')
      : DEMO_DATA.accounts;
    
    // Draw transactions (edges)
    DEMO_DATA.transactions.forEach((tx, idx) => {
      const from = DEMO_DATA.accounts.find(a => a.id === tx.from);
      const to = DEMO_DATA.accounts.find(a => a.id === tx.to);
      
      if (!from || !to) return;
      if (filter === 'suspicious' && !visibleAccounts.includes(from)) return;
      if (filter === 'suspicious' && !visibleAccounts.includes(to)) return;
      
      const isHighlighted = highlightedPath.includes(idx);
      const isSuspicious = tx.suspicious;
      
      drawEdge(ctx, from, to, isSuspicious, isHighlighted, tx);
    });
    
    // Draw particles
    particles.forEach(particle => {
      drawParticle(ctx, particle);
    });
    
    // Draw accounts (nodes)
    visibleAccounts.forEach(account => {
      const isSelected = selectedNode?.id === account.id;
      const isInPath = currentStage >= 3 && highlightedPath.length > 0;
      const shouldHighlight = isInPath && ['ACC003', 'ACC005', 'ACC007'].includes(account.id);
      
      drawNode(ctx, account, isSelected, shouldHighlight, currentStage);
    });
    
    ctx.restore();
  }

  function drawGrid(ctx, width, height) {
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
    ctx.lineWidth = 1;
    
    const gridSize = 40;
    
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function drawNode(ctx, account, isSelected, isHighlighted, stage) {
    const radius = account.hub ? 30 : 16; // Hubs are larger
    
    // Use account's color if available
    let color = account.color || '#3b82f6';
    let glowColor = account.color ? account.color.replace(')', ', 0.5)').replace('#', 'rgba(') : 'rgba(59, 130, 246, 0.5)';
    
    // Override for special types
    if (account.type === 'suspicious' && stage >= 1) {
      color = '#f59e0b';
      glowColor = 'rgba(245, 158, 11, 0.6)';
    }
    
    if (account.type === 'high-risk' && stage >= 2) {
      color = '#ef4444';
      glowColor = 'rgba(239, 68, 68, 0.7)';
    }
    
    // Glow for hubs and highlighted nodes
    if (isHighlighted || isSelected || account.hub) {
      ctx.shadowBlur = account.hub ? 20 : 12;
      ctx.shadowColor = glowColor;
    }
    
    // Pulsing for high-risk
    if (account.type === 'high-risk' && stage === 2) {
      const pulseRadius = radius + Math.sin(Date.now() / 300) * 3;
      ctx.beginPath();
      ctx.arc(account.x, account.y, pulseRadius + 5, 0, Math.PI * 2);
      ctx.fillStyle = glowColor;
      ctx.fill();
    }
    
    // Node circle
    ctx.beginPath();
    ctx.arc(account.x, account.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Border for selected or hubs
    if (isSelected) {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (account.hub) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
    
    // Label only for hubs, selected, or important nodes
    if (isSelected || account.hub || account.type !== 'normal') {
      ctx.fillStyle = '#ffffff';
      ctx.font = account.hub ? 'bold 11px Arial' : 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(account.id, account.x, account.y);
    }
  }

  function drawEdge(ctx, from, to, isSuspicious, isHighlighted, tx) {
    // Use transaction's color if available, otherwise default colors
    let color;
    if (tx && tx.color) {
      color = isHighlighted ? tx.color.replace('0.4)', '0.8)') : tx.color;
    } else {
      color = isSuspicious && currentStage >= 1
        ? (isHighlighted ? 'rgba(245, 158, 11, 0.8)' : 'rgba(245, 158, 11, 0.3)')
        : (isHighlighted ? 'rgba(59, 130, 246, 0.6)' : 'rgba(100, 116, 139, 0.25)');
    }
    
    const lineWidth = isHighlighted ? 1 : 0.3;
    
    // Calculate control points for organic curves
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // More dramatic curves for longer connections
    const curveFactor = Math.min(distance / 2.5, 180);
    const perpX = -dy / distance;
    const perpY = dx / distance;
    
    // Vary curve direction for organic look
    const curveDirection = ((from.x + from.y + to.x + to.y) % 2 === 0) ? 1 : -1;
    
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const controlX = midX + perpX * curveFactor * curveDirection;
    const controlY = midY + perpY * curveFactor * curveDirection;
    
    // Draw the curved thread
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(controlX, controlY, to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // Draw small arrow at the end
    if (isHighlighted) {
      const t = 0.85;
      const arrowX = (1-t)*(1-t)*from.x + 2*(1-t)*t*controlX + t*t*to.x;
      const arrowY = (1-t)*(1-t)*from.y + 2*(1-t)*t*controlY + t*t*to.y;
      
      const t2 = 0.83;
      const prevX = (1-t2)*(1-t2)*from.x + 2*(1-t2)*t2*controlX + t2*t2*to.x;
      const prevY = (1-t2)*(1-t2)*from.y + 2*(1-t2)*t2*controlY + t2*t2*to.y;
      
      const angle = Math.atan2(arrowY - prevY, arrowX - prevX);
      const arrowSize = 6;
      
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
        arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
        arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  function drawParticle(ctx, particle) {
    // Draw as a small directional arrow instead of a large dot
    const arrowLength = 8;
    const arrowWidth = 4;
    
    // Calculate direction based on movement
    const angle = Math.atan2(
      particle.toY - particle.fromY,
      particle.toX - particle.fromX
    );
    
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(angle);
    
    // Draw arrow shape
    ctx.beginPath();
    ctx.moveTo(arrowLength / 2, 0); // Tip
    ctx.lineTo(-arrowLength / 2, -arrowWidth / 2); // Bottom left
    ctx.lineTo(-arrowLength / 4, 0); // Middle notch
    ctx.lineTo(-arrowLength / 2, arrowWidth / 2); // Top left
    ctx.closePath();
    
    // Fill with slight glow
    ctx.fillStyle = particle.color.replace('0.8)', '0.9)').replace('0.7)', '0.9)');
    ctx.fill();
    
    // Optional subtle outer glow
    ctx.shadowBlur = 3;
    ctx.shadowColor = particle.color;
    ctx.fill();
    
    ctx.restore();
  }

  function playDemo() {
    if (isPlaying) return;
    
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsPlaying(true);
    setCurrentStage(0);
    setStageProgress(0);
    setHighlightedPath([]);
    setSelectedNode(null);
    setRiskScore(0);
    
    // Start from stage 0
    setTimeout(() => {
      runStage(0);
    }, 100);
  }

  function runStage(stage) {
    setCurrentStage(stage);
    
    const baseDuration = 3000;
    const duration = baseDuration / speed;
    
    console.log('Running stage:', stage);
    
    switch(stage) {
      case 0: // Monitor
        startParticleAnimation();
        timeoutRef.current = setTimeout(() => {
          if (isPlaying) runStage(1);
        }, duration);
        break;
        
      case 1: // Detect & Trace
        highlightSuspiciousTransaction();
        // Trace path after a delay
        setTimeout(() => {
          tracePath();
        }, 1000 / speed);
        timeoutRef.current = setTimeout(() => {
          if (isPlaying) runStage(2);
        }, duration * 2);
        break;
        
      case 2: // Investigate
        assessRisk();
        setTimeout(() => {
          openInvestigation();
        }, 1000 / speed);
        setIsPlaying(false);
        break;
        
      default:
        setIsPlaying(false);
        break;
    }
  }

  function startParticleAnimation() {
    const newParticles = [];
    DEMO_DATA.transactions.forEach((tx, idx) => {
      const from = DEMO_DATA.accounts.find(a => a.id === tx.from);
      const to = DEMO_DATA.accounts.find(a => a.id === tx.to);
      
      if (from && to) {
        newParticles.push({
          id: idx,
          fromX: from.x,
          fromY: from.y,
          toX: to.x,
          toY: to.y,
          x: from.x,
          y: from.y,
          size: 2,
          color: 'rgba(59, 130, 246, 0.8)',
          progress: Math.random(),
          speed: 0.005
        });
      }
    });
    
    setParticles(newParticles);
    updateParticles(newParticles);
    
    // Start live transaction feed
    startLiveTransactionFeed();
  }

  function startLiveTransactionFeed() {
    // Clear existing feed
    setLiveTransactions([]);
    
    // Add transactions one by one with delays
    let currentIndex = 0;
    const feedInterval = setInterval(() => {
      if (currentIndex < DEMO_DATA.transactions.length) {
        const tx = DEMO_DATA.transactions[currentIndex];
        const fromAccount = DEMO_DATA.accounts.find(a => a.id === tx.from);
        const toAccount = DEMO_DATA.accounts.find(a => a.id === tx.to);
        
        setLiveTransactions(prev => [
          {
            id: Date.now() + currentIndex,
            from: tx.from,
            fromLabel: fromAccount?.label || tx.from,
            to: tx.to,
            toLabel: toAccount?.label || tx.to,
            amount: tx.amount,
            timestamp: tx.timestamp,
            suspicious: tx.suspicious,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          },
          ...prev
        ].slice(0, 8)); // Keep only last 8 transactions
        
        currentIndex++;
      } else {
        // Loop back to start
        currentIndex = 0;
      }
    }, 1500 / speed); // New transaction every 1.5 seconds
    
    intervalsRef.current.push(feedInterval);
  }

  function updateParticles(currentParticles) {
    const updatedParticles = currentParticles.map(p => {
      let newProgress = p.progress + p.speed * speed;
      if (newProgress > 1) newProgress = 0;
      
      // Calculate position along the path
      const t = newProgress;
      const newX = p.fromX + (p.toX - p.fromX) * t;
      const newY = p.fromY + (p.toY - p.fromY) * t;
      
      return {
        ...p,
        x: newX,
        y: newY,
        progress: newProgress
      };
    });
    
    setParticles(updatedParticles);
    
    if (isPlaying || currentStage === 0) {
      setTimeout(() => updateParticles(updatedParticles), 50);
    }
  }

  function highlightSuspiciousTransaction() {
    const suspiciousNode = DEMO_DATA.accounts.find(a => a.id === 'ACC003');
    setSelectedNode(suspiciousNode);
    
    // Update particles to show suspicious flow
    setParticles(prev => prev.map(p => {
      const tx = DEMO_DATA.transactions[p.id];
      if (tx && tx.suspicious) {
        return { ...p, color: 'rgba(245, 158, 11, 0.9)', size: 5 };
      }
      return { ...p, color: 'rgba(59, 130, 246, 0.6)', size: 3 };
    }));
  }

  function tracePath() {
    const suspiciousPath = [1, 2, 3, 4]; // Indices of suspicious transactions
    let currentIndex = 0;
    
    const traceInterval = setInterval(() => {
      if (currentIndex < suspiciousPath.length) {
        setHighlightedPath(prev => [...prev, suspiciousPath[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(traceInterval);
        const idx = intervalsRef.current.indexOf(traceInterval);
        if (idx > -1) intervalsRef.current.splice(idx, 1);
      }
    }, (500 / speed));
    
    intervalsRef.current.push(traceInterval);
  }

  function assessRisk() {
    let score = 0;
    const riskInterval = setInterval(() => {
      score += 5;
      setRiskScore(score);
      if (score >= 85) {
        clearInterval(riskInterval);
        const idx = intervalsRef.current.indexOf(riskInterval);
        if (idx > -1) intervalsRef.current.splice(idx, 1);
      }
    }, (50 / speed));
    
    intervalsRef.current.push(riskInterval);
    
    const highRiskNode = DEMO_DATA.accounts.find(a => a.id === 'ACC007');
    setSelectedNode(highRiskNode);
  }

  function openInvestigation() {
    const highRiskNode = DEMO_DATA.accounts.find(a => a.id === 'ACC007');
    setSelectedNode(highRiskNode);
  }

  function pauseResume() {
    if (!isPlaying) {
      // Resume
      setIsPlaying(true);
      runStage(currentStage);
    } else {
      // Pause
      setIsPlaying(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }

  function jumpToStage(stageIndex) {
    // Stop any running animation
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    intervalsRef.current.forEach(interval => clearInterval(interval));
    intervalsRef.current = [];
    
    // Set the current stage
    setCurrentStage(stageIndex);
    
    // Reset state first
    setHighlightedPath([]);
    setSelectedNode(null);
    setRiskScore(0);
    setParticles([]);
    
    // Execute the stage visualization immediately
    switch(stageIndex) {
      case 0: // Stage 1: Monitor - Normal activity, all blue
        const normalParticles = [];
        DEMO_DATA.transactions.forEach((tx, idx) => {
          const from = DEMO_DATA.accounts.find(a => a.id === tx.from);
          const to = DEMO_DATA.accounts.find(a => a.id === tx.to);
          
          if (from && to) {
            normalParticles.push({
              id: idx,
              fromX: from.x,
              fromY: from.y,
              toX: to.x,
              toY: to.y,
              x: from.x,
              y: from.y,
              size: 2,
              color: 'rgba(59, 130, 246, 0.7)', // All blue
              progress: Math.random(),
              speed: 0.005
            });
          }
        });
        setParticles(normalParticles);
        updateParticles(normalParticles);
        break;
        
      case 1: // Stage 2: Detect & Trace - Show suspicious paths and amber nodes
        const detectParticles = [];
        DEMO_DATA.transactions.forEach((tx, idx) => {
          const from = DEMO_DATA.accounts.find(a => a.id === tx.from);
          const to = DEMO_DATA.accounts.find(a => a.id === tx.to);
          
          if (from && to) {
            const isSuspicious = tx.suspicious;
            detectParticles.push({
              id: idx,
              fromX: from.x,
              fromY: from.y,
              toX: to.x,
              toY: to.y,
              x: from.x,
              y: from.y,
              size: isSuspicious ? 2 : 2,
              color: isSuspicious ? 'rgba(245, 158, 11, 0.9)' : 'rgba(59, 130, 246, 0.5)',
              progress: Math.random(),
              speed: 0.005
            });
          }
        });
        setParticles(detectParticles);
        updateParticles(detectParticles);
        
        // Highlight suspicious paths
        setHighlightedPath([1, 2, 3, 4]);
        
        // Highlight ACC003
        const suspiciousNode = DEMO_DATA.accounts.find(a => a.id === 'ACC003');
        setSelectedNode(suspiciousNode);
        break;
        
      case 2: // Stage 3: Investigate - Show ACC007 red with full investigation
        const investigateParticles = [];
        DEMO_DATA.transactions.forEach((tx, idx) => {
          const from = DEMO_DATA.accounts.find(a => a.id === tx.from);
          const to = DEMO_DATA.accounts.find(a => a.id === tx.to);
          
          if (from && to) {
            const isSuspicious = tx.suspicious;
            investigateParticles.push({
              id: idx,
              fromX: from.x,
              fromY: from.y,
              toX: to.x,
              toY: to.y,
              x: from.x,
              y: from.y,
              size: isSuspicious ? 2 : 2,
              color: isSuspicious ? 'rgba(245, 158, 11, 0.9)' : 'rgba(59, 130, 246, 0.5)',
              progress: Math.random(),
              speed: 0.005
            });
          }
        });
        setParticles(investigateParticles);
        updateParticles(investigateParticles);
        
        setHighlightedPath([1, 2, 3, 4]);
        
        // Select ACC007 and show full investigation
        const investigateNode = DEMO_DATA.accounts.find(a => a.id === 'ACC007');
        setSelectedNode(investigateNode);
        setRiskScore(85);
        break;
    }
  }

  function replay() {
    // Clear all timers and intervals
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    intervalsRef.current.forEach(interval => clearInterval(interval));
    intervalsRef.current = [];
    
    // Reset all state
    setIsPlaying(false);
    setCurrentStage(0);
    setHighlightedPath([]);
    setSelectedNode(null);
    setParticles([]);
    setRiskScore(0);
    
    // Start playing after a brief delay
    setTimeout(() => {
      playDemo();
    }, 200);
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function handleZoomIn() {
    setZoom(prev => Math.min(prev + 0.2, 2));
  }

  function handleZoomOut() {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  }

  function handleCanvasClick(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    // Check if clicked on a node
    const clickedNode = DEMO_DATA.accounts.find(account => {
      const distance = Math.sqrt(
        Math.pow(x - account.x, 2) + Math.pow(y - account.y, 2)
      );
      return distance < 30;
    });
    
    setSelectedNode(clickedNode || null);
  }

  const stats = {
    accountsAnalyzed: filter === 'all' ? DEMO_DATA.accounts.length : DEMO_DATA.accounts.filter(a => a.type !== 'normal').length,
    transactionsAnalyzed: DEMO_DATA.transactions.length,
    suspiciousAccounts: DEMO_DATA.accounts.filter(a => a.type !== 'normal').length
  };

  return (
    <div className="card p-0 overflow-hidden relative h-[700px] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
              Live Fraud Investigation
              <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">Demo Scenario</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {STAGES[currentStage]?.description || 'Interactive fraud detection demonstration'}
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={playDemo}
              disabled={isPlaying}
              className="btn-ai flex items-center gap-2 text-sm"
            >
              <Play className="w-4 h-4" />
              Play Demo
            </button>
            
            <button
              onClick={pauseResume}
              className="btn-secondary px-3 py-2"
              title={isPlaying ? 'Pause' : 'Resume'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            
            <button
              onClick={replay}
              className="btn-secondary px-3 py-2"
              title="Replay"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="input text-sm px-3 py-2 w-20"
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="2">2x</option>
            </select>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input text-sm px-3 py-2 w-32"
            >
              <option value="all">Show All</option>
              <option value="suspicious">Suspicious Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas */}
        <div className="flex-1 relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-pointer"
          />
          
          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button onClick={handleZoomIn} className="btn-secondary w-10 h-10 flex items-center justify-center">
              <ZoomIn className="w-5 h-5" />
            </button>
            <button onClick={handleZoomOut} className="btn-secondary w-10 h-10 flex items-center justify-center">
              <ZoomOut className="w-5 h-5" />
            </button>
            <button onClick={resetView} className="btn-secondary w-10 h-10 flex items-center justify-center">
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
          
          {/* Legend */}
          <div className="absolute top-4 left-4 glass p-3 rounded-lg space-y-2 text-xs">
            <h4 className="font-semibold text-white mb-2">Legend</h4>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-slate-300">Normal Account</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
              <span className="text-slate-300">Suspicious Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
              <span className="text-slate-300">High-Risk Account</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-500"></div>
              <span className="text-slate-300">Transaction Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-amber-500"></div>
              <span className="text-slate-300">Investigation Trail</span>
            </div>
          </div>
          
          {/* Stats Panel */}
          <div className="absolute bottom-4 left-4 glass p-3 rounded-lg space-y-2 text-xs">
            <h4 className="font-semibold text-white mb-2">Live Status</h4>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Accounts:</span>
              <span className="text-white font-semibold">{stats.accountsAnalyzed}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Transactions:</span>
              <span className="text-white font-semibold">{stats.transactionsAnalyzed}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Suspicious:</span>
              <span className="text-orange-400 font-semibold">{stats.suspiciousAccounts}</span>
            </div>
            {riskScore > 0 && (
              <div className="flex justify-between gap-4 pt-2 border-t border-slate-700">
                <span className="text-slate-400">Risk Score:</span>
                <span className="text-red-400 font-bold">{riskScore}</span>
              </div>
            )}
          </div>
          
          {/* Live Transaction Feed */}
          <div className="absolute top-4 left-4 glass p-3 rounded-lg w-80 max-h-80 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-white text-xs flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Transaction Flow
              </h4>
              <span className="text-xs text-slate-400">{liveTransactions.length} active</span>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto smooth-scroll">
              {liveTransactions.map((tx, idx) => (
                <div 
                  key={tx.id + '-' + idx}
                  className={`p-2 rounded text-xs transition-all duration-300 ${
                    tx.suspicious 
                      ? 'bg-orange-500/20 border border-orange-500/30' 
                      : 'bg-slate-800/50 border border-slate-700/50'
                  }`}
                  style={{
                    animation: 'slide-in-right 0.3s ease-out',
                    opacity: Math.max(1 - (idx * 0.1), 0.3)
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-mono font-semibold ${tx.suspicious ? 'text-orange-400' : 'text-blue-400'}`}>
                      ${tx.amount.toLocaleString()}
                    </span>
                    <span className="text-slate-500 text-[10px]">{tx.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <span className="font-mono text-[10px]">{tx.from}</span>
                    <span className="text-slate-500">→</span>
                    <span className="font-mono text-[10px]">{tx.to}</span>
                  </div>
                  {tx.suspicious && (
                    <div className="mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                      <span className="text-orange-400 text-[10px]">Suspicious pattern detected</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Stage Indicator */}
          <div className="absolute bottom-4 right-4 glass p-3 rounded-lg">
            <div className="flex items-center gap-2">
              {STAGES.map((stage, idx) => (
                <div key={stage.id} className="flex items-center gap-2">
                  <button
                    onClick={() => jumpToStage(idx)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer hover:scale-110 ${
                      idx <= currentStage 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50' 
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                    title={`Jump to ${stage.name}: ${stage.description}`}
                  >
                    {stage.id}
                  </button>
                  {idx < STAGES.length - 1 && (
                    <div className={`w-8 h-1 transition-all ${
                      idx < currentStage ? 'bg-blue-500' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-center">
              <span className="text-slate-400">Stage {currentStage + 1}:</span>
              <span className="text-white font-semibold ml-1">{STAGES[currentStage]?.name}</span>
            </div>
          </div>
        </div>

        {/* Investigation Panel */}
        {selectedNode && currentStage === 2 && (
          <div className="w-80 border-l border-slate-700/50 bg-slate-900/50 p-4 space-y-4 overflow-y-auto smooth-scroll">
            <div className="ai-highlight p-4 rounded-lg">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                Investigation Report
                <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/30">
                  HIGH RISK
                </span>
              </h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-400">Account ID</p>
                  <p className="text-white font-mono font-semibold">{selectedNode.id}</p>
                  <p className="text-slate-300">{selectedNode.label}</p>
                </div>
                
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-slate-400 mb-2">Linked Accounts</p>
                  <div className="space-y-1">
                    {['ACC003', 'ACC005'].map(id => (
                      <div key={id} className="px-2 py-1 bg-slate-800 rounded text-slate-300 font-mono">
                        {id}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-slate-400 mb-2">Transaction Trail</p>
                  <div className="space-y-1 text-slate-300">
                    <div>ACC002 → ACC003: $15,000</div>
                    <div>ACC003 → ACC005: $14,500</div>
                    <div>ACC005 → ACC007: $14,000</div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-slate-400 mb-2">Total Transferred</p>
                  <p className="text-white font-bold text-lg">$43,500</p>
                </div>
                
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-slate-400 mb-2">Risk Indicators</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">✓</span>
                      <span className="text-slate-300">Rapid sequential transfers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">✓</span>
                      <span className="text-slate-300">High-value transactions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">✓</span>
                      <span className="text-slate-300">Multi-hop transaction path</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">✓</span>
                      <span className="text-slate-300">Connected suspicious accounts</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-slate-400 mb-2">Recommended Action</p>
                  <div className="px-3 py-2 bg-red-500/20 border border-red-500/30 rounded text-red-300">
                    Immediate investigation required. Freeze account and review transaction history.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
