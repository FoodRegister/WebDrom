

/**
 * ContextMenu Manager
 */

class ContextMenu {
    constructor (project) {
        this.project = project;

        document.addEventListener("contextmenu", (event) => {
            event.preventDefault();

            let target = event.target;
            while (target !== project.body.parentNode && (!target.contextmenu)) {
                if (target.hasAttribute("contextmenu")) return ;

                target = target.parentNode;
            }

            if (target === project.body.parentNode) return ;
            
            const closeCallback = (event) => {
                if (event) {
                    let target = event.target;
                    while (target !== document.body) {
                        if (target === child) return ;
                        target = target.parentNode;
                    }
                }

                document.removeEventListener("click", closeCallback);
                document.removeEventListener("contextmenu", closeCallback);
                document.removeEventListener("mousedown", closeCallback);

                project.body.removeChild(child);
            }

            let child = target.contextmenu(event, closeCallback);
            if (child instanceof Component) {
                child.is_dom_root = true;
                child.dom_body    = project.body;

                child = child.render();
            }
            if (!child) return ;

            document.addEventListener("click", closeCallback);
            document.addEventListener("contextmenu", closeCallback);
            document.addEventListener("mousedown", closeCallback);
            child.setAttribute("contextmenu", "true");
            project.body.appendChild( child );
        })
    }
}

/**
 * ContextMenu Styles
 */

class SearchableContextMenu_ConfigViewer extends Component {
    constructor (parent, config, depth = 0) {
        super(parent);
        this.config = config;
        this.depth  = depth;

        if (this.config.type === "category") this._render_category();
        else if (this.config.type === "action") this._render_action();
    }

    _render_name (props, use_icon) {
        let icon = createIcon("chevron_right", `select-none icon-19 acenter-h left-[${this.depth * 20 + 4}px]`, "div");
        return [ createElement("div", props, `select-none relative py-1 pl-${this.depth * 5 + 6} pr-4 text-base font-300 cursor-pointer duration-300 hover:bg-Vwebdrom-light-background`, [
            ...(use_icon ? [icon] : []),
            createElement("div", {}, "", [
                this.config.name
            ])
        ]), icon ];
    }
    _render_category () {
        this.childs = createElement("div", {}, "", [
            ...(this.config.childs.map((x) => {
                return new SearchableContextMenu_ConfigViewer(this, x, this.depth + 1).render()
            }))
        ]);
        this.childs.style.display = "none";

        let [ name, icon ] = this._render_name({ onclick: () => {
            if (icon.innerHTML == "chevron_right")
                icon.innerHTML = "expand_more"
            else icon.innerHTML = "chevron_right"

            this.childs.style.display = this.childs.style.display == "none" ? "block" : "none";
        } }, true);
        this.element = createElement("div", {}, "", [
            name,
            this.childs
        ]);
    }
    _render_action () {
        this.element = this._render_name({ onclick: this.config.action })[0];
    }
    _render () {
        return this.element;
    }
}
class SearchableContextMenu extends Component {
    constructor (parent, config, title, x, y) {
        super(parent);
        this.is_dom_root = true;

        this.config = config;
        this.title  = title;
        this.x      = x;
        this.y      = y;

        this._first_render();
    }

    _first_render () {
        const DEFAULT_ELEMENT_HEIGHT = 500;
        const DEFAULT_ELEMENT_WIDTH  = 400;
        const TITLE_ELEMENT_HEIGHT   = 36;

        let px = this.x; let py = this.y + TITLE_ELEMENT_HEIGHT;
        if (px + DEFAULT_ELEMENT_WIDTH > window.innerWidth)
            px -= DEFAULT_ELEMENT_WIDTH;
        if (py + DEFAULT_ELEMENT_HEIGHT > window.innerHeight)
            py -= DEFAULT_ELEMENT_HEIGHT + TITLE_ELEMENT_HEIGHT;
        if (py < TITLE_ELEMENT_HEIGHT) py = TITLE_ELEMENT_HEIGHT;
        
        this.title_element = createElement("div", {}, "z-100 select-none absolute bg-Vwebdrom-background px-4 py-1 text-lg", [ this.title ]);
        this.title_element.style.maxWidth  = `${DEFAULT_ELEMENT_WIDTH - 32}px`;
        this.title_element.style.width     = `${DEFAULT_ELEMENT_WIDTH - 32}px`;
        this.title_element.style.left      = `${px}px`
        this.title_element.style.top       = `${py}px`
        this.title_element.style.transform = "translateY(-100%)";

        this.element = createElement("div", {}, "z-100 absolute bg-Vwebdrom-navbar-background overflow-scroll", [
            ...(this.config.map((x) => {
                return new SearchableContextMenu_ConfigViewer(this, x, 0).render()
            }))
        ]);

        this.element.style.maxWidth  = `${DEFAULT_ELEMENT_WIDTH}px`;
        this.element.style.maxHeight = `${DEFAULT_ELEMENT_HEIGHT}px`;
        this.element.style.width     = `${DEFAULT_ELEMENT_WIDTH}px`;
        this.element.style.height    = `${DEFAULT_ELEMENT_HEIGHT}px`;
        this.element.style.left      = `${px}px`
        this.element.style.top       = `${py}px`
    }
    _render () {
        return createElement("div", {}, "", [ this.title_element, this.element ]);
    }
}
