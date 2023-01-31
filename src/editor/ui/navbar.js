
class Navbar {
    constructor (project, config) {
        let navbar = project.body.querySelector("navbar")
        if (navbar === null) {
            navbar = document.createElement("navbar")
            project.body.appendChild(navbar)
        }
    
        for (let el of config) {
            navbar.appendChild( this.render(el, true) )
        }
    }

    render (config, isRoot=true) {
        if (config.type === "separator") {
            const el = document.createElement("span");
            el.className = "separator";
            return el;
        }
        if (config.type === "action") {
            const el = document.createElement("div");
            el.onclick   = config?.action;
            el.innerHTML = `<p>${config.text}</p>`
            return el;
        }

        const root = document.createElement("div");
        root.classList = isRoot ? "nav" : "menu";
        root.innerHTML = `<p>${config.text}</p>`
        const el = document.createElement("div");
        el.classList = `menu ${isRoot ? "main-menu" : "sub-menu"}`
        root.appendChild(el);

        for (let next_config of config.childs) {
            el.appendChild(this.render(next_config, false));
        }
        
        return root;
    }
}
