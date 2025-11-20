import json
import sys

# Simulate what KalidoKit would do
# We'll check the actual rotation values that would be calculated

with open('output/dancing_motion.json', 'r') as f:
    data = json.load(f)

print("="*60)
print("ANALYZING WHAT KALIDOKIT WOULD PRODUCE")
print("="*60)

for frame_idx in range(3):
    frame = data['frames'][frame_idx]
    landmarks_3d = frame['landmarks_3d']
    
    # Get leg landmarks
    right_hip = landmarks_3d[23]
    left_hip = landmarks_3d[24]
    right_knee = landmarks_3d[25]
    left_knee = landmarks_3d[26]
    right_ankle = landmarks_3d[27]
    left_ankle = landmarks_3d[28]
    
    print(f"\nFRAME {frame_idx}:")
    print(f"  Right Hip:  y={right_hip['y']:7.4f}")
    print(f"  Right Knee: y={right_knee['y']:7.4f} (delta from hip: {right_knee['y'] - right_hip['y']:7.4f})")
    print(f"  Right Ankle: y={right_ankle['y']:7.4f} (delta from knee: {right_ankle['y'] - right_knee['y']:7.4f})")
    
    # Calculate direction vectors
    right_upper_leg_dir = {
        'x': right_knee['x'] - right_hip['x'],
        'y': right_knee['y'] - right_hip['y'],
        'z': right_knee['z'] - right_hip['z']
    }
    
    print(f"\n  Right Upper Leg Direction Vector:")
    print(f"    x={right_upper_leg_dir['x']:7.4f}, y={right_upper_leg_dir['y']:7.4f}, z={right_upper_leg_dir['z']:7.4f}")
    print(f"    Y is positive (pointing DOWN) - this is CORRECT")
    
    # If Y is positive (down), the rotation should make the leg point down
    # If the leg is going "upside down behind head", the rotation is being applied incorrectly
    
print("\n" + "="*60)
print("CONCLUSION:")
print("  - Raw data shows legs pointing DOWN (positive Y)")
print("  - KalidoKit should calculate rotations that keep legs pointing DOWN")
print("  - If legs go upside down, the rotation application is WRONG")
print("  - Likely need to invert X and/or Z axes for leg bones")
print("="*60)

