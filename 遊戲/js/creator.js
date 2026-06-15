// js/creator.js

document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById('open-creator-btn');
    const overlay = document.getElementById('creator-overlay');
    const closeBtn = document.getElementById('creator-close');
    const clearBtn = document.getElementById('creator-clear');
    const saveBtn = document.getElementById('creator-save');
    
    const canvas = document.getElementById('creator-canvas');
    const ctx = canvas.getContext('2d');
    
    let isDrawing = false;
    // 儲存所有筆畫的點，讓重繪時能有發光效果
    let paths = []; 
    let currentPath = [];

    // 設定畫筆樣式
    const brushSize = 30; // 粗一點才夠塞身體
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize;
        
        // 發光效果
        ctx.strokeStyle = '#fff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 15;

        paths.forEach(path => {
            if (path.length < 2) {
                // 如果只點一下
                ctx.beginPath();
                ctx.arc(path[0].x, path[0].y, brushSize/2, 0, Math.PI*2);
                ctx.fillStyle = '#fff';
                ctx.fill();
                return;
            }
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x, path[i].y);
            }
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
            ctx.stroke();
        });
        
        if (currentPath.length > 0) {
            if (currentPath.length < 2) {
                ctx.beginPath();
                ctx.arc(currentPath[0].x, currentPath[0].y, brushSize/2, 0, Math.PI*2);
                ctx.fillStyle = '#fff';
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.moveTo(currentPath[0].x, currentPath[0].y);
                for (let i = 1; i < currentPath.length; i++) {
                    ctx.lineTo(currentPath[i].x, currentPath[i].y);
                }
                ctx.strokeStyle = '#fff';
                ctx.stroke();
            }
        }
    }
    
    openBtn.addEventListener('click', () => {
        overlay.style.display = 'flex';
        paths = [];
        currentPath = [];
        draw();
    });
    
    closeBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
    });
    
    clearBtn.addEventListener('click', () => {
        paths = [];
        currentPath = [];
        draw();
    });
    
    function getPointerPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    const startDrawing = (e) => {
        e.preventDefault();
        isDrawing = true;
        currentPath = [getPointerPos(e)];
        draw();
    };

    const moveDrawing = (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        currentPath.push(getPointerPos(e));
        draw();
    };

    const stopDrawing = (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        isDrawing = false;
        if (currentPath.length > 0) {
            paths.push([...currentPath]);
        }
        currentPath = [];
        draw();
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', moveDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing, {passive: false});
    canvas.addEventListener('touchmove', moveDrawing, {passive: false});
    canvas.addEventListener('touchend', stopDrawing, {passive: false});
    
    saveBtn.addEventListener('click', () => {
        if (paths.length === 0) {
            alert("請至少畫出一條線！");
            return;
        }
        
        // 為了匯出完美的遮罩，我們暫時把發光效果關掉，只畫純白色，背景透明
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#fff';
        
        paths.forEach(path => {
            if (path.length < 2) {
                ctx.beginPath();
                ctx.arc(path[0].x, path[0].y, brushSize/2, 0, Math.PI*2);
                ctx.fill();
                return;
            }
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x, path[i].y);
            }
            ctx.closePath();
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.stroke();
        });
        
        // 匯出為 Base64 圖片
        const dataURL = canvas.toDataURL("image/png");
        
        // 呼叫 shapes.js 中的 addCustomShape
        if (typeof addCustomShape === 'function') {
            addCustomShape(dataURL);
            alert("自訂圖框儲存成功！將會在遊戲中隨機出現。");
            overlay.style.display = 'none';
        }
        
        // 恢復原狀
        draw();
    });
});
