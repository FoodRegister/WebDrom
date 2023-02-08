
class __MTree_Object extends Component {
    constructor (parent, config, depth=1) {
        super(parent);

        this.group_cls = Tailwind.createGroup();
        this.config    = config;
        this.depth     = depth;
        this.visual_depth = depth + 3;

        this.open_status = true;

        this._first_render();
    }

    toggle_tree () {
        this.open_status = !this.open_status;
        this.render(false);
    }

    getIcon () {
        if (this.config.icon) return this.config.icon;
        if (this.open_status) return "expand_more";

        return "chevron_right"
    }

    _create_div_cls () {
        return `flex
                pl-${this.visual_depth} ${this.group_cls}
                py-[5px]
                cursor-pointer

                hover:bg-Vwebdrom-contrast-lighter-background

                cls.active:bg-Vwebdrom-editor-blue-light 
                cls.active:border-Vwebdrom-editor-blue 
                cls.active:border-[1px] cls.active:mr-[1px]
                cls.active:pl-[${this.visual_depth * 4 - 1}px]
                cls.active:py-1`
    }
    _first_render () {
        this.childs = []

        for (let sub_config of (this.config.files ?? []))
            this.childs.push( new __MTree_Object( this, sub_config, this.depth + 3 ) )

        this.child_element = createElement("div", {}, "", [
            ...this.childs.map((x) => x.render())
        ])
        let [ child_disable, child_enable ] = Tailwind.bindClass( this.child_element, "hidden" )
        this.child_disable = child_disable; this.child_enable = child_enable;

        this.icon_element = createElement("div", {}, "material-icons-outlined", [])

        this.element = createElement("div", {}, "", [
            createElement("div", { onclick: () => this.toggle_tree() }, 
                this._create_div_cls(), [
                this.icon_element,
                createElement("p", {}, "text-sm font-500 pl-2", [ this.config.text ])
            ]),
            this.child_element
        ])
    }
    _render () {
        this.icon_element.innerText = this.getIcon();
        if (this.open_status) this.child_enable();
        else this.child_disable();

        return this.element;
    }
}


class MTree extends Component {
    constructor (parent) {
        super(parent);

        this.config = {
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

        this._first_render();
    }
    _first_render () {
        this.element = new __MTree_Object( this, this.config, 1 ).render();
    }
    _render () {
        return createElement("div", {}, "", [
            this.element
        ])
    }
}

