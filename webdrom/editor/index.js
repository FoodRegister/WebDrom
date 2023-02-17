
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

    _first_render () {
        let tree     = new MExplorer (this, { "text": "Explorer", "components": [
            { "text": "Webdrom", "component": (parent) => new FileTree(parent).render(), "icons": []  },
            { "text": "Webdrom", "component": (parent) => new MTree(parent, TEST_MTREE_CONFIG).render(), "icons": []  },
            { "text": "Webdrom", "component": (parent) => new MTree(parent, TEST_MTREE_CONFIG).render(), "icons": []  }
        ] });
        let splitter = new MSplitter (this, "horizontal", undefined, true,
            createElement("div", {}, "w-full h-full bg-Vwebdrom-light-background", [
                tree.render()
            ]),
            createElement("div", {}, "", [])
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
        this.prompt       = new MPromptManager();
    }

    _render () {
        return createElement("div", {}, "flex-1", [
            this.project_page,
            this.prompt.render()
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

    prompt (config) {
        this.component.prompt.addPrompt(config)
    }
}
