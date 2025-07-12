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
  })

  .catch(error => {
    console.error("Error loading JSON:", error); // Error handling
  });