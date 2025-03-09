function exportGame() {
    const code = editor.getValue();  // Get code from Monaco editor

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>GAMEDEV</title>
            <style>
            body, html {
    height: 100%;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

canvas { 
    flex: 1; 
    background: black; 
    border: 2px solid #555; 
    width: 80%; 
    height: 80%; 
}

            </style>
        </head>
        <body>
            <canvas id="gameCanvas"></canvas>
            <script>
                ${code}  <!-- Insert user code here -->
            </script>
        </body>
        </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "game.html";
    link.click();  // Trigger the download
}
