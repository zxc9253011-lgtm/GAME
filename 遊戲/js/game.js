class CyberPoseGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.detector = new PoseDetector();
        
        this.state = 'INIT';
        this.round = 1;
        this.maxRounds = 10;
        this.scores = { p1: 0, p2: 0 };
        
        this.shapeP1 = null;
        this.shapeP2 = null;
        this.shapeProgress = 0; 
        this.shapeSpeed = 0.005; 
        this.shapeDeck = [];
        
        this.ui = {
            messageOverlay: document.getElementById('message-overlay'),
            mainMsg: document.getElementById('main-message'),
            subMsg: document.getElementById('sub-message'),
            startBtn: document.getElementById('start-btn'),
            loadingStatus: document.getElementById('loading-status'),
            scoreP1: document.getElementById('score-p1'),
            scoreP2: document.getElementById('score-p2'),
            roundInfo: document.getElementById('round-info'),
            flash: document.getElementById('flash-overlay')
        };
        
        this.ui.startBtn.addEventListener('click', () => this.startGame());
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.init();
    }

    async init() {
        this.resizeCanvas();
        try {
            await this.detector.init();
            this.ui.loadingStatus.style.display = 'none';
            this.ui.startBtn.style.display = 'inline-block';
            document.getElementById('open-creator-btn').style.display = 'inline-block';
            this.ui.subMsg.innerText = "相機與 AI 模型載入完成！兩人請各站畫面一邊。";
            this.state = 'MENU';
            
            requestAnimationFrame(() => this.loop());
        } catch (e) {
            console.error(e);
            this.ui.loadingStatus.innerText = "發生錯誤: " + e.message;
            this.ui.loadingStatus.style.color = "red";
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    getScreenCoord(kp) {
        const vw = this.detector.videoWidth;
        const vh = this.detector.videoHeight;
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        
        const videoRatio = vw / vh;
        const canvasRatio = cw / ch;
        
        let drawW, drawH, offsetX = 0, offsetY = 0;
        if (canvasRatio > videoRatio) {
            drawW = cw;
            drawH = cw / videoRatio;
            offsetY = (ch - drawH) / 2;
        } else {
            drawH = ch;
            drawW = ch * videoRatio;
            offsetX = (cw - drawW) / 2;
        }
        
        let nx = kp.x / vw;
        let ny = kp.y / vh;
        
        return {
            x: offsetX + nx * drawW,
            y: offsetY + ny * drawH
        };
    }

    startGame() {
        this.ui.messageOverlay.style.opacity = 0;
        setTimeout(() => {
            this.ui.messageOverlay.style.display = 'none';
        }, 500);
        
        this.scores = { p1: 0, p2: 0 };
        this.updateScores();
        this.round = 1;
        
        // 生成依據難度遞增的題庫
        this.shapeDeck = generateProgressiveDeck(this.maxRounds * 2); // 需要雙倍題目
        this.startRound();
    }

    startRound() {
        this.state = 'PLAYING';
        this.ui.roundInfo.innerText = `ROUND ${this.round} / ${this.maxRounds}`;
        
        if (this.shapeDeck.length < 2) {
            this.shapeDeck = generateProgressiveDeck(this.maxRounds * 2);
        }
        
        this.shapeP1 = this.shapeDeck.shift();
        this.shapeP2 = this.shapeDeck.shift();
        
        let tempDeck = [];
        // 絕對不允許重複：如果抽出來的兩張一模一樣，繼續往下抽直到不一樣為止
        while (this.shapeP1 && this.shapeP2 && this.shapeP1.name === this.shapeP2.name && this.shapeDeck.length > 0) {
            tempDeck.push(this.shapeP2);
            this.shapeP2 = this.shapeDeck.shift();
        }
        
        // 確保 P2 有東西，如果真的整副牌都一樣(不可能發生了，因為題庫擴增了)，也只好接受
        if (!this.shapeP2 && tempDeck.length > 0) {
            this.shapeP2 = tempDeck.pop();
        }
        
        // 把剛剛因為重複而暫存的形狀放回牌堆，供後續回合使用
        if (tempDeck.length > 0) {
            this.shapeDeck.push(...tempDeck);
        }
        
        this.shapeProgress = 0;
        this.shapeSpeed = 0.005 + (this.round * 0.001); 
    }

    async loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const poses = await this.detector.estimatePoses();
        this.drawPoses(poses);
        
        if (this.state === 'PLAYING') {
            this.shapeProgress += this.shapeSpeed;
            this.drawShape();
            
            if (this.shapeProgress >= 1.0) {
                this.evaluate(poses);
            }
        }
        
        requestAnimationFrame(() => this.loop());
    }

    drawPoses(poses) {
        this.ctx.lineWidth = 4;
        const cw = this.canvas.width;

        poses.forEach((pose) => {
            // 計算重心 X 判斷是 P1 (左) 還是 P2 (右)
            let sumX = 0, count = 0;
            pose.keypoints.forEach(kp => {
                if (kp.score > 0.3) {
                    sumX += this.getScreenCoord(kp).x;
                    count++;
                }
            });
            if (count === 0) return;
            let avgX = sumX / count;
            
            let isP1 = avgX < cw / 2;
            
            this.ctx.strokeStyle = isP1 ? '#00f3ff' : '#ff00ea';
            this.ctx.fillStyle = this.ctx.strokeStyle;
            this.ctx.shadowColor = this.ctx.strokeStyle;
            this.ctx.shadowBlur = 10;
            
            const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
            adjacentKeyPoints.forEach((pair) => {
                const i = pair[0], j = pair[1];
                const kp1 = pose.keypoints[i];
                const kp2 = pose.keypoints[j];
                
                if (kp1.score > 0.3 && kp2.score > 0.3) {
                    const pos1 = this.getScreenCoord(kp1);
                    const pos2 = this.getScreenCoord(kp2);
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(pos1.x, pos1.y);
                    this.ctx.lineTo(pos2.x, pos2.y);
                    this.ctx.stroke();
                }
            });
            
            pose.keypoints.forEach(kp => {
                if (kp.score > 0.3) {
                    const pos = this.getScreenCoord(kp);
                    this.ctx.beginPath();
                    this.ctx.arc(pos.x, pos.y, 6, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            });
            
            this.ctx.shadowBlur = 0;
        });
    }

    drawShape() {
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const scale = 0.05 + Math.pow(this.shapeProgress, 2) * 0.95;
        
        // 單側畫面寬度
        const halfW = cw / 2;
        // 將 400x400 的圖形縮放至適合半邊畫面
        const baseScale = Math.min(halfW, ch) / 400;

        this.ctx.save();
        
        // 1. 畫實體牆壁 (蓋滿全螢幕)
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = 'rgba(5, 5, 20, 0.85)';
        this.ctx.fillRect(0, 0, cw, ch);
        
        // 2. 畫中央分割線
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 4;
        this.ctx.shadowColor = '#fff';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.moveTo(cw/2, 0);
        this.ctx.lineTo(cw/2, ch);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // 3. 處理左半邊 P1 (視覺在左邊，對應 Canvas 的右半部 3*cw/4)
        this.drawSingleHole(3*cw/4, ch/2, scale, baseScale, this.shapeP1);
        
        // 4. 處理右半邊 P2 (視覺在右邊，對應 Canvas 的左半部 cw/4)
        this.drawSingleHole(cw/4, ch/2, scale, baseScale, this.shapeP2);
        
        this.ctx.restore();
    }

    drawSingleHole(cx, cy, animScale, baseScale, shape) {
        if (!shape) shape = SHAPES[0]; // 自動補齊

        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.scale(animScale, animScale);
        this.ctx.scale(baseScale, baseScale);
        this.ctx.translate(-200, -200); // 400x400 置中
        
        // 挖空
        this.ctx.globalCompositeOperation = 'destination-out';
        
        if (shape.type === 'path') {
            const p = new Path2D(shape.data);
            this.ctx.fillStyle = '#fff';
            this.ctx.fill(p);
            this.ctx.lineWidth = 20;
            this.ctx.stroke(p);
            
            // 發光邊框
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = shape.color;
            this.ctx.lineWidth = 10;
            this.ctx.shadowColor = shape.color;
            this.ctx.shadowBlur = 30;
            this.ctx.stroke(p);
        } else if (shape.type === 'image') {
            // 檢查圖片是否已成功載入且無損毀
            if (shape.imgObj && shape.imgObj.complete && shape.imgObj.naturalWidth > 0) {
                this.ctx.drawImage(shape.imgObj, 0, 0, 400, 400);
                
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.shadowColor = shape.color;
                this.ctx.shadowBlur = 30;
                this.ctx.drawImage(shape.imgObj, 0, 0, 400, 400);
            } else {
                // 自動補齊：若自訂圖片損毀，以預設形狀替代，避免出現全黑無洞的狀況
                const fallbackShape = SHAPES[0];
                const p = new Path2D(fallbackShape.data);
                this.ctx.fillStyle = '#fff';
                this.ctx.fill(p);
                this.ctx.lineWidth = 20;
                this.ctx.stroke(p);
                
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.strokeStyle = fallbackShape.color;
                this.ctx.lineWidth = 10;
                this.ctx.shadowColor = fallbackShape.color;
                this.ctx.shadowBlur = 30;
                this.ctx.stroke(p);
            }
        }
        
        this.ctx.restore();
    }

    evaluate(poses) {
        this.state = 'EVALUATING';
        
        this.ui.flash.classList.remove('flash-animation');
        void this.ui.flash.offsetWidth; 
        this.ui.flash.classList.add('flash-animation');
        
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const halfW = cw / 2;
        
        // 建立像素級判定畫布
        const hitCanvas = document.createElement('canvas');
        hitCanvas.width = cw;
        hitCanvas.height = ch;
        const hCtx = hitCanvas.getContext('2d', { willReadFrequently: true });
        
        // 在判定畫布上畫出最終的破洞 (animScale = 1.0)
        const baseScale = Math.min(halfW, ch) / 400;
        
        const drawHitHole = (cx, cy, shape) => {
            if (!shape) shape = SHAPES[0]; // 自動補齊
            hCtx.save();
            hCtx.translate(cx, cy);
            hCtx.scale(baseScale, baseScale);
            hCtx.translate(-200, -200);
            hCtx.fillStyle = '#fff';
            hCtx.strokeStyle = '#fff';
            if (shape.type === 'path') {
                const p = new Path2D(shape.data);
                hCtx.fill(p);
                hCtx.lineWidth = 30; // 判定寬容度
                hCtx.stroke(p);
            } else if (shape.type === 'image') {
                if (shape.imgObj && shape.imgObj.complete && shape.imgObj.naturalWidth > 0) {
                    hCtx.drawImage(shape.imgObj, 0, 0, 400, 400);
                } else {
                    // 自動補齊：如果在結算時圖片尚未載入或損毀，改用預設形狀判定
                    const fallbackShape = SHAPES[0];
                    const p = new Path2D(fallbackShape.data);
                    hCtx.fill(p);
                    hCtx.lineWidth = 30; 
                    hCtx.stroke(p);
                }
            }
            hCtx.restore();
        };

        drawHitHole(3*cw/4, ch/2, this.shapeP1);
        drawHitHole(cw/4, ch/2, this.shapeP2);
        
        const imgData = hCtx.getImageData(0, 0, cw, ch).data;
        
        let p1Poses = [];
        let p2Poses = [];
        
        // 根據重心分發 Pose 給 P1 還是 P2
        poses.forEach((pose) => {
            let sumX = 0, count = 0;
            pose.keypoints.forEach(kp => {
                if (kp.score > 0.3) {
                    sumX += this.getScreenCoord(kp).x;
                    count++;
                }
            });
            if (count === 0) return;
            let avgX = sumX / count;
            
            // 由於 Canvas 有 scaleX(-1) 鏡像，所以 x > cw/2 在視覺上是在左半邊 (P1)
            let isP1 = avgX > cw / 2;
            
            if (isP1) p1Poses.push(pose);
            else p2Poses.push(pose);
        });
        
        // 計算某個 Pose 的分數
        const calcScore = (poseArray, isP1) => {
            if (poseArray.length === 0) return 0;
            // 如果有多個人擠在同一邊，取第一個(最明顯的)
            const pose = poseArray[0];
            
            let validPoints = 0;
            let insidePoints = 0;
            
            pose.keypoints.forEach(kp => {
                if (kp.score > 0.3) {
                    const pos = this.getScreenCoord(kp);
                    const px = Math.floor(pos.x);
                    const py = Math.floor(pos.y);
                    
                    // 防呆：如果 P1 越界伸到右邊去 (Canvas x < cw/2)，直接算失誤
                    if (isP1 && px < cw / 2) {
                        validPoints++; // 計入總點數，但 inside=false
                        return;
                    }
                    if (!isP1 && px >= cw / 2) {
                        validPoints++;
                        return;
                    }

                    validPoints++;
                    
                    if (px >= 0 && px < cw && py >= 0 && py < ch) {
                        const idx = (py * cw + px) * 4;
                        const alpha = imgData[idx + 3];
                        if (alpha > 50) {
                            insidePoints++;
                        }
                    }
                }
            });
            
            let accuracy = validPoints > 0 ? (insidePoints / validPoints) : 0;
            return Math.round(accuracy * 100);
        };

        const roundScoreP1 = calcScore(p1Poses, true);
        const roundScoreP2 = calcScore(p2Poses, false);
        
        this.scores.p1 += roundScoreP1;
        this.scores.p2 += roundScoreP2;
        this.updateScores();
        
        // 結算文字
        this.ui.mainMsg.style.fontSize = "2rem"; // 字縮小點免得擠爆
        this.showMessage(`P1: ${this.shapeP1.name} | P2: ${this.shapeP2.name}`, 
                         `P1: +${roundScoreP1} 分 | P2: +${roundScoreP2} 分`);
        
        setTimeout(() => {
            this.ui.mainMsg.style.fontSize = "3rem";
            this.round++;
            if (this.round > this.maxRounds) {
                this.gameOver();
            } else {
                this.ui.messageOverlay.style.display = 'none';
                this.startRound();
            }
        }, 3500);
    }
    
    updateScores() {
        this.ui.scoreP1.innerText = this.scores.p1;
        this.ui.scoreP2.innerText = this.scores.p2;
    }
    
    showMessage(main, sub) {
        this.ui.mainMsg.innerText = main;
        this.ui.subMsg.innerText = sub;
        this.ui.startBtn.style.display = 'none';
        this.ui.loadingStatus.style.display = 'none';
        document.getElementById('open-creator-btn').style.display = 'none';
        
        this.ui.messageOverlay.style.display = 'block';
        setTimeout(() => {
            this.ui.messageOverlay.style.opacity = 1;
        }, 50);
    }
    
    gameOver() {
        this.state = 'GAMEOVER';
        let winnerText = "平分秋色！";
        if (this.scores.p1 > this.scores.p2) winnerText = "🏆 PLAYER 1 獲勝！";
        if (this.scores.p2 > this.scores.p1) winnerText = "🏆 PLAYER 2 獲勝！";
        
        this.showMessage("GAME OVER", winnerText);
        this.ui.startBtn.innerText = "PLAY AGAIN";
        this.ui.startBtn.style.display = 'inline-block';
        document.getElementById('open-creator-btn').style.display = 'inline-block';
    }
}

window.onload = () => {
    window.game = new CyberPoseGame();
};
