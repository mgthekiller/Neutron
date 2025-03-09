class SimpleCompiler {
    constructor() {
        this.keyHandlers = {};
        this.objects = [];  // قائمة الكائنات
    }

    parse(code) {
        const lines = code.split("\n");
        lines.forEach(line => {
            line = line.trim();
            const matchKey = line.match(/key \"(.*?)\" press => \{(.*?)\}/);
            if (matchKey) {
                const key = matchKey[1];
                const action = matchKey[2].trim();
                this.registerKeyPress(key, action);
            }

            const matchMove = line.match(/move (.*?) to (\d+), (\d+)/);
            if (matchMove) {
                const objectId = matchMove[1];
                const x = parseInt(matchMove[2]);
                const y = parseInt(matchMove[3]);
                this.moveObject(objectId, x, y);
            }
        });
    }

    registerKeyPress(key, action) {
        this.keyHandlers[key] = new Function(action);
        window.addEventListener("keydown", (event) => {
            if (event.key === key && this.keyHandlers[key]) {
                this.keyHandlers[key]();
            }
        });
    }

    createObject(id, x, y) {
        const obj = { id, x, y };
        this.objects.push(obj);
        return obj;
    }

    moveObject(id, x, y) {
        const obj = this.objects.find(o => o.id === id);
        if (obj) {
            obj.x = x;
            obj.y = y;
            console.log(`${id} moved to (${x}, ${y})`);
        }
    }
}

// اختبار الكود
const code = `
    key "ArrowRight" press => {
        const player = gameObject("player");
        move player to 100, 50;
    }
`;

const compiler = new SimpleCompiler();
compiler.createObject("player", 0, 0);  // إنشاء كائن اللاعب
compiler.parse(code);
