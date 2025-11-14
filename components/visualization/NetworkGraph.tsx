
import React, { useMemo } from 'react';
import { GraphNode, GraphEdge } from '../../types';

interface NetworkGraphProps {
  nodes: { id: string }[];
  edges: GraphEdge[];
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ nodes, edges }) => {
  const width = 380;
  const height = 320;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 40;

  const graphNodes: GraphNode[] = useMemo(() => {
    const angleStep = (2 * Math.PI) / nodes.length;
    return nodes.map((node, i) => ({
      id: node.id,
      x: cx + radius * Math.cos(i * angleStep - Math.PI / 2),
      y: cy + radius * Math.sin(i * angleStep - Math.PI / 2),
    }));
  }, [nodes, cx, cy, radius]);

  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    graphNodes.forEach(node => map.set(node.id, node));
    return map;
  }, [graphNodes]);

  if (nodes.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">네트워크 데이터가 없습니다.</div>;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
        </marker>
      </defs>
      
      {edges.map((edge, i) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (!sourceNode || !targetNode) return null;

        return (
          <g key={i}>
            <line
              x1={sourceNode.x}
              y1={sourceNode.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke="#4b5563"
              strokeWidth="1.5"
              markerEnd={edge.amount > 0 ? "url(#arrowhead)" : ""}
            />
            {edge.amount > 0 && (
                 <text
                    x={(sourceNode.x + targetNode.x) / 2}
                    y={(sourceNode.y + targetNode.y) / 2}
                    dy="-5"
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize="10"
                >
                   ${edge.amount.toFixed(0)}
                </text>
            )}
          </g>
        );
      })}

      {graphNodes.map(node => (
        <g key={node.id} transform={`translate(${node.x},${node.y})`}>
          <circle r="20" fill="#1f2937" stroke="#3b82f6" strokeWidth="2" />
          <text
            textAnchor="middle"
            y="4"
            fontSize="10"
            fill="#e5e7eb"
            className="font-mono"
          >
            {node.id.substring(node.id.length - 4)}
          </text>
        </g>
      ))}
    </svg>
  );
};
