
document.querySelectorAll(".accordion-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
        const content = toggle.nextElementSibling;
        const isOpen = content.classList.contains("show");

        // 1) Close every open panel
        document.querySelectorAll(".accordion-content").forEach((c) => {
            c.classList.remove("show");
        });

        // 2) If it was closed, open it now
        if (!isOpen) {
            content.classList.add("show");
        }
    });
});
