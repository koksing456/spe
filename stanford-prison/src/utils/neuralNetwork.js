class NeuralNetwork {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    // Configuration
    this.options = {
      nodeCount: options.nodeCount || 50,
      connectionRadius: options.connectionRadius || 150,
      nodeRadius: options.nodeRadius || 3,
      nodeColor: options.nodeColor || '#4299e1',
      connectionColor: options.connectionColor || 'rgba(66, 153, 225, 0.2)',
      pulseSpeed: options.pulseSpeed || 0.002,
      flowSpeed: options.flowSpeed || 0.001,
      mouseInfluence: options.mouseInfluence || 100,
      mouseRepulsion: options.mouseRepulsion || false
    };

    // Initialize nodes
    this.nodes = [];
    this.flowParticles = [];
    this.mousePosition = { x: null, y: null };
    this.time = 0;
    
    this.initialize();
  }

  initialize() {
    // Create nodes
    for (let i = 0; i < this.options.nodeCount; i++) {
      this.nodes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        connections: [],
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // Initialize flow particles
    this.initializeFlowParticles();
  }

  initializeFlowParticles() {
    this.flowParticles = [];
    const connections = this.getConnections();
    
    connections.forEach(conn => {
      if (Math.random() < 0.3) { // Only add particles to some connections
        this.flowParticles.push({
          x: conn.from.x,
          y: conn.from.y,
          targetX: conn.to.x,
          targetY: conn.to.y,
          progress: 0,
          speed: Math.random() * 0.02 + 0.01
        });
      }
    });
  }

  getConnections() {
    const connections = [];
    for (let i = 0; i < this.nodes.length; i++) {
      const nodeA = this.nodes[i];
      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeB = this.nodes[j];
        const distance = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y);
        
        if (distance < this.options.connectionRadius) {
          connections.push({
            from: nodeA,
            to: nodeB,
            distance: distance
          });
        }
      }
    }
    return connections;
  }

  updateNodes() {
    this.nodes.forEach(node => {
      // Update position
      node.x += node.vx;
      node.y += node.vy;

      // Bounce off walls
      if (node.x < 0 || node.x > this.width) node.vx *= -1;
      if (node.y < 0 || node.y > this.height) node.vy *= -1;

      // Keep within bounds
      node.x = Math.max(0, Math.min(this.width, node.x));
      node.y = Math.max(0, Math.min(this.height, node.y));

      // Update pulse phase
      node.pulsePhase += this.options.pulseSpeed;

      // Mouse interaction
      if (this.mousePosition.x !== null && this.mousePosition.y !== null) {
        const dx = node.x - this.mousePosition.x;
        const dy = node.y - this.mousePosition.y;
        const distance = Math.hypot(dx, dy);

        if (distance < this.options.mouseInfluence) {
          const force = (this.options.mouseInfluence - distance) / this.options.mouseInfluence;
          if (this.options.mouseRepulsion) {
            node.vx += (dx / distance) * force * 0.1;
            node.vy += (dy / distance) * force * 0.1;
          } else {
            node.vx -= (dx / distance) * force * 0.1;
            node.vy -= (dy / distance) * force * 0.1;
          }
        }
      }
    });
  }

  updateFlowParticles() {
    this.flowParticles = this.flowParticles.filter(particle => {
      particle.progress += particle.speed;
      
      if (particle.progress >= 1) {
        return false;
      }
      
      return true;
    });

    // Add new particles occasionally
    if (Math.random() < 0.1) {
      this.initializeFlowParticles();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw connections
    const connections = this.getConnections();
    connections.forEach(conn => {
      const opacity = 1 - (conn.distance / this.options.connectionRadius);
      this.ctx.strokeStyle = this.options.connectionColor.replace('0.2', opacity * 0.2);
      this.ctx.beginPath();
      this.ctx.moveTo(conn.from.x, conn.from.y);
      this.ctx.lineTo(conn.to.x, conn.to.y);
      this.ctx.stroke();
    });

    // Draw flow particles
    this.ctx.fillStyle = this.options.nodeColor;
    this.flowParticles.forEach(particle => {
      const x = particle.x + (particle.targetX - particle.x) * particle.progress;
      const y = particle.y + (particle.targetY - particle.y) * particle.progress;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw nodes
    this.nodes.forEach(node => {
      const pulseScale = 1 + Math.sin(node.pulsePhase) * 0.2;
      const radius = this.options.nodeRadius * pulseScale;
      
      // Glow effect
      const gradient = this.ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, radius * 2
      );
      gradient.addColorStop(0, this.options.nodeColor);
      gradient.addColorStop(1, 'rgba(66, 153, 225, 0)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Node core
      this.ctx.fillStyle = this.options.nodeColor;
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  setMousePosition(x, y) {
    this.mousePosition = { x, y };
  }

  clearMousePosition() {
    this.mousePosition = { x: null, y: null };
  }

  animate() {
    this.time += 1;
    this.updateNodes();
    this.updateFlowParticles();
    this.draw();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }
}

export default NeuralNetwork; 