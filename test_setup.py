"""
Quick test script to verify MediaPipe installation and generate sample motion data
"""

import cv2
import mediapipe as mp
import numpy as np
import json
import os

def create_sample_motion_data():
    """
    Create sample motion data for testing without a video file
    Simulates a simple jumping motion
    """
    print("Creating sample motion data for testing...")
    
    # Base pose (T-pose standing)
    base_landmarks = [
        # Face (0-10)
        {"x": 0.0, "y": 1.6, "z": 0.0, "visibility": 1.0},  # 0: nose
        {"x": -0.02, "y": 1.62, "z": 0.0, "visibility": 1.0},  # 1: left eye inner
        {"x": -0.04, "y": 1.62, "z": 0.0, "visibility": 1.0},  # 2: left eye
        {"x": -0.06, "y": 1.62, "z": 0.0, "visibility": 1.0},  # 3: left eye outer
        {"x": 0.02, "y": 1.62, "z": 0.0, "visibility": 1.0},   # 4: right eye inner
        {"x": 0.04, "y": 1.62, "z": 0.0, "visibility": 1.0},   # 5: right eye
        {"x": 0.06, "y": 1.62, "z": 0.0, "visibility": 1.0},   # 6: right eye outer
        {"x": -0.08, "y": 1.6, "z": 0.0, "visibility": 1.0},   # 7: left ear
        {"x": 0.08, "y": 1.6, "z": 0.0, "visibility": 1.0},    # 8: right ear
        {"x": -0.03, "y": 1.55, "z": 0.0, "visibility": 1.0},  # 9: mouth left
        {"x": 0.03, "y": 1.55, "z": 0.0, "visibility": 1.0},   # 10: mouth right
        
        # Shoulders (11-12)
        {"x": 0.2, "y": 1.4, "z": 0.0, "visibility": 1.0},     # 11: right shoulder
        {"x": -0.2, "y": 1.4, "z": 0.0, "visibility": 1.0},    # 12: left shoulder
        
        # Arms (13-22)
        {"x": 0.4, "y": 1.4, "z": 0.0, "visibility": 1.0},     # 13: right elbow
        {"x": -0.4, "y": 1.4, "z": 0.0, "visibility": 1.0},    # 14: left elbow
        {"x": 0.6, "y": 1.4, "z": 0.0, "visibility": 1.0},     # 15: right wrist
        {"x": -0.6, "y": 1.4, "z": 0.0, "visibility": 1.0},    # 16: left wrist
        {"x": 0.65, "y": 1.35, "z": 0.0, "visibility": 1.0},   # 17: right pinky
        {"x": -0.65, "y": 1.35, "z": 0.0, "visibility": 1.0},  # 18: left pinky
        {"x": 0.68, "y": 1.4, "z": 0.0, "visibility": 1.0},    # 19: right index
        {"x": -0.68, "y": 1.4, "z": 0.0, "visibility": 1.0},   # 20: left index
        {"x": 0.62, "y": 1.38, "z": 0.0, "visibility": 1.0},   # 21: right thumb
        {"x": -0.62, "y": 1.38, "z": 0.0, "visibility": 1.0},  # 22: left thumb
        
        # Hips (23-24)
        {"x": 0.1, "y": 1.0, "z": 0.0, "visibility": 1.0},     # 23: right hip
        {"x": -0.1, "y": 1.0, "z": 0.0, "visibility": 1.0},    # 24: left hip
        
        # Legs (25-32)
        {"x": 0.1, "y": 0.5, "z": 0.0, "visibility": 1.0},     # 25: right knee
        {"x": -0.1, "y": 0.5, "z": 0.0, "visibility": 1.0},    # 26: left knee
        {"x": 0.1, "y": 0.05, "z": 0.0, "visibility": 1.0},    # 27: right ankle
        {"x": -0.1, "y": 0.05, "z": 0.0, "visibility": 1.0},   # 28: left ankle
        {"x": 0.1, "y": 0.0, "z": 0.05, "visibility": 1.0},    # 29: right heel
        {"x": -0.1, "y": 0.0, "z": 0.05, "visibility": 1.0},   # 30: left heel
        {"x": 0.1, "y": 0.0, "z": 0.15, "visibility": 1.0},    # 31: right foot index
        {"x": -0.1, "y": 0.0, "z": 0.15, "visibility": 1.0},   # 32: left foot index
    ]
    
    frames = []
    fps = 30
    duration = 3  # seconds
    total_frames = int(fps * duration)
    
    for frame_num in range(total_frames):
        t = frame_num / fps
        
        # Create animation - simple jump and arm wave
        jump_height = abs(np.sin(t * np.pi * 2)) * 0.3
        arm_angle = np.sin(t * np.pi * 4) * 0.3
        
        frame_landmarks = []
        for i, landmark in enumerate(base_landmarks):
            new_landmark = landmark.copy()
            
            # Apply jump to whole body
            new_landmark["y"] += jump_height
            
            # Wave arms
            if i == 13:  # right elbow
                new_landmark["y"] += arm_angle
            elif i == 14:  # left elbow
                new_landmark["y"] -= arm_angle
            elif i == 15:  # right wrist
                new_landmark["y"] += arm_angle * 1.5
            elif i == 16:  # left wrist
                new_landmark["y"] -= arm_angle * 1.5
            
            frame_landmarks.append(new_landmark)
        
        frames.append({
            "frame_number": frame_num,
            "timestamp": t,
            "landmarks_2d": frame_landmarks,
            "landmarks_3d": frame_landmarks
        })
    
    motion_data = {
        "metadata": {
            "fps": fps,
            "frame_count": total_frames,
            "width": 1920,
            "height": 1080,
            "source_video": "sample_animation.generated"
        },
        "frames": frames
    }
    
    # Save to file
    output_path = "output/sample_motion.json"
    os.makedirs("output", exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(motion_data, f, indent=2)
    
    print(f"✓ Sample motion data created: {output_path}")
    print(f"✓ {total_frames} frames at {fps} FPS")
    print("\nYou can now:")
    print("1. Run: npm start")
    print("2. Open http://localhost:8000")
    print("3. Load the sample_motion.json file")

def test_mediapipe():
    """Test MediaPipe installation"""
    print("Testing MediaPipe installation...")
    try:
        mp_pose = mp.solutions.pose
        print("✓ MediaPipe imported successfully")
        print(f"✓ MediaPipe version: {mp.__version__}")
        return True
    except Exception as e:
        print(f"✗ Error importing MediaPipe: {e}")
        return False

def main():
    print("=" * 60)
    print("Dance Motion Capture - Setup Test")
    print("=" * 60)
    print()
    
    # Test MediaPipe
    if test_mediapipe():
        print()
        # Create sample data
        create_sample_motion_data()
        print()
        print("=" * 60)
        print("Setup test completed successfully!")
        print("=" * 60)
    else:
        print("\nPlease install dependencies:")
        print("pip install -r requirements.txt")

if __name__ == "__main__":
    main()
