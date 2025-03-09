class SimpleParser {
    constructor() {
        this.commands = [];
    }

    // التحليل النصي للكود
    parse(code) {
        const lines = code.split("\n");

        lines.forEach(line => {
            line = line.trim();
            const match = line.match(/drawSprite "(.*?)" at (\d+), (\d+);/);
            if (match) {
                const image = match[1];
                const x = parseInt(match[2]);
                const y = parseInt(match[3]);
                this.commands.push({ type: 'drawSprite', image, x, y });
            }
        });
    }

    // تنفيذ الأوامر
    execute() {
        this.commands.forEach(command => {
            if (command.type === 'drawSprite') {
                this.drawSprite(command.image, command.x, command.y);
            }
        });
    }

    // دالة رسم على الكانفز
    drawSprite(imagePath, x, y) {
        const image = new Image();
        image.src = imagePath;
        image.onload = () => {
            const canvas = document.getElementById('canvas');
            const context = canvas.getContext('2d');
            context.drawImage(image, x, y);
        };
    }
}

// اختبار الكود
const code = `
    drawSprite "player.jpg" at 100, 150;
    drawSprite "enemy.jpg" at 200, 250;
`;

const parser = new SimpleParser();
parser.parse(code);
parser.execute();
