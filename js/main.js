import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SkeletonRenderer } from './SkeletonRenderer.js';
import { KalidoAvatarController } from './KalidoAvatarController.js';

class MotionCaptureApp {
    constructor() {
        this.motionData = null;
        this.currentFrame = 0;
        this.isPlaying = false;
        this.playbackSpeed = 1.0;
        this.loopAnimation = true;
        
        this.initScene();
        this.initLights();
        this.initControls();
        this.initEventListeners();
        
        this.skeletonRenderer = new SkeletonRenderer(this.scene);
        this.avatarController = new KalidoAvatarController(this.scene);
        
        this.animate();
    }
    
    initScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.5, 4);
        this.camera.lookAt(0, 1, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        // Grid
        const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
        this.scene.add(gridHelper);
        
        // Axes helper
        const axesHelper = new THREE.AxesHelper(2);
        this.scene.add(axesHelper);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    initLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        this.scene.add(mainLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0x9090ff, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        
        // Rim light
        const rimLight = new THREE.DirectionalLight(0xff9090, 0.2);
        rimLight.position.set(0, 5, -10);
        this.scene.add(rimLight);
    }
    
    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.target.set(0, 1, 0);
        this.controls.maxPolarAngle = Math.PI / 2 + 0.2;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 20;
    }
    
    initEventListeners() {
        // Video file input
        document.getElementById('videoFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('processBtn').disabled = false;
                this.selectedVideoFile = file;
                this.updateStatus(`Video selected: ${file.name}`);
            }
        });
        
        // Process video button
        document.getElementById('processBtn').addEventListener('click', () => {
            if (this.selectedVideoFile) {
                this.processVideo(this.selectedVideoFile);
            }
        });
        
        // Motion file input
        document.getElementById('motionFile').addEventListener('change', (e) => {
            this.loadMotionData(e.target.files[0]);
        });
        
        // Play button
        document.getElementById('playBtn').addEventListener('click', () => {
            this.togglePlayback();
        });
        
        // Speed slider
        const speedSlider = document.getElementById('speedSlider');
        speedSlider.addEventListener('input', (e) => {
            this.playbackSpeed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = this.playbackSpeed.toFixed(1) + 'x';
        });
        
        // Progress slider
        const progressSlider = document.getElementById('progressSlider');
        progressSlider.addEventListener('input', (e) => {
            if (this.motionData) {
                const progress = parseFloat(e.target.value) / 100;
                this.currentFrame = Math.floor(progress * (this.motionData.frames.length - 1));
                this.updateFrame();
            }
        });
        
        // Checkboxes
        document.getElementById('showSkeleton').addEventListener('change', (e) => {
            this.skeletonRenderer.setVisible(e.target.checked);
        });
        
        document.getElementById('showAvatar').addEventListener('change', (e) => {
            this.avatarController.setVisible(e.target.checked);
        });
        
        document.getElementById('loopAnimation').addEventListener('change', (e) => {
            this.loopAnimation = e.target.checked;
        });
        
        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.motionData) {
                e.preventDefault();
                this.togglePlayback();
            }
        });
    }
    
    async processVideo(file) {
        this.updateStatus('📤 Uploading video...');
        document.getElementById('processing').style.display = 'block';
        document.getElementById('processingStatus').textContent = 'Uploading video to server...';
        document.getElementById('progressBar').style.width = '5%';
        document.getElementById('processBtn').disabled = true;
        
        // Create FormData to send video to backend
        const formData = new FormData();
        formData.append('video', file);
        
        try {
            // Upload video to Flask server
            const uploadResponse = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload video');
            }
            
            const uploadData = await uploadResponse.json();
            console.log('Upload successful:', uploadData);
            
            this.updateStatus('⚙️ Processing video with MediaPipe...');
            document.getElementById('processingStatus').textContent = 'Extracting pose landmarks...';
            document.getElementById('progressBar').style.width = '10%';
            
            // Poll for progress
            await this.pollProcessingProgress();
            
        } catch (error) {
            console.error('Error processing video:', error);
            this.updateStatus('❌ Error: ' + error.message);
            document.getElementById('processing').style.display = 'none';
            document.getElementById('processBtn').disabled = false;
        }
    }
    
    async pollProcessingProgress() {
        const pollInterval = 500; // Check every 500ms
        
        const checkProgress = async () => {
            try {
                const response = await fetch('http://localhost:5000/progress');
                const data = await response.json();
                
                // Update UI
                document.getElementById('progressBar').style.width = data.progress + '%';
                document.getElementById('processingStatus').textContent = data.message;
                
                if (data.status === 'completed') {
                    // Processing complete - load the motion data
                    this.updateStatus('✅ Processing complete! Loading animation...');
                    document.getElementById('progressBar').style.width = '100%';
                    
                    // Fetch and load the generated JSON
                    const motionResponse = await fetch(`http://localhost:5000/output/${data.output_file}`);
                    const motionText = await motionResponse.text();
                    this.motionData = JSON.parse(motionText);
                    
                    this.currentFrame = 0;
                    this.isPlaying = false;
                    
                    document.getElementById('playBtn').disabled = false;
                    document.getElementById('playBtn').textContent = '▶ Play Animation';
                    
                    this.updateStatus(
                        `🎉 Success! Loaded ${this.motionData.frames.length} frames at ${this.motionData.metadata.fps.toFixed(2)} FPS`
                    );
                    
                    this.updateFrame();
                    
                    setTimeout(() => {
                        document.getElementById('processing').style.display = 'none';
                        document.getElementById('processBtn').disabled = false;
                    }, 2000);
                    
                } else if (data.status === 'error') {
                    throw new Error(data.message);
                } else {
                    // Continue polling
                    setTimeout(checkProgress, pollInterval);
                }
                
            } catch (error) {
                console.error('Error checking progress:', error);
                this.updateStatus('❌ Error: ' + error.message);
                document.getElementById('processing').style.display = 'none';
                document.getElementById('processBtn').disabled = false;
            }
        };
        
        checkProgress();
    }
    
    async loadMotionData(file) {
        if (!file) {
            console.log('No file selected');
            return;
        }
        
        console.log('Loading motion data from file:', file.name);
        this.updateStatus('Loading motion data...');
        document.getElementById('processing').style.display = 'none';
        
        try {
            const text = await file.text();
            this.motionData = JSON.parse(text);
            
            console.log('Motion data loaded:', {
                frames: this.motionData.frames?.length,
                fps: this.motionData.metadata?.fps
            });
            
            if (!this.motionData.frames || this.motionData.frames.length === 0) {
                throw new Error('No frames found in motion data');
            }
            
            this.currentFrame = 0;
            this.isPlaying = false;
            
            document.getElementById('playBtn').disabled = false;
            document.getElementById('playBtn').textContent = '▶ Play Animation';
            console.log('Play button enabled!');
            
            this.updateStatus(
                `✅ Loaded ${this.motionData.frames.length} frames at ${this.motionData.metadata.fps.toFixed(2)} FPS - Ready to play!`
            );
            
            this.updateFrame();
            
        } catch (error) {
            console.error('Error loading motion data:', error);
            this.updateStatus('❌ Error: Failed to load motion data. ' + error.message);
        }
    }
    
    togglePlayback() {
        if (!this.motionData) return;
        
        this.isPlaying = !this.isPlaying;
        document.getElementById('playBtn').textContent = this.isPlaying ? '⏸ Pause' : '▶ Play Animation';
        
        if (this.isPlaying && this.currentFrame >= this.motionData.frames.length - 1) {
            this.currentFrame = 0;
        }
    }
    
    updateFrame() {
        if (!this.motionData) return;
        
        // Ensure frame index is within bounds and is an integer
        const frameIndex = Math.floor(Math.min(Math.max(0, this.currentFrame), this.motionData.frames.length - 1));
        const frameData = this.motionData.frames[frameIndex];
        
        if (frameData.landmarks_3d && frameData.landmarks_3d.length > 0) {
            // Use 3D world landmarks
            this.skeletonRenderer.update(frameData.landmarks_3d);
            this.avatarController.update(frameData.landmarks_3d);
        } else if (frameData.landmarks_2d && frameData.landmarks_2d.length > 0) {
            // Fallback to 2D landmarks (will need conversion)
            console.warn('Using 2D landmarks - consider re-running extraction with 3D data');
        }
        
        // Update progress slider
        const progress = (frameIndex / (this.motionData.frames.length - 1)) * 100;
        document.getElementById('progressSlider').value = progress;
        document.getElementById('progressValue').textContent = Math.round(progress) + '%';
    }
    
    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update animation
        if (this.isPlaying && this.motionData) {
            const fps = this.motionData.metadata.fps || 30;
            const frameIncrement = (this.playbackSpeed * fps) / 60; // Assuming 60 FPS render loop
            
            this.currentFrame += frameIncrement;
            
            if (this.currentFrame >= this.motionData.frames.length) {
                if (this.loopAnimation) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = this.motionData.frames.length - 1;
                    this.isPlaying = false;
                    document.getElementById('playBtn').textContent = '▶ Play Animation';
                }
            }
            
            this.updateFrame();
        }
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize app when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    new MotionCaptureApp();
});
