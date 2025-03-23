from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS  
import os
import requests
import folium

app = Flask(__name__, static_folder="static")  
CORS(app)  

@app.route("/get-hospitals", methods=["POST"])  # Change to POST
def get_hospitals():
    data = request.json
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if not latitude or not longitude:
        return jsonify({"error": "Invalid coordinates"}), 400

    radius = 5000  
    query = f"""
    [out:json];
    (
      node["amenity"="hospital"](around:{radius},{latitude},{longitude});
      way["amenity"="hospital"](around:{radius},{longitude},{longitude});
      relation["amenity"="hospital"](around:{radius},{latitude},{longitude});
    );
    out center;
    """
    
    url = "https://overpass-api.de/api/interpreter"
    response = requests.get(url, params={"data": query})
    
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch hospital data"}), 500
    
    data = response.json()

    hospitals = []
    for element in data["elements"]:
        if "tags" in element and "name" in element["tags"]:
            hospital_lat = element.get("lat") or element.get("center", {}).get("lat")
            hospital_lon = element.get("lon") or element.get("center", {}).get("lon")
            
            if hospital_lat and hospital_lon:
                hospitals.append({
                    "name": element["tags"]["name"],
                    "lat": hospital_lat,
                    "lon": hospital_lon,
                })

    # Generate the map
    m = folium.Map(location=[latitude, longitude], zoom_start=12)
    folium.Marker([latitude, longitude], popup="Your Location", icon=folium.Icon(color="blue", icon="info-sign")).add_to(m)

    for hospital in hospitals:
        folium.Marker(
            location=[hospital["lat"], hospital["lon"]],
            popup=hospital["name"],
            icon=folium.Icon(color="red", icon="plus-sign"),
        ).add_to(m)

    if not os.path.exists("static"):
        os.makedirs("static")

    map_filename = "hospitals_map.html"
    m.save(os.path.join("static", map_filename))

    return jsonify({"message": "Map generated", "map_url": f"http://127.0.0.1:5000/static/{map_filename}"})

if __name__ == "__main__":
    app.run(debug=True)
