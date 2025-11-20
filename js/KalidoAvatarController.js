import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// KalidoKit is loaded globally via UMD bundle (note: capital K!)
const Kalidokit = window.Kalidokit || {};

/**
 * KalidoKit-powered Avatar Controller
 * Uses proper kinematics and rotations for realistic animation
 */
export class KalidoAvatarController {
    constructor(scene) {
        this.scene = scene;
        this.avatar = null;
        this.bones = {};
        this.visible = true;
        this.avatarOffset = new THREE.Vector3(1.5, 0, 0);
        
        this.gltfLoader = new GLTFLoader();
        this.modelType = 'basic';
        
        // Debug: Check what's available
        console.log('Window object keys:', Object.keys(window).filter(k => k.toLowerCase().includes('kalido')));
        console.log('Kalidokit available?', Kalidokit);
        
        this.createBasicAvatar();
    }
    
    createBasicAvatar() {
        // Create a simple rigged avatar with proper bone hierarchy
        this.avatar = new THREE.Group();
        this.avatar.position.copy(this.avatarOffset);
        
        // Materials
        const skinMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffdbac,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const clothingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4a90e2,
            roughness: 0.7
        });
        
        const shoesMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            roughness: 0.9
        });
        
        // Hips (root bone)
        const hipsGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const hips = new THREE.Mesh(hipsGeometry, clothingMaterial);
        hips.castShadow = true;
        this.bones.Hips = hips;
        this.avatar.add(hips);
        
        // Spine
        const spineGeometry = new THREE.CapsuleGeometry(0.06, 0.25, 8, 16);
        const spine = new THREE.Mesh(spineGeometry, clothingMaterial);
        spine.position.y = 0.15;
        spine.castShadow = true;
        this.bones.Spine = spine;
        hips.add(spine);
        
        // Chest/Upper Spine
        const chestGeometry = new THREE.CapsuleGeometry(0.08, 0.20, 8, 16);
        const chest = new THREE.Mesh(chestGeometry, clothingMaterial);
        chest.position.y = 0.22;
        chest.castShadow = true;
        this.bones.Chest = chest;
        spine.add(chest);
        
        // Neck
        const neckGeometry = new THREE.CylinderGeometry(0.04, 0.045, 0.1, 16);
        const neck = new THREE.Mesh(neckGeometry, skinMaterial);
        neck.position.y = 0.15;
        neck.castShadow = true;
        this.bones.Neck = neck;
        chest.add(neck);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.11, 32, 32);
        const head = new THREE.Mesh(headGeometry, skinMaterial);
        head.position.y = 0.16;
        head.castShadow = true;
        this.bones.Head = head;
        neck.add(head);
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.015, 16, 16);
        const leftEye = new THREE.Mesh(eyeGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
        leftEye.position.set(-0.04, 0.02, 0.09);
        head.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
        rightEye.position.set(0.04, 0.02, 0.09);
        head.add(rightEye);
        
        // Right Arm Chain
        const rightShoulderGeometry = new THREE.SphereGeometry(0.055, 16, 16);
        const rightShoulder = new THREE.Mesh(rightShoulderGeometry, clothingMaterial);
        rightShoulder.position.set(0.12, 0.08, 0);
        rightShoulder.castShadow = true;
        this.bones.RightShoulder = rightShoulder;
        chest.add(rightShoulder);
        
        const rightUpperArmGeometry = new THREE.CapsuleGeometry(0.035, 0.22, 8, 16);
        const rightUpperArm = new THREE.Mesh(rightUpperArmGeometry, skinMaterial);
        rightUpperArm.position.y = -0.14;
        rightUpperArm.castShadow = true;
        this.bones.RightUpperArm = rightUpperArm;
        rightShoulder.add(rightUpperArm);
        
        const rightLowerArmGeometry = new THREE.CapsuleGeometry(0.03, 0.20, 8, 16);
        const rightLowerArm = new THREE.Mesh(rightLowerArmGeometry, skinMaterial);
        rightLowerArm.position.y = -0.13;
        rightLowerArm.castShadow = true;
        this.bones.RightLowerArm = rightLowerArm;
        rightUpperArm.add(rightLowerArm);
        
        const rightHandGeometry = new THREE.SphereGeometry(0.04, 12, 12);
        const rightHand = new THREE.Mesh(rightHandGeometry, skinMaterial);
        rightHand.position.y = -0.12;
        rightHand.castShadow = true;
        this.bones.RightHand = rightHand;
        rightLowerArm.add(rightHand);
        
        // Left Arm Chain (mirror of right)
        const leftShoulderGeometry = new THREE.SphereGeometry(0.055, 16, 16);
        const leftShoulder = new THREE.Mesh(leftShoulderGeometry, clothingMaterial);
        leftShoulder.position.set(-0.12, 0.08, 0);
        leftShoulder.castShadow = true;
        this.bones.LeftShoulder = leftShoulder;
        chest.add(leftShoulder);
        
        const leftUpperArmGeometry = new THREE.CapsuleGeometry(0.035, 0.22, 8, 16);
        const leftUpperArm = new THREE.Mesh(leftUpperArmGeometry, skinMaterial);
        leftUpperArm.position.y = -0.14;
        leftUpperArm.castShadow = true;
        this.bones.LeftUpperArm = leftUpperArm;
        leftShoulder.add(leftUpperArm);
        
        const leftLowerArmGeometry = new THREE.CapsuleGeometry(0.03, 0.20, 8, 16);
        const leftLowerArm = new THREE.Mesh(leftLowerArmGeometry, skinMaterial);
        leftLowerArm.position.y = -0.13;
        leftLowerArm.castShadow = true;
        this.bones.LeftLowerArm = leftLowerArm;
        leftUpperArm.add(leftLowerArm);
        
        const leftHandGeometry = new THREE.SphereGeometry(0.04, 12, 12);
        const leftHand = new THREE.Mesh(leftHandGeometry, skinMaterial);
        leftHand.position.y = -0.12;
        leftHand.castShadow = true;
        this.bones.LeftHand = leftHand;
        leftLowerArm.add(leftHand);
        
        // Right Leg Chain
        const rightUpperLegGeometry = new THREE.CapsuleGeometry(0.055, 0.35, 8, 16);
        const rightUpperLeg = new THREE.Mesh(rightUpperLegGeometry, clothingMaterial);
        rightUpperLeg.position.set(0.08, -0.20, 0);
        rightUpperLeg.castShadow = true;
        this.bones.RightUpperLeg = rightUpperLeg;
        hips.add(rightUpperLeg);
        
        const rightLowerLegGeometry = new THREE.CapsuleGeometry(0.045, 0.35, 8, 16);
        const rightLowerLeg = new THREE.Mesh(rightLowerLegGeometry, skinMaterial);
        rightLowerLeg.position.y = -0.22;
        rightLowerLeg.castShadow = true;
        this.bones.RightLowerLeg = rightLowerLeg;
        rightUpperLeg.add(rightLowerLeg);
        
        const rightFootGeometry = new THREE.BoxGeometry(0.06, 0.04, 0.14);
        const rightFoot = new THREE.Mesh(rightFootGeometry, shoesMaterial);
        rightFoot.position.set(0, -0.20, 0.04);
        rightFoot.castShadow = true;
        this.bones.RightFoot = rightFoot;
        rightLowerLeg.add(rightFoot);
        
        // Left Leg Chain
        const leftUpperLegGeometry = new THREE.CapsuleGeometry(0.055, 0.35, 8, 16);
        const leftUpperLeg = new THREE.Mesh(leftUpperLegGeometry, clothingMaterial);
        leftUpperLeg.position.set(-0.08, -0.20, 0);
        leftUpperLeg.castShadow = true;
        this.bones.LeftUpperLeg = leftUpperLeg;
        hips.add(leftUpperLeg);
        
        const leftLowerLegGeometry = new THREE.CapsuleGeometry(0.045, 0.35, 8, 16);
        const leftLowerLeg = new THREE.Mesh(leftLowerLegGeometry, skinMaterial);
        leftLowerLeg.position.y = -0.22;
        leftLowerLeg.castShadow = true;
        this.bones.LeftLowerLeg = leftLowerLeg;
        leftUpperLeg.add(leftLowerLeg);
        
        const leftFootGeometry = new THREE.BoxGeometry(0.06, 0.04, 0.14);
        const leftFoot = new THREE.Mesh(leftFootGeometry, shoesMaterial);
        leftFoot.position.set(0, -0.20, 0.04);
        leftFoot.castShadow = true;
        this.bones.LeftFoot = leftFoot;
        leftLowerLeg.add(leftFoot);
        
        this.scene.add(this.avatar);
    }
    
    update(landmarks) {
        if (!landmarks || landmarks.length < 33) {
            console.warn('Invalid landmarks:', landmarks);
            return;
        }
        
        // Check if KalidoKit is loaded
        if (!Kalidokit || !Kalidokit.Pose) {
            console.error('KalidoKit not loaded! Check if script is included.');
            return;
        }
        
        // Convert MediaPipe landmarks to format KalidoKit expects
        const poseLandmarks = landmarks.map(lm => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility || 1
        }));
        
        const poseWorld = landmarks.map(lm => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility || 1
        }));
        
        // Use KalidoKit to calculate proper rotations
        try {
            const riggedPose = Kalidokit.Pose.solve(poseWorld, poseLandmarks, {
                runtime: 'mediapipe',
                enableLegs: true
            });
            
            if (!riggedPose) {
                console.warn('KalidoKit returned null pose');
                return;
            }
            
            // Apply KalidoKit rotations to our bones
            this.applyRotations(riggedPose);
            
            // Position hips at world position
            if (riggedPose.Hips && riggedPose.Hips.position) {
                this.bones.Hips.position.set(
                    riggedPose.Hips.position.x,
                    riggedPose.Hips.position.y + 0.9, // Offset to ground level
                    -riggedPose.Hips.position.z
                );
            }
        } catch (error) {
            console.error('KalidoKit error:', error);
        }
    }
    
    applyRotations(riggedPose) {
        // Helper to apply euler rotations with smoothing
        const applyRotation = (boneName, rotation, smoothing = 0.3) => {
            const bone = this.bones[boneName];
            if (!bone || !rotation) return;
            
            // Convert from KalidoKit's euler angles (radians) to Three.js Euler
            const targetEuler = new THREE.Euler(
                rotation.x || 0,
                rotation.y || 0,
                rotation.z || 0,
                'XYZ'
            );
            
            // Smooth interpolation
            const currentQuat = bone.quaternion.clone();
            const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler);
            bone.quaternion.slerpQuaternions(currentQuat, targetQuat, smoothing);
        };
        
        // Apply all bone rotations from KalidoKit
        if (riggedPose.Hips) applyRotation('Hips', riggedPose.Hips.rotation);
        if (riggedPose.Spine) applyRotation('Spine', riggedPose.Spine);
        if (riggedPose.Chest) applyRotation('Chest', riggedPose.Spine); // Use spine for chest too
        if (riggedPose.Neck) applyRotation('Neck', riggedPose.Spine, 0.5);
        if (riggedPose.Head) applyRotation('Head', riggedPose.Spine, 0.5);
        
        // Arms
        applyRotation('RightUpperArm', riggedPose.RightUpperArm);
        applyRotation('RightLowerArm', riggedPose.RightLowerArm);
        applyRotation('RightHand', riggedPose.RightHand);
        applyRotation('LeftUpperArm', riggedPose.LeftUpperArm);
        applyRotation('LeftLowerArm', riggedPose.LeftLowerArm);
        applyRotation('LeftHand', riggedPose.LeftHand);
        
        // Legs
        applyRotation('RightUpperLeg', riggedPose.RightUpperLeg);
        applyRotation('RightLowerLeg', riggedPose.RightLowerLeg);
        applyRotation('RightFoot', riggedPose.RightFoot);
        applyRotation('LeftUpperLeg', riggedPose.LeftUpperLeg);
        applyRotation('LeftLowerLeg', riggedPose.LeftLowerLeg);
        applyRotation('LeftFoot', riggedPose.LeftFoot);
    }
    
    setVisible(visible) {
        this.visible = visible;
        this.avatar.visible = visible;
    }
    
    dispose() {
        this.scene.remove(this.avatar);
    }
}
