// 定義各種形狀與動物剪影
// 包含難度設定 (1~5)，1 最簡單，5 最難

const SHAPES = [
    {
        name: "大廣場 (Square)",
        type: "path",
        data: "M 80 80 L 320 80 L 320 320 L 80 320 Z",
        color: "#00f3ff",
        difficulty: 1
    },
    {
        name: "矮冬瓜 (Low Bridge)",
        type: "path",
        data: "M 50 200 L 350 200 L 350 350 L 50 350 Z",
        color: "#00ff66",
        difficulty: 1
    },
    {
        name: "大字形 (Star Pose)",
        type: "path",
        data: "M 150 50 L 250 50 L 250 150 L 350 200 L 350 250 L 250 250 L 280 380 L 200 380 L 200 280 L 120 380 L 50 380 L 150 250 L 50 250 L 50 200 L 150 150 Z",
        color: "#ffcc00",
        difficulty: 2
    },
    {
        name: "坐下休息 (Sitting)",
        type: "path",
        data: "M 150 100 C 200 100, 200 150, 150 150 C 100 150, 100 100, 150 100 Z M 150 170 C 200 170, 250 200, 250 250 L 250 350 L 200 350 L 200 250 L 150 300 L 150 380 L 100 380 L 100 200 Z M 250 250 L 350 250 L 350 300 L 250 300 Z",
        color: "#00ff66",
        difficulty: 2
    },
    {
        name: "L型 (L-Shape)",
        type: "path",
        data: "M 100 50 L 180 50 L 180 250 L 350 250 L 350 330 L 100 330 Z",
        color: "#9900ff",
        difficulty: 3
    },
    {
        name: "暴龍 (T-Rex)",
        type: "path",
        data: "M 200 50 C 250 50, 250 100, 250 120 C 270 120, 290 120, 290 140 C 290 160, 270 160, 250 160 C 250 200, 280 250, 280 300 C 280 350, 230 350, 220 300 C 200 250, 150 250, 100 300 C 50 350, 50 250, 100 200 C 150 150, 180 150, 180 100 C 180 80, 160 80, 160 60 C 160 50, 180 50, 200 50 Z",
        color: "#ff00ea",
        difficulty: 3
    },
    {
        name: "左右分飛 (Split)",
        type: "path",
        data: "M 50 80 L 150 80 L 150 350 L 50 350 Z M 250 80 L 350 80 L 350 350 L 250 350 Z",
        color: "#00f3ff",
        difficulty: 4
    },
    {
        name: "展翅雄鷹 (Eagle)",
        type: "path",
        data: "M 200 150 C 150 150, 50 100, 20 80 C 50 150, 150 250, 180 250 C 180 300, 150 350, 200 380 C 250 350, 220 300, 220 250 C 250 250, 350 150, 380 80 C 350 100, 250 150, 200 150 Z",
        color: "#ffcc00",
        difficulty: 4
    },
    {
        name: "單腳獨立 (One Leg)",
        type: "path",
        data: "M 150 50 L 250 50 L 250 150 L 320 150 L 320 220 L 250 220 L 250 380 L 150 380 L 150 220 L 80 220 L 80 150 L 150 150 Z",
        color: "#ff3300",
        difficulty: 5
    },
    {
        name: "狹縫求生 (Slit)",
        type: "path",
        data: "M 180 50 L 220 50 L 220 380 L 180 380 Z",
        color: "#ff00ea",
        difficulty: 5
    },
    {
        name: "鑽石 (Diamond)",
        type: "path",
        data: "M 50 200 L 200 50 L 350 200 L 200 350 Z",
        color: "#00f3ff",
        difficulty: 2
    },
    {
        name: "大拱門 (Arch)",
        type: "path",
        data: "M 50 350 L 50 100 L 350 100 L 350 350 L 250 350 L 250 200 L 150 200 L 150 350 Z",
        color: "#00ff66",
        difficulty: 2
    },
    {
        name: "Ｘ戰警 (X-Shape)",
        type: "path",
        data: "M 50 50 L 150 50 L 200 150 L 250 50 L 350 50 L 250 200 L 350 350 L 250 350 L 200 250 L 150 350 L 50 350 L 150 200 Z",
        color: "#ffcc00",
        difficulty: 3
    },
    {
        name: "十字架 (Cross)",
        type: "path",
        data: "M 150 50 L 250 50 L 250 150 L 300 150 L 300 250 L 250 250 L 250 350 L 150 350 L 150 250 L 100 250 L 100 150 L 150 150 Z",
        color: "#ff3300",
        difficulty: 2
    },
    {
        name: "右側通行 (Right Side)",
        type: "path",
        data: "M 200 50 L 350 50 L 350 350 L 200 350 Z",
        color: "#9900ff",
        difficulty: 2
    },
    {
        name: "左側通行 (Left Side)",
        type: "path",
        data: "M 50 50 L 200 50 L 200 350 L 50 350 Z",
        color: "#00f3ff",
        difficulty: 2
    },
    {
        name: "沙漏 (Hourglass)",
        type: "path",
        data: "M 50 50 L 350 50 L 250 200 L 350 350 L 50 350 L 150 200 Z",
        color: "#ff00ea",
        difficulty: 3
    },
    {
        name: "步步高升 (Stairs)",
        type: "path",
        data: "M 50 350 L 50 250 L 150 250 L 150 150 L 250 150 L 250 50 L 350 50 L 350 350 Z",
        color: "#00ff66",
        difficulty: 3
    },
    {
        name: "閃電 (Lightning)",
        type: "path",
        data: "M 150 50 L 350 50 L 250 200 L 350 200 L 150 350 L 200 200 L 50 200 Z",
        color: "#ffcc00",
        difficulty: 4
    }
];

// 從 LocalStorage 載入玩家自訂的圖庫
function loadCustomShapes() {
    const saved = localStorage.getItem('cyberpose_custom_shapes');
    if (saved) {
        try {
            const parsedShapes = JSON.parse(saved);
            // 過濾掉舊版的「方形」圖庫 (缺乏 type 屬性的舊資料)，避免遊戲畫不出東西導致黑屏
            const validShapes = parsedShapes.filter(s => s.type === 'image' && s.data);
            
            validShapes.forEach(shape => {
                if (!shape.imgObj) {
                    shape.imgObj = new Image();
                    shape.imgObj.src = shape.data;
                }
                SHAPES.push(shape);
            });
            
            // 如果有舊資料被濾除，更新 LocalStorage 確保下次乾淨
            if (validShapes.length !== parsedShapes.length) {
                localStorage.setItem('cyberpose_custom_shapes', JSON.stringify(validShapes));
            }
            
            console.log(`已載入 ${validShapes.length} 個自訂圖庫`);
        } catch(e) {
            console.error("無法載入自訂圖庫", e);
        }
    }
}

// 新增並儲存自訂形狀 (接收 Base64 dataURL)
function addCustomShape(dataURL) {
    const colors = ["#00f3ff", "#ff00ea", "#00ff66", "#ffcc00", "#ff3300", "#9900ff"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // 自訂形狀預設為隨機難度，讓它可以散佈在不同的關卡中
    const difficulty = Math.floor(Math.random() * 5) + 1;
    
    const newShape = {
        name: "玩家自訂圖案",
        type: "image",
        data: dataURL,
        color: color,
        difficulty: difficulty,
        imgObj: new Image()
    };
    newShape.imgObj.src = dataURL;
    
    SHAPES.push(newShape);
    
    const saved = localStorage.getItem('cyberpose_custom_shapes');
    let customShapes = saved ? JSON.parse(saved) : [];
    
    // 儲存時把 imgObj 濾掉避免 JSON.stringify 報錯
    customShapes.push({
        name: newShape.name,
        type: newShape.type,
        data: newShape.data,
        color: newShape.color,
        difficulty: newShape.difficulty
    });
    
    localStorage.setItem('cyberpose_custom_shapes', JSON.stringify(customShapes));
    
    return newShape;
}

// 洗牌功能
function shuffleShapes(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// 根據難度生成漸進式牌堆
function generateProgressiveDeck(maxRounds) {
    // 依據難度將形狀分組 1~5
    const groups = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    SHAPES.forEach(s => {
        if (groups[s.difficulty]) {
            groups[s.difficulty].push(s);
        } else {
            groups[3].push(s); // 預設防錯
        }
    });
    
    // 各自洗牌
    for (let i = 1; i <= 5; i++) {
        shuffleShapes(groups[i]);
    }
    
    let deck = [];
    let currentDifficulty = 1;
    
    // 嘗試挑選符合漸進難度的不重複形狀
    for (let i = 0; i < maxRounds; i++) {
        // 每兩回合增加一點難度
        currentDifficulty = Math.min(5, Math.ceil((i + 1) / (maxRounds / 5)));
        
        // 嘗試從該難度群組抽卡
        let shape = groups[currentDifficulty].pop();
        
        // 如果該難度抽完了，就從相近的難度往下/往上找
        if (!shape) {
            for (let d = currentDifficulty - 1; d >= 1; d--) {
                shape = groups[d].pop();
                if (shape) break;
            }
        }
        if (!shape) {
            for (let d = currentDifficulty + 1; d <= 5; d++) {
                shape = groups[d].pop();
                if (shape) break;
            }
        }
        
        // 如果全抽完了(題庫小於 maxRounds)，只好重新拿所有題目再洗一次
        if (!shape) {
            let backup = shuffleShapes([...SHAPES]);
            shape = backup.pop();
        }
        
        deck.push(shape);
    }
    
    return deck;
}

// 啟動時自動載入
loadCustomShapes();
