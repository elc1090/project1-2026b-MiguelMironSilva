const canvas = document.querySelector("canvas"),
drawingBoard = document.querySelector(".drawing-board"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
polygonSidesInput = document.querySelector("#polygon-sides"),
//esquema velho de ColorBtns retirado
presetColorBtns = document.querySelectorAll(".colors .option:not(.custom-color)"),
customColorButton = document.querySelector("#custom-color-button"),
hsvPicker = document.querySelector("#hsv-picker"),
hueSlider = document.querySelector("#hue-slider"),
saturationSlider = document.querySelector("#saturation-slider"),
valueSlider = document.querySelector("#value-slider"),
hueValue = document.querySelector("#hue-value"),
saturationValue = document.querySelector("#saturation-value"),
valueValue = document.querySelector("#value-value"),
hsvPreview = document.querySelector("#hsv-preview"),
resetColor = document.querySelector("#reset-color"),
undoBtn = document.querySelector(".undo-btn"),
redoBtn = document.querySelector(".redo-btn"),
resetZoomBtn = document.querySelector(".reset-zoom"),
clearCanvas = document.querySelector(".clear-canvas"),
saveImg = document.querySelector(".save-img"),
ctx = canvas.getContext("2d");

let prevMouseX, prevMouseY, snapshot,
isDrawing = false,
hasDrawn = false,  // New flag to track if the user has drawn something
selectedTool = "brush",
brushWidth = 5,
selectedColor = "#000";

//Armazenamento de pontos aleatórios
let randomPoints = [];

//Suporte para undo e redo
let undoStack = [];
let redoStack = [];
const MAX_HISTORY = 20;

//Suporte para zoom
let zoomLevel = 1;
let originalDisplayWidth;
let originalDisplayHeight;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;

const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
};

//Captura o canvas de agora
const getCanvasState = () => {
    return {
        imageData: ctx.getImageData(0,0,canvas.width,canvas.height),
        hasDrawn: hasDrawn
    };
};

//Botões de undo e redo desabilitados por padrão
const updateHistoryButtons = () => {
    undoBtn.disabled = undoStack.length === 0;
    redoBtn.disabled = redoStack.length === 0;
};

//Salva a captura
const saveState = () => {
    undoStack.push(getCanvasState());

    if(undoStack.length > MAX_HISTORY) {
        undoStack.shift();
    }
    //invalida o redo com uma nova ação
    redoStack = [];
    updateHistoryButtons();
};

//Restaura captura prévia
const restoreState = (state) => {
    ctx.putImageData(state.imageData, 0, 0);
    hasDrawn = state.hasDrawn;
};

//Inicializa tamanho do display
window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    originalDisplayWidth = canvas.offsetWidth;
    originalDisplayHeight = canvas.offsetHeight;
    setCanvasBackground();
});

//Para gerar coordenadas normalizadas entre 0 e 1
//Gera pontos ao redor de um centro comum
//Randomiza as vertices geradas
const generateRandomPoints = () => {
    randomPoints = [];

    //entre quatro e catorze vértices
    const pointCount = Math.floor(Math.random() * 11) + 4;
    const rotation = Math.random() * Math.PI * 2;
    for(let i = 0; i < pointCount; i++) {
        const baseAngle = (Math.PI * 2 * i) / pointCount;
        const angleVariation = (Math.random() - 0.5) * 0.8;
        const angle = baseAngle + angleVariation + rotation;
        
        let radius;  //puxa o raio para dentro
        if(Math.random() < 0.2) { 
            radius = 0.08 + Math.random() * 0.15;
        } else {
            radius = 0.25 + Math.random() * 0.3;
        }

        randomPoints.push({
            x: 0.5 + Math.cos(angle) * radius,
            y: 0.5 + Math.sin(angle) * radius
        });
    }
};

//Conversor de HSV para RGB
const hsvToRgb = (h, s, v) => {
    s /= 100;
    v /= 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0;
    let g = 0;
    let b = 0;

    if(h < 60) {
        r = c;
        g = x;
    } else if(h < 120) {
        r = x;
        g = c;
    } else if(h < 180) {
        g = c;
        b = x;
    } else if(h < 240) {
        g = x;
        b = c;
    } else if(h < 300) {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `rgb(${r}, ${g}, ${b})`;
};

//Atualiza a cor quando os sliders se movem
const updateHSVColor = () => {
    const h = Number(hueSlider.value);
    const s = Number(saturationSlider.value);
    const v = Number(valueSlider.value);

    hueValue.textContent = `${h}°`;
    saturationValue.textContent = `${s}%`;
    valueValue.textContent = `${v}%`;

    const color = hsvToRgb(h, s, v);

    hsvPreview.style.backgroundColor = color;
    customColorButton.style.backgroundColor = color;

    selectedColor = color;

    document
        .querySelector(".colors .selected")
        ?.classList.remove("selected");

    customColorButton.classList.add("selected");
};

//Implementação do undo
const undo = () => {
    if(undoStack.length === 0) return;
    redoStack.push(getCanvasState());
    const previousState = undoStack.pop();
    restoreState(previousState);
    updateHistoryButtons();
};

//Implementação do redo
const redo = () => {
    if(redoStack.length === 0) return;
    undoStack.push(getCanvasState());
    const nextState = redoStack.pop();
    restoreState(nextState);
    updateHistoryButtons();
};

//Implementação do zoom
const applyZoom = () => {
    canvas.style.width = `${originalDisplayWidth * zoomLevel}px`;
    canvas.style.height = `${originalDisplayHeight * zoomLevel}px`;
    resetZoomBtn.textContent = `Zoom ${Math.round(zoomLevel * 100)}%`; //display do nível de zoom
};

//Botão para resetar o zoom
const resetZoom = () => {
    zoomLevel = 1;
    applyZoom();
    drawingBoard.scrollLeft = 0;
    drawingBoard.scrollTop = 0;
};

//Getter das coordenadas
const getCanvasCoordinates = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        offsetX: (e.clientX - rect.left) * scaleX,
        offsetY: (e.clientY - rect.top) * scaleY
    };
};

//Desenha retângulo
const drawRect = (e) => {
    if(!fillColor.checked) {
        return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
};

//Desenha círculo
const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

//Desenha triângulo
const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

//Implementação do desenho por linha
const drawLine = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
};

//Implementação da função geradora de polígono
const drawPolygon = (e) => {
    const sides = Math.min(20, Math.max(3, Number(polygonSidesInput.value) || 5));
    const centerX = prevMouseX;
    const centerY = prevMouseY;
    const radius = Math.sqrt( Math.pow(e.offsetX - centerX, 2) +  Math.pow(e.offsetY - centerY, 2)
    );
    const angleStep = (Math.PI * 2) / sides;
    ctx.beginPath();
    for(let i = 0; i < sides; i++) {
        const angle = -Math.PI / 2 + i * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if(i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

const startDraw = (e) => {
    saveState(); //Salva o desenho
    isDrawing = true;
    hasDrawn = true; // Set to true when user starts drawing
    prevMouseX = point.offsetX; //modificado para usar "point" ao invés de "e"
    prevMouseY = point.offsetY; //necessário para o escalonamento
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

    //Gera os pontos uma única vez quando o usuário começa a desenhar
    if(selectedTool === "random-draw") {
        generateRandomPoints();
    }
};

const sprayPaint = (e) => {
    //Spray fica mais amplo e denso com amplitude do pincel maior
    const sprayRadius = brushWidth * 1.5;
    const density = brushWidth * 3;
    ctx.fillStyle = selectedColor;
    for(let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        // sqrt() uniformiza melhor a distribuição do spray
        const distance = Math.sqrt(Math.random()) * sprayRadius;
        const x = e.offsetX + Math.cos(angle) * distance;
        const y = e.offsetY + Math.sin(angle) * distance;
        ctx.fillRect(x, y, 1.5, 1.5);
    }
};

const drawRandom = (e) => {
    const width = e.offsetX - prevMouseX;
    const height = e.offsetY - prevMouseY;
    ctx.beginPath();
    const firstX = prevMouseX + randomPoints[0].x * width;
    const firstY = prevMouseY + randomPoints[0].y * height;
    ctx.moveTo(firstX, firstY);

    for(let i = 1; i < randomPoints.length; i++) {
        const x = prevMouseX + randomPoints[i].x * width;
        const y = prevMouseY + randomPoints[i].y * height;
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawing = (e) => {
    if(!isDrawing) return;

    const point = getCanvasCoordinates(e); //conversão de "e" para "points"

    //Spray tem que ficar antes do "putImageData" para poder acumular propriamente
    if(selectedTool === "spray") {
        sprayPaint(point);
        return;
    }
        
    ctx.putImageData(snapshot, 0, 0);

    if(selectedTool === "brush" || selectedTool === "eraser") {
        ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
        ctx.lineTo(point.offsetX, point.offsetY);
        ctx.stroke();
    } else if(selectedTool === "rectangle"){
        drawRect(point);
    } else if(selectedTool === "circle"){
        drawCircle(point);
    } else if(selectedTool === "triangle"){
        drawTriangle(point);
    } else if(selectedTool === "line") {
        drawLine(point);
    } else if(selectedTool === "random-draw") {
        drawRandom(point);
    } else if(selectedTool === "polygon") {
        drawPolygon(point);
    } else {
        drawTriangle(point);
    }
};

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

//Controle dos botôes que não sejam do HSV
presetColorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".colors .selected")?.classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = window.getComputedStyle(btn).backgroundColor;
        hsvPicker.classList.remove("visible");
    });
});

//Controle para a roda do mouse + ctrl para zoom
drawingBoard.addEventListener("wheel", (e) => {
    if(!e.ctrlKey) return;
    e.preventDefault();
    if(e.deltaY < 0) {
        zoomLevel += ZOOM_STEP;
    } else {
        zoomLevel -= ZOOM_STEP;
    }
    zoomLevel = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomLevel));
    applyZoom();
}, { passive: false });

//Controle para resetar o zoom
resetZoomBtn.addEventListener(
    "click",
    resetZoom
);

//Conecta todos os componentes do selecionador de HSV
hueSlider.addEventListener("input", updateHSVColor);
saturationSlider.addEventListener("input", updateHSVColor);
valueSlider.addEventListener("input", updateHSVColor);

//Conecta botôes de undo e redo
undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

//Abre o painel de HSV
customColorButton.addEventListener("click", (e) => {
    e.stopPropagation();
    hsvPicker.classList.toggle("visible");
    document.querySelector(".colors .selected")?.classList.remove("selected");
    customColorButton.classList.add("selected");
    selectedColor = window.getComputedStyle(customColorButton).backgroundColor;
});

//Reseta para o azul original com o botão Reset
resetColor.addEventListener("click", () => {
    const defaultColor = customColorButton.dataset.defaultColor;

    customColorButton.style.backgroundColor = defaultColor;

    hsvPreview.style.backgroundColor = defaultColor;

    selectedColor = defaultColor;

    hueSlider.value = 213;
    saturationSlider.value = 70;
    valueSlider.value = 97;
    
    hueValue.textContent = "213°";
    saturationValue.textContent = "70%";
    valueValue.textContent = "97%";
    
    document.querySelector(".colors .selected")?.classList.remove("selected");
    customColorButton.classList.add("selected");
});

//Limpa  a tela
clearCanvas.addEventListener("click", () => {
    saveState(); //Salva desenho
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
    hasDrawn = false; // Reset the flag when canvas is cleared
    updateHistoryButtons(); //Vê se os botôes de undo e redo estão habilitados ou não
});

//Salva a imagem
saveImg.addEventListener("click", () => {
    if (!hasDrawn) { // Prevent saving if nothing has been drawn
        alert("You cannot save an empty board!");
        return;
    }
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => { isDrawing = false; });
canvas.addEventListener("mouseleave", () => { isDrawing = false; });
