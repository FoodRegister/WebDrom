
function make_active (target) {
    if (target === null || target == document.body) return ;

    target.classList.add("active")
    make_active(target.parentNode);
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.onclick = (event) => {
        let target = event.target;
        
        document.querySelectorAll(".active").forEach((element) => element.classList.remove("active"))

        make_active(target);
    }
})
