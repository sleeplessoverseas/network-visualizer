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
      physics: true, // Physics simulation
      interaction: { hover: true }, // Hover effect
      nodes: {
        shape: "dot", // Circle nodes
        scaling: { min: 10, max: 30 }, // Dot size
        font: { size: 16, color: "#000" } // Label font
      },
      edges: {
        arrows: "to", // Arrow at 'to' end
        color: "#999", // Edge color
        font: { align: "middle" } // Edge label
      }
    };
    const network = new vis.Network(container, networkData, options); // Render graph
  })

  .catch(error => {
    console.error("Error loading JSON:", error); // Error handling
  });