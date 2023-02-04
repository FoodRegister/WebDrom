
class Navbar {
    constructor (project, config) {
        this.shortcuts = {};

        let navbar = project.body.querySelector("navbar")
        if (navbar === null) {
            navbar = document.createElement("navbar")
            project.body.appendChild(navbar)
        }
    
        for (let el of config) {
            navbar.appendChild( this.render(el, true) )
        }

        document.addEventListener("keyup",   (event) => this.shortcutManager(event, true))
        document.addEventListener("keydown", (event) => this.shortcutManager(event, false))
    }
    shortcutManager (event, run_shortcut) {
        if (event.key.toUpperCase() == "CONTROL") return ;
        if (event.key.toUpperCase() == "SHIFT")   return ;
        if (event.key.toUpperCase() == "ALT")     return ;

        let text = event.key.toUpperCase();
        if (event.shiftKey) text = "Shift+" + text;
        if (event.  altKey) text = "Alt+"   + text;
        if (event. ctrlKey) text = "Ctrl+"  + text;
        
        let shortcut = this.shortcuts[text];
        if (shortcut === undefined) return ;

        event.preventDefault();
        if (run_shortcut) shortcut(event);
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
            if (config?.shortcut)
                this.shortcuts[config?.shortcut] = config?.action;
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
