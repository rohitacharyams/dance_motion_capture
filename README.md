# 🕺 Dance Motion Capture Pipeline

A complete end-to-end pipeline for extracting pose data from dance videos and animating 3D avatars with the captured motion.

![Pipeline](https://img.shields.io/badge/MediaPipe-Pose%20Detection-blue)
![Three.js](https://img.shields.io/badge/Three.js-3D%20Rendering-green)
![Python](https://img.shields.io/badge/Python-3.8%2B-yellow)

## ✨ Features

### 🎯 Complete Motion Capture Pipeline
1. **2D Keypoint Extraction**: Uses Google MediaPipe to detect 33 pose landmarks from any video
2. **3D Pose Lifting**: Automatically converts 2D keypoints to 3D world coordinates (in meters)
3. **Real-time 3D Visualization**: Interactive Three.js viewer with smooth camera controls
4. **3D Avatar Animation**: Custom-built humanoid avatar that replicates the dance movements
5. **Playback Controls**: Variable speed, scrubbing, looping, and toggle views

### 🎨 Interactive Web Interface
- Upload and visualize motion data
- Toggle between skeleton and avatar views
- Adjust playback speed (0.1x to 3.0x)
- Scrub through animation timeline
- Orbit, pan, and zoom 3D camera
- Keyboard shortcuts for quick control

## 🚀 Quick Start

### Method 1: Automated Setup (Recommended)
```powershell
cd dance_motion_capture
.\setup.ps1
```

### Method 2: Manual Setup

#### 1. Install Dependencies
```powershell
pip install -r requirements.txt
```

#### 2. Generate Sample Data (for testing)
```powershell
python test_setup.py
```

#### 3. Start Web Server
```powershell
python -m http.server 8000
```

#### 4. Open Browser
Navigate to `http://localhost:8000` and load `output/sample_motion.json`

## 📹 Extract Motion from Your Videos

### Basic Usage
```powershell
python extract_pose.py --input your_video.mp4 --output output/motion.json
```

### With Options
```powershell
# Process with live visualization
python extract_pose.py -i dance_video.mp4 -o output/dance.json

# Process without visualization (faster)
python extract_pose.py -i dance_video.mp4 -o output/dance.json --no-viz
```

### Supported Formats
- MP4, AVI, MOV, MKV
- 720p or 1080p resolution recommended
- 30 FPS or higher for smooth playback

## 🎮 Controls

### Web Interface
| Control | Action |
|---------|--------|
| **Left Click + Drag** | Rotate camera |
| **Right Click + Drag** | Pan camera |
| **Mouse Wheel** | Zoom in/out |
| **Space Bar** | Play/Pause |
| **Speed Slider** | Adjust playback speed |
| **Progress Slider** | Scrub animation |
| **Show Skeleton** | Toggle skeleton visualization |
| **Show Avatar** | Toggle 3D avatar |
| **Loop Animation** | Enable/disable looping |

### Keyboard Shortcuts
- `Space`: Play/Pause animation
- `Q`: Exit visualization during extraction

## 📁 Project Structure

```
dance_motion_capture/
├── 📄 extract_pose.py          # Main pose extraction script
├── 📄 test_setup.py            # Setup verification & sample generator
├── 📄 setup.ps1                # Automated setup script (Windows)
├── 🌐 index.html               # Web application interface
├── 📋 requirements.txt         # Python dependencies
├── 📋 package.json            # Optional Node.js config
├── 📖 README.md               # This file
├── 📖 QUICKSTART.md           # Quick reference guide
├── 🎨 js/
│   ├── main.js                # Main application controller
│   ├── SkeletonRenderer.js    # 3D skeleton visualization
│   └── AvatarController.js    # Avatar rigging & animation
├── 📦 output/                 # Generated motion JSON files
│   ├── README.md
│   └── sample_motion.json     # Test animation
└── 🎬 sample_videos/          # Place your videos here
    └── README.md
```

## 🔧 Technical Details

### MediaPipe Pose Landmarks
The system tracks 33 body landmarks:

**Face & Head** (0-10)
- Nose, eyes (inner, outer), ears, mouth

**Upper Body** (11-22)
- Shoulders, elbows, wrists
- Hand landmarks (pinky, index, thumb)

**Torso** (23-24)
- Right and left hip

**Lower Body** (25-32)
- Knees, ankles
- Feet (heel, foot index)

### Coordinate System
**3D World Coordinates** (in meters, origin at hips):
- **X-axis**: Right (+) / Left (-)
- **Y-axis**: Up (+) / Down (-)
- **Z-axis**: Forward towards camera (-) / Away (+)

### Motion Data Format
```json
{
  "metadata": {
    "fps": 30,
    "frame_count": 90,
    "width": 1920,
    "height": 1080,
    "source_video": "dance.mp4"
  },
  "frames": [
    {
      "frame_number": 0,
      "timestamp": 0.0,
      "landmarks_2d": [...],  // Normalized coordinates
      "landmarks_3d": [       // World coordinates (meters)
        {
          "x": 0.0,
          "y": 1.5,
          "z": 0.0,
          "visibility": 0.99
        },
        // ... 32 more landmarks
      ]
    }
  ]
}
```

## 💡 Tips for Best Results

### Recording Videos
- ✅ Keep full body visible in frame
- ✅ Use good, even lighting
- ✅ Clear background (minimal clutter)
- ✅ Stable camera (tripod recommended)
- ✅ Stand 2-3 meters from camera
- ✅ Avoid loose/baggy clothing
- ✅ Higher contrast between person and background

### Processing
- Videos under 30 seconds process faster
- Higher resolution = better detection
- Model complexity can be adjusted in `extract_pose.py`
- Use `--no-viz` flag for faster batch processing

## 🐛 Troubleshooting

### Python/MediaPipe Issues
```powershell
# Upgrade pip first
pip install --upgrade pip

# Reinstall dependencies
pip install --force-reinstall -r requirements.txt

# Check MediaPipe version
python -c "import mediapipe; print(mediapipe.__version__)"
```

### "Cannot open video file"
- Verify file path is correct
- Check video format (use MP4 for best compatibility)
- Try converting with: `ffmpeg -i input.mov -c:v libx264 output.mp4`

### Poor Pose Detection
- Improve lighting conditions
- Ensure person is clearly visible
- Try different MediaPipe model complexity (0, 1, or 2)
- Adjust detection confidence thresholds

### Web Interface Issues
- Check browser console (F12) for errors
- Verify server is running on correct port
- Try incognito/private browsing mode
- Clear browser cache

## 🎯 Future Enhancements

### Planned Features
- [ ] Import custom 3D avatar models (GLB/GLTF)
- [ ] Export animation data (BVH, FBX formats)
- [ ] Multi-person tracking
- [ ] Motion smoothing filters
- [ ] Side-by-side comparison view
- [ ] Motion analysis metrics (speed, angles, etc.)
- [ ] Record browser output as video
- [ ] Batch processing multiple videos

### Advanced Customization
- Modify `AvatarController.js` for custom avatar models
- Adjust materials and lighting in `main.js`
- Add custom visualization modes
- Implement motion post-processing

## 📚 Dependencies

### Python
- `mediapipe >= 0.10.9` - Pose detection
- `opencv-python >= 4.8.1` - Video processing
- `numpy >= 1.24.3` - Numerical operations

### JavaScript (CDN)
- Three.js 0.159.0 - 3D rendering
- OrbitControls - Camera controls

## 📄 License

This project is open source and available for educational and research purposes.

## 🙏 Acknowledgments

- **Google MediaPipe** - Pose detection framework
- **Three.js** - 3D graphics library
- **OpenCV** - Computer vision tools

## 📞 Support

For issues, questions, or contributions:
1. Check `QUICKSTART.md` for common solutions
2. Review troubleshooting section above
3. Check MediaPipe documentation: https://google.github.io/mediapipe/

---

**Made with ❤️ for dancers, animators, and motion capture enthusiasts**
