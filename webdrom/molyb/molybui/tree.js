
class __MTree_Object extends Component {
    constructor (parent, config, depth=3) {
        super(parent);

        this.group_cls = Tailwind.createGroup();
        this.config    = config;
        this.depth     = depth;
        this.visual_depth = depth + 3;

        this.open_status = false;

        this._first_render();
    }

    toggle_tree () {
        this.open_status = !this.open_status;
        this.render(false);

        setTimeout(() => make_active( this.icon_element ), 0)
    }

    getIcon () {
        if (this.config.icon) return this.config.icon;
        if (this.config.type == "file") return "description"
        if (this.open_status) return "expand_more";

        return "chevron_right"
    }
    makeIcon () {
        return createElement("div", {}, "material-icons-outlined", [ this.getIcon() ])
    }
    getText () {
        return this.config.text;
    }
    makeText () {
        return createElement("p", {}, "text-base font-400 pl-2", [ this.getText() ]);
    }
    makeBubble () {
        if (this.config?.bubble?.color   === undefined) return createElement("div", {}, "", [])
        if (this.config?.bubble?.opacity === undefined) return createElement("div", {}, "", [])

        let element = createElement("div", {}, `h-3 w-3 rounded-12 text-center font-800 opacity-${this.config.bubble.opacity} ${this.config?.bubble?.color} center-h`, this.config?.bubble?.text ? [ this.config.bubble.text ] : [])
        element.style.fontSize = "12px";

        return element
    }

    _create_div_cls () {
        return `flex
                pl-${this.visual_depth} ${this.group_cls}
                pr-6
                py-[5px]
                cursor-pointer

                hover:bg-Vwebdrom-contrast-lighter-background

                cls.active:bg-Vwebdrom-editor-blue-light 
                cls.active:border-Vwebdrom-editor-blue 
                cls.active:border-[1px]
                cls.active:pl-[${this.visual_depth * 4 - 1}px]
                cls.active:pr-[23px]
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

        this.icon_element = createElement("div", {}, "", [])

        this.text_element = createElement("div", {}, "", [])
        this.bubb_element = createElement("div", {}, "", [])

        this.element = createElement("div", {}, "", [
            createElement("div", { onclick: () => this.toggle_tree() }, 
                this._create_div_cls(), [
                this.icon_element,
                this.text_element,
                createElement("div", [], "flex-1", []),
                this.bubb_element
            ]),
            this.child_element
        ])
    }
    _render () {
        this.icon_element.replaceChildren();
        this.icon_element.appendChild(this.makeIcon())
        
        this.text_element.replaceChildren();
        this.text_element.appendChild(this.makeText());

        this.bubb_element.replaceChildren();
        this.bubb_element.appendChild(this.makeBubble());

        if (this.open_status) this.child_enable();
        else this.child_disable();

        return this.element;
    }
}


class MTree extends Component {
    constructor (parent, config) {
        super(parent);

        this.config = config

        this._first_render();
    }
    _first_render () {
        if (this.config instanceof Array) {
            this.elements = this.config.map((_conf) => {
                return new __MTree_Object( this, _conf, 1 ).render()
            })
        } else {
            this.elements = [ new __MTree_Object( this, this.config, 1 ).render() ];
        }
    }
    _render () {
        return createElement("div", {}, "", [
            ...this.elements
        ])
    }
}

