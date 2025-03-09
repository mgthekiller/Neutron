// script.js

// إنشاء تيرمينال جديد
const terminal = new Terminal();

// ربط التيرمينال بالـ DOM
terminal.open(document.getElementById('terminal-container'));

// إعداد بعض الإعدادات مثل اللون والخطوط
terminal.setOption('cursorBlink', true);
terminal.setOption('theme', { background: '#000000', foreground: '#00FF00' });

// إضافة بعض النصوص الافتراضية عند بدء التيرمينال
terminal.writeln('مرحبًا بك في التيرمينال!');
terminal.write('$ ');

// الاستماع إلى المدخلات من المستخدم
terminal.onData(data => {
    if (data === '\r') {
        terminal.write('\r\n$ ');
    } else if (data === '\u007f') {  // Backspace
        terminal.write('\b \b');
    } else {
        terminal.write(data);
    }
});
