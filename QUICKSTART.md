# Quick Start Guide

## Step-by-Step Instructions

### 1. Install Python Dependencies
```powershell
cd dance_motion_capture
pip install -r requirements.txt
```

### 2. Test the Setup
```powershell
python test_setup.py
```
This will:
- Verify MediaPipe installation
- Generate a sample motion file (`output/sample_motion.json`)

### 3. Start the Web Server
```powershell
# Option 1: Using Python's built-in server
python -m http.server 8000

# Option 2: If you have Node.js installed
npm install
npm start
```

### 4. Open the Application
Open your browser and go to: `http://localhost:8000`

### 5. Test with Sample Data
1. Click "Choose File" button
2. Select `output/sample_motion.json`
3. Click "▶ Play Animation"
4. Watch the skeleton and avatar animate!

---

## Using Your Own Dance Videos

### Extract Motion from Video
```powershell
python extract_pose.py --input path/to/your/dance_video.mp4 --output output/my_dance.json
```

**Options:**
- `--input` or `-i`: Path to your input video file
- `--output` or `-o`: Path where JSON output will be saved (default: output/motion_data.json)
- `--no-viz`: Disable the preview window during processing

**Example:**
```powershell
# With visualization (shows processing in real-time)
python extract_pose.py -i sample_videos/dance.mp4 -o output/dance_motion.json

# Without visualization (faster processing)
python extract_pose.py -i sample_videos/dance.mp4 -o output/dance_motion.json --no-viz
```

### Load Your Motion Data
1. Make sure the web server is running
2. Open `http://localhost:8000`
3. Click "Choose File" and select your generated JSON file
4. Click "▶ Play Animation"

---

## Tips for Best Results

### Video Recording Tips:
1. **Full body in frame**: Ensure the entire body is visible throughout
2. **Good lighting**: Well-lit environment helps detection
3. **Clear background**: Reduces false detections
4. **Stable camera**: Mount camera on tripod if possible
5. **Distance**: Stand 2-3 meters from camera

### Performance Tips:
- Videos with 30 FPS work best
- Resolution 720p or 1080p recommended
- Keep video length under 30 seconds for smooth playback
- Close other applications for better performance

### Controls in Web App:
- **Mouse Left Click + Drag**: Rotate camera view
- **Mouse Right Click + Drag**: Pan camera
- **Mouse Scroll**: Zoom in/out
- **Space Bar**: Play/Pause animation
- **Speed Slider**: Adjust playback speed (0.1x to 3.0x)
- **Progress Slider**: Scrub through animation
- **Show Skeleton**: Toggle skeleton visualization
- **Show Avatar**: Toggle 3D avatar
- **Loop Animation**: Enable/disable looping

---

## Troubleshooting

### "Cannot open video file"
- Check that the video file path is correct
- Supported formats: MP4, AVI, MOV, MKV
- Try converting to MP4 if issues persist

### "No frames found in motion data"
- The video may be too short
- Check that MediaPipe can detect the person in the video
- Try with better lighting or a clearer background

### "MediaPipe not installed"
```powershell
pip install --upgrade mediapipe opencv-python
```

### Web page won't load
- Check that the server is running on port 8000
- Try a different port: `python -m http.server 8080`
- Check browser console for errors (F12)

### Avatar doesn't move smoothly
- Lower the playback speed
- Use a video with better pose detection
- Ensure 3D landmarks were extracted (check JSON file)

---

## Project Structure

```
dance_motion_capture/
├── extract_pose.py          # Python script to extract poses
├── test_setup.py            # Setup verification script
├── index.html               # Main web application
├── requirements.txt         # Python dependencies
├── package.json            # Node.js dependencies (optional)
├── README.md               # Full documentation
├── QUICKSTART.md           # This file
├── js/
│   ├── main.js             # Main application logic
│   ├── SkeletonRenderer.js # Skeleton visualization
│   └── AvatarController.js # Avatar animation
├── output/                 # Generated motion data files
│   └── sample_motion.json  # Sample animation
└── sample_videos/          # Place your videos here
```

---

## What's Next?

### Enhance the Avatar
- Import custom 3D models (GLB/GLTF format)
- Add textures and materials
- Create more realistic skeletal rigging

### Add More Features
- Record and export animations
- Multiple camera angles
- Side-by-side comparison
- Motion analysis metrics

### Improve Detection
- Fine-tune MediaPipe parameters
- Add smoothing filters
- Handle occlusions better

---

## Need Help?

Common MediaPipe Landmarks (33 total):
- 0: Nose
- 11, 12: Right/Left Shoulder
- 13, 14: Right/Left Elbow
- 15, 16: Right/Left Wrist
- 23, 24: Right/Left Hip
- 25, 26: Right/Left Knee
- 27, 28: Right/Left Ankle

The 3D world coordinates are in meters with origin at the hips:
- X: Right (+) / Left (-)
- Y: Up (+) / Down (-)
- Z: Forward (-) / Back (+)
