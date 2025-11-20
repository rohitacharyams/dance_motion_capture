import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// KalidoKit is loaded globally via UMD bundle (note: capital K!)
const Kalidokit = window.Kalidokit || {};

/**
 * KalidoKit-powered Avatar Controller
 * Works with GLB/GLTF files (no VRM loader required)
 * Based on official KalidoKit example pattern: https://github.com/yeemachine/kalidokit/tree/main/sample/3d
 * Uses GLTFLoader and custom bone mapping instead of VRM-specific APIs
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
        this.externalModel = null;
        this.boneMappings = {};
        this.skeleton = null;
        
        // Test KalidoKit availability
        this.testKalidoKit();
        
        this.createBasicAvatar();
    }
    
    testKalidoKit() {
        console.log('=== 🔍 KalidoKit Debug Info ===');
        console.log('Kalidokit object:', Kalidokit);
        console.log('Kalidokit.Pose available?', !!Kalidokit?.Pose);
        console.log('Kalidokit.Pose.solve available?', typeof Kalidokit?.Pose?.solve === 'function');
        if (Kalidokit?.Pose) {
            console.log('✅ KalidoKit is ready!');
        } else {
            console.warn('⚠️ KalidoKit not found!');
        }
        console.log('================================');
    }
    
    async loadExternalModel(modelUrl) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                modelUrl,
                (gltf) => {
                    this.externalModel = gltf.scene;
                    this.externalModel.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    
                    // Setup bone mappings
                    this.setupBoneMappings(gltf);
                    resolve(gltf);
                },
                (progress) => {
                    console.log(`Loading model: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
                },
                (error) => {
                    console.error('Error loading model:', error);
                    reject(error);
                }
            );
        });
    }
    
    setupBoneMappings(gltf) {
        // Search for standard bone names in GLB/GLTF files (Mixamo, Ready Player Me, etc.)
        const boneNames = {
            head: ['head', 'Head', 'mixamorig:Head', 'head_0', 'Head_0'],
            neck: ['neck', 'Neck', 'mixamorig:Neck', 'neck_0', 'Neck_0'],
            spine: ['spine', 'Spine', 'mixamorig:Spine', 'spine_1', 'Spine_1', 'spine_2', 'Spine_2'],
            hips: ['hips', 'Hips', 'mixamorig:Hips', 'root', 'Root', 'pelvis', 'Pelvis', 'Hips_0'],
            rightArm: ['rightUpperArm', 'RightUpperArm', 'mixamorig:RightArm', 'rightArm', 'RightArm', 'upperarm_r', 'UpperArm_R'],
            rightForeArm: ['rightLowerArm', 'RightLowerArm', 'mixamorig:RightForeArm', 'rightForeArm', 'RightForeArm', 'lowerarm_r', 'LowerArm_R'],
            rightHand: ['rightHand', 'RightHand', 'mixamorig:RightHand', 'hand_r', 'Hand_R'],
            leftArm: ['leftUpperArm', 'LeftUpperArm', 'mixamorig:LeftArm', 'leftArm', 'LeftArm', 'upperarm_l', 'UpperArm_L'],
            leftForeArm: ['leftLowerArm', 'LeftLowerArm', 'mixamorig:LeftForeArm', 'leftForeArm', 'LeftForeArm', 'lowerarm_l', 'LowerArm_L'],
            leftHand: ['leftHand', 'LeftHand', 'mixamorig:LeftHand', 'hand_l', 'Hand_L'],
            rightUpLeg: ['rightUpperLeg', 'RightUpperLeg', 'mixamorig:RightUpLeg', 'rightUpLeg', 'RightUpLeg', 'thigh_r', 'Thigh_R'],
            rightLeg: ['rightLowerLeg', 'RightLowerLeg', 'mixamorig:RightLeg', 'rightLeg', 'RightLeg', 'calf_r', 'Calf_R'],
            rightFoot: ['rightFoot', 'RightFoot', 'mixamorig:RightFoot', 'foot_r', 'Foot_R'],
            leftUpLeg: ['leftUpperLeg', 'LeftUpperLeg', 'mixamorig:LeftUpLeg', 'leftUpLeg', 'LeftUpLeg', 'thigh_l', 'Thigh_L'],
            leftLeg: ['leftLowerLeg', 'LeftLowerLeg', 'mixamorig:LeftLeg', 'leftLeg', 'LeftLeg', 'calf_l', 'Calf_L'],
            leftFoot: ['leftFoot', 'LeftFoot', 'mixamorig:LeftFoot', 'foot_l', 'Foot_L']
        };
        
        this.boneMappings = {};
        
        // First pass: find all bones
        const allBones = [];
        gltf.scenes.forEach(scene => {
            scene.traverse((child) => {
                if (child.isBone || child.type === 'Bone') {
                    allBones.push(child);
                }
                // Also check for SkinnedMesh to get skeleton
                if (child.isSkinnedMesh && child.skeleton) {
                    this.skeleton = child.skeleton;
                }
            });
        });
        
        console.log(`📋 Found ${allBones.length} bones in model`);
        console.log('Bone names:', allBones.map(b => b.name).slice(0, 20), '...');
        
        // Second pass: map bones
        for (const [key, names] of Object.entries(boneNames)) {
            for (const bone of allBones) {
                const boneNameLower = bone.name.toLowerCase();
                for (const name of names) {
                    if (boneNameLower === name.toLowerCase() || boneNameLower.includes(name.toLowerCase())) {
                        this.boneMappings[key] = bone;
                        console.log(`✅ Mapped ${key} -> ${bone.name}`);
                        break;
                    }
                }
                if (this.boneMappings[key]) break;
            }
        }
        
        console.log(`📊 Mapped ${Object.keys(this.boneMappings).length} bones`);
    }
    
    async switchModel(modelType, customUrl) {
        // Remove old model
        if (this.avatar) {
            this.scene.remove(this.avatar);
            this.avatar = null;
        }
        
        this.modelType = modelType;
        this.externalModel = null;
        this.bones = {};
        this.boneMappings = {};
        
        if (modelType === 'basic') {
            this.createBasicAvatar();
        } else if (modelType === 'readyplayer') {
            const readyPlayerMeUrl = 'https://models.readyplayer.me/691f37327b7a88e1f6529abe.glb';
            try {
                const gltf = await this.loadExternalModel(readyPlayerMeUrl);
                this.avatar = new THREE.Group();
                this.avatar.add(this.externalModel);
                
                // Scale and position
                const box = new THREE.Box3().setFromObject(this.externalModel);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 1.8 / maxDim;
                this.externalModel.scale.setScalar(scale);
                
                box.setFromObject(this.externalModel);
                const minY = box.min.y;
                this.externalModel.position.set(1.5, -minY, 0);
                
                // FIX BACKWARDS LOADING: Rotate 180 degrees (as per KalidoKit example)
                this.externalModel.rotation.y = Math.PI;
                
                this.scene.add(this.avatar);
                console.log('✅ Ready Player Me model loaded');
            } catch (error) {
                console.error('❌ Failed to load Ready Player Me model:', error);
                this.modelType = 'basic';
                this.createBasicAvatar();
            }
        } else if (modelType === 'custom' && customUrl) {
            try {
                const gltf = await this.loadExternalModel(customUrl);
                this.avatar = new THREE.Group();
                this.avatar.add(this.externalModel);
                
                // Scale and position
                const box = new THREE.Box3().setFromObject(this.externalModel);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 1.8 / maxDim;
                this.externalModel.scale.setScalar(scale);
                
                box.setFromObject(this.externalModel);
                const minY = box.min.y;
                this.externalModel.position.set(1.5, -minY, 0);
                
                // FIX BACKWARDS LOADING: Rotate 180 degrees (as per KalidoKit example)
                this.externalModel.rotation.y = Math.PI;
                
                this.scene.add(this.avatar);
                console.log('✅ Custom model loaded');
            } catch (error) {
                console.error('❌ Failed to load custom model:', error);
                this.modelType = 'basic';
                this.createBasicAvatar();
            }
        }
    }
    
    createBasicAvatar() {
        // Create a simple rigged avatar
        this.avatar = new THREE.Group();
        this.avatar.position.copy(this.avatarOffset);
        
        const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.8 });
        const clothingMaterial = new THREE.MeshStandardMaterial({ color: 0x4a90e2, roughness: 0.7 });
        
        // Hips
        const hips = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), clothingMaterial);
        this.bones.Hips = hips;
        this.avatar.add(hips);
        
        // Spine
        const spine = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.25, 8, 16), clothingMaterial);
        spine.position.y = 0.15;
        this.bones.Spine = spine;
        hips.add(spine);
        
        // Chest
        const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.20, 8, 16), clothingMaterial);
        chest.position.y = 0.22;
        this.bones.Chest = chest;
        spine.add(chest);
        
        // Neck
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.1, 16), skinMaterial);
        neck.position.y = 0.15;
        this.bones.Neck = neck;
        chest.add(neck);
        
        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 32, 32), skinMaterial);
        head.position.y = 0.16;
        this.bones.Head = head;
        neck.add(head);
        
        // Right Arm
        const rightUpperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.22, 8, 16), skinMaterial);
        rightUpperArm.position.set(0.12, 0.08, 0);
        this.bones.RightUpperArm = rightUpperArm;
        chest.add(rightUpperArm);
        
        const rightLowerArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.20, 8, 16), skinMaterial);
        rightLowerArm.position.y = -0.13;
        this.bones.RightLowerArm = rightLowerArm;
        rightUpperArm.add(rightLowerArm);
        
        // Left Arm
        const leftUpperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.22, 8, 16), skinMaterial);
        leftUpperArm.position.set(-0.12, 0.08, 0);
        this.bones.LeftUpperArm = leftUpperArm;
        chest.add(leftUpperArm);
        
        const leftLowerArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.20, 8, 16), skinMaterial);
        leftLowerArm.position.y = -0.13;
        this.bones.LeftLowerArm = leftLowerArm;
        leftUpperArm.add(leftLowerArm);
        
        // Right Leg
        const rightUpperLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.30, 8, 16), skinMaterial);
        rightUpperLeg.position.set(0.05, -0.15, 0);
        this.bones.RightUpperLeg = rightUpperLeg;
        hips.add(rightUpperLeg);
        
        const rightLowerLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.28, 8, 16), skinMaterial);
        rightLowerLeg.position.y = -0.20;
        this.bones.RightLowerLeg = rightLowerLeg;
        rightUpperLeg.add(rightLowerLeg);
        
        // Left Leg
        const leftUpperLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.30, 8, 16), skinMaterial);
        leftUpperLeg.position.set(-0.05, -0.15, 0);
        this.bones.LeftUpperLeg = leftUpperLeg;
        hips.add(leftUpperLeg);
        
        const leftLowerLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.28, 8, 16), skinMaterial);
        leftLowerLeg.position.y = -0.20;
        this.bones.LeftLowerLeg = leftLowerLeg;
        leftUpperLeg.add(leftLowerLeg);
        
        this.scene.add(this.avatar);
    }
    
    /**
     * Rig Rotation Helper - Based on official KalidoKit example
     * @param {string} boneKey - Key in boneMappings
     * @param {Object} rotation - {x, y, z} in radians
     * @param {number} dampener - Rotation dampener (default: 1)
     * @param {number} lerpAmount - Interpolation amount (default: 0.3)
     */
    rigRotation(boneKey, rotation = { x: 0, y: 0, z: 0 }, dampener = 1, lerpAmount = 0.3) {
        if (this.modelType === 'basic') {
            // For basic avatar, use bones object
            const bone = this.bones[boneKey];
            if (!bone || !rotation) return;
            
            const euler = new THREE.Euler(
                rotation.x * dampener,
                rotation.y * dampener,
                rotation.z * dampener,
                'XYZ'
            );
            const quaternion = new THREE.Quaternion().setFromEuler(euler);
            bone.quaternion.slerp(quaternion, lerpAmount);
        } else {
            // For external models, use boneMappings
            const bone = this.boneMappings[boneKey];
            if (!bone || !rotation) return;
            
            const euler = new THREE.Euler(
                rotation.x * dampener,
                rotation.y * dampener,
                rotation.z * dampener,
                'XYZ'
            );
            const quaternion = new THREE.Quaternion().setFromEuler(euler);
            bone.quaternion.slerp(quaternion, lerpAmount);
        }
    }
    
    /**
     * Rig Position Helper - Based on official KalidoKit example
     */
    rigPosition(boneKey, position = { x: 0, y: 0, z: 0 }, dampener = 1, lerpAmount = 0.07) {
        const bone = this.modelType === 'basic' ? this.bones[boneKey] : this.boneMappings[boneKey];
        if (!bone) return;
        
        const vector = new THREE.Vector3(
            position.x * dampener,
            position.y * dampener,
            position.z * dampener
        );
        bone.position.lerp(vector, lerpAmount);
    }
    
    update(landmarks) {
        if (!landmarks || landmarks.length < 33) return;
        
        if (this.modelType !== 'basic' && this.externalModel) {
            this.updateExternalModel(landmarks);
            return;
        }
        
        if (!Kalidokit || !Kalidokit.Pose) {
            console.error('KalidoKit not loaded!');
            return;
        }
        
        const poseLandmarks = landmarks.map(lm => ({
            x: lm.x, y: lm.y, z: lm.z, visibility: lm.visibility || 1
        }));
        
        const poseWorld = landmarks.map(lm => ({
            x: lm.x, y: lm.y, z: lm.z, visibility: lm.visibility || 1
        }));
        
        try {
            const riggedPose = Kalidokit.Pose.solve(poseWorld, poseLandmarks, {
                runtime: 'mediapipe',
                enableLegs: true
            });
            
            if (!riggedPose) return;
            
            // Apply rotations using official KalidoKit pattern
            this.rigRotation('Hips', riggedPose.Hips?.rotation, 0.7);
            this.rigPosition('Hips', {
                x: -riggedPose.Hips?.position?.x || 0,
                y: (riggedPose.Hips?.position?.y || 0) + 1,
                z: -riggedPose.Hips?.position?.z || 0
            }, 1, 0.07);
            
            this.rigRotation('Chest', riggedPose.Spine, 0.25, 0.3);
            this.rigRotation('Spine', riggedPose.Spine, 0.45, 0.3);
            
            this.rigRotation('RightUpperArm', riggedPose.RightUpperArm, 1, 0.3);
            this.rigRotation('RightLowerArm', riggedPose.RightLowerArm, 1, 0.3);
            this.rigRotation('LeftUpperArm', riggedPose.LeftUpperArm, 1, 0.3);
            this.rigRotation('LeftLowerArm', riggedPose.LeftLowerArm, 1, 0.3);
            
            this.rigRotation('RightUpperLeg', riggedPose.RightUpperLeg, 1, 0.3);
            this.rigRotation('RightLowerLeg', riggedPose.RightLowerLeg, 1, 0.3);
            this.rigRotation('LeftUpperLeg', riggedPose.LeftUpperLeg, 1, 0.3);
            this.rigRotation('LeftLowerLeg', riggedPose.LeftLowerLeg, 1, 0.3);
        } catch (error) {
            console.error('KalidoKit error:', error);
        }
    }
    
    updateExternalModel(landmarks) {
        if (!Kalidokit || !Kalidokit.Pose) return;
        
        const poseLandmarks = landmarks.map(lm => ({
            x: lm.x, y: lm.y, z: lm.z, visibility: lm.visibility || 1
        }));
        
        const poseWorld = landmarks.map(lm => ({
            x: lm.x, y: lm.y, z: lm.z, visibility: lm.visibility || 1
        }));
        
        try {
            const riggedPose = Kalidokit.Pose.solve(poseWorld, poseLandmarks, {
                runtime: 'mediapipe',
                enableLegs: true
            });
            
            if (!riggedPose) return;
            
            // Apply rotations using EXACT pattern from official KalidoKit example
            this.rigRotation('hips', riggedPose.Hips?.rotation, 0.7);
            this.rigPosition('hips', {
                x: -riggedPose.Hips?.position?.x || 0,  // Reverse direction
                y: (riggedPose.Hips?.position?.y || 0) + 1,  // Add height
                z: -riggedPose.Hips?.position?.z || 0   // Reverse direction
            }, 1, 0.07);
            
            this.rigRotation('spine', riggedPose.Spine, 0.45, 0.3);
            
            this.rigRotation('rightArm', riggedPose.RightUpperArm, 1, 0.3);
            this.rigRotation('rightForeArm', riggedPose.RightLowerArm, 1, 0.3);
            this.rigRotation('leftArm', riggedPose.LeftUpperArm, 1, 0.3);
            this.rigRotation('leftForeArm', riggedPose.LeftLowerArm, 1, 0.3);
            
            this.rigRotation('rightUpLeg', riggedPose.RightUpperLeg, 1, 0.3);
            this.rigRotation('rightLeg', riggedPose.RightLowerLeg, 1, 0.3);
            this.rigRotation('leftUpLeg', riggedPose.LeftUpperLeg, 1, 0.3);
            this.rigRotation('leftLeg', riggedPose.LeftLowerLeg, 1, 0.3);
            
            // Update skeleton if available
            if (this.skeleton) {
                this.skeleton.update();
            }
        } catch (error) {
            console.error('KalidoKit error:', error);
        }
    }
    
    setVisible(visible) {
        this.visible = visible;
        if (this.avatar) {
            this.avatar.visible = visible;
        }
    }
}
