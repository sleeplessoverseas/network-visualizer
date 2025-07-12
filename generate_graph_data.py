import json

# Step 1: Define the nodes
companies = [
    {"id": 1, "label": "Meta", "value": 10},
    {"id": 2, "label": "Scale AI", "value": 8},
    {"id": 3, "label": "a16z", "value": 9},
    {"id": 4, "label": "OpenAI", "value": 9}
]

# Step 2: Define the edges
relationships = [
    {"from": 3, "to": 2, "label": "invested"},
    {"from": 1, "to": 2, "label": "acquired"},
    {"from": 3, "to": 4, "label": "invested"}
]

# Step 3: Combine into graph structure
graph_data = {
    "nodes": companies,
    "edges": relationships
}

# Step 4: Write to graph_data.json
with open("graph_data.json", "w") as f:
    json.dump(graph_data, f, indent=2)

print("✅ graph_data.json created!")