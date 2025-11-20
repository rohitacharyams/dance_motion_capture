# Dance Motion Capture Pipeline - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DANCE MOTION CAPTURE PIPELINE                    │
└─────────────────────────────────────────────────────────────────────┘

                              INPUT
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Dance Video File    │
                    │   (MP4, AVI, MOV)     │
                    └───────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                         STEP 1: EXTRACTION                            │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │  extract_pose.py (Python + MediaPipe)                       │     │
│  │  ────────────────────────────────────────────────────       │     │
│  │  • Load video frame by frame                                │     │
│  │  • Detect 33 pose landmarks per frame                       │     │
│  │  • Extract 2D normalized coordinates                        │     │
│  │  • Extract 3D world coordinates (meters)                    │     │
│  │  • Calculate visibility scores                              │     │
│  │  • Save to JSON format                                      │     │
│  └─────────────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Motion Data (JSON)   │
                    │  • Frame-by-frame     │
                    │  • 2D + 3D landmarks  │
                    │  • Metadata           │
                    └───────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                      STEP 2: VISUALIZATION                            │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │  Web Application (HTML + JavaScript + Three.js)            │     │
│  │  ────────────────────────────────────────────────────       │     │
│  │                                                              │     │
│  │  ┌────────────────┐  ┌──────────────────┐                  │     │
│  │  │   main.js      │  │ SkeletonRenderer │                  │     │
│  │  │   ─────────    │  │ ──────────────── │                  │     │
│  │  │ • Load JSON    │─▶│ • Create joints  │                  │     │
│  │  │ • Parse data   │  │ • Draw bones     │                  │     │
│  │  │ • Control      │  │ • Update poses   │                  │     │
│  │  │   playback     │  └──────────────────┘                  │     │
│  │  │ • Manage UI    │           │                             │     │
│  │  └────────────────┘           │                             │     │
│  │         │                     │                             │     │
│  │         │                     ▼                             │     │
│  │         │          ┌──────────────────┐                     │     │
│  │         └─────────▶│ AvatarController │                     │     │
│  │                    │ ──────────────── │                     │     │
│  │                    │ • Build avatar   │                     │     │
│  │                    │ • Map landmarks  │                     │     │
│  │                    │ • Animate bones  │                     │     │
│  │                    │ • Apply motion   │                     │     │
│  │                    └──────────────────┘                     │     │
│  └─────────────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                        ┌───────────────┐
                        │  3D Animation │
                        │  in Browser   │
                        └───────────────┘
```

## Data Flow

### MediaPipe Landmarks (33 points)
```
         0: Nose
        / | \
    1-3   |   4-6    (Eyes)
      7   |   8      (Ears)
       9─10          (Mouth)
         
    12──────11       (Shoulders)
    │        │
   14       13       (Elbows)
    │        │
   16       15       (Wrists)
   /│\     /│\
 18 20 22 17 19 21   (Hands)
    
    24──────23       (Hips)
    │        │
   26       25       (Knees)
    │        │
   28       27       (Ankles)
   /│      /│
  30 32   29 31      (Feet)
```

### Coordinate Systems

**2D Normalized (landmarks_2d)**
```
(0,0) ────────────────────▶ X (1,0)
  │
  │     Image Space
  │     • X: 0 (left) to 1 (right)
  │     • Y: 0 (top) to 1 (bottom)
  │     • Z: Depth relative to hips
  ▼
Y (0,1)
```

**3D World (landmarks_3d)**
```
        Y (Up)
        │
        │
        │
        └────────▶ X (Right)
       /
      /
     Z (Back)
     
• Origin at hip center
• Units in meters
• X: -∞ (left) to +∞ (right)
• Y: 0 (ground) to ~2m (head)
• Z: -∞ (forward) to +∞ (back)
```

## Component Architecture

### Python Backend (extract_pose.py)
```
┌──────────────────────────────────────────┐
│ PoseExtractor Class                      │
├──────────────────────────────────────────┤
│ • __init__()                             │
│   - Initialize MediaPipe Pose            │
│   - Set model complexity                 │
│   - Configure confidence thresholds      │
│                                          │
│ • extract_pose_from_video()              │
│   - Open video capture                   │
│   - Process frame by frame               │
│   - Extract landmarks                    │
│   - Visualize (optional)                 │
│   - Save to JSON                         │
└──────────────────────────────────────────┘
```

### JavaScript Frontend

**Main Application (main.js)**
```
┌──────────────────────────────────────────┐
│ MotionCaptureApp Class                   │
├──────────────────────────────────────────┤
│ • initScene()                            │
│   - Create Three.js scene                │
│   - Setup camera & renderer              │
│   - Add lights & helpers                 │
│                                          │
│ • loadMotionData()                       │
│   - Parse JSON file                      │
│   - Validate frame data                  │
│   - Initialize playback                  │
│                                          │
│ • animate()                              │
│   - Animation loop                       │
│   - Update frame                         │
│   - Render scene                         │
└──────────────────────────────────────────┘
```

**Skeleton Renderer (SkeletonRenderer.js)**
```
┌──────────────────────────────────────────┐
│ SkeletonRenderer Class                   │
├──────────────────────────────────────────┤
│ • createSkeleton()                       │
│   - Create 33 joint spheres              │
│   - Create bone connections              │
│   - Setup materials                      │
│                                          │
│ • update(landmarks)                      │
│   - Update joint positions               │
│   - Update bone orientations             │
│   - Handle visibility                    │
└──────────────────────────────────────────┘
```

**Avatar Controller (AvatarController.js)**
```
┌──────────────────────────────────────────┐
│ AvatarController Class                   │
├──────────────────────────────────────────┤
│ • createAvatar()                         │
│   - Build humanoid mesh                  │
│   - Create body parts                    │
│   - Setup materials                      │
│                                          │
│ • update(landmarks)                      │
│   - Map landmarks to bones               │
│   - Calculate rotations                  │
│   - Update mesh positions                │
│   - Orient limbs                         │
└──────────────────────────────────────────┘
```

## File Formats

### Input Video
```
Supported: MP4, AVI, MOV, MKV
Recommended:
  • Codec: H.264
  • Resolution: 1080p (1920x1080)
  • Frame rate: 30 FPS
  • Bitrate: 5-10 Mbps
```

### Motion Data JSON
```json
{
  "metadata": {
    "fps": 30.0,
    "frame_count": 90,
    "width": 1920,
    "height": 1080,
    "source_video": "dance.mp4"
  },
  "frames": [
    {
      "frame_number": 0,
      "timestamp": 0.0,
      "landmarks_2d": [
        {"x": 0.5, "y": 0.3, "z": -0.1, "visibility": 0.99},
        // ... 32 more
      ],
      "landmarks_3d": [
        {"x": 0.0, "y": 1.5, "z": 0.0, "visibility": 0.99},
        // ... 32 more
      ]
    }
    // ... more frames
  ]
}
```

## Performance Considerations

### Processing Time (720p video)
```
MediaPipe Model Complexity:
• Level 0: ~30 FPS (fast, less accurate)
• Level 1: ~20 FPS (balanced)
• Level 2: ~10 FPS (slow, most accurate) ✓ Default

Typical Processing:
• 1 minute video ≈ 6-10 minutes processing
• Depends on: CPU, resolution, model complexity
```

### Browser Performance
```
Rendering (60 FPS target):
• < 100 frames: Smooth
• 100-500 frames: Good
• > 500 frames: May lag on slower systems

Optimization:
• Use lower playback speeds for long sequences
• Close other browser tabs
• Disable skeleton if only viewing avatar
```

## Extension Points

### Custom Avatars
```javascript
// In AvatarController.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

loadCustomAvatar(modelPath) {
  const loader = new GLTFLoader();
  loader.load(modelPath, (gltf) => {
    // Map MediaPipe bones to model skeleton
    // Apply animations
  });
}
```

### Motion Smoothing
```python
# In extract_pose.py
from scipy.signal import savgol_filter

def smooth_landmarks(landmarks, window=5):
    # Apply Savitzky-Golay filter
    return savgol_filter(landmarks, window, 3)
```

### Export Formats
```python
# Add to extract_pose.py
def export_to_bvh(motion_data):
    # Convert to BVH format for
    # Blender, Maya, etc.
    pass
```

## Error Handling

### Common Issues & Solutions
```
Issue: Low visibility scores
→ Improve lighting, reduce motion blur

Issue: Jittery motion
→ Enable smoothing, increase tracking confidence

Issue: Missing landmarks
→ Ensure full body in frame, try different angles

Issue: Slow processing
→ Reduce model complexity, use --no-viz flag

Issue: Browser lag
→ Reduce video length, lower playback speed
```
