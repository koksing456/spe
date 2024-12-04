import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'

export default function RelationshipMap() {
  const svgRef = useRef(null)
  const [filter, setFilter] = useState('all') // all, staff, shift1, shift2, shift3, cell1, cell2, cell3

  const allRelationships = {
    nodes: [
      // Core Staff
      { id: 'zimbardo', label: 'Dr. Zimbardo', group: 'staff', influence: 10 },
      { id: 'psychologist', label: 'Psychologist', group: 'staff', influence: 8 },
      { id: 'observer1', label: 'Observer 1', group: 'staff', influence: 5 },
      { id: 'observer2', label: 'Observer 2', group: 'staff', influence: 5 },
      
      // Representative Guards (1 leader + 1 member from each shift)
      { id: 'guard1', label: 'Guard #1', group: 'guard', influence: 7, shift: 1 },
      { id: 'guard2', label: 'Guard #2', group: 'guard', influence: 6, shift: 1 },
      { id: 'guard5', label: 'Guard #5', group: 'guard', influence: 7, shift: 2 },
      { id: 'guard6', label: 'Guard #6', group: 'guard', influence: 6, shift: 2 },
      { id: 'guard9', label: 'Guard #9', group: 'guard', influence: 7, shift: 3 },
      { id: 'guard10', label: 'Guard #10', group: 'guard', influence: 6, shift: 3 },

      // Representative Prisoners (2 from each cell)
      { id: 'prisoner8612', label: '#8612', group: 'prisoner', influence: 5, cell: 1 },
      { id: 'prisoner8613', label: '#8613', group: 'prisoner', influence: 4, cell: 1 },
      { id: 'prisoner8616', label: '#8616', group: 'prisoner', influence: 4, cell: 2 },
      { id: 'prisoner8617', label: '#8617', group: 'prisoner', influence: 4, cell: 2 },
      { id: 'prisoner8620', label: '#8620', group: 'prisoner', influence: 4, cell: 3 },
      { id: 'prisoner8621', label: '#8621', group: 'prisoner', influence: 4, cell: 3 }
    ],
    links: [
      // Staff oversight
      { source: 'zimbardo', target: 'psychologist', strength: 8, type: 'collaboration' },
      { source: 'zimbardo', target: 'observer1', strength: 7, type: 'authority' },
      { source: 'zimbardo', target: 'observer2', strength: 7, type: 'authority' },
      
      // Guard shift 1 relationships
      { source: 'guard1', target: 'guard2', strength: 6, type: 'collaboration' },
      { source: 'zimbardo', target: 'guard1', strength: 8, type: 'authority' },
      
      // Guard shift 2 relationships
      { source: 'guard5', target: 'guard6', strength: 6, type: 'collaboration' },
      { source: 'zimbardo', target: 'guard5', strength: 8, type: 'authority' },
      
      // Guard shift 3 relationships
      { source: 'guard9', target: 'guard10', strength: 6, type: 'collaboration' },
      { source: 'zimbardo', target: 'guard9', strength: 8, type: 'authority' },

      // Cell relationships
      { source: 'prisoner8612', target: 'prisoner8613', strength: 5, type: 'alliance' },
      { source: 'prisoner8616', target: 'prisoner8617', strength: 5, type: 'alliance' },
      { source: 'prisoner8620', target: 'prisoner8621', strength: 5, type: 'alliance' },

      // Guard-Prisoner interactions
      { source: 'guard1', target: 'prisoner8612', strength: 7, type: 'conflict' },
      { source: 'guard5', target: 'prisoner8616', strength: 6, type: 'tension' },
      { source: 'guard9', target: 'prisoner8620', strength: 6, type: 'tension' },

      // Observer monitoring
      { source: 'observer1', target: 'guard1', strength: 4, type: 'observation' },
      { source: 'observer1', target: 'prisoner8612', strength: 4, type: 'observation' },
      { source: 'observer2', target: 'guard5', strength: 4, type: 'observation' },
      { source: 'observer2', target: 'prisoner8616', strength: 4, type: 'observation' },

      // Psychologist monitoring
      { source: 'psychologist', target: 'prisoner8612', strength: 5, type: 'observation' },
      { source: 'psychologist', target: 'prisoner8616', strength: 5, type: 'observation' },
      { source: 'psychologist', target: 'prisoner8620', strength: 5, type: 'observation' }
    ]
  }

  const getFilteredData = () => {
    if (filter === 'all') return allRelationships

    const filteredNodes = allRelationships.nodes.filter(node => {
      switch (filter) {
        case 'staff':
          return node.group === 'staff'
        case 'shift1':
          return node.group === 'staff' || node.shift === 1
        case 'shift2':
          return node.group === 'staff' || node.shift === 2
        case 'shift3':
          return node.group === 'staff' || node.shift === 3
        case 'cell1':
          return node.group === 'staff' || node.cell === 1
        case 'cell2':
          return node.group === 'staff' || node.cell === 2
        case 'cell3':
          return node.group === 'staff' || node.cell === 3
        default:
          return true
      }
    })

    const nodeIds = new Set(filteredNodes.map(n => n.id))
    const filteredLinks = allRelationships.links.filter(
      link => nodeIds.has(link.source) && nodeIds.has(link.target)
    )

    return { nodes: filteredNodes, links: filteredLinks }
  }

  const getNodeColor = (group) => {
    switch (group) {
      case 'staff': return '#8B5CF6' // Purple
      case 'guard': return '#EF4444' // Red
      case 'prisoner': return '#6B7280' // Gray
      default: return '#9CA3AF'
    }
  }

  const getLinkColor = (type) => {
    switch (type) {
      case 'authority': return '#8B5CF6'
      case 'conflict': return '#EF4444'
      case 'tension': return '#F59E0B'
      case 'alliance': return '#10B981'
      case 'collaboration': return '#3B82F6'
      case 'observation': return '#6B7280'
      default: return '#4B5563'
    }
  }

  useEffect(() => {
    if (!svgRef.current) return

    const data = getFilteredData()

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove()

    const width = 600
    const height = 400

    // Create force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(d => 100 - d.strength * 5))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', d => getLinkColor(d.type))
      .attr('stroke-width', d => d.strength / 2)
      .attr('stroke-opacity', 0.6)

    // Create nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    // Add circles to nodes
    node.append('circle')
      .attr('r', d => 8 + d.influence)
      .attr('fill', d => getNodeColor(d.group))
      .attr('stroke', '#1F2937')
      .attr('stroke-width', 2)

    // Add labels to nodes
    node.append('text')
      .text(d => d.label)
      .attr('x', 0)
      .attr('y', d => -10 - d.influence)
      .attr('text-anchor', 'middle')
      .attr('fill', '#D1D5DB')
      .attr('font-size', '10px')

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node
        .attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // Drag functions
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    return () => {
      simulation.stop()
    }
  }, [filter])

  return (
    <div className="prison-card">
      <div className="flex items-center justify-between mb-4">
        <h2>Relationship Dynamics</h2>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-800 border-gray-700 text-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="all">All Relationships</option>
          <option value="staff">Staff Only</option>
          <option value="shift1">Shift 1</option>
          <option value="shift2">Shift 2</option>
          <option value="shift3">Shift 3</option>
          <option value="cell1">Cell 1</option>
          <option value="cell2">Cell 2</option>
          <option value="cell3">Cell 3</option>
        </select>
      </div>
      
      <div className="mt-4 aspect-[3/2] w-full">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <h3 className="prison-text font-bold mb-2">Participants</h3>
          <div className="space-y-2">
            {['staff', 'guard', 'prisoner'].map(group => (
              <div key={group} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: getNodeColor(group) }} />
                <span className="prison-text capitalize">{group}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="prison-text font-bold mb-2">Relationships</h3>
          <div className="space-y-2">
            {['authority', 'conflict', 'alliance', 'observation', 'collaboration', 'tension'].map(type => (
              <div key={type} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: getLinkColor(type) }} />
                <span className="prison-text capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 