import json
import csv

# Step 1: Read people from CSV
people = []
with open("people.csv", "r", encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Debug: show what columns we actually have
        if len(people) == 0:
            print("Available columns:", list(row.keys()))
            print("First row data:", dict(row))
        
        # Create a person object with your exact CSV structure
        person = {
            "id": int(row["id"]),
            "label": row["label"],
            "value": 10,  # Default size for visualization
            "notable_company": row["notable_company"],
            "types": [row[f"type{i}"] for i in range(1, 3) if row[f"type{i}"].strip()],  # type1-type2
            "gender": row["gender"],
            "photo_url": row["photo_url"] if row["photo_url"].strip() else None
        }
        people.append(person)

#Step 2: Read relationships from CSV  
relationships = []
print("About to open relationships.csv...")
with open("relationships.csv", "r", encoding='utf-8') as f:
    print("File opened successfully!")
    reader = csv.DictReader(f)
    print("CSV reader created!")
    for row in reader:
        print("Hi")  # Debug to show we're processing relationships
        # Debug for first row
        if len(relationships) == 0:
            print("Relationship columns:", list(row.keys()))
            print("First relationship row:", dict(row))

        
        # Calculate edge length based on strength (stronger = shorter)
        # Strength 10 = length 50, Strength 1 = length 500
        strength = int(row["strength"])
        edge_length = 50 + (10 - strength) * 50  # Inverse relationship
        
        relationships.append({
            "from": int(row["source"]),      # vis.js needs "from"
            "to": int(row["target"]),        # vis.js needs "to"  
            "label": row["relationship"],    # vis.js needs "label"
            "length": edge_length,           # Edge length for physics
            "strength": strength,            # Keep original strength for reference
            "color": {"color": f"hsl({strength * 30}, 70%, 50%)"}  # Color by strength
        })

# Step 3: Combine into graph structure
graph_data = {
    "nodes": people,
    "edges": relationships
}

# Step 4: Write to graph_data.json
with open("graph_data.json", "w") as f:
    json.dump(graph_data, f, indent=2)

print("✅ graph_data.json created!")