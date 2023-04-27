

class GraphEditor extends Component {
    constructor (parent, engine) {
        super(parent);

        this.engine = engine;

        this._first_render();
    }

    _first_render () {
        let tree = new MExplorer (this, { "text": "Explorer", "components": [
            { "text": "Project", "component": (parent) => new FileTree(parent).render(), "icons": []  },
            { "text": "Properties", "component": (parent) => new MTree(parent, TEST_MTREE_CONFIG).render(), "icons": [] }
        ] });

        let splitter = new MSplitter (this, "horizontal", undefined, true,
            createElement("div", {}, "w-full h-full bg-Vwebdrom-light-background", [
                tree.render()
            ]),
            createElement("div", {}, "", [
                new MGraph().render()
            ])
        )
        splitter.sizes = [ 300, 800 ];

        let splitter_viewport = new ViewportComponent(
            this, splitter, left_onglet, 21
        )
        this.element = createElement("div", {}, "h-full", [
            splitter_viewport.render()
        ]);
    }
    _render () { return this.element; }
}

