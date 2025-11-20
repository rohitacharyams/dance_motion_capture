"""
Flask server for processing dance videos in real-time
Handles video upload and MediaPipe pose extraction
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import cv2
import mediapipe as mp
from pathlib import Path
import tempfile
import threading

app = Flask(__name__, static_folder='.')
CORS(app)

# Global variable to track processing progress
processing_status = {
    'progress': 0,
    'status': 'idle',
    'message': '',
    'output_file': None
}

class PoseExtractorServer:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        
    def extract_pose_from_video(self, video_path, output_path, progress_callback=None):
        """Extract pose landmarks from video file with progress reporting"""
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise Exception(f"Cannot open video file {video_path}")
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        motion_data = {
            "metadata": {
                "fps": fps,
                "frame_count": frame_count,
                "width": width,
                "height": height,
                "source_video": os.path.basename(video_path)
            },
            "frames": []
        }
        
        frame_idx = 0
        
        with self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=2,
            smooth_landmarks=True,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        ) as pose:
            
            while cap.isOpened():
                success, image = cap.read()
                if not success:
                    break
                
                # Convert BGR to RGB
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                image_rgb.flags.writeable = False
                
                # Process the image
                results = pose.process(image_rgb)
                
                # Prepare frame data
                frame_data = {
                    "frame_number": frame_idx,
                    "timestamp": frame_idx / fps,
                    "landmarks_2d": [],
                    "landmarks_3d": []
                }
                
                if results.pose_landmarks:
                    # Extract 2D landmarks
                    for landmark in results.pose_landmarks.landmark:
                        frame_data["landmarks_2d"].append({
                            "x": landmark.x,
                            "y": landmark.y,
                            "z": landmark.z,
                            "visibility": landmark.visibility
                        })
                    
                    # Extract 3D world landmarks
                    if results.pose_world_landmarks:
                        for landmark in results.pose_world_landmarks.landmark:
                            frame_data["landmarks_3d"].append({
                                "x": landmark.x,
                                "y": landmark.y,
                                "z": landmark.z,
                                "visibility": landmark.visibility
                            })
                
                motion_data["frames"].append(frame_data)
                
                frame_idx += 1
                
                # Report progress
                if progress_callback:
                    progress = int((frame_idx / frame_count) * 100)
                    progress_callback(progress, f"Processing frame {frame_idx}/{frame_count}")
        
        cap.release()
        
        # Save motion data to JSON
        os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(motion_data, f, indent=2)
        
        return motion_data

extractor = PoseExtractorServer()

def process_video_async(video_path, output_path):
    """Process video in background thread"""
    global processing_status
    
    try:
        processing_status['status'] = 'processing'
        processing_status['message'] = 'Starting video processing...'
        processing_status['progress'] = 0
        
        def update_progress(progress, message):
            processing_status['progress'] = progress
            processing_status['message'] = message
        
        # Extract pose
        extractor.extract_pose_from_video(video_path, output_path, update_progress)
        
        processing_status['status'] = 'completed'
        processing_status['message'] = 'Processing complete!'
        processing_status['progress'] = 100
        processing_status['output_file'] = os.path.basename(output_path)
        
    except Exception as e:
        processing_status['status'] = 'error'
        processing_status['message'] = str(e)
        processing_status['progress'] = 0
        print(f"Error processing video: {e}")

@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory('.', path)

@app.route('/upload', methods=['POST'])
def upload_video():
    """Handle video upload and start processing"""
    global processing_status
    
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    
    video_file = request.files['video']
    
    if video_file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Save uploaded video to temp location
    video_filename = video_file.filename
    temp_video_path = os.path.join('sample_videos', video_filename)
    os.makedirs('sample_videos', exist_ok=True)
    video_file.save(temp_video_path)
    
    # Generate output filename
    output_filename = video_filename.rsplit('.', 1)[0] + '_motion.json'
    output_path = os.path.join('output', output_filename)
    
    # Reset processing status
    processing_status = {
        'progress': 0,
        'status': 'queued',
        'message': 'Video uploaded, starting processing...',
        'output_file': None
    }
    
    # Start processing in background thread
    thread = threading.Thread(target=process_video_async, args=(temp_video_path, output_path))
    thread.daemon = True
    thread.start()
    
    return jsonify({
        'success': True,
        'message': 'Video uploaded successfully',
        'filename': video_filename
    })

@app.route('/progress', methods=['GET'])
def get_progress():
    """Get current processing progress"""
    return jsonify(processing_status)

@app.route('/output/<filename>', methods=['GET'])
def get_output(filename):
    """Serve the generated motion data JSON file"""
    return send_from_directory('output', filename)

if __name__ == '__main__':
    print("=" * 60)
    print("Dance Motion Capture Server")
    print("=" * 60)
    print("\nServer starting on http://localhost:5000")
    print("Open your browser and navigate to http://localhost:5000")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
