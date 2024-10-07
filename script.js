const colorOptions = document.querySelectorAll('.color-option');
let targetColor = '#F00'; // по умолчанию красный
let brushSize = 20;
let isDrawing = false; // Флаг для отслеживания начала рисования
let lastX = 0;
let lastY = 0;
let isErasing = false; // Флаг для отслеживания режима стиралки
let undoStack = []; // Стек для хранения состояний канваса

// Инициализация выделенного цвета по умолчанию
const defaultColorOption = document.getElementById('red');
defaultColorOption.style.height = '80px';
defaultColorOption.style.width = '80px';

colorOptions.forEach(option => {
  option.addEventListener('click', pickColor);
});

const canvas = document.getElementById('canvas');
const canvasContext = canvas.getContext('2d');

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', drawOnCanvas);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

document.getElementById('brushSize').addEventListener('input', e => {
  brushSize = e.target.value;
});

// Кнопка стиралки
const eraser = document.getElementById('eraser');
eraser.addEventListener('click', () => {
  isErasing = !isErasing; // Переключение режима стиралки
  eraser.classList.toggle('active', isErasing); // Подсветка активной стиралки
});

function pickColor(e) {
  isErasing = false; // Сброс режима стиралки при выборе цвета
  eraser.classList.remove('active'); // Убираем подсветку стиралки
  targetColor = e.target.style.backgroundColor;
  colorOptions.forEach(option => {
    option.style.height = '50px';
    option.style.width = '50px';
  });
  e.target.style.height = '80px';
  e.target.style.width = '80px';
}

function startDrawing(e) {
  isDrawing = true;
  saveCanvasState(); // Сохранение состояния канваса перед началом рисования
  [lastX, lastY] = [e.offsetX, e.offsetY];
}

function stopDrawing() {
  isDrawing = false;
  canvasContext.beginPath(); // Прекращение текущего пути
}

function drawOnCanvas(e) {
  if (!isDrawing) return; // Прекращаем рисовать, если не зажата кнопка мыши
  canvasContext.strokeStyle = isErasing ? '#FFF' : targetColor; // Если стираем, то цвет — белый
  canvasContext.lineWidth = isErasing ? brushSize * 2 : brushSize; // Стиралка больше по размеру
  canvasContext.lineCap = 'round'; // Закругление концов линии
  canvasContext.beginPath();
  canvasContext.moveTo(lastX, lastY); // Начинаем с последней точки
  canvasContext.lineTo(e.offsetX, e.offsetY); // Рисуем линию до новой точки
  canvasContext.stroke(); // Применяем нарисованное
  [lastX, lastY] = [e.offsetX, e.offsetY]; // Обновляем координаты последней точки
}

// Функция для сохранения текущего состояния канваса
function saveCanvasState() {
  const imageData = canvasContext.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );
  undoStack.push(imageData);
}

// Обработка Ctrl + Z для отмены действия
document.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.key === 'z') {
    undoLastAction();
  }
});

// Функция для отмены последнего действия
function undoLastAction() {
  if (undoStack.length > 0) {
    const previousState = undoStack.pop();
    canvasContext.putImageData(previousState, 0, 0);
  }
}
