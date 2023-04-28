
let state_proxy = {
    set: (obj, prop, value) => {
        obj[prop] = value;
        
        if (prop != "enableProxy" && obj.enableProxy) obj.render(false);
        return true;
    }
}

class FetchComponent {
    constructor (file, get_ref) {
        this.file = file;
        this.ref  = get_ref;
    }

    async get () {
        const file = await get_file_registered(this.file)
    
        return this.ref(file);
    }
}

class Component {
    constructor(parent) {
        this.parent      = parent;
        this.enableProxy = false;
        this.is_dom_root = false;
        
        return new Proxy(this, state_proxy);
    }

    loadProxy() { this.enableProxy = true;  }
    killProxy() { this.enableProxy = false; }

    render (useCache=true) {
        if (this.component && useCache) return this.component;

        const proxyDefaultState = this.enableProxy;
        this.killProxy();

        const component = this._render();

        if (this.parent && this.component)
            this.parent.updateChild(this, component, this.component)
        if (this.is_dom_root && this.component && this.component != component) {
            let body = this.dom_body ?? document.body;
            try {
                body.removeChild(this.component)
            } catch (exception) {}
            body.appendChild(component)
        }
        this.component = component;
        
        if (proxyDefaultState) this.loadProxy();
        return component;
    }
    _render () { return undefined; }
    updateChild (child, newComp, oldComp) {
        if (oldComp && oldComp.parentNode && oldComp != newComp) {
            const parent = oldComp.parentNode
            parent.replaceChild(newComp, oldComp)
        }
    }

    getNavigation () {
        while (this.parent != undefined)
            return this.parent.getNavigation();
        return undefined;
    }
}

class RouterComponent extends Component {
    constructor (parent) {
        super(parent);

        this.uri_path = "/"
        this.uri_args = []
    }
    getNavigation() {
        return this;
    }
    setRoutes(routes, route404, regex_routes=[]) {
        this.route404 = route404;
        this.routes   = routes;
        this.regex_routes = regex_routes;
    }
    is_regex_route (path) {
        for (let [ regex, route ] of this.regex_routes)
            if (regex.test(path))
                return true;
        
        return false;
    }
    get_regex_route (path) {
        for (let [ regex, route ] of this.regex_routes)
            if (regex.test(path))
                return route;
        
        return false;
    }

    async get_route(path) {
        let route = this.is_regex_route(path) ? this.get_regex_route(path) : this.routes[path]
        if (route instanceof FetchComponent) route = await route.get();
    
        // this.routes[path] = route;

        return route;
    }
    async getCurrentComponent () {
        if (this.routes[this.uri_path] || this.is_regex_route(this.uri_path)) return await this.get_route(this.uri_path)
        
        return await this.route404();
    }
}

function createElement (type, props={}, classes="", childrens=[]) {
    const el = document.createElement(type)

    for (let key in props) {
        if (key == "onclick") el.onclick = props[key]
        else el.setAttribute(key, props[key])
    }
    
    Tailwind.compile(el, classes)
    for (let child of childrens) {
        if (child.parentNode == el) continue;
        if (child.parentNode) child.parentNode.removeChild(child);

        if (child instanceof Node) {
            el.appendChild(child);
        } else el.append(child);
    }
    
    el.classList.add("tailwind");
    return el;
}
function createUnsafeText (text, classes="") {
    const el = createElement("span",{}, classes, [])
    el.innerHTML = text;
    return el;
}

function createIcon (type, css, divType="span", props={}) {
    return createElement(divType, props, "material-icons-outlined icon-16 " + css, [ type ])
}

function createInput(placeholder, className="", inputClassName="", value="", props={}) {
    return createElement("div", {}, `p-2 px-6 ${className}`, [
        createElement("input", { ...props, placeholder, value }, `shadow-md rounded-40 p-4 px-6 ${inputClassName}`, [])
    ])
}

function getInputValue (input) {
    return input.childNodes[0].value;
}

function createButton(text, className="", props={}, textClassName="") {
    return createElement("div", {}, `p-2 px-6 ${className}`, [
        createElement("button", props, "shadow-xl rounded-40 cursor-pointer bg-indigo-300 hover:bg-blue-300 duration-125 delay-75 w-[100%]", [
            createElement("div", {}, `p-4 px-6 text-white ${textClassName}`, [text])
        ])
    ])
}

console.log("Starting Framework")