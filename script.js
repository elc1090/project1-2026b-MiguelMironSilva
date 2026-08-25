const canvas = document.querySelector("canvas"),
drawingBoard = document.querySelector(".drawing-board"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
polygonSidesInput = document.querySelector("#polygon-sides"),
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
rotationInput = document.querySelector("#selection-rotation"),
applySelectionBtn = document.querySelector(".apply-selection"),
cancelSelectionBtn = document.querySelector(".cancel-selection"),
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
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.1;

//Suporte para seleção, movimento, escalonamento e rotação
let selectionActive = false;
let isSelecting = false;
let selectionMode = null;
let selectionStartX = 0;
let selectionStartY = 0;
let selectionCanvas = null;
let selectionBackground = null;
let selectionSessionStart = null;
let selection = { 
    centerX: 0, centerY: 0, width: 0, height: 0, scale: 1, rotation: 0
};
let transformStart = {
    mouseX: 0, mouseY: 0, centerX: 0, centerY: 0, scale: 1, distance: 1
};

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
    document.querySelector(".colors .selected")?.classList.remove("selected");
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
    if(selectionActive) {
        renderSelection(); //handler de seleção fica ativo em todas as escalas
    }
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

//Normalizador da caixa de seleção inicial
const normalizeRect = (x1, y1, x2, y2) => {
    return {
        x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1)
    };
};

//Arrastador da caixa de seleção
const startSelection = (point) => {
    isSelecting = true;
    selectionStartX = point.offsetX;
    selectionStartY = point.offsetY;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

//Previsão da movimentação da caixa de seleção
const previewSelectionRectangle = (point) => {
    if(!isSelecting) return;
    ctx.putImageData(snapshot, 0, 0);
    const rect = normalizeRect( selectionStartX, selectionStartY, point.offsetX, point.offsetY);
    ctx.save();
    ctx.strokeStyle = "#4A98F7";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect( rect.x, rect.y, rect.width, rect.height);
    ctx.restore();
};

//Lógica de rotacionamento dos pontos
const rotatePoint = (x, y, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: selection.centerX + x * cos - y * sin,
        y: selection.centerY + x * sin + y * cos
    };
};

//Cria os cantos de seleção
const getSelectionCorners = () => {
    const width = selection.width * selection.scale;
    const height = selection.height * selection.scale;
    const halfW = width / 2;
    const halfH = height / 2;
    const angle = selection.rotation * Math.PI / 180;
    return [
        rotatePoint(-halfW, -halfH, angle),
        rotatePoint( halfW, -halfH, angle),
        rotatePoint( halfW,  halfH, angle),
        rotatePoint(-halfW,  halfH, angle)
    ];
};

//Desenha os cantos de seleção
const drawSelectionHandles = () => {
    const corners = getSelectionCorners();
    ctx.save();
    ctx.strokeStyle = "#4A98F7";
    ctx.fillStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);

    for(let i = 1; i < corners.length; i++) {
        ctx.lineTo(corners[i].x, corners[i].y);
    }

    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    const handleSize = 8 / zoomLevel;

    for(const corner of corners) {
        ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(corner.x - handleSize / 2, corner.y - handleSize / 2,  handleSize, handleSize);
    }

    ctx.restore();
};

//Testando as colisões dos  cantos
const hitTestCorner = (point) => {
    const corners = getSelectionCorners();
    const threshold = 10 / zoomLevel;
    for(let i = 0; i < corners.length; i++) {
        const dx =  point.offsetX - corners[i].x;
        const dy = point.offsetY - corners[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if(distance <= threshold) {
            return i;
        }
    }
    return -1;
};

//Testando as colisões no retângulo rotacionado
//Matematicamente se desfaz a rotação
const pointInSelection = (point) => {
    const dx = point.offsetX - selection.centerX;
    const dy = point.offsetY - selection.centerY;
    const angle = -selection.rotation * Math.PI / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;
    const halfW = selection.width * selection.scale / 2;
    const halfH = selection.height * selection.scale / 2;
    return ( Math.abs(localX) <= halfW && Math.abs(localY) <= halfH);
};

//Renderiza a imagem flutuante
const renderSelection = () => {
    if(!selectionActive) return;
    ctx.putImageData(selectionBackground, 0, 0);
    const width = selection.width * selection.scale;
    const height = selection.height * selection.scale;
    const radians = selection.rotation * Math.PI / 180;
    ctx.save();
    ctx.translate(selection.centerX, selection.centerY);
    ctx.rotate(radians);
    ctx.drawImage(selectionCanvas, -width / 2, -height / 2, width, height);
    ctx.restore();
    drawSelectionHandles();
};

//Criação da caixa de seleção
const beginSelectionSession = (rect) => {
    selectionSessionStart = getCanvasState();
    const x = Math.round(rect.x);
    const y = Math.round(rect.y);
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    const imageData = ctx.getImageData(x, y, width, height);
    selectionCanvas = document.createElement("canvas");
    selectionCanvas.width = width;
    selectionCanvas.height = height;
    const selectionCtx = selectionCanvas.getContext("2d");
    selectionCtx.putImageData( imageData, 0, 0);
    //Remove pixels originais
    ctx.fillStyle = "#fff";
    ctx.fillRect( x, y, width, height);

    selectionBackground = ctx.getImageData( 0, 0, canvas.width, canvas.height);
    selection.centerX = x + width / 2;
    selection.centerY = y + height / 2;
    selection.width = width;
    selection.height = height;
    selection.scale = 1;
    selection.rotation = 0;
    selectionActive = true;
    rotationInput.value = 0;
    rotationInput.disabled = false;
    applySelectionBtn.disabled = false;
    cancelSelectionBtn.disabled = false;
    renderSelection();
};

//Finalização da caixa de seleção
const finishSelection = (point) => {
    if(!isSelecting) return;
    isSelecting = false;
    ctx.putImageData(snapshot, 0, 0);
    const rect = normalizeRect( selectionStartX, selectionStartY, point.offsetX, point.offsetY);
    if(rect.width < 2 || rect.height < 2) {
        return;
    }
    beginSelectionSession(rect);
};

//Começo do vovimento e escalonamento da caixa de seleção
const startSelectionTransform = (point) => {
    const corner = hitTestCorner(point);
    if(corner !== -1) {
        selectionMode = "scale";
        transformStart.scale = selection.scale;
        const dx = point.offsetX - selection.centerX;
        const dy = point.offsetY - selection.centerY;
        transformStart.distance = Math.sqrt( dx * dx + dy * dy);
        return true;
    }
    if(pointInSelection(point)) {
        selectionMode = "move";
        transformStart.mouseX = point.offsetX;
        transformStart.mouseY = point.offsetY;
        transformStart.centerX = selection.centerX;
        transformStart.centerY = selection.centerY;
        return true;
    }
    return false;
};

//Movimento da caixa de seleção
const moveSelection = (point) => {
    selection.centerX = transformStart.centerX + (point.offsetX - transformStart.mouseX);
    selection.centerY = transformStart.centerY + (point.offsetY - transformStart.mouseY);
    renderSelection();
};

//Escalonamento uniforme dos cantos
const scaleSelection = (point) => {
    const dx = point.offsetX - selection.centerX;
    const dy = point.offsetY - selection.centerY;
    const currentDistance = Math.sqrt(  dx * dx +  dy * dy);
    if(transformStart.distance === 0) {
        return;
    }
    const ratio = currentDistance / transformStart.distance;
    selection.scale = Math.max(  0.05, transformStart.scale * ratio);
    renderSelection();
};

//Helper para desfazer os movimentos da caixa de seleção
const pushUndoState = (state) => {
    undoStack.push(state);
    if(undoStack.length > MAX_HISTORY) {
        undoStack.shift();
    }
    redoStack = [];
    updateHistoryButtons();
};

//Reseta o estado da transformação
const endSelectionSession = () => {
    selectionActive = false;
    isSelecting = false;
    selectionMode = null;
    selectionCanvas = null;
    selectionBackground = null;
    selectionSessionStart = null;
    rotationInput.value = 0;
    rotationInput.disabled = true;
    applySelectionBtn.disabled = true;
    cancelSelectionBtn.disabled = true;
};

//Salva a seção de seleção inteira
const commitSelection = () => {
    if(!selectionActive) return;
    //Remove prévia + maçanetas
    ctx.putImageData( selectionBackground, 0, 0);
    const width = selection.width * selection.scale;
    const height = selection.height * selection.scale;
    const radians = selection.rotation * Math.PI / 180;
    ctx.save();
    ctx.translate( selection.centerX, selection.centerY);
    ctx.rotate(radians);
    ctx.drawImage(selectionCanvas, -width / 2, -height / 2, width, height);
    ctx.restore();
    pushUndoState(selectionSessionStart);
    hasDrawn = true;
    endSelectionSession();
};

//Cancelamento da sessão
const cancelSelection = () => {
    if(!selectionActive) return;
    restoreState( selectionSessionStart);
    endSelectionSession();
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
    const point = getCanvasCoordinates(e); //converte e para point
    if(selectedTool === "selection") { //integra com a seleção
        if(selectionActive) {
            if(startSelectionTransform(point)) {
                return;
            }
            commitSelection(); //clicar fora da caixa comita ela
        }
        startSelection(point);
        return;
    }
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
    const point = getCanvasCoordinates(e); //conversão de "e" para "points"
    if(selectedTool === "selection") { //integra com seleção
        if(isSelecting) {
            previewSelectionRectangle(point);
            return;
        }
        if(selectionMode === "move") {
            moveSelection(point);
            return;
        }
        if(selectionMode === "scale") {
            scaleSelection(point);
            return;
        }
        return;
    }
    if(!isDrawing) return;
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
        if( //se o usuário selecionar outra ferramenta, comita a seleção
            selectionActive && btn.id !== "selection"
        ) {
            commitSelection();
        }
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

//Rotação numérica
rotationInput.addEventListener(
    "input",
    () => {
        if(!selectionActive) return;
        let angle = Number(rotationInput.value);
        if(Number.isNaN(angle)) return;
        angle = Math.min( 360, Math.max(0, angle));
        rotationInput.value = angle;
        selection.rotation = angle;
        renderSelection();
    }
);

//Conecta todos os componentes do selecionador de HSV
hueSlider.addEventListener("input", updateHSVColor);
saturationSlider.addEventListener("input", updateHSVColor);
valueSlider.addEventListener("input", updateHSVColor);

//Conecta botôes de undo e redo
undoBtn.addEventListener("click", () => {
        if(selectionActive) { //integra com o cancelador de seleção
            cancelSelection();
            return;
        }
        undo();
    });
redoBtn.addEventListener("click", () => {
    if(selectionActive) { //não faz redo durante uma seleção ativa
        return;
    }
    redo();
});

//Abre o painel de HSV
customColorButton.addEventListener("click", (e) => {
    e.stopPropagation();
    hsvPicker.classList.toggle("visible");
    document.querySelector(".colors .selected")?.classList.remove("selected");
    customColorButton.classList.add("selected");
    selectedColor = window.getComputedStyle(customColorButton).backgroundColor;
});

//Clica para selecionar e cancelar
applySelectionBtn.addEventListener("click", commitSelection);
cancelSelectionBtn.addEventListener( "click", cancelSelection);

//Enter para comitar seleção, esc para cancelar
document.addEventListener("keydown", (e) => {
        if(!selectionActive) return;
        if(e.key === "Enter") {
            e.preventDefault();
            commitSelection();
        }
        if(e.key === "Escape") {
            e.preventDefault();
            cancelSelection();
        }
    }
);

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
    if(selectionActive) { //comita a seleção antes de limpar
        commitSelection();
    }
    saveState(); //Salva desenho
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
    hasDrawn = false; // Reset the flag when canvas is cleared
    updateHistoryButtons(); //Vê se os botôes de undo e redo estão habilitados ou não
});

//Salva a imagem
saveImg.addEventListener("click", () => {
    if(selectionActive) { //comita a seleção antes de salvar
        commitSelection();
    }
    if (!hasDrawn) { // Prevent saving if nothing has been drawn
        alert("Você não pode salvar um quadro vazio!");
        return;
    }
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", (e) => { //integra com seleção
        const point = getCanvasCoordinates(e);
        if(isSelecting) {
            finishSelection(point);
        }
        selectionMode = null;
        isDrawing = false;
    });
canvas.addEventListener("mouseleave", () => {
    isDrawing = false;
    selectionMode = null;
    if(isSelecting) {
        ctx.putImageData(snapshot, 0, 0);
        isSelecting = false;
    }
});
