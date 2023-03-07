
class ProjectPage extends Component {
    constructor (parent) {
        super(parent);

        if (this.constructor == ProjectPage)
            throw "Cannot create default project page"
    }
}

const TEST_MTREE_CONFIG = {
    "type": "folder",
    "text": "src",
    "files": [
        { "type": "file", "text": "README.md", "icon": "info" },
        { "type": "file", "text": ".gitignore", "icon": "info" },
        {
            "type": "folder",
            "text": "editor",
            "files": [
                { "type": "file", "text": "README.md", "icon": "info" },
                { "type": "file", "text": ".gitignore", "icon": "info" }
            ]
        }
    ]
}

class HomeProjectPage extends ProjectPage {
    constructor (parent) {
        super(parent);

        this._first_render();
    }
    clicked(onglet){
        console.log("hi")
    }

    _first_render () {
        let tree     = new MExplorer (this, { "text": "Explorer", "components": [
            { "text": "Webdrom", "component": (parent) => new MTree(parent, TEST_MTREE_CONFIG).render(), "icons": []  },
            { "text": "Webdrom", "component": (parent) => new MTree(parent, TEST_MTREE_CONFIG).render(), "icons": []  },
            { "text": "Webdrom", "component": (parent) => new MTree(parent, TEST_MTREE_CONFIG).render(), "icons": []  }
        ] });
        let config   = undefined
        let onglets  = createElement("div", {}, "w-full h-8 bg-Vwebdrom-navbar-background flex", [
            new Onglet(this,config).render()
        ])
        let editor   = createElement("textarea", {}, "w-full h-full bg-Vwebdrom-light-background text-white p-4", []);
        let editorparent   = createElement("div", {}, "w-full h-full bg-Vwebdrom-editor-blue-light", [
            onglets,
            editor
        ])
        let splitter = new MSplitter (this, "horizontal", undefined, true,
            createElement("div", {}, "w-full h-full bg-Vwebdrom-light-background", [
                tree.render()
            ]),
            editorparent
        )
        splitter.sizes = [ 400, 0 ];
        this.element = createElement("div", {}, "h-full", [
            splitter.render()
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
