// مثال بسيط لتنفيذ بعض الوظائف مثل عرض نافذة عند الضغط على الأزرار
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const projectId = event.target.parentElement.id;
        alert(`تم الضغط على ${projectId}`);
            window.location.href = 'engine.html';
    });
});
