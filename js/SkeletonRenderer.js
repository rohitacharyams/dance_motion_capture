import * as THREE from 'three';

// MediaPipe Pose landmark connections
const POSE_CONNECTIONS = [
    // Face
    [0, 1], [1, 2], [2, 3], [3, 7],
    [0, 4], [4, 5], [5, 6], [6, 8],
    [9, 10],
    
    // Torso
    [11, 12], // Shoulders
    [11, 23], [12, 24], // Shoulders to hips
    [23, 24], // Hips
    
    // Right arm
    [11, 13], [13, 15], // Shoulder to elbow to wrist
    [15, 17], [15, 19], [15, 21], // Wrist to hand
    [17, 19], // Hand connections
    
    // Left arm
    [12, 14], [14, 16], // Shoulder to elbow to wrist
    [16, 18], [16, 20], [16, 22], // Wrist to hand
    [18, 20], // Hand connections
    
    // Right leg
    [23, 25], [25, 27], // Hip to knee to ankle
    [27, 29], [27, 31], // Ankle to foot
    [29, 31], // Foot
    
    // Left leg
    [24, 26], [26, 28], // Hip to knee to ankle
    [28, 30], [28, 32], // Ankle to foot
    [30, 32], // Foot
];

export class SkeletonRenderer {
    constructor(scene) {
        this.scene = scene;
        this.joints = [];
        this.bones = [];
        this.visible = true;
        
        this.createSkeleton();
    }
    
    createSkeleton() {
        // Offset for positioning skeleton to the left
        this.skeletonOffset = new THREE.Vector3(-1.5, 0, 0);
        
        // Create 33 joint spheres (MediaPipe has 33 landmarks)
        const jointGeometry = new THREE.SphereGeometry(0.04, 20, 20);  // Increased from 0.02 to 0.04
        const jointMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.5,
            roughness: 0.3,
            metalness: 0.8
        });
        
        for (let i = 0; i < 33; i++) {
            const joint = new THREE.Mesh(jointGeometry, jointMaterial);
            joint.visible = false;
            this.scene.add(joint);
            this.joints.push(joint);
        }
        
        // Create bone connections using tubes for thickness
        this.boneMeshes = [];
        
        // Create tube bones for better visibility
        const boneMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.3,
            roughness: 0.4,
            metalness: 0.6
        });
        
        POSE_CONNECTIONS.forEach(() => {
            // Create a cylinder for each bone connection
            const boneGeometry = new THREE.CylinderGeometry(0.015, 0.015, 1, 8);  // Thicker bones
            const bone = new THREE.Mesh(boneGeometry, boneMaterial);
            bone.visible = false;
            bone.castShadow = true;
            this.scene.add(bone);
            this.bones.push(bone);
        });
    }
    
    update(landmarks) {
        if (!landmarks || landmarks.length < 33) {
            console.warn('Invalid landmarks data');
            return;
        }
        
        // Update joint positions
        landmarks.forEach((landmark, i) => {
            if (i < this.joints.length && landmark.visibility > 0.5) {
                // MediaPipe world coordinates are in meters, origin at hips
                // MediaPipe Y is down, Three.js Y is up, so flip Y
                // Z is forward (towards camera), flip to match Three.js
                this.joints[i].position.set(
                    landmark.x + this.skeletonOffset.x,
                    -landmark.y + this.skeletonOffset.y,  // Flip Y axis
                    -landmark.z + this.skeletonOffset.z   // Flip Z to match Three.js convention
                );
                this.joints[i].visible = this.visible;
            } else if (i < this.joints.length) {
                this.joints[i].visible = false;
            }
        });
        
        // Update bone connections (now using cylinders)
        POSE_CONNECTIONS.forEach((connection, i) => {
            const [startIdx, endIdx] = connection;
            const startLandmark = landmarks[startIdx];
            const endLandmark = landmarks[endIdx];
            
            if (startLandmark.visibility > 0.5 && endLandmark.visibility > 0.5) {
                // Calculate positions with offset
                const start = new THREE.Vector3(
                    startLandmark.x + this.skeletonOffset.x,
                    -startLandmark.y + this.skeletonOffset.y,
                    -startLandmark.z + this.skeletonOffset.z
                );
                const end = new THREE.Vector3(
                    endLandmark.x + this.skeletonOffset.x,
                    -endLandmark.y + this.skeletonOffset.y,
                    -endLandmark.z + this.skeletonOffset.z
                );
                
                // Position bone at midpoint
                const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
                this.bones[i].position.copy(midpoint);
                
                // Orient bone to connect the two points
                const direction = new THREE.Vector3().subVectors(end, start);
                const length = direction.length();
                this.bones[i].scale.y = length;
                
                // Align cylinder with direction
                const axis = new THREE.Vector3(0, 1, 0);
                this.bones[i].quaternion.setFromUnitVectors(axis, direction.clone().normalize());
                
                this.bones[i].visible = this.visible;
            } else {
                this.bones[i].visible = false;
            }
        });
    }
    
    setVisible(visible) {
        this.visible = visible;
        this.joints.forEach(joint => {
            if (joint.visible) joint.visible = visible;
        });
        this.bones.forEach(bone => {
            if (bone.visible) bone.visible = visible;
        });
    }
    
    dispose() {
        this.joints.forEach(joint => {
            this.scene.remove(joint);
            joint.geometry.dispose();
            joint.material.dispose();
        });
        
        this.bones.forEach(bone => {
            this.scene.remove(bone);
            bone.geometry.dispose();
            bone.material.dispose();
        });
    }
}
