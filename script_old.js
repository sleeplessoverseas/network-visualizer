// 📦 This line uses the `fetch()` function to load an external file.
// In this case, we're loading "graph_data.json", which contains our nodes and edges data.
// `fetch()` returns a Promise, which means it will eventually give us the result (asynchronously).
fetch("graph_data.json") // Load graph data

  // Once the file is successfully fetched, we use `.then()` to process the response.
  // `.json()` reads the response body and turns it into a JavaScript object (parsed from JSON format).
  .then(response => response.json()) // Parse JSON

  // This `.then()` gets called once the JSON is ready.
  // The `data` variable will now contain our nodes and edges.
  .then(data => {
    const container = document.getElementById("mynetwork"); // Graph container
    const nodes = new vis.DataSet(data.nodes); // Nodes
    const edges = new vis.DataSet(data.edges); // Edges
    const networkData = { nodes, edges }; // Data for vis.js
    
    // Track label visibility state
    let labelsVisible = false;
    
    // Store original edge colors from the raw data (before vis.js processes it)
    const originalEdgeColorMap = new Map();
    data.edges.forEach(edge => {
      const key = `${edge.from}-${edge.to}`;
      originalEdgeColorMap.set(key, edge.color?.color || "#848484");
      console.log(`Stored edge ${key}: ${edge.color?.color}`); // Debug
    });
    
    const options = {
      physics: {
        enabled: true,
        stabilization: { 
          iterations: 200,
          onlyDynamicEdges: false,
          fit: true
         }, // Stop moving after 200 iterations
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 300, // Base spring length
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 1
        }
      },
      interaction: { 
        hover: true,
        dragNodes: true,
        zoomView: true
      },
      nodes: {
        shape: "dot",
        size: 10, // Fixed size instead of scaling
        font: { size: 14, color: "#000" },
        borderWidth: 2,
        color: {
          border: "#2B7CE9",
          background: "#97C2FC",
          highlight: { border: "#2B7CE9", background: "#D2E5FF" }
        }
      },
      edges: {
        arrows: "to",
        width: 3, // Slightly thicker edges for better visibility
        smooth: { type: "continuous" },
        physics: true, // Enable edge physics
        font: { size: 0 }, // Hide labels by default
        length: function(edgeData) {
          // Use the length property from our data, or default to 200
          return edgeData.length || 200;
        }
      },
      layout: {
        improvedLayout: true,
        hierarchical: false
      }
    };
    const network = new vis.Network(container, networkData, options); // Render graph
    
    // Track selected node and highlighted elements
    let selectedNodeId = null;
    let originalNodeColors = {};
    
    // Store original node colors
    data.nodes.forEach(node => {
      originalNodeColors[node.id] = {
        border: node.color?.border || "#2B7CE9",
        background: node.color?.background || "#97C2FC"
      };
    });
    
    // Node click handler for enhanced highlighting
    network.on("click", function(params) {
      if (params.nodes.length > 0) {
        const clickedNodeId = params.nodes[0];
        
        if (selectedNodeId === clickedNodeId) {
          // Clicking the same node again - reset highlighting
          resetHighlighting();
          selectedNodeId = null;
        } else {
          // New node clicked - highlight neighborhood
          highlightNeighborhood(clickedNodeId);
          selectedNodeId = clickedNodeId;
        }
      } else {
        // Clicked on empty space - reset highlighting
        resetHighlighting();
        selectedNodeId = null;
      }
    });
    
    function highlightNeighborhood(nodeId) {
      // Reset any previous highlighting
      resetHighlighting();
      
      // Get all edges connected to this node
      const connectedEdges = edges.get().filter(edge => 
        edge.from === nodeId || edge.to === nodeId
      );
      
      // Get all connected node IDs
      const connectedNodeIds = new Set();
      connectedNodeIds.add(nodeId); // Include the clicked node
      
      connectedEdges.forEach(edge => {
        if (edge.from === nodeId) connectedNodeIds.add(edge.to);
        if (edge.to === nodeId) connectedNodeIds.add(edge.from);
      });
      
      // Update nodes - highlight connected ones, dim others
      const allNodes = nodes.get();
      const updatedNodes = allNodes.map(node => {
        if (connectedNodeIds.has(node.id)) {
          return {
            ...node,
            color: {
              border: node.id === nodeId ? "#FF0000" : "#00FF00", // Red for clicked, green for connected
              background: node.id === nodeId ? "#FFB3B3" : "#B3FFB3"
            },
            font: { size: 16, color: "#000", bold: true }, // Make labels more prominent
            borderWidth: 4
          };
        } else {
          return {
            ...node,
            color: {
              border: "#CCCCCC",
              background: "#F0F0F0"
            },
            font: { size: 12, color: "#999" }, // Dim non-connected nodes
            borderWidth: 1
          };
        }
      });
      
      // Update edges - highlight connected ones, dim others
      const allEdges = edges.get();
      const connectedEdgeIds = new Set(connectedEdges.map(edge => edge.id));
      const updatedEdges = allEdges.map(edge => {
        if (connectedEdgeIds.has(edge.id)) {
          // Get original color using from-to mapping
          const key = `${edge.from}-${edge.to}`;
          const originalColor = originalEdgeColorMap.get(key) || "#000000";
          console.log(`Highlighting edge ${edge.id} (${key}) with color: ${originalColor}`); // Debug
          return {
            ...edge,
            width: 5, // Thicker for highlighted edges
            color: { color: originalColor } // Preserve original color
          };
        } else {
          return {
            ...edge,
            width: 1, // Thinner for non-connected edges
            color: { color: "#E0E0E0" } // Very light gray
          };
        }
      });
      
      // Apply updates
      nodes.update(updatedNodes);
      edges.update(updatedEdges);
    }
    
    function resetHighlighting() {
      // Reset all nodes to original appearance
      const allNodes = nodes.get();
      const resetNodes = allNodes.map(node => ({
        ...node,
        color: {
          border: originalNodeColors[node.id]?.border || "#2B7CE9",
          background: originalNodeColors[node.id]?.background || "#97C2FC"
        },
        font: { size: 14, color: "#000" },
        borderWidth: 2
      }));
      
      // Reset all edges to original appearance
      const allEdges = edges.get();
      const resetEdges = allEdges.map(edge => {
        const key = `${edge.from}-${edge.to}`;
        const originalColor = originalEdgeColorMap.get(key) || "#848484";
        return {
          ...edge,
          width: 3,
          color: { color: originalColor }
        };
      });
      
      // Apply resets
      nodes.update(resetNodes);
      edges.update(resetEdges);
    }
    
    // Toggle button functionality
    document.getElementById('toggleLabels').addEventListener('click', function() {
      labelsVisible = !labelsVisible;
      
      // Update all edges to show/hide labels
      const allEdges = edges.get();
      const updatedEdges = allEdges.map(edge => ({
        ...edge,
        font: { size: labelsVisible ? 12 : 0, align: "middle" }
      }));
      
      edges.update(updatedEdges);
      
      // Update button text
      this.textContent = labelsVisible ? 'Hide Edge Labels' : 'Show Edge Labels';
    });
    
    // Add hover tooltips for edges
    network.on("hoverEdge", function (params) {
      const edgeId = params.edge;
      const edge = edges.get(edgeId);
      if (edge) {
        const sourceNode = nodes.get(edge.from);
        const targetNode = nodes.get(edge.to);
        const tooltip = `${sourceNode.label} → ${targetNode.label}\n${edge.label}`;
        
        // Update the network with a temporary title for the edge
        edges.update({
          id: edgeId,
          title: tooltip
        });
      }
    });
    
    network.on("blurEdge", function (params) {
      const edgeId = params.edge;
      // Remove the tooltip
      edges.update({
        id: edgeId,
        title: undefined
      });
    });
  }) // Close the .then() block properly

  .catch(error => {
    console.error("Error loading JSON:", error); // Error handling
  });