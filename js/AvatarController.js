import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Bone mapping from MediaPipe landmarks to avatar skeleton
const MEDIAPIPE_BONES = {
    // Head/Neck
    HEAD: { start: 0, end: null, parent: 'NECK' },
    NECK: { start: null, mid: [11, 12], end: 0 }, // Average of shoulders to nose
    
    // Spine
    SPINE_UPPER: { start: null, mid: [11, 12], end: null, midLower: [23, 24] },
    SPINE_LOWER: { start: null, mid: [23, 24], end: null },
    
    // Right Arm
    RIGHT_SHOULDER: { start: 11, end: 13 },
    RIGHT_UPPER_ARM: { start: 13, end: 15 },
    RIGHT_FOREARM: { start: 15, end: 17 },
    RIGHT_HAND: { start: 17, end: 19 },
    
    // Left Arm
    LEFT_SHOULDER: { start: 12, end: 14 },
    LEFT_UPPER_ARM: { start: 14, end: 16 },
    LEFT_FOREARM: { start: 16, end: 18 },
    LEFT_HAND: { start: 18, end: 20 },
    
    // Right Leg
    RIGHT_HIP: { start: 23, end: 25 },
    RIGHT_UPPER_LEG: { start: 25, end: 27 },
    RIGHT_LOWER_LEG: { start: 27, end: 29 },
    RIGHT_FOOT: { start: 29, end: 31 },
    
    // Left Leg
    LEFT_HIP: { start: 24, end: 26 },
    LEFT_UPPER_LEG: { start: 26, end: 28 },
    LEFT_LOWER_LEG: { start: 28, end: 30 },
    LEFT_FOOT: { start: 30, end: 32 },
};

export class AvatarController {
    constructor(scene) {
        this.scene = scene;
        this.avatar = null;
        this.bones = {};
        this.visible = true;
        this.modelType = 'basic'; // 'basic', 'readyplayer', 'custom'
        this.externalModel = null; // For loaded GLTF models
        this.boneMappings = {}; // Maps MediaPipe to model bones
        this.gltfLoader = new GLTFLoader();
        
        this.createAvatar();
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
                    
                    // Auto-detect bones in the model
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
        // Search for standard bone names (Mixamo, VRM, etc.)
        const boneNames = {
            head: ['head', 'Head', 'mixamorig:Head'],
            neck: ['neck', 'Neck', 'mixamorig:Neck'],
            spine: ['spine', 'Spine', 'mixamorig:Spine', 'mixamorig:Spine1', 'mixamorig:Spine2'],
            hips: ['hips', 'Hips', 'mixamorig:Hips'],
            leftShoulder: ['LeftShoulder', 'leftShoulder', 'mixamorig:LeftShoulder'],
            leftArm: ['LeftArm', 'leftArm', 'mixamorig:LeftArm'],
            leftForeArm: ['LeftForeArm', 'leftForeArm', 'mixamorig:LeftForeArm'],
            leftHand: ['LeftHand', 'leftHand', 'mixamorig:LeftHand'],
            rightShoulder: ['RightShoulder', 'rightShoulder', 'mixamorig:RightShoulder'],
            rightArm: ['RightArm', 'rightArm', 'mixamorig:RightArm'],
            rightForeArm: ['RightForeArm', 'rightForeArm', 'mixamorig:RightForeArm'],
            rightHand: ['RightHand', 'rightHand', 'mixamorig:RightHand'],
            leftUpLeg: ['LeftUpLeg', 'leftUpLeg', 'mixamorig:LeftUpLeg'],
            leftLeg: ['LeftLeg', 'leftLeg', 'mixamorig:LeftLeg'],
            leftFoot: ['LeftFoot', 'leftFoot', 'mixamorig:LeftFoot'],
            rightUpLeg: ['RightUpLeg', 'rightUpLeg', 'mixamorig:RightUpLeg'],
            rightLeg: ['RightLeg', 'rightLeg', 'mixamorig:RightLeg'],
            rightFoot: ['RightFoot', 'rightFoot', 'mixamorig:RightFoot']
        };
        
        gltf.scene.traverse((object) => {
            if (object.isBone || object.type === 'Bone') {
                for (const [key, names] of Object.entries(boneNames)) {
                    if (names.some(name => object.name.includes(name))) {
                        this.boneMappings[key] = object;
                        break;
                    }
                }
            }
        });
        
        console.log('Bone mappings detected:', Object.keys(this.boneMappings));
    }
    
    async switchModel(modelType, customUrl = null) {
        // Remove existing model
        if (this.avatar) {
            this.scene.remove(this.avatar);
        }
        
        this.modelType = modelType;
        
        if (modelType === 'basic') {
            this.externalModel = null;
            this.createAvatar();
        } else if (modelType === 'readyplayer') {
            // Load a sample Ready Player Me model
            const sampleUrl = 'https://models.readyplayer.me/64bfa40f0e72c63d7c3934a0.glb';
            try {
                const gltf = await this.loadExternalModel(sampleUrl);
                this.avatar = new THREE.Group();
                this.avatar.add(this.externalModel);
                
                // Position and scale
                this.externalModel.scale.setScalar(1);
                this.externalModel.position.set(1.5, -0.9, 0);
                
                this.scene.add(this.avatar);
            } catch (error) {
                console.error('Failed to load Ready Player Me model, falling back to basic:', error);
                this.modelType = 'basic';
                this.createAvatar();
            }
        } else if (modelType === 'custom' && customUrl) {
            try {
                const gltf = await this.loadExternalModel(customUrl);
                this.avatar = new THREE.Group();
                this.avatar.add(this.externalModel);
                
                // Auto-scale to reasonable size
                const box = new THREE.Box3().setFromObject(this.externalModel);
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 1.8 / maxDim; // Target height ~1.8 units
                this.externalModel.scale.setScalar(scale);
                this.externalModel.position.set(1.5, -0.9, 0);
                
                this.scene.add(this.avatar);
            } catch (error) {
                console.error('Failed to load custom model, falling back to basic:', error);
                this.modelType = 'basic';
                this.createAvatar();
            }
        }
    }
    
    createAvatar() {
        // Create a realistic humanoid avatar with detailed features
        this.avatar = new THREE.Group();
        
        // Offset for positioning avatar to the right
        this.avatarOffset = new THREE.Vector3(1.5, 0, 0);
        
        // Realistic materials
        const skinMaterial = new THREE.MeshStandardMaterial({
            color: 0xffdbac,
            roughness: 0.85,
            metalness: 0.05
        });
        
        const faceMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd5b3,  // Slightly lighter for face
            roughness: 0.9,
            metalness: 0.02
        });
        
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0x3d2817,  // Brown eyes
            roughness: 0.3,
            metalness: 0.1
        });
        
        const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.7,
            metalness: 0.0
        });
        
        const clothingMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.9,
            metalness: 0.05
        });
        
        const shoesMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.6,
            metalness: 0.2
        });
        
        const hairMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c1810,
            roughness: 0.95,
            metalness: 0
        });
        
        const jointMaterial = skinMaterial;
        
        // Head base - slightly larger for better proportions
        const headGeometry = new THREE.SphereGeometry(0.11, 32, 32);
        const head = new THREE.Mesh(headGeometry, faceMaterial);
        head.castShadow = true;
        head.receiveShadow = true;
        this.bones.head = head;
        this.avatar.add(head);
        
        // Hair - fuller style matching head size
        const hairGeometry = new THREE.SphereGeometry(0.115, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.65);
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.castShadow = true;
        this.bones.hair = hair;
        this.avatar.add(hair);
        
        // Eyes - proportional to head
        const eyeGeometry = new THREE.SphereGeometry(0.015, 16, 16);
        const leftEyeWhite = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        const rightEyeWhite = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
        
        const pupilGeometry = new THREE.SphereGeometry(0.008, 12, 12);
        const leftPupil = new THREE.Mesh(pupilGeometry, eyeMaterial);
        const rightPupil = new THREE.Mesh(pupilGeometry, eyeMaterial);
        
        this.bones.leftEyeWhite = leftEyeWhite;
        this.bones.rightEyeWhite = rightEyeWhite;
        this.bones.leftPupil = leftPupil;
        this.bones.rightPupil = rightPupil;
        
        this.avatar.add(leftEyeWhite, rightEyeWhite, leftPupil, rightPupil);
        
        // Nose - subtle and proportional
        const noseGeometry = new THREE.ConeGeometry(0.012, 0.025, 8);
        const nose = new THREE.Mesh(noseGeometry, faceMaterial);
        nose.castShadow = true;
        this.bones.nose = nose;
        this.avatar.add(nose);
        
        // Mouth area - proportional
        const mouthGeometry = new THREE.SphereGeometry(0.02, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const mouth = new THREE.Mesh(mouthGeometry, new THREE.MeshStandardMaterial({
            color: 0xff9999,
            roughness: 0.95,
            metalness: 0
        }));
        this.bones.mouth = mouth;
        this.avatar.add(mouth);
        
        // Ears - proportional to head
        const earGeometry = new THREE.SphereGeometry(0.02, 16, 16, 0, Math.PI, 0, Math.PI);
        const leftEar = new THREE.Mesh(earGeometry, faceMaterial);
        const rightEar = new THREE.Mesh(earGeometry, faceMaterial);
        leftEar.castShadow = true;
        rightEar.castShadow = true;
        this.bones.leftEar = leftEar;
        this.bones.rightEar = rightEar;
        this.avatar.add(leftEar, rightEar);
        
        // Neck - proportional to head
        const neckGeometry = new THREE.CylinderGeometry(0.04, 0.045, 0.1, 16);
        const neck = new THREE.Mesh(neckGeometry, skinMaterial);
        neck.castShadow = true;
        neck.receiveShadow = true;
        this.bones.neck = neck;
        this.avatar.add(neck);
        
        // Torso - upper (shirt) with better proportions
        const torsoGeometry = new THREE.CapsuleGeometry(0.14, 0.35, 16, 32);
        const torso = new THREE.Mesh(torsoGeometry, clothingMaterial);
        torso.castShadow = true;
        torso.receiveShadow = true;
        this.bones.torso = torso;
        this.avatar.add(torso);
        
        // Create limb function with material selection
        const createLimb = (radius, length, material = skinMaterial) => {
            const geometry = new THREE.CapsuleGeometry(radius, length, 12, 24);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        };
        
        const createJoint = (radius = 0.05, material = jointMaterial) => {
            const geometry = new THREE.SphereGeometry(radius, 20, 20);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        };
        
        // Helper to create hand with fingers
        const createHand = (material) => {
            const handGroup = new THREE.Group();
            
            // Palm - realistic hand size
            const palmGeometry = new THREE.BoxGeometry(0.05, 0.07, 0.018);
            const palm = new THREE.Mesh(palmGeometry, material);
            palm.castShadow = true;
            handGroup.add(palm);
            
            // Fingers (5 fingers) - realistic proportions
            const fingerPositions = [
                { x: -0.020, name: 'thumb', length: 0.030 },
                { x: -0.010, name: 'index', length: 0.035 },
                { x: 0, name: 'middle', length: 0.038 },
                { x: 0.010, name: 'ring', length: 0.035 },
                { x: 0.020, name: 'pinky', length: 0.028 }
            ];
            
            fingerPositions.forEach(finger => {
                const fingerGeometry = new THREE.CapsuleGeometry(0.005, finger.length, 4, 8);
                const fingerMesh = new THREE.Mesh(fingerGeometry, material);
                fingerMesh.position.set(finger.x, 0.05, 0);
                fingerMesh.rotation.z = 0;
                fingerMesh.castShadow = true;
                handGroup.add(fingerMesh);
            });
            
            return handGroup;
        };
        
        // Right Arm (skin tone for exposed arms) - realistic proportions
        this.bones.rightShoulder = createJoint(0.055, skinMaterial);
        this.bones.rightUpperArm = createLimb(0.038, 0.22, skinMaterial);
        this.bones.rightElbow = createJoint(0.042, skinMaterial);
        this.bones.rightForearm = createLimb(0.035, 0.20, skinMaterial);
        this.bones.rightWrist = createJoint(0.032, skinMaterial);
        this.bones.rightHand = createHand(skinMaterial);
        this.bones.rightHand.castShadow = true;
        
        // Left Arm (skin tone for exposed arms) - realistic proportions
        this.bones.leftShoulder = createJoint(0.055, skinMaterial);
        this.bones.leftUpperArm = createLimb(0.038, 0.22, skinMaterial);
        this.bones.leftElbow = createJoint(0.042, skinMaterial);
        this.bones.leftForearm = createLimb(0.035, 0.20, skinMaterial);
        this.bones.leftWrist = createJoint(0.032, skinMaterial);
        this.bones.leftHand = createHand(skinMaterial);
        this.bones.leftHand.castShadow = true;
        
        // Helper to create detailed foot
        const createFoot = (material) => {
            const footGroup = new THREE.Group();
            
            // Main foot/shoe - realistic proportions
            const footGeometry = new THREE.BoxGeometry(0.055, 0.035, 0.13);
            const footMesh = new THREE.Mesh(footGeometry, material);
            footMesh.castShadow = true;
            footMesh.receiveShadow = true;
            footGroup.add(footMesh);
            
            // Toe cap - realistic size
            const toeGeometry = new THREE.SphereGeometry(0.027, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
            const toeMesh = new THREE.Mesh(toeGeometry, material);
            toeMesh.position.set(0, -0.01, 0.065);
            toeMesh.rotation.x = Math.PI / 2;
            toeMesh.castShadow = true;
            footGroup.add(toeMesh);
            
            return footGroup;
        };
        
        // Right Leg (clothing material for pants) - realistic proportions
        this.bones.rightHip = createJoint(0.065, clothingMaterial);
        this.bones.rightUpperLeg = createLimb(0.058, 0.35, clothingMaterial);
        this.bones.rightKnee = createJoint(0.052, clothingMaterial);
        this.bones.rightLowerLeg = createLimb(0.050, 0.34, clothingMaterial);
        this.bones.rightAnkle = createJoint(0.042, skinMaterial);
        this.bones.rightFoot = createFoot(shoesMaterial);
        
        // Left Leg (clothing material for pants) - realistic proportions
        this.bones.leftHip = createJoint(0.065, clothingMaterial);
        this.bones.leftUpperLeg = createLimb(0.058, 0.35, clothingMaterial);
        this.bones.leftKnee = createJoint(0.052, clothingMaterial);
        this.bones.leftLowerLeg = createLimb(0.050, 0.34, clothingMaterial);
        this.bones.leftAnkle = createJoint(0.042, skinMaterial);
        this.bones.leftFoot = createFoot(shoesMaterial);
        
        // Add all bones to avatar
        Object.values(this.bones).forEach(bone => {
            if (bone !== this.bones.head && bone !== this.bones.neck && bone !== this.bones.torso) {
                this.avatar.add(bone);
            }
        });
        
        this.scene.add(this.avatar);
    }
    
    update(landmarks) {
        if (!landmarks || landmarks.length < 33) return;
        
        // If using external model, use bone-based animation
        if (this.modelType !== 'basic' && this.externalModel) {
            this.updateExternalModel(landmarks);
            return;
        }
        
        // Store landmarks for getLandmarkSafe method
        this.currentLandmarks = landmarks;
        
        const getLandmark = (idx) => {
            const lm = landmarks[idx];
            // MediaPipe Y is down, Three.js Y is up, so flip Y
            // Add offset to position avatar to the right
            return new THREE.Vector3(
                lm.x + this.avatarOffset.x, 
                -lm.y + this.avatarOffset.y, 
                -lm.z + this.avatarOffset.z
            );
        };
        
        const getMidpoint = (idx1, idx2) => {
            const p1 = getLandmark(idx1);
            const p2 = getLandmark(idx2);
            return p1.clone().add(p2).multiplyScalar(0.5);
        };
        
        // Position and orient bones based on landmarks
        try {
            // Head - position at nose landmark
            const noseLandmark = getLandmark(0);
            this.bones.head.position.copy(noseLandmark);
            
            // Hair follows head
            if (this.bones.hair) {
                this.bones.hair.position.copy(noseLandmark);
                this.bones.hair.position.y += 0.02;
            }
            
            // Position facial features
            if (this.bones.leftEyeWhite) {
                const leftEye = getLandmark(2);
                this.bones.leftEyeWhite.position.copy(leftEye);
                this.bones.leftPupil.position.copy(leftEye);
                this.bones.leftPupil.position.z += 0.008; // Slightly forward
            }
            
            if (this.bones.rightEyeWhite) {
                const rightEye = getLandmark(5);
                this.bones.rightEyeWhite.position.copy(rightEye);
                this.bones.rightPupil.position.copy(rightEye);
                this.bones.rightPupil.position.z += 0.008;
            }
            
            if (this.bones.nose) {
                this.bones.nose.position.copy(noseLandmark);
                this.bones.nose.position.z += 0.015;
                this.bones.nose.rotation.x = Math.PI;
            }
            
            if (this.bones.mouth) {
                const mouthLeft = getLandmark(9);
                const mouthRight = getLandmark(10);
                const mouthPos = mouthLeft.clone().lerp(mouthRight, 0.5);
                this.bones.mouth.position.copy(mouthPos);
                this.bones.mouth.position.z += 0.01;
                this.bones.mouth.rotation.x = Math.PI;
            }
            
            // Position ears
            if (this.bones.leftEar) {
                const leftEar = getLandmark(7);
                this.bones.leftEar.position.copy(leftEar);
                this.bones.leftEar.rotation.y = -Math.PI / 2;
            }
            
            if (this.bones.rightEar) {
                const rightEar = getLandmark(8);
                this.bones.rightEar.position.copy(rightEar);
                this.bones.rightEar.rotation.y = Math.PI / 2;
            }
            
            // Get key body positions for torso
            const leftShoulder = getLandmark(12);
            const rightShoulder = getLandmark(11);
            const shoulderMid = getMidpoint(11, 12);
            const leftHip = getLandmark(24);
            const rightHip = getLandmark(23);
            const hipMid = getMidpoint(23, 24);
            
            // Torso - between shoulders and hips (foundational body part)
            const torsoPos = shoulderMid.clone().lerp(hipMid, 0.5);
            this.bones.torso.position.copy(torsoPos);
            this.orientBone(this.bones.torso, hipMid, shoulderMid);
            
            // Neck - connects shoulders to head
            const neckPos = shoulderMid.clone().lerp(noseLandmark, 0.4);
            this.bones.neck.position.copy(neckPos);
            this.orientBone(this.bones.neck, shoulderMid, noseLandmark);
            
            // Right Arm
            this.updateLimb(
                [this.bones.rightShoulder, this.bones.rightUpperArm, this.bones.rightElbow, 
                 this.bones.rightForearm, this.bones.rightWrist, this.bones.rightHand],
                [11, 13, 15, 17]
            );
            
            // Left Arm
            this.updateLimb(
                [this.bones.leftShoulder, this.bones.leftUpperArm, this.bones.leftElbow,
                 this.bones.leftForearm, this.bones.leftWrist, this.bones.leftHand],
                [12, 14, 16, 18]
            );
            
            // Right Leg
            this.updateLimb(
                [this.bones.rightHip, this.bones.rightUpperLeg, this.bones.rightKnee,
                 this.bones.rightLowerLeg, this.bones.rightAnkle, this.bones.rightFoot],
                [23, 25, 27, 29]
            );
            
            // Left Leg
            this.updateLimb(
                [this.bones.leftHip, this.bones.leftUpperLeg, this.bones.leftKnee,
                 this.bones.leftLowerLeg, this.bones.leftAnkle, this.bones.leftFoot],
                [24, 26, 28, 30]
            );
            
        } catch (error) {
            console.error('Error updating avatar:', error);
        }
    }
    
    updateLimb(bones, landmarkIndices) {
        // bones: [joint1, segment1, joint2, segment2, joint3, segment3]
        // landmarkIndices: [idx1, idx2, idx3, idx4]
        
        const positions = landmarkIndices.map(idx => {
            const lm = this.getLandmarkSafe(idx);
            // MediaPipe Y is down, Three.js Y is up, so flip Y
            // Add offset to position avatar to the right
            return new THREE.Vector3(
                lm.x + this.avatarOffset.x, 
                -lm.y + this.avatarOffset.y, 
                -lm.z + this.avatarOffset.z
            );
        });
        
        // Position joints at landmarks
        bones[0].position.copy(positions[0]); // First joint
        bones[2].position.copy(positions[1]); // Second joint
        bones[4].position.copy(positions[2]); // Third joint (wrist/ankle)
        
        // Position and orient segments between joints
        this.positionAndOrientBone(bones[1], positions[0], positions[1]); // First segment
        this.positionAndOrientBone(bones[3], positions[1], positions[2]); // Second segment
        
        // Handle hand/foot (might be a group)
        if (bones[5].type === 'Group') {
            // Position the entire hand/foot group
            bones[5].position.copy(positions[2]);
            
            // Orient hand/foot to point towards the final landmark
            const direction = new THREE.Vector3().subVectors(positions[3], positions[2]);
            if (direction.length() > 0.001) {
                direction.normalize();
                const axis = new THREE.Vector3(0, 1, 0);
                bones[5].quaternion.setFromUnitVectors(axis, direction);
            }
        } else {
            // Regular bone segment
            this.positionAndOrientBone(bones[5], positions[2], positions[3]); // Third segment
        }
    }
    
    getLandmarkSafe(idx) {
        // Safely get landmark with fallback
        const landmarks = this.currentLandmarks || [];
        if (idx < landmarks.length) {
            return landmarks[idx];
        }
        return { x: 0, y: 0, z: 0, visibility: 0 };
    }
    
    positionAndOrientBone(bone, startPos, endPos) {
        // Position bone at midpoint
        const midpoint = startPos.clone().add(endPos).multiplyScalar(0.5);
        bone.position.copy(midpoint);
        
        // Calculate the distance and scale the bone accordingly
        const distance = startPos.distanceTo(endPos);
        
        // Orient bone to point from start to end
        this.orientBone(bone, startPos, endPos, distance);
    }
    
    orientBone(bone, startPos, endPos, distance = null) {
        // Calculate direction vector
        const direction = endPos.clone().sub(startPos);
        const length = direction.length();
        
        if (length < 0.001) return; // Too short to orient
        
        direction.normalize();
        
        // Scale bone to match actual distance if provided
        if (distance !== null && bone.geometry.type === 'CapsuleGeometry') {
            // CapsuleGeometry: scale Y axis for length
            const originalLength = bone.geometry.parameters.height || 0.25;
            const scale = distance / originalLength;
            bone.scale.y = Math.max(0.1, scale); // Prevent too small scaling
        }
        
        // Bones are created along Y axis, so we need to align Y with direction
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, direction);
        
        bone.quaternion.copy(quaternion);
    }
    
    updateExternalModel(landmarks) {
        // Update external GLTF model using detected bone mappings
        if (!this.boneMappings || Object.keys(this.boneMappings).length === 0) {
            return;
        }
        
        const getLandmark = (idx) => {
            const lm = landmarks[idx];
            return new THREE.Vector3(lm.x, -lm.y, -lm.z);
        };
        
        const getMidpoint = (idx1, idx2) => {
            const p1 = getLandmark(idx1);
            const p2 = getLandmark(idx2);
            return p1.clone().add(p2).multiplyScalar(0.5);
        };
        
        const setJointRotation = (bone, startLandmark, endLandmark) => {
            if (!bone) return;
            
            const direction = endLandmark.clone().sub(startLandmark).normalize();
            const up = new THREE.Vector3(0, 1, 0);
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(up, direction);
            
            // Apply rotation relative to parent
            if (bone.parent) {
                const parentQuaternion = new THREE.Quaternion();
                bone.parent.getWorldQuaternion(parentQuaternion);
                parentQuaternion.invert();
                quaternion.premultiply(parentQuaternion);
            }
            
            bone.quaternion.slerp(quaternion, 0.3); // Smooth interpolation
        };
        
        // Update hips position (root of skeleton)
        if (this.boneMappings.hips) {
            const hipsMid = getMidpoint(23, 24);
            this.boneMappings.hips.position.copy(hipsMid);
        }
        
        // Head
        const nosePos = getLandmark(0);
        const neckMid = getMidpoint(11, 12);
        if (this.boneMappings.head) {
            setJointRotation(this.boneMappings.head, neckMid, nosePos);
        }
        
        // Spine
        const shoulderMid = getMidpoint(11, 12);
        const hipsMid = getMidpoint(23, 24);
        if (this.boneMappings.spine && this.boneMappings.spine.length > 0) {
            setJointRotation(this.boneMappings.spine[0], hipsMid, shoulderMid);
        }
        
        // Right arm
        if (this.boneMappings.rightShoulder) {
            setJointRotation(this.boneMappings.rightShoulder, getLandmark(11), getLandmark(13));
        }
        if (this.boneMappings.rightArm) {
            setJointRotation(this.boneMappings.rightArm, getLandmark(13), getLandmark(15));
        }
        if (this.boneMappings.rightForeArm) {
            setJointRotation(this.boneMappings.rightForeArm, getLandmark(15), getLandmark(17));
        }
        
        // Left arm
        if (this.boneMappings.leftShoulder) {
            setJointRotation(this.boneMappings.leftShoulder, getLandmark(12), getLandmark(14));
        }
        if (this.boneMappings.leftArm) {
            setJointRotation(this.boneMappings.leftArm, getLandmark(14), getLandmark(16));
        }
        if (this.boneMappings.leftForeArm) {
            setJointRotation(this.boneMappings.leftForeArm, getLandmark(16), getLandmark(18));
        }
        
        // Right leg
        if (this.boneMappings.rightUpLeg) {
            setJointRotation(this.boneMappings.rightUpLeg, getLandmark(23), getLandmark(25));
        }
        if (this.boneMappings.rightLeg) {
            setJointRotation(this.boneMappings.rightLeg, getLandmark(25), getLandmark(27));
        }
        if (this.boneMappings.rightFoot) {
            setJointRotation(this.boneMappings.rightFoot, getLandmark(27), getLandmark(31));
        }
        
        // Left leg
        if (this.boneMappings.leftUpLeg) {
            setJointRotation(this.boneMappings.leftUpLeg, getLandmark(24), getLandmark(26));
        }
        if (this.boneMappings.leftLeg) {
            setJointRotation(this.boneMappings.leftLeg, getLandmark(26), getLandmark(28));
        }
        if (this.boneMappings.leftFoot) {
            setJointRotation(this.boneMappings.leftFoot, getLandmark(28), getLandmark(32));
        }
    }
    
    setVisible(visible) {
        this.visible = visible;
        this.avatar.visible = visible;
    }
    
    dispose() {
        Object.values(this.bones).forEach(bone => {
            if (bone.geometry) bone.geometry.dispose();
            if (bone.material) bone.material.dispose();
        });
        this.scene.remove(this.avatar);
    }
}
