
document.addEventListener("DOMContentLoaded", () => {
    document.body.onclick = (event) => {
        let target = event.target;

        document.querySelectorAll(".active").forEach((element) => element.classList.remove("active"))

        while (target != document.body) {
            target.classList.add("active");
            target = target.parentNode;
        }
    }
})
