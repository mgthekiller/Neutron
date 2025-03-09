function convertToHTML() {
    const fileInput = document.getElementById('cubeFile');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // تحقق إذا كان هناك ملف
    if (fileInput.files.length === 0) {
        alert('يرجى اختيار ملف .cubec');
        return;
    }

    const file = fileInput.files[0];

    // قراءة محتوى الملف
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const cubeContent = event.target.result;
        
        // تحويل المحتوى إلى HTML
        const htmlContent = `
            <html>
            <head>
                <title>CubeC Code Output</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                    }
                    canvas {
                        border: 1px solid black;
                    }
                </style>
            </head>
            <body>
                <h1>CubeC Code</h1>
                <canvas id="gameCanvas" width="500" height="500"></canvas>
            </body>
            </html>
        `;

        // عند تنفيذ الكود، نعرضه في Canvas
        executeCubeCCode(cubeContent, ctx);
        
        // تنزيل ملف HTML
        downloadHTML(htmlContent);
    };

    reader.readAsText(file);
}

// تنفيذ كود CubeC في Canvas
function executeCubeCCode(cubeCode, ctx) {
    // مسح الـ Canvas أولًا
    ctx.clearRect(0, 0, 500, 500);

    // لوضع مثال بسيط: عرض الكود داخل Canvas
    ctx.fillStyle = 'blue';
    ctx.font = '20px Arial';
    ctx.fillText("تم تحويل كود CubeC إلى Canvas!", 50, 50);

    // هنا يمكن إضافة منطق لتحليل الكود الخاص بـ CubeC وتنفيذه ديناميكيًا
    // مثل رسم كائنات أو تحريك كائنات بناءً على الأوامر داخل الكود.
}

// وظيفة لتحميل الملف بصيغة HTML
function downloadHTML(content) {
    const blob = new Blob([content], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'output.html';
    link.click();
}
