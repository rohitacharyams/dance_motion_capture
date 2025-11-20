/**
 * Official KalidoKit Pattern - Adapted for GLB files and pre-processed motion data
 * Based on: https://github.com/yeemachine/kalidokit/tree/main/sample/3d
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// KalidoKit is loaded globally via UMD bundle
const Kalidokit = window.Kalidokit || {};

export class OfficialKalidoKitController {
    constructor(scene) {
        this.scene = scene;
        this.currentModel = null; // GLB model (not VRM)
        this.boneMappings = {}; // Maps KalidoKit bone names to Three.js bones
        this.skeleton = null;
        
        this.gltfLoader = new GLTFLoader();
        
        // Test KalidoKit
        console.log('=== Official KalidoKit Controller ===');
        console.log('Kalidokit available:', !!Kalidokit);
        console.log('Kalidokit.Pose available:', !!Kalidokit?.Pose);
    }
    
    /**
     * Switch model - interface for main.js
     */
    async switchModel(modelType, customUrl = null) {
        // Remove old model
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
            this.currentModel = null;
            this.boneMappings = {};
        }
        
        if (modelType === 'basic') {
            // Basic avatar - not implemented in official example, skip for now
            console.log('Basic avatar not implemented in official example');
            return;
        } else if (modelType === 'readyplayer') {
            const readyPlayerMeUrl = 'https://models.readyplayer.me/691f37327b7a88e1f6529abe.glb';
            await this.loadModel(readyPlayerMeUrl);
        } else if (modelType === 'custom' && customUrl) {
            await this.loadModel(customUrl);
        }
    }
    
    /**
     * Load GLB model and setup bone mappings
     */
    async loadModel(modelUrl) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                modelUrl,
                (gltf) => {
                    this.currentModel = gltf.scene;
                    
                    // Setup bone mappings (replacing VRM's humanoid.getBoneNode)
                    this.setupBoneMappings(gltf);
                    
                    // Scale and position model
                    const box = new THREE.Box3().setFromObject(this.currentModel);
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 1.8 / maxDim;
                    this.currentModel.scale.setScalar(scale);
                    
                    box.setFromObject(this.currentModel);
                    const minY = box.min.y;
                    this.currentModel.position.set(0, -minY, 0);
                    
                    // FIX BACKWARDS LOADING: Rotate 180 degrees (as per official example)
                    this.currentModel.rotation.y = Math.PI;
                    
                    this.scene.add(this.currentModel);
                    console.log('✅ Model loaded and positioned');
                    resolve(gltf);
                },
                (progress) => {
                    console.log(`Loading: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
                },
                (error) => {
                    console.error('Error loading model:', error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Setup bone mappings - replaces VRM's humanoid.getBoneNode()
     */
    setupBoneMappings(gltf) {
        // KalidoKit bone names (from VRM schema)
        const kalidoKitBoneNames = [
            'Hips', 'Spine', 'Chest', 'Neck', 'Head',
            'LeftUpperArm', 'LeftLowerArm', 'LeftHand',
            'RightUpperArm', 'RightLowerArm', 'RightHand',
            'LeftUpperLeg', 'LeftLowerLeg', 'LeftFoot',
            'RightUpperLeg', 'RightLowerLeg', 'RightFoot'
        ];
        
        // Common GLB bone name variations
        const boneNameVariations = {
            'Hips': ['hips', 'Hips', 'mixamorig:Hips', 'root', 'Root', 'pelvis', 'Pelvis'],
            'Spine': ['spine', 'Spine', 'mixamorig:Spine', 'spine_1', 'Spine_1', 'spine_2', 'Spine_2'],
            'Chest': ['chest', 'Chest', 'mixamorig:Spine2', 'spine_3', 'Spine_3'],
            'Neck': ['neck', 'Neck', 'mixamorig:Neck'],
            'Head': ['head', 'Head', 'mixamorig:Head'],
            'LeftUpperArm': ['leftUpperArm', 'LeftUpperArm', 'mixamorig:LeftArm', 'leftArm', 'LeftArm', 'upperarm_l'],
            'LeftLowerArm': ['leftLowerArm', 'LeftLowerArm', 'mixamorig:LeftForeArm', 'leftForeArm', 'LeftForeArm', 'lowerarm_l'],
            'LeftHand': ['leftHand', 'LeftHand', 'mixamorig:LeftHand', 'hand_l'],
            'RightUpperArm': ['rightUpperArm', 'RightUpperArm', 'mixamorig:RightArm', 'rightArm', 'RightArm', 'upperarm_r'],
            'RightLowerArm': ['rightLowerArm', 'RightLowerArm', 'mixamorig:RightForeArm', 'rightForeArm', 'RightForeArm', 'lowerarm_r'],
            'RightHand': ['rightHand', 'RightHand', 'mixamorig:RightHand', 'hand_r'],
            'LeftUpperLeg': ['leftUpperLeg', 'LeftUpperLeg', 'mixamorig:LeftUpLeg', 'leftUpLeg', 'LeftUpLeg', 'thigh_l'],
            'LeftLowerLeg': ['leftLowerLeg', 'LeftLowerLeg', 'mixamorig:LeftLeg', 'leftLeg', 'LeftLeg', 'calf_l'],
            'LeftFoot': ['leftFoot', 'LeftFoot', 'mixamorig:LeftFoot', 'foot_l'],
            'RightUpperLeg': ['rightUpperLeg', 'RightUpperLeg', 'mixamorig:RightUpLeg', 'rightUpLeg', 'RightUpLeg', 'thigh_r'],
            'RightLowerLeg': ['rightLowerLeg', 'RightLowerLeg', 'mixamorig:RightLeg', 'rightLeg', 'RightLeg', 'calf_r'],
            'RightFoot': ['rightFoot', 'RightFoot', 'mixamorig:RightFoot', 'foot_r']
        };
        
        // Find all bones in the model
        const allBones = [];
        gltf.scenes.forEach(scene => {
            scene.traverse((child) => {
                if (child.isBone || child.type === 'Bone') {
                    allBones.push(child);
                }
                if (child.isSkinnedMesh && child.skeleton) {
                    this.skeleton = child.skeleton;
                }
            });
        });
        
        console.log(`📋 Found ${allBones.length} bones in model`);
        
        // Map KalidoKit bone names to actual bones
        this.boneMappings = {};
        for (const kalidoName of kalidoKitBoneNames) {
            const variations = boneNameVariations[kalidoName] || [kalidoName];
            for (const bone of allBones) {
                const boneNameLower = bone.name.toLowerCase();
                for (const variation of variations) {
                    if (boneNameLower === variation.toLowerCase() || boneNameLower.includes(variation.toLowerCase())) {
                        this.boneMappings[kalidoName] = bone;
                        console.log(`✅ Mapped ${kalidoName} -> ${bone.name}`);
                        break;
                    }
                }
                if (this.boneMappings[kalidoName]) break;
            }
        }
        
        console.log(`📊 Mapped ${Object.keys(this.boneMappings).length} bones`);
    }
    
    /**
     * Get bone node - replaces VRM's currentVrm.humanoid.getBoneNode()
     */
    getBoneNode(name) {
        return this.boneMappings[name] || null;
    }
    
    /**
     * Rig Rotation Helper - EXACT copy from official KalidoKit example
     * @param {string} name - KalidoKit bone name (e.g., "Hips", "LeftUpperArm")
     * @param {Object} rotation - {x, y, z} in radians
     * @param {number} dampener - Rotation dampener (default: 1)
     * @param {number} lerpAmount - Interpolation amount (default: 0.3)
     */
    rigRotation(name, rotation = { x: 0, y: 0, z: 0 }, dampener = 1, lerpAmount = 0.3) {
        if (!this.currentModel) return;
        
        // Get bone using our mapping (replaces VRM's getBoneNode)
        const Part = this.getBoneNode(name);
        if (!Part) return;
        
        let euler = new THREE.Euler(
            rotation.x * dampener,
            rotation.y * dampener,
            rotation.z * dampener
        );
        let quaternion = new THREE.Quaternion().setFromEuler(euler);
        Part.quaternion.slerp(quaternion, lerpAmount); // interpolate
    }
    
    /**
     * Rig Position Helper - EXACT copy from official KalidoKit example
     */
    rigPosition(name, position = { x: 0, y: 0, z: 0 }, dampener = 1, lerpAmount = 0.3) {
        if (!this.currentModel) return;
        
        const Part = this.getBoneNode(name);
        if (!Part) return;
        
        let vector = new THREE.Vector3(
            position.x * dampener,
            position.y * dampener,
            position.z * dampener
        );
        Part.position.lerp(vector, lerpAmount); // interpolate
    }
    
    /**
     * Animate VRM - EXACT copy from official KalidoKit example
     * Adapted to work with pre-processed landmarks instead of MediaPipe results
     */
    animateVRM(landmarks) {
        if (!this.currentModel) return;
        
        // Convert our landmark format to MediaPipe-like format
        // Our landmarks are already in the correct format (33 pose landmarks)
        const poseLandmarks = landmarks.map(lm => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility || 1
        }));
        
        // For 3D landmarks, we use the same data (MediaPipe uses poseWorldLandmarks)
        const pose3DLandmarks = landmarks.map(lm => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility || 1
        }));
        
        // Create a dummy video element for KalidoKit (it needs video dimensions)
        const dummyVideo = {
            videoWidth: 720,
            videoHeight: 1280
        };
        
        // Animate Pose - EXACT pattern from official example
        if (poseLandmarks && pose3DLandmarks) {
            const riggedPose = Kalidokit.Pose.solve(pose3DLandmarks, poseLandmarks, {
                runtime: "mediapipe",
                video: dummyVideo,
            });
            
            if (!riggedPose) return;
            
            // EXACT code from official example
            this.rigRotation("Hips", riggedPose.Hips.rotation, 0.7);
            this.rigPosition(
                "Hips",
                {
                    x: -riggedPose.Hips.position.x, // Reverse direction
                    y: riggedPose.Hips.position.y + 1, // Add a bit of height
                    z: -riggedPose.Hips.position.z // Reverse direction
                },
                1,
                0.07
            );
            
            this.rigRotation("Chest", riggedPose.Spine, 0.25, 0.3);
            this.rigRotation("Spine", riggedPose.Spine, 0.45, 0.3);
            
            this.rigRotation("RightUpperArm", riggedPose.RightUpperArm, 1, 0.3);
            this.rigRotation("RightLowerArm", riggedPose.RightLowerArm, 1, 0.3);
            this.rigRotation("LeftUpperArm", riggedPose.LeftUpperArm, 1, 0.3);
            this.rigRotation("LeftLowerArm", riggedPose.LeftLowerArm, 1, 0.3);
            
            this.rigRotation("LeftUpperLeg", riggedPose.LeftUpperLeg, 1, 0.3);
            this.rigRotation("LeftLowerLeg", riggedPose.LeftLowerLeg, 1, 0.3);
            this.rigRotation("RightUpperLeg", riggedPose.RightUpperLeg, 1, 0.3);
            this.rigRotation("RightLowerLeg", riggedPose.RightLowerLeg, 1, 0.3);
        }
        
        // Update skeleton if available
        if (this.skeleton) {
            this.skeleton.update();
        }
    }
    
    /**
     * Update with landmarks - called from main app
     */
    update(landmarks) {
        if (!landmarks || landmarks.length < 33) return;
        this.animateVRM(landmarks);
    }
    
    setVisible(visible) {
        if (this.currentModel) {
            this.currentModel.visible = visible;
        }
    }
}

