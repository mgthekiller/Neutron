let editor;
let fileList = [];
let scene, camera, renderer, clock;
let player, ground;
let keys = {};
let assets = {};

// Load Monaco editor for Cubec script
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs' } });
require(["vs/editor/editor.main"], function() {
    monaco.languages.register({ id: "cubec" });
    monaco.languages.setMonarchTokensProvider("cubec", {
        tokenizer: {
            root: [
                // الكلمات المحجوزة (Keywords)
                [/\b(import|export|let|const|var|function|class|new|if|else|while|do|for|return|break|continue|switch|case|default|try|catch|finally|throw|extends|super|static|this|typeof|instanceof|in|of|delete|void|yield|await|async)\b/, "keyword"],

                // الكلمات الثابتة (Constants)
                [/\b(true|false|null|undefined|NaN|Infinity)\b/, "constant"],

                // تعريف الأنواع (Types)
                [/\b(int|float|double|boolean|string|char|void|any|Array|Object|Map|Set|Date|RegExp)\b/, "type"],

                // التعليقات
                [/(\/\/.*$)/, "comment"], // تعليق سطر واحد
                [/(\/\*[\s\S]*?\*\/)/, "comment"], // تعليق متعدد الأسطر
                [/(\/\/\s*(TODO|FIXME|NOTE|HACK):?.*$)/, "comment.special"], // TODO / FIXME / HACK / NOTE

                // التعليقات التوضيحية (JSDoc-like)
                [/(\/\*\*[\s\S]*?\*\/)/, "comment.doc"], 

                // الأرقام
                [/\b\d+\b/, "number"], // أعداد صحيحة
                [/\b\d+\.\d+\b/, "number.float"], // أعداد عشرية
                [/0x[0-9a-fA-F]+\b/, "number.hex"], // أعداد ست عشرية
                [/-?\b\d+\b/, "number.negative"], // أعداد سالبة

                // النصوص والسلاسل
                [/"([^"\\]|\\.)*$/, "string.invalid"], // نص غير مكتمل
                [/".*?"/, "string"], // نصوص محصورة بين علامات الاقتباس العادية
                [/`([^`\\]|\\.)*`/, "string.template"], // قوالب نصوص متعددة الأسطر
                [/'([^'\\]|\\.)'/, "string.char"], // دعم الحرف الواحد 'a', 'b', إلخ

                // العمليات الحسابية والمنطقية (Operators)
                [/[+\-*/%=<>!&|^~]+/, "operator"], // العمليات الأساسية
                [/(==|===|!=|!==|<=|>=|&&|\|\||\*\*|<<|>>)/, "operator.logical"], // العمليات المنطقية والمقارنات المتقدمة

                // الفواصل (Delimiters)
                [/[{}()\[\]]/, "delimiter"],

                // الفئات (Class Names)
                [/\b[A-Z][a-zA-Z0-9_]*\b/, "type.class"], // أسماء الفئات تبدأ بحرف كبير

                // الدوال والمتغيرات
                [/\b[a-zA-Z_][a-zA-Z0-9_]*\b(?=\s*\()/, "function"], // تعريف واستدعاء الدوال
                [/\b[a-zA-Z_][a-zA-Z0-9_]*\b/, "variable"], // المتغيرات العادية

                // الكائنات والوظائف المدمجة (Built-in Objects)
                [/\b(Math|Game|Player|Physics|Graphics|Sound|Network|Storage|Console|Canvas|Engine|Renderer)\b/, "builtin"],

                // أسماء الوحدات في `import`
                [/(import\s+)([a-zA-Z0-9_]+)/, ["keyword", "module"]], // تمييز اسم الوحدة المستوردة

                // Regex (التعبيرات النمطية)
                [/\/(?!\/)(?:\\\/|[^\r\n])*?\//, "regexp"], // دعم /pattern/

                // التعليقات التوضيحية (Annotations)
                [/@[a-zA-Z_][a-zA-Z0-9_]*/, "annotation"]
            ]
        }
    });
    ;
    monaco.languages.registerCompletionItemProvider("cubec", {
        provideCompletionItems: function(model, position) {
            var suggestions = [
                {
                    label: "drawCube",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "drawCube(x, y, size)"
                },
                {
                    label: "moveObject",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "moveObject(dx, dy)"
                },
                {
                    label: "rotateObject",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "rotateObject(object, angle)"
                },
                {
                    label: "scaleObject",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "scaleObject(object, scaleX, scaleY)"
                },
                {
                    label: "spawnObject",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "spawnObject(x, y, size, color)"
                },
                {
                    label: "destroyObject",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "destroyObject(object)"
                },
                {
                    label: "log",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "log('message')"
                },
                {
                    label: "clearScreen",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "clearScreen()"
                },
                {
                    label: "playSound",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "playSound('url')"
                },
                {
                    label: "loadImage",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "loadImage('url')"
                },
                {
                    label: "moveCamera",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "moveCamera(x, y, z)"
                },
                {
                    label: "createLight",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "createLight(x, y, z, intensity)"
                },
                {
                    label: "spawnEnemy",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "spawnEnemy(x, y, z)"
                },
                {
                    label: "changeColor",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "changeColor(object, 'color')"
                },
                {
                    label: "toggleFullScreen",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "toggleFullScreen()"
                },
                {
                    label: "addParticleEffect",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "addParticleEffect(x, y, z)"
                },
                {
                    label: "addGravity",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "addGravity(object)"
                },
                {
                    label: "showScore",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "showScore(score)"
                },
                {
                    label: "createTimer",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "createTimer(duration)"
                },
                {
                    label: "playBackgroundMusic",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "playBackgroundMusic('url')"
                },
                {
                    label: "onKeyPress",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "onKeyPress(key, callback)"
                },
                {
                    label: "onMouseClick",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "onMouseClick(callback)"
                },
                {
                    label: "constCanvas",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "const canvas = document.getElementById('gameCanvas');"
                },
                {
                    label: "Let canvas",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "let canvas = document.getElementById('gameCanvas');"
                },
                {
                    label: "drawText",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "function drawText(text, x, y, color = 'white', font = '20px Arial')"
                },
                {
                    label: "Let ctx",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "let ctx = canvas.getContext('2d');"
                },
                {
                    label: "Fmove",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "function moveSnake() {         let head = { ...snake[0] };             if (direction === 'right') head.x += gridSize;   if (direction === 'left') head.x -= gridSize;  if (direction === 'up') head.y -= gridSize;  if (direction === 'down') head.y += gridSize;  }"
                },
                {
                    label: "clear",
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: "ctx.clearRect(0, 0, canvasWidth, canvasHeight);"
                }
            ];
            return { suggestions: suggestions };
        }
    });
    
    
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: `// Initialize canvas and context
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

// Define GameObject class
class GameObject {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speed = 5;
        this.image = null;
    }

    loadImage(url) {
        let img = new Image();
        img.onload = () => { this.image = img; this.draw(); };
        img.src = url;
    }

    draw() {
        if (this.image) {
            ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    animate() {
        // Override to add animations
    }
}

// Player-specific behavior
class Player extends GameObject {
    constructor(x, y, size, color) {
        super(x, y, size, color);
    }

    animate() {
        // Custom animation logic
    }
}

// Function to draw text on the canvas
function drawText(text, x, y, color = 'white', font = '20px Arial') {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, x, y);
}

// Function to play sound
function playSound(url) {
    let audio = new Audio(url);
    audio.play();
}

// Function to clear the screen
function clearScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Function to rotate an object
function rotateObject(object, angle) {
    ctx.save();
    ctx.translate(object.x + object.size / 2, object.y + object.size / 2);
    ctx.rotate(angle);
    ctx.translate(-object.x - object.size / 2, -object.y - object.size / 2);
    object.draw();
    ctx.restore();
}

// Function to scale an object
function scaleObject(object, scaleX, scaleY) {
    ctx.save();
    ctx.translate(object.x + object.size / 2, object.y + object.size / 2);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-object.x - object.size / 2, -object.y - object.size / 2);
    object.draw();
    ctx.restore();
}

// Function to spawn an object
function spawnObject(x, y, size, color) {
    let obj = new GameObject(x, y, size, color);
    obj.draw();
    return obj;
}

// Function to destroy an object
function destroyObject(object) {
    // Simply clear the area where the object was
    ctx.clearRect(object.x, object.y, object.size, object.size);
}

// Log function
function log(message) {
    console.log(message);
}

// Keyboard input handling
document.addEventListener('keydown', function(event) {
    keys[event.key] = true;
    if (keys['ArrowUp']) player.move(0, -player.speed);
    if (keys['ArrowDown']) player.move(0, player.speed);
    if (keys['ArrowLeft']) player.move(-player.speed, 0);
    if (keys['ArrowRight']) player.move(player.speed, 0);
    drawScene();
});

document.addEventListener('keyup', function(event) {
    keys[event.key] = false;
});

// Create player object and load image
let player = new Player(50, 50, 20, 'red');
player.loadImage('https://example.com/playerImage.png');  // Example image URL

// Function to draw the scene
function drawScene() {
    clearScreen();
    player.draw();
    drawText("Player", player.x, player.y - 10, 'yellow');
    player.animate();
}

drawScene();
`,

        language: "cubec",
        theme: "hc-black"
    });
});

// 3D setup with THREE.js
function init3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
    renderer.setSize(window.innerWidth * 0.4, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    camera.position.z = 5;

    // Basic ground plane
    const geometry = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    ground = new THREE.Mesh(geometry, material);
    scene.add(ground);

    // Player cube
    const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    scene.add(player);

    animate();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    let delta = clock.getDelta();

    // Player movement logic
    if (keys['ArrowUp']) player.position.z -= 0.1;
    if (keys['ArrowDown']) player.position.z += 0.1;
    if (keys['ArrowLeft']) player.position.x -= 0.1;
    if (keys['ArrowRight']) player.position.x += 0.1;

    renderer.render(scene, camera);
}

init3D();

// Additional functions integrated into the existing setup

function rotateObject3D(object, angleX, angleY, angleZ) {
    object.rotation.x += angleX;
    object.rotation.y += angleY;
    object.rotation.z += angleZ;
}

function scaleObject3D(object, scaleX, scaleY, scaleZ) {
    object.scale.set(scaleX, scaleY, scaleZ);
}

function spawnEnemy(x, y, z) {
    let enemyGeometry = new THREE.BoxGeometry(1, 1, 1);
    let enemyMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    let enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(x, y, z);
    scene.add(enemy);
    return enemy;
}

function changeColor(object, color) {
    object.material.color.set(color);
}

function moveCamera(x, y, z) {
    camera.position.x += x;
    camera.position.y += y;
    camera.position.z += z;
}

function loadTexture(object, textureUrl) {
    let texture = new THREE.TextureLoader().load(textureUrl);
    object.material.map = texture;
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function createLight(x, y, z, intensity) {
    let light = new THREE.PointLight(0xffffff, intensity, 100);
    light.position.set(x, y, z);
    scene.add(light);
}

function playBackgroundMusic(url) {
    let audio = new Audio(url);
    audio.loop = true;
    audio.play();
}

function spawnItem(x, y, z, itemType) {
    let geometry = new THREE.SphereGeometry(0.5, 32, 32);
    let material = new THREE.MeshBasicMaterial({ color: itemType === 'health' ? 0x00ff00 : 0xff0000 });
    let item = new THREE.Mesh(geometry, material);
    item.position.set(x, y, z);
    scene.add(item);
    return item;
}

function showScore(score) {
    drawText("Score: " + score, 10, 30, 'yellow');
}

function createTimer(duration) {
    let timer = duration;
    let interval = setInterval(() => {
        if (timer <= 0) {
            clearInterval(interval);
            alert("Time's up!");
        }
        timer--;
    }, 1000);
}

function addParticleEffect(x, y, z) {
    let particleGeometry = new THREE.SphereGeometry(0.1, 10, 10);
    let particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    let particle = new THREE.Mesh(particleGeometry, particleMaterial);
    particle.position.set(x, y, z);
    scene.add(particle);
    setTimeout(() => scene.remove(particle), 1000);
}

function addGravity(object) {
    let gravity = -0.1;
    object.position.y += gravity;
}

function runCode() {
    try {
        document.getElementById("console").innerHTML = "";
        eval(editor.getValue());
        document.getElementById("console").innerHTML = "Execution successful";
    } catch (error) {
        const errorMessage = `
            <strong style="color:red;">Error: </strong><span style="color:white;">${error.message}</span><br>
            <strong style="color:orange;">Line: </strong><span style="color:white;">${error.lineNumber}</span><br>
            <strong style="color:orange;">Column: </strong><span style="color:white;">${error.columnNumber}</span><br>
            <a href="javascript:goToErrorLine(${error.lineNumber})" style="color: #6562; text-decoration: underline;">Go to line ${error.lineNumber}</a>
        `;
        document.getElementById("console").innerHTML = errorMessage;
    }
}

function goToErrorLine(lineNumber) {
    const model = editor.getModel();
    const linePosition = new monaco.Position(lineNumber, 1);
    editor.revealLineInCenter(linePosition.lineNumber);
    editor.setPosition(linePosition);
}

async function saveCode() {
    try {
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: "myCode.x94",
            types: [{
                description: "Custom Code Files",
                accept: { "text/plain": [".x94"] }
            }]
        });

        const writable = await fileHandle.createWritable();
        await writable.write(editor.getValue());
        await writable.close();
        alert("File saved successfully!");
    } catch (error) {
        console.error("Save cancelled or failed:", error);
    }
}


async function loadCode() {
    try {
        // فتح نافذة اختيار الملف
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: "Custom Code Files",
                accept: { "text/plain": [".x94"] }
            }]
        });

        // قراءة محتوى الملف
        const file = await fileHandle.getFile();
        const text = await file.text();

        // تحميل المحتوى إلى المحرر
        editor.setValue(text);
        alert("File loaded successfully!");
    } catch (error) {
        console.error("Load cancelled or failed:", error);
    }
}

function updateFileExplorer() {
    const fileExplorer = document.getElementById("fileExplorer");
    fileExplorer.innerHTML = "";
    fileList.forEach(fileName => {
        const fileItem = document.createElement("div");
        fileItem.classList.add("file-item");
        fileItem.innerText = fileName;
        fileItem.onclick = () => loadFile(fileName);
        fileExplorer.appendChild(fileItem);
    });
}

function loadFile(fileName) {
    const fileContent = localStorage.getItem(fileName);
    if (fileContent) {
        editor.setValue(fileContent);
    }
}

function importAsset() {
    alert('Coming Soon ');
    }