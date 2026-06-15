class PoseDetector {
    constructor() {
        this.detector = null;
        this.video = document.getElementById('webcam');
        this.isReady = false;
        this.videoWidth = 640;
        this.videoHeight = 480;
    }

    async init() {
        await this.setupCamera();
        this.video.play();
        await this.loadModel();
        this.isReady = true;
        return true;
    }

    async setupCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        
        this.video.srcObject = stream;
        
        return new Promise((resolve) => {
            this.video.onloadedmetadata = () => {
                this.videoWidth = this.video.videoWidth;
                this.videoHeight = this.video.videoHeight;
                resolve(this.video);
            };
        });
    }

    async loadModel() {
        await tf.ready();
        const detectorConfig = {
            modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
            enableTracking: true,
            trackerType: poseDetection.TrackerType.BoundingBox
        };
        // It might take a few seconds to load
        this.detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            detectorConfig
        );
    }

    async estimatePoses() {
        if (!this.isReady || !this.detector) return [];
        try {
            // estimatePoses returns an array of poses (up to 6 for multipose lightning)
            const poses = await this.detector.estimatePoses(this.video);
            return poses;
        } catch (error) {
            console.error("Error estimating poses:", error);
            return [];
        }
    }
}
