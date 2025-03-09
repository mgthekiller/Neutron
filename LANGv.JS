// Enhanced initialization and setup
let editor;
let fileList = [];
let scene, camera, renderer, clock;
let player, ground;
let keys = {};
let assets = {};
let gameObjects = []; // Track all game objects
let physicsEnabled = false;
let currentGameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver'

// Asset Management System
const assetManager = {
    images: {},
    sounds: {},
    models: {},
    
    loadImage: function(key, url, callback) {
        const img = new Image();
        img.onload = () => {
            this.images[key] = img;
            if (callback) callback(img);
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${url}`);
        };
        img.src = url;
    },
    
    loadSound: function(key, url, callback) {
        const audio = new Audio();
        audio.oncanplaythrough = () => {
            this.sounds[key] = audio;
            if (callback) callback(audio);
        };
        audio.onerror = () => {
            console.error(`Failed to load sound: ${url}`);
        };
        audio.src = url;
    },
    
    loadModel: function(key, url, callback) {
        const loader = new THREE.GLTFLoader();
        loader.load(url, (gltf) => {
            this.models[key] = gltf;
            if (callback) callback(gltf);
        }, undefined, (error) => {
            console.error(`Failed to load model: ${url}`, error);
        });
    },
    
    getImage: function(key) {
        return this.images[key];
    },
    
    getSound: function(key) {
        return this.sounds[key];
    },
    
    getModel: function(key) {
        return this.models[key];
    }
};

// Game State Management
const gameStateManager = {
    currentState: 'menu',
    
    states: {
        menu: {
            enter: function() {
                // Show menu UI
                document.getElementById('menuScreen').style.display = 'block';
                document.getElementById('gameCanvas').style.display = 'none';
            },
            update: function() {
                // Update menu animations
            },
            exit: function() {
                document.getElementById('menuScreen').style.display = 'none';
                document.getElementById('gameCanvas').style.display = 'block';
            }
        },
        playing: {
            enter: function() {
                // Start game logic
                clock = new THREE.Clock();
                if (physicsEnabled) initPhysics();
            },
            update: function() {
                // Update game logic
                updateGameObjects();
                if (physicsEnabled) updatePhysics();
            },
            exit: function() {
                // Cleanup
            }
        },
        paused: {
            enter: function() {
                // Show pause menu
                document.getElementById('pauseScreen').style.display = 'block';
            },
            update: function() {
                // Minimal updates while paused
            },
            exit: function() {
                document.getElementById('pauseScreen').style.display = 'none';
            }
        },
        gameOver: {
            enter: function() {
                // Show game over screen
                document.getElementById('gameOverScreen').style.display = 'block';
            },
            update: function() {
                // Game over animations
            },
            exit: function() {
                document.getElementById('gameOverScreen').style.display = 'none';
            }
        }
    },
    
    changeState: function(newState) {
        if (this.states[this.currentState]) {
            this.states[this.currentState].exit();
        }
        this.currentState = newState;
        if (this.states[this.currentState]) {
            this.states[this.currentState].enter();
        }
    },
    
    update: function() {
        if (this.states[this.currentState] && this.states[this.currentState].update) {
            this.states[this.currentState].update();
        }
    }
};

// Enhanced Physics System
let physicsWorld;
const rigidBodies = [];

function initPhysics() {
    // Set up Ammo.js physics (assuming Ammo.js is loaded)
    if (typeof Ammo !== 'undefined') {
        const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
        const overlappingPairCache = new Ammo.btDbvtBroadphase();
        const solver = new Ammo.btSequentialImpulseConstraintSolver();
        
        physicsWorld = new Ammo.btDiscreteDynamicsWorld(
            dispatcher, overlappingPairCache, solver, collisionConfiguration
        );
        physicsWorld.setGravity(new Ammo.btVector3(0, -9.8, 0));
    } else {
        console.warn("Ammo.js not loaded. Physics system will use simplified calculations.");
        // Fall back to simplified physics
    }
}

function createRigidBody(object, mass, shape) {
    if (typeof Ammo === 'undefined') {
        // Simplified physics for objects
        object.velocity = { x: 0, y: 0, z: 0 };
        object.acceleration = { x: 0, y: 0, z: 0 };
        object.mass = mass;
        gameObjects.push(object);
        return;
    }
    
    // Ammo.js implementation
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(object.position.x, object.position.y, object.position.z));
    
    const motionState = new Ammo.btDefaultMotionState(transform);
    const localInertia = new Ammo.btVector3(0, 0, 0);
    
    if (mass > 0) {
        shape.calculateLocalInertia(mass, localInertia);
    }
    
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);
    
    physicsWorld.addRigidBody(body);
    
    object.userData.physicsBody = body;
    rigidBodies.push(object);
}

function updatePhysics() {
    if (typeof Ammo !== 'undefined' && physicsWorld) {
        // Update Ammo.js physics
        physicsWorld.stepSimulation(clock.getDelta(), 10);
        
        // Update objects
        for (let i = 0; i < rigidBodies.length; i++) {
            const objThree = rigidBodies[i];
            const objPhys = objThree.userData.physicsBody;
            const ms = objPhys.getMotionState();
            
            if (ms) {
                ms.getWorldTransform(tmpTrans);
                const p = tmpTrans.getOrigin();
                const q = tmpTrans.getRotation();
                objThree.position.set(p.x(), p.y(), p.z());
                objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
            }
        }
    } else {
        // Simple physics update
        gameObjects.forEach(obj => {
            if (obj.velocity) {
                // Apply gravity
                obj.velocity.y -= 9.8 * 0.01 * (obj.mass || 1);
                
                // Apply velocity
                obj.position.x += obj.velocity.x;
                obj.position.y += obj.velocity.y;
                obj.position.z += obj.velocity.z;
                
                // Simple ground collision
                if (obj.position.y < 0) {
                    obj.position.y = 0;
                    obj.velocity.y = 0;
                }
            }
        });
    }
}

// Improved collision detection system
function checkCollision(obj1, obj2) {
    // Simple box collision
    return (
        obj1.position.x < obj2.position.x + obj2.size &&
        obj1.position.x + obj1.size > obj2.position.x &&
        obj1.position.y < obj2.position.y + obj2.size &&
        obj1.position.y + obj1.size > obj2.position.y &&
        obj1.position.z < obj2.position.z + obj2.size &&
        obj1.position.z + obj1.size > obj2.position.z
    );
}

function detectCollisions() {
    for (let i = 0; i < gameObjects.length; i++) {
        const obj1 = gameObjects[i];
        
        for (let j = i + 1; j < gameObjects.length; j++) {
            const obj2 = gameObjects[j];
            
            if (checkCollision(obj1, obj2)) {
                // Trigger collision handlers if they exist
                if (obj1.onCollision) obj1.onCollision(obj2);
                if (obj2.onCollision) obj2.onCollision(obj1);
                
                // Apply simple physics response
                if (obj1.velocity && obj2.velocity) {
                    // Simple elastic collision
                    const temp = { x: obj1.velocity.x, y: obj1.velocity.y, z: obj1.velocity.z };
                    obj1.velocity.x = obj2.velocity.x;
                    obj1.velocity.y = obj2.velocity.y;
                    obj1.velocity.z = obj2.velocity.z;
                    obj2.velocity.x = temp.x;
                    obj2.velocity.y = temp.y;
                    obj2.velocity.z = temp.z;
                }
            }
        }
    }
}

// Enhanced GameObject class with physics support
class GameObject {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.z = 0;
        this.size = size;
        this.color = color;
        this.speed = 5;
        this.image = null;
        this.velocity = { x: 0, y: 0, z: 0 };
        this.acceleration = { x: 0, y: 0, z: 0 };
        this.mass = 1;
        this.tags = [];
        this.components = {};
        
        // Add to game objects array
        gameObjects.push(this);
    }

    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
        }
    }
    
    hasTag(tag) {
        return this.tags.includes(tag);
    }
    
    addComponent(name, component) {
        this.components[name] = component;
        if (component.init) {
            component.init(this);
        }
    }
    
    getComponent(name) {
        return this.components[name];
    }
    
    loadImage(url) {
        let img = new Image();
        img.onload = () => { this.image = img; };
        img.src = url;
    }

    draw(ctx) {
        if (this.image) {
            ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    move(dx, dy, dz = 0) {
        this.x += dx;
        this.y += dy;
        this.z += dz;
    }
    
    setPosition(x, y, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    getPosition() {
        return { x: this.x, y: this.y, z: this.z };
    }
    
    setVelocity(vx, vy, vz = 0) {
        this.velocity.x = vx;
        this.velocity.y = vy;
        this.velocity.z = vz;
    }
    
    getVelocity() {
        return this.velocity;
    }
    
    applyForce(fx, fy, fz = 0) {
        this.acceleration.x += fx / this.mass;
        this.acceleration.y += fy / this.mass;
        this.acceleration.z += fz / this.mass;
    }

    update() {
        // Apply acceleration
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        this.velocity.z += this.acceleration.z;
        
        // Apply velocity
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.z += this.velocity.z;
        
        // Reset acceleration
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        this.acceleration.z = 0;
        
        // Update components
        for (const name in this.components) {
            if (this.components[name].update) {
                this.components[name].update(this);
            }
        }
    }

    animate() {
        // Override to add animations
    }
    
    onCollision(other) {
        // Override to handle collisions
    }
    
    destroy() {
        // Remove from game objects array
        const index = gameObjects.indexOf(this);
        if (index !== -1) {
            gameObjects.splice(index, 1);
        }
    }
}

// Component system - example components
const components = {
    // Health component
    Health: function(maxHealth) {
        return {
            health: maxHealth,
            maxHealth: maxHealth,
            
            init: function(gameObject) {
                gameObject.health = this.health;
            },
            
            damage: function(amount) {
                this.health = Math.max(0, this.health - amount);
                if (this.health <= 0 && this.onDeath) {
                    this.onDeath();
                }
                return this.health;
            },
            
            heal: function(amount) {
                this.health = Math.min(this.maxHealth, this.health + amount);
                return this.health;
            },
            
            setOnDeath: function(callback) {
                this.onDeath = callback;
            }
        };
    },
    
    // AI component
    AI: function(type) {
        return {
            type: type,
            target: null,
            
            init: function(gameObject) {
                this.gameObject = gameObject;
            },
            
            setTarget: function(target) {
                this.target = target;
            },
            
            update: function() {
                if (!this.target) return;
                
                switch (this.type) {
                    case 'chase':
                        // Simple chase AI
                        const dx = this.target.x - this.gameObject.x;
                        const dy = this.target.y - this.gameObject.y;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        
                        if (dist > 0) {
                            const speed = this.gameObject.speed / dist;
                            this.gameObject.move(dx * speed, dy * speed);
                        }
                        break;
                        
                    case 'patrol':
                        // Implement patrol behavior
                        break;
                        
                    case 'flee':
                        // Implement flee behavior
                        break;
                }
            }
        };
    }
};

// Improved Monaco editor setup with enhanced language support
function setupMonacoEditor() {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs' } });
    require(["vs/editor/editor.main"], function() {
        monaco.languages.register({ id: "cubec" });
        monaco.languages.setMonarchTokensProvider("cubec", {
            tokenizer: {
                root: [
                    [/\b(import|let|const|function|class|new|if|else|while|for|return|break|continue|draw|move|sound|rotate|scale|spawn|destroy|add|line|PrintD|Create|setColor|setSize|getPosition|getSize|log|ctx|debug|loadImage|loadScript|saveGame|loadGame|setGravity|applyForce|setVelocity|getVelocity|playSound|stopSound|setVolume|setCameraPosition|getCameraPosition|shakeCamera|createLayer|setLayer|removeLayer|onCollision|detectCollision|connectToServer|sendData|receiveData)\b/, "keyword"],
                    [/\b(physicsEnabled|GameObject|Player|addComponent|getComponent|applyForce|setVelocity|createRigidBody|initPhysics|updatePhysics|checkCollision|detectCollisions|assetManager|gameStateManager)\b/, "keyword.extra"],
                    [/\d+/, "number"],
                    [/"[^"]*"/, "string"],
                    [/\/\/.*$/, "comment"],
                    [/\/\*/, "comment", "@comment"],
                    [/[{}()\[\]]/, "delimiter"],
                ]
            }
        });
        
        // Enhanced completion provider with new functions
        monaco.languages.registerCompletionItemProvider("cubec", {
            provideCompletionItems: function(model, position) {
                var suggestions = [
                    // Original suggestions
                    {
                        label: "drawCube",
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: "drawCube(x, y, size)"
                    },
                    // ... [all the original suggestions here]
                    
                    // New enhanced suggestions
                    {
                        label: "createGameObject",
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: "const obj = new GameObject(x, y, size, color);"
                    },
                    {
                        label: "addHealthComponent",
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: "obj.addComponent('health', components.Health(100));"
                    },
                    {
                        label: "enablePhysics",
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: "physicsEnabled = true;\ninitPhysics();"
                    },
                    {
                        label: "applyGravity",
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: "obj.applyForce(0, -9.8, 0);"
                    },
                    {
                        label: "loadGameAsset",
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: "assetManager.loadImage('keyName', 'url', (img) => {\n\t// Asset loaded\n});"
                    },
                    {
                        label: "changeGameState",
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: "gameStateManager.changeState('playing');"
                    },
                    {
                        label: "createAIEnemy",
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: "const enemy = new GameObject(x, y, size, 'red');\nenemy.addComponent('ai', components.AI('chase'));\nenemy.getComponent('ai').setTarget(player);"
                    },
                    {
                        label: "setupCollisionHandler",
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: "obj.onCollision = function(other) {\n\t// Handle collision\n};"
                    }
                ];
                return { suggestions: suggestions };
            }
        });
        
        // Create and configure editor
        editor = monaco.editor.create(document.getElementById('editor'), {
            value: getDefaultCode(),
            language: "cubec",
            theme: "hc-black",
            automaticLayout: true
        });
        
        // Add command execution
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function() {
            runCode();
        });
    });
}

function getDefaultCode() {
    return `// Cubec Engine - Game Template
// Use arrow keys to move the player

// Initialize game
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
physicsEnabled = true;

// Setup game state
gameStateManager.changeState('playing');

// Create player
let player = new GameObject(canvas.width / 2, canvas.height / 2, 30, 'blue');
player.addComponent('health', components.Health(100));

// Create enemies
for (let i = 0; i < 5; i++) {
    let enemy = new GameObject(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        20,
        'red'
    );
    enemy.addComponent('ai', components.AI('chase'));
    enemy.getComponent('ai').setTarget(player);
    
    // Handle collision with player
    enemy.onCollision = function(other) {
        if (other === player) {
            player.getComponent('health').damage(10);
            // Show damage effect
            addParticleEffect(player.x, player.y, player.z);
            playSound('hit');
        }
    };
}

// Load assets
assetManager.loadImage('playerImg', 'https://example.com/player.png', (img) => {
    player.image = img;
});
assetManager.loadSound('hit', 'https://example.com/hit.mp3');

// Keyboard input handling
document.addEventListener('keydown', function(event) {
    keys[event.key] = true;
});

document.addEventListener('keyup', function(event) {
    keys[event.key] = false;
});

// Game loop
function update() {
    // Handle input
    if (keys['ArrowUp']) player.move(0, -player.speed);
    if (keys['ArrowDown']) player.move(0, player.speed);
    if (keys['ArrowLeft']) player.move(-player.speed, 0);
    if (keys['ArrowRight']) player.move(player.speed, 0);
    
    // Update all game objects
    gameObjects.forEach(obj => obj.update());
    
    // Detect collisions
    detectCollisions();
    
    // Update physics
    if (physicsEnabled) updatePhysics();
    
    // Clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all game objects
    gameObjects.forEach(obj => obj.draw(ctx));
    
    // Show player health
    const health = player.getComponent('health').health;
    drawText("Health: " + health, 10, 30, health > 50 ? 'green' : 'red');
    
    // Request next frame
    requestAnimationFrame(update);
}

// Start the game loop
update();
`;
}

// Function to run the user's code
function runCode() {
    try {
        document.getElementById("console").innerHTML = "";
        
        // Reset game state
        gameObjects = [];
        
        // Evaluate the code
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

// Enhanced file management system
function saveCode() {
    const fileName = prompt("Enter file name:", "myGame.cubec");
    if (fileName) {
        const fileContent = editor.getValue();
        localStorage.setItem(fileName, fileContent);
        
        // Add to file list if not already there
        if (!fileList.includes(fileName)) {
            fileList.push(fileName);
            updateFileExplorer();
        }
        
        showNotification("File saved successfully");
    }
}

function loadCode() {
    const fileSelector = document.createElement('select');
    fileSelector.style.position = 'fixed';
    fileSelector.style.top = '50%';
    fileSelector.style.left = '50%';
    fileSelector.style.transform = 'translate(-50%, -50%)';
    fileSelector.style.padding = '10px';
    fileSelector.style.backgroundColor = '#333';
    fileSelector.style.color = 'white';
    fileSelector.style.border = '1px solid #555';
    fileSelector.style.zIndex = '1000';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select a file --';
    fileSelector.appendChild(defaultOption);
    
    // Add file options
    fileList.forEach(fileName => {
        const option = document.createElement('option');
        option.value = fileName;
        option.textContent = fileName;
        fileSelector.appendChild(option);
    });
    
    // Add load button
    const loadButton = document.createElement('button');
    loadButton.textContent = 'Load';
    loadButton.style.marginLeft = '10px';
    loadButton.style.padding = '5px 10px';
    loadButton.style.backgroundColor = '#555';
    loadButton.style.color = 'white';
    loadButton.style.border = 'none';
    loadButton.style.cursor = 'pointer';
    
    // Create container for both
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.padding = '20px';
    container.style.backgroundColor = '#222';
    container.style.border = '1px solid #555';
    container.style.zIndex = '1000';
    container.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    
    container.appendChild(fileSelector);
    container.appendChild(loadButton);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(container);
    });
    container.appendChild(closeButton);
    
    // Load file on button click
    loadButton.addEventListener('click', () => {
        const fileName = fileSelector.value;
        if (fileName) {
            const fileContent = localStorage.getItem(fileName);
            if (fileContent) {
                editor.setValue(fileContent);
                showNotification(`Loaded file: ${fileName}`);
            } else {
                showNotification("File not found", "error");
            }
        }
        document.body.removeChild(container);
    });
    
    document.body.appendChild(container);
}

function createNewFile() {
    const fileName = prompt("Enter new file name:", "newGame.cubec");
    if (fileName) {
        // Create a new file with default template
        localStorage.setItem(fileName, getDefaultCode());
        
        // Add to file list
        if (!fileList.includes(fileName)) {
            fileList.push(fileName);
            updateFileExplorer();
        }
        
        // Load the new file
        editor.setValue(localStorage.getItem(fileName));
        showNotification(`Created and loaded new file: ${fileName}`);
    }
}

function updateFileExplorer() {
    const fileExplorer = document.getElementById("fileExplorer");
    fileExplorer.innerHTML = "";
    
    // Add header
    const header = document.createElement("div");
    header.classList.add("file-explorer-header");
    header.innerHTML = `
        <span>File Explorer</span>
        <button onclick="createNewFile()">New</button>
    `;
    fileExplorer.appendChild(header);
    
    // Add files
    fileList.forEach(fileName => {
        const fileItem = document.createElement("div");
        fileItem.classList.add("file-item");
        
        // File icon and name
        const fileIcon = document.createElement("span");
        fileIcon.classList.add("file-icon");
        fileIcon.innerHTML = "📄";
        
        const fileNameSpan = document.createElement("span");
        fileNameSpan.textContent = fileName;
        
        // Actions menu (delete, rename)
        const actionsMenu = document.createElement("div");
        actionsMenu.classList.add("file-actions");
        actionsMenu.innerHTML = `
            <button title="Delete" onclick="deleteFile('${fileName}')">🗑️</button>
            <button title="Rename" onclick="renameFile('${fileName}')">✏️</button>
        `;
        
        fileItem.appendChild(fileIcon);
        fileItem.appendChild(fileNameSpan);
        fileItem.appendChild(actionsMenu);
        
        // Load file on click
        fileItem.addEventListener("click", (e) => {
            // Don't load if clicking on actions
            if (!e.target.closest(".file-actions")) {
                loadFile(fileName);
            }
        });
        
        fileExplorer.appendChild(fileItem);
    });
    
    // Save file list to localStorage
    localStorage.setItem("fileList", JSON.stringify(fileList));
}

function loadFile(fileName) {
    const fileContent = localStorage.getItem(fileName);
    if (fileContent) {
        editor.setValue(fileContent);
        showNotification(`Loaded file: ${fileName}`);
    } else {
        showNotification("File not found", "error");
    }
}

function deleteFile(fileName) {
    if (confirm(`Are you sure you want to delete ${fileName}?`)) {
        localStorage.removeItem(fileName);
        
        // Remove from file list
        const index = fileList.indexOf(fileName);
        if (index !== -1) {
            fileList.splice(index, 1);
            updateFileExplorer();
            showNotification(`Deleted file: ${fileName}`);
        }
    }
}

function renameFile(fileName) {
    const newName = prompt("Enter new file name:", fileName);
    if (newName && newName !== fileName) {
        // Get the file extension from the original file name
        const extensionMatch = fileName.match(/\.[^.]+$/);
        const extension = extensionMatch ? extensionMatch[0] : '';
        
        // Check if the new name already has the extension
        const newNameWithExt = newName.endsWith(extension) ? newName : newName + extension;
        
        // Here you would add the code to actually rename the file,
        // which depends on your environment (browser, Node.js, etc.)
        console.log(`Renaming file from "${fileName}" to "${newNameWithExt}"`);
        
        // Return the new filename
        return newNameWithExt;
    }
    
    // If user canceled or didn't change the name, return the original filename
    return fileName;
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

function goToErrorLine(lineNumber) {
    const model = editor.getModel();
    const linePosition = new monaco.Position(lineNumber, 1);
    editor.revealLineInCenter(linePosition.lineNumber);
    editor.setPosition(linePosition);
}

function saveCode() {
    const fileName = prompt("Enter file name:", "myCode.cubec");
    if (fileName) {
        const fileContent = editor.getValue();
        localStorage.setItem(fileName, fileContent);
        alert("File saved successfully");
    }
}