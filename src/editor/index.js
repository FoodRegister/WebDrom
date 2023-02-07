
class ProjectPage extends Component {
    constructor (parent) {
        super(parent);

        if (this.constructor == ProjectPage)
            throw "Cannot create default project page"
    }
}

class HomeProjectPage extends ProjectPage {
    constructor (parent) {
        super(parent);

        this._first_render();
    }

    _first_render () {
        this.element = createElement("div", {}, "h-full", [
            createElement("div", {}, "center h-min", [
                createElement("import", { href: "/src/assets/webdrom_logo.svg" }, "", [])
            ])
        ])
    }

    _render () {
        return this.element;
    }
}

class ProjectComponent extends Component {
    constructor (parent, project_page) {
        super(parent);

        this.project_page = (new project_page(this)).render();
    }

    _render () {
        return createElement("div", {}, "flex-1", [
            this.project_page
        ])
    }
}

class Project {
    constructor (body, page = HomeProjectPage) {
        let customEvent = new CustomEvent( "WebDrom.CreateProject" )
        customEvent.project = this;
        this.body = body;

        this.page = page;
        this.component = new ProjectComponent(undefined, page);

        this.body.appendChild(this.component.render())
        
        document.dispatchEvent( customEvent )
    }
}
