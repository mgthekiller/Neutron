class SimpleParser {
    constructor() {
        this.commands = [];
    }

    // التحليل النصي للكود
    parse(code) {
        const lines = code.split("\n");

        lines.forEach(line => {
            line = line.trim();

            // التعامل مع أوامر النص
            const matchText = line.match(/drawText "(.*?)" at (\d+), (\d+);/);
            if (matchText) {
                const text = matchText[1];
                const x = parseInt(matchText[2]);
                const y = parseInt(matchText[3]);
                this.commands.push({ type: 'drawText', text, x, y });
            }
        });
    }

    // تنفيذ الأوامر
    execute() {
        this.commands.forEach(command => {
            if (command.type === 'drawText') {
                this.drawText(command.text, command.x, command.y);
            }
        });
    }

    // دالة لرسم النص على الكانفز
    drawText(text, x, y) {
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');
        context.font = '20px Arial';  // تعيين الخط
        context.fillStyle = 'black';  // تعيين اللون
        context.fillText(text, x, y);  // رسم النص
    }
}

// اختبار الكود
const code = `
    drawText "Hello, world!" at 100, 150;
    drawText "This is a test." at 200, 200;
`;

const parser = new SimpleParser();
parser.parse(code);
parser.execute();
