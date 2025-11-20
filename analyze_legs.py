import json

# Load the motion data
with open('output/dancing_motion.json', 'r') as f:
    data = json.load(f)

# Analyze first 3 frames
for frame_idx in range(3):
    frame = data['frames'][frame_idx]
    print(f"\n{'='*60}")
    print(f"FRAME {frame['frame_number']} (timestamp: {frame['timestamp']:.3f}s)")
    print(f"{'='*60}")
    
    landmarks_3d = frame['landmarks_3d']
    
    # Leg landmarks (MediaPipe indices)
    # 23: Right hip, 24: Left hip
    # 25: Right knee, 26: Left knee  
    # 27: Right ankle, 28: Left ankle
    
    right_hip = landmarks_3d[23]
    left_hip = landmarks_3d[24]
    right_knee = landmarks_3d[25]
    left_knee = landmarks_3d[26]
    right_ankle = landmarks_3d[27]
    left_ankle = landmarks_3d[28]
    
    print(f"\nHIPS:")
    print(f"  Right Hip (23):  x={right_hip['x']:7.4f}, y={right_hip['y']:7.4f}, z={right_hip['z']:7.4f}")
    print(f"  Left Hip (24):   x={left_hip['x']:7.4f}, y={left_hip['y']:7.4f}, z={left_hip['z']:7.4f}")
    
    print(f"\nKNEES:")
    print(f"  Right Knee (25): x={right_knee['x']:7.4f}, y={right_knee['y']:7.4f}, z={right_knee['z']:7.4f}")
    print(f"  Left Knee (26):  x={left_knee['x']:7.4f}, y={left_knee['y']:7.4f}, z={left_knee['z']:7.4f}")
    
    print(f"\nANKLES:")
    print(f"  Right Ankle (27): x={right_ankle['x']:7.4f}, y={right_ankle['y']:7.4f}, z={right_ankle['z']:7.4f}")
    print(f"  Left Ankle (28):  x={left_ankle['x']:7.4f}, y={left_ankle['y']:7.4f}, z={left_ankle['z']:7.4f}")
    
    # Calculate leg directions (from hip to knee to ankle)
    print(f"\nLEG DIRECTIONS (hip -> knee -> ankle):")
    
    # Right leg
    right_hip_to_knee = {
        'x': right_knee['x'] - right_hip['x'],
        'y': right_knee['y'] - right_hip['y'],
        'z': right_knee['z'] - right_hip['z']
    }
    right_knee_to_ankle = {
        'x': right_ankle['x'] - right_knee['x'],
        'y': right_ankle['y'] - right_knee['y'],
        'z': right_ankle['z'] - right_knee['z']
    }
    
    print(f"  Right: Hip->Knee:   x={right_hip_to_knee['x']:7.4f}, y={right_hip_to_knee['y']:7.4f}, z={right_hip_to_knee['z']:7.4f}")
    print(f"         Knee->Ankle: x={right_knee_to_ankle['x']:7.4f}, y={right_knee_to_ankle['y']:7.4f}, z={right_knee_to_ankle['z']:7.4f}")
    
    # Left leg
    left_hip_to_knee = {
        'x': left_knee['x'] - left_hip['x'],
        'y': left_knee['y'] - left_hip['y'],
        'z': left_knee['z'] - left_hip['z']
    }
    left_knee_to_ankle = {
        'x': left_ankle['x'] - left_knee['x'],
        'y': left_ankle['y'] - left_knee['y'],
        'z': left_ankle['z'] - left_knee['z']
    }
    
    print(f"  Left:  Hip->Knee:   x={left_hip_to_knee['x']:7.4f}, y={left_hip_to_knee['y']:7.4f}, z={left_hip_to_knee['z']:7.4f}")
    print(f"         Knee->Ankle: x={left_knee_to_ankle['x']:7.4f}, y={left_knee_to_ankle['y']:7.4f}, z={left_knee_to_ankle['z']:7.4f}")
    
    # Check if legs are pointing down (positive Y means down in MediaPipe world coords)
    print(f"\nLEG ORIENTATION ANALYSIS:")
    print(f"  Right leg Y direction (should be positive/down): {right_hip_to_knee['y']:7.4f}")
    print(f"  Left leg Y direction (should be positive/down):  {left_hip_to_knee['y']:7.4f}")
    
    if frame_idx > 0:
        prev_frame = data['frames'][frame_idx - 1]
        prev_landmarks = prev_frame['landmarks_3d']
        
        print(f"\nCHANGES FROM FRAME {frame_idx - 1} to {frame_idx}:")
        print(f"  Right Hip Y change:  {right_hip['y'] - prev_landmarks[23]['y']:7.4f}")
        print(f"  Right Knee Y change: {right_knee['y'] - prev_landmarks[25]['y']:7.4f}")
        print(f"  Right Ankle Y change: {right_ankle['y'] - prev_landmarks[27]['y']:7.4f}")

print(f"\n{'='*60}")
print("ANALYSIS COMPLETE")
print(f"{'='*60}")

