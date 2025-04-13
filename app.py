from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from datetime import datetime
import sys
import time
import os

app = Flask(__name__, static_folder='.', template_folder='.')

# Enhanced CORS configuration
CORS(app, resources={
    r"/*": {
        "origins": ["*"],  # Allow all origins during development
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True,
        "max_age": 86400
    }
})

emergency_requests = []

@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "request_count": len(emergency_requests),
        "endpoints": {
            "submit_request": "/submit-request",
            "get_requests": "/get-requests"
        }
    })

@app.route('/submit-request', methods=['POST', 'OPTIONS'])
def submit_request():
    try:
        # Add small delay to simulate real-world conditions
        time.sleep(0.1)
        
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400
            
        required_fields = ['name', 'phone', 'location', 'vehicle', 'service', 'description']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"success": False, "message": f"Missing required field: {field}"}), 400
                
        request_id = f"REQ-{datetime.now().timestamp()}"
        record = {
            "id": request_id,
            **data,
            "timestamp": datetime.now().isoformat(),
            "status": "new",
            "notes": ""
        }
        
        emergency_requests.append(record)
        print(f"Request {request_id} stored", file=sys.stderr)
        
        return jsonify({
            "success": True,
            "id": request_id,
            "timestamp": record["timestamp"]
        })
        
    except Exception as e:
        print(f"Error in submit_request: {str(e)}", file=sys.stderr)
        return jsonify({"success": False, "message": "Server error"}), 500

@app.route('/get-requests', methods=['GET'])
def get_requests():
    try:
        # Add cache control to prevent rapid refreshes
        return jsonify({
            "success": True,
            "count": len(emergency_requests),
            "requests": emergency_requests
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/delete-request', methods=['POST'])
def delete_request():
    try:
        data = request.get_json()
        request_id = data.get('id')
        
        global emergency_requests
        emergency_requests = [req for req in emergency_requests if req['id'] != request_id]
        
        return jsonify({
            "success": True,
            "message": f"Request {request_id} deleted"
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    # Add sample data
    emergency_requests.append({
        "id": "1678901234567",
        "name": "John Doe",
        "phone": "555-123-4567",
        "location": "Highway 101, Mile Marker 42",
        "vehicle": "Toyota Camry 2022 Blue",
        "service": "tire",
        "description": "Flat tire on the driver's side front wheel",
        "timestamp": datetime.now().isoformat(),
        "status": "new",
        "notes": ""
    })
    
    try:
        port = int(os.environ.get('PORT', 5000))
        app.run(host='0.0.0.0', port=port, debug=True)
    except OSError as e:
        print(f"Port {port} is already in use!", file=sys.stderr)
        print("Try: kill $(lsof -t -i:5000) or use a different port", file=sys.stderr)
        sys.exit(1)