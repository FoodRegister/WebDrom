
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
const left_onglet = 60;

class HomeProjectPage extends ProjectPage {
    constructor (parent, engine) {
        super(parent, engine);

        this._first_render();
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

        let splitter_viewport = new ViewportComponent(
            this, splitter, left_onglet, 21
        )
        splitter.sizes     = [ 300, 800, 300 ];
        splitter1.sizes    = [ 300, 300 ];
        splitter.min_sizes = [ 200, 400, 200 ];
        splitter.collapse  = [ true, false, true ];
        splitter1.collapse = [ false, false ];
        this.element = createElement("div", {}, "h-full", [
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

        this.project_pages = {  }
    
        this.setPage(project_page, false);
        this.prompt = new MPromptManager();
    }
    setPage (project_type, render = true) {
        if (this.project_main === project_type) return ;

        try {
            if (this.project_pages[project_type] === undefined)
                this.project_pages[project_type] = (new project_type(this, this.engine)).render();
        } catch (e) {
            project_type();
            throw 'No error message';
        }

        this.project_main = project_type;
        this.project_page = this.project_pages[project_type];

        if (render) this.render(false);
    }

    createColorElement (condition) {
        if (condition) return [ createElement("div", [], "absolute left-0 top-0 w-[2px] bg-Vwebdrom-editor-text h-full") ]
        return [ ]
    }
    createIcon (project_type, icon) {
        let element = createElement("div", [], "cursor-pointer p-[14px] h-15 relative", [
            ...this.createColorElement(this.project_main === project_type),
            createIcon(icon, "icon-32")
        ])

        element.onclick = (ev) => {
            this.setPage( project_type );
        }

        return element;
    }
    _render () {
        return createElement("div", {}, "flex-1 flex", [
            createElement("div", {}, `w-[${left_onglet}px]`, [
                this.createIcon( HomeProjectPage, "desktop_windows" ),
                this.createIcon( (...a) => { throw 'TextEditorPage not developped'; }, "content_copy" ),
                this.createIcon( MGraph, "schema" ),
            ]),
            this.project_page,
            this.prompt.render()
        ]);
    }
}

class Project {
    constructor (body, page = HomeProjectPage) {
        let customEvent = new CustomEvent( "WebDrom.CreateProject" )
        customEvent.project = this;
        this.body = body;

        this.page = page;
        this.component = new ProjectComponent(undefined, page);
        this.component.is_dom_root = true;
        this.body.appendChild(this.component.render());
        
        document.dispatchEvent( customEvent )
    }

    prompt (config) {
        this.component.prompt.addPrompt(config)
    }
}
