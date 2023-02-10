
class NavbarElement extends Component {
    constructor (parent, config, navbar, isRoot=true) {
        super(parent);
        
        this.config = config;
        this.isRoot = isRoot;
        if      (config.type == "separator") this.renderSeparator(navbar)
        else if (config.type == "action")    this.renderAction   (navbar);
        else if (config.type == "menu")      this.renderMenu     (navbar);
    }

    renderSeparator (navbar) {
        this.element = createElement("span", {}, "no-tailwind forward-separator", [])
    }
    renderAction (navbar) {
        let props = this.config.action ? { "onclick": this.config.action } : {}
        this.element = createElement("div", props, "no-tailwind", [
            createElement("p", {}, "no-tailwind", [ this.config.text ])
        ])

        if (this.config.shortcut)
            navbar.shortcuts[this.config.shortcut] = this.config.action;
    }
    renderMenu (navbar) {
        let childs = [];

        for (let child_config of this.config.childs)
            childs.push (new NavbarElement( this, child_config, navbar, false ).render())
        
        this.element = createElement("div", {}, this.isRoot ? "no-tailwind forward-nav" : "no-tailwind forward-menu", [
            createElement("p", {}, "no-tailwind", [ this.config.text ]),
            createElement(
                "div", {}, 
                `no-tailwind forward-menu ${this.isRoot ? "forward-main-menu" : "forward-sub-menu"}`,
                childs
            )
        ])
    }

    _render () {
        return this.element;
    }
}

class Navbar {
    constructor (project, config) {
        this.shortcuts = {};

        let navbar = project.body.querySelector("navbar")
        if (navbar === null) {
            navbar = document.createElement("navbar")
            project.body.insertBefore(navbar, project.body.firstChild);
        }
    
        for (let el of config) {
            navbar.appendChild( this.render(el, true) )
        }

        document.addEventListener("keyup",   (event) => this.shortcutManager(event, true))
        document.addEventListener("keydown", (event) => this.shortcutManager(event, false))
    }
    testShortcut (event, run_shortcut, text) {
        if (event.shiftKey) text = "Shift+" + text;
        if (event.  altKey) text = "Alt+"   + text;
        if (event. ctrlKey) text = "Ctrl+"  + text;

        let shortcut = this.shortcuts[text];
        if (shortcut === undefined) return false;

        event.preventDefault();
        if (run_shortcut) shortcut(event);
        
        return true;
    }
    shortcutManager (event, run_shortcut) {
        if (event.key.toUpperCase() == "CONTROL") return ;
        if (event.key.toUpperCase() == "SHIFT")   return ;
        if (event.key.toUpperCase() == "ALT")     return ;

        if (this.testShortcut( event, run_shortcut, event.key.toUpperCase() )) return ;
        if (this.testShortcut( event, run_shortcut, event.keyCode           )) return ;
    }

    render (config, isRoot=true) {
        return new NavbarElement(this, config, this, isRoot).render();
    }
}
