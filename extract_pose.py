"""
Dance Motion Capture - Pose Extraction Script
Extracts 2D and 3D pose landmarks from dance videos using MediaPipe
"""

import cv2
import mediapipe as mp
import json
import argparse
import os
from pathlib import Path

class PoseExtractor:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
    def extract_pose_from_video(self, video_path, output_path, visualize=True):
        """
        Extract pose landmarks from video file
        
        Args:
            video_path: Path to input video file
            output_path: Path to output JSON file
            visualize: Whether to show visualization during processing
        """
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            print(f"Error: Cannot open video file {video_path}")
            return
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        print(f"Processing video: {video_path}")
        print(f"FPS: {fps}, Frames: {frame_count}, Resolution: {width}x{height}")
        
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
            model_complexity=2,  # 0, 1, or 2. Higher = more accurate but slower
            smooth_landmarks=True,
            enable_segmentation=False,
            smooth_segmentation=False,
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
                    # Extract 2D landmarks (normalized to image dimensions)
                    for landmark in results.pose_landmarks.landmark:
                        frame_data["landmarks_2d"].append({
                            "x": landmark.x,
                            "y": landmark.y,
                            "z": landmark.z,  # Depth (relative to hip)
                            "visibility": landmark.visibility
                        })
                    
                    # Extract 3D world landmarks (in meters, origin at hips)
                    if results.pose_world_landmarks:
                        for landmark in results.pose_world_landmarks.landmark:
                            frame_data["landmarks_3d"].append({
                                "x": landmark.x,
                                "y": landmark.y,
                                "z": landmark.z,
                                "visibility": landmark.visibility
                            })
                
                motion_data["frames"].append(frame_data)
                
                # Visualization
                if visualize and results.pose_landmarks:
                    image_rgb.flags.writeable = True
                    image_bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
                    
                    # Draw pose landmarks
                    self.mp_drawing.draw_landmarks(
                        image_bgr,
                        results.pose_landmarks,
                        self.mp_pose.POSE_CONNECTIONS,
                        landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style()
                    )
                    
                    # Add frame info
                    cv2.putText(image_bgr, f"Frame: {frame_idx}/{frame_count}", 
                               (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    
                    cv2.imshow('MediaPipe Pose', image_bgr)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                
                frame_idx += 1
                
                if frame_idx % 30 == 0:
                    print(f"Processed {frame_idx}/{frame_count} frames...")
        
        cap.release()
        cv2.destroyAllWindows()
        
        # Save motion data to JSON
        print(f"\nSaving motion data to {output_path}")
        os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)
        
        with open(output_path, 'w') as f:
            json.dump(motion_data, f, indent=2)
        
        print(f"✓ Successfully extracted {frame_idx} frames")
        print(f"✓ Motion data saved to {output_path}")
        
        return motion_data

def main():
    parser = argparse.ArgumentParser(description='Extract pose landmarks from dance video')
    parser.add_argument('--input', '-i', required=True, help='Input video file path')
    parser.add_argument('--output', '-o', default='output/motion_data.json', 
                       help='Output JSON file path (default: output/motion_data.json)')
    parser.add_argument('--no-viz', action='store_true', 
                       help='Disable visualization during processing')
    
    args = parser.parse_args()
    
    # Validate input file
    if not os.path.exists(args.input):
        print(f"Error: Input file '{args.input}' does not exist")
        return
    
    # Extract pose
    extractor = PoseExtractor()
    extractor.extract_pose_from_video(
        args.input, 
        args.output, 
        visualize=not args.no_viz
    )

if __name__ == "__main__":
    main()
