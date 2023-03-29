
class ProjectPage extends Component {
    constructor (parent, engine) {
        super(parent);

        this.engine = engine;

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
    constructor (parent, engine) {
        super(parent, engine);

        this._first_render();
    }
    clicked(onglet){
        console.log("hi")
    }

    _first_render () {
        let transform_editor = new TransformEditorComponent(this);
        document.addEventListener("WebDrom.MeshInstance.Clicked", (event) => {
            transform_editor.setTarget(event.meshInstance?.transform);
        });

        let tree = new MExplorer (this, { "text": "Explorer", "components": [
            { "text": "Project", "component": (parent) => new FileTree(parent).render(), "icons": []  },
            { "text": "Webdrom", "component": (parent) => new MTree(parent, TEST_MTREE_CONFIG).render(), "icons": []  },
            { "text": "Level", "component": (parent) => new MTree(parent, TEST_MTREE_CONFIG).render(), "icons": []  }
        ] });
        let property_tree = new MExplorer(this, {
            "text": "Properties",
            "components": [
                { "text": "Transform", "component": (parent) => transform_editor.render() },
                { "text": "Material", "component": (parent) => new MTree(parent, TEST_MTREE_CONFIG).render() },
            ]
        }, false)
        let config   = undefined
        
        let splitter1 = new MSplitter(this, "vertical", undefined, true, 
            this.engine.render(),
            createElement("div", {}, "", [])
        )
        let splitter = new MSplitter (this, "horizontal", undefined, true,
            createElement("div", {}, "w-full h-full bg-Vwebdrom-light-background", [
                tree.render()
            ]),
            splitter1.render(),
            createElement("div", {}, "w-full h-full bg-Vwebdrom-light-background", [
                property_tree.render()
            ])
        )

        const left_onglet = 60;
        let splitter_viewport = new ViewportComponent(
            this, splitter, left_onglet, 21
        )
        splitter.sizes     = [ 300, 800, 300 ];
        splitter1.sizes    = [ 300, 300 ];
        splitter.min_sizes = [ 200, 400, 200 ];
        splitter.collapse  = [ true, false, true ];
        splitter1.collapse = [ false, false ];
        this.element = createElement("div", {}, "h-full flex", [
            createElement("div", {}, `w-[${left_onglet}px]`, [
                createElement("div", [], "cursor-pointer p-[14px] h-15 relative", [
                    createElement("div", [], "absolute left-0 top-0 w-[2px] bg-Vwebdrom-editor-text h-full"),
                    createIcon("desktop_windows", "icon-32")
                ]),
                createElement("div", [], "cursor-pointer p-[14px] h-15", [
                    createIcon("content_copy", "icon-32")
                ]),
                createElement("div", [], "cursor-pointer p-[14px] h-15", [
                    createIcon("schema", "icon-32")
                ])
            ]),
            splitter_viewport.render()
        ])
    }

    _render () {
        return this.element;
    }
}

class ProjectComponent extends Component {
    constructor (parent, project_page, engine) {
        super(parent);
        this.engine = new WebEngine(this.component);

        this.project_page = (new project_page(this, this.engine)).render();
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
