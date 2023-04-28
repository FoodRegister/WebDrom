
class Scalar {
    constructor (sc) {
        this.sc = sc;
    }
    compute (v) {
        return this.sc * v;
    }
    modify (v) {
        this.sc = v;
    }
}

function append_drag_listener (scalar, element, callback, end_callback = undefined) {
    let integralX = 0;
    let integralY = 0;
    element.setAttribute("useDrag", "true");

    element.addEventListener("mousedown", (event) => {
        let target = event.target;
        if (target.hasAttribute("nodrag")) return ;

        while (target && (!target.hasAttribute("useDrag"))) target = target.parentNode;
        if (target != element) return ;

        let sx = event.clientX; let sy = event.clientY;
        
        document.onmousemove = (event) => {
            let x = event.clientX; let y = event.clientY;
            integralX += scalar.compute(x - sx);
            integralY += scalar.compute(y - sy);

            callback(scalar.compute(x - sx), scalar.compute(y - sy), integralX, integralY, (ix, iy) => {
                integralX = ix;
                integralY = iy;
            });
            
            sx = x; sy = y;
        }

        document.onmouseup = (event) => {
            document.onmousemove = undefined;
    
            if (end_callback)
                end_callback(integralX, integralY);
        };
    });
}
function neg_mod (h, mod) {
    if (h >= 0) return h % mod;

    return (mod - (- h) % mod);
}
function cap (x, min_x, max_x) {
    if (x < min_x) return min_x;
    if (x > max_x) return max_x;

    return x;
}

const GRAPH_BACKGROUND_TILING = 45;

/**
 * Molyb Graph-Based Editor
 */
class MGraph extends Component {
    constructor (parent) {
        super(parent);

        this.scale = 2;
        this.scala = new Scalar(2);

        let i = 0;
        this.nodes = [];

        this.current_ressource = undefined;
        this._first_render();
    }
    ressource_hover (res) {
        this.current_ressource = res;
    }
    ressource_end_hover () {
        this.current_ressource = undefined;
    }
    // Should resize the canvas to a scale BUT do not use for pity
    // it does not always properly works and hasn't been tested
    use_scale (scale) {
        this.scale = scale;
        this.scala.modify(this.scale);

        this.element.style.transform = `scale(calc(1 / ${this.scale}))`;
        this.element.style.width     = `calc(${this.scale} * 100%)`
        this.element.style.height    = `calc(${this.scale} * 100%)`
        this.element.style.left      = `calc(-1 * ${this.scale - 1} * 50%)`
        this.element.style.top       = `calc(-1 * ${this.scale - 1} * 50%)`
        this.bg_element.style.width     = `calc(${this.scale} * (100% + 4 * var(--webdrom-editor-graph-grid-size)))`
        this.bg_element.style.height    = `calc(${this.scale} * (100% + 4 * var(--webdrom-editor-graph-grid-size)))`
        this.bg_element.style.left      = `calc(${this.scale} * (- 2 * var(--webdrom-editor-graph-grid-size)))`
        this.bg_element.style.top       = `calc(${this.scale} * (- 2 * var(--webdrom-editor-graph-grid-size)))`
    
        this.bg_element.style.backgroundImage = `linear-gradient(var(--webdrom-editor-graph-border) .${this.scale}em, transparent .${this.scale}em), linear-gradient(90deg, var(--webdrom-editor-graph-border) .${this.scale}em, transparent .${this.scale}em)`
        this.bg_element.style.backgroundSize  = `calc(${this.scale} * var(--webdrom-editor-graph-grid-size)) calc(${this.scale} * var(--webdrom-editor-graph-grid-size))`
    }
    _recompute_element () {
        let to_remove = [];
        for (let child of this.element.childNodes) {
            if (child === this.bg_element) continue ;
            to_remove.push(child);
        }

        for (let child of to_remove) this.element.removeChild(child);
        for (let node of this.nodes)
            this.element.appendChild(node.render());
    }
    _first_render () {
        this.bg_element = createElement("div", {}, "w-full h-full absolute forward-grid-background", []);
        this.element    = createElement("div", {}, "w-full h-full absolute overflow-hidden", [
            this.bg_element,
            ...(this.nodes.map((x) => x.render()))
        ]);
        this.rel_element = createElement("div", {}, "w-full h-full relative", [ this.element ]);

        this.use_scale(1);

        this.ix = 0;
        this.iy = 0;

        append_drag_listener(this.scala, this.bg_element, (dx, dy, ix, iy, modify) => {
            ix = cap(ix, - 2000, 2000); // TODO dynamic left and right border
            iy = cap(iy, - 2000, 2000); // TODO dynamic left and right border

            for (let node of this.nodes) node.setBackground(ix, iy);
            modify(ix, iy);

            this.ix = ix;
            this.iy = iy;

            ix = neg_mod(ix, this.scale * GRAPH_BACKGROUND_TILING)
            iy = neg_mod(iy, this.scale * GRAPH_BACKGROUND_TILING)

            this.bg_element.style.left = `${ix - this.scale * 2 * GRAPH_BACKGROUND_TILING}px`;
            this.bg_element.style.top  = `${iy - this.scale * 2 * GRAPH_BACKGROUND_TILING}px`;
        });

        this.element.contextmenu = (event, close) => {
            if (event.target !== this.bg_element) return ;
            
            let summon_x = (event.clientX - this.rel_element.getBoundingClientRect().left ) * this.scale;
            let summon_y = (event.clientY - this.rel_element.getBoundingClientRect().top  ) * this.scale;
            
            let el = new SearchableContextMenu(undefined, MATERIAL_CATEGORY.library.as_ctxmenu_config((node) => {
                this.nodes.push(node.as_node(this, this, summon_x, summon_y))
                this._recompute_element();
                
                close();
            }), "Add Node", event.clientX, event.clientY);

            return el;
        };
    }
    _render () {
        return this.rel_element;
    }
}

class MNode_Ressource extends Component {
    constructor (parent, graph, name, node_type, color, is_output = false) {
        super(parent);

        this.graph     = graph;
        this.is_output = is_output;

        this.node_type = node_type;

        this.name  = name;
        this.color = color;

        // Graph links
        this.parent = undefined;
        this.childs = new Set();

        this.node = undefined;

        this._first_render();
    }
    setNode (node) {
        this.node = node;
    }
    removeChild (child) {
        this.childs.delete(child);
        this.computeLine();
    }
    appendChild (child) {
        this.childs.add(child);
        this.computeLine();
    }
    appendParent (parent) {
        if (parent === undefined) {
            if (this.parent) this.parent.removeChild(this);

            this.parent = undefined;
            this.computeLine();
            return ;
        }

        if (this.is_output
         || parent.node == this.node
         || this.node_type != parent.node_type) return false;
        if (this.parent) this.parent.removeChild(this);

        this.parent = parent;
        this.parent.appendChild(this);
        this.computeLine();
    }
    computeLine () {
        if (this.parent === undefined) {
            this.line.x = 0;
            this.line.y = 0;
            this.line.update_line();

            return ;
        }

        let p0 = this.get_bubble_position();
        let p1 = this.parent.get_bubble_position();

        this.line.x =    p1[0] - p0[0];
        this.line.y = - (p1[1] - p0[1]);
        this.line.update_line();
    }
    clear () {
        for (let child of this.childs) child.appendParent(undefined);
        if (this.parent) this.appendParent(undefined);
    }

    get_bubble_position () {
        return [
            this.bubble                          .offsetLeft
          + this.bubble.offsetParent             .offsetLeft
          + this.bubble.offsetParent.offsetParent.offsetLeft,
            this.bubble                          .offsetTop
          + this.bubble.offsetParent             .offsetTop
          + this.bubble.offsetParent.offsetParent.offsetTop
        ]
    }

    _first_render () {
        this.line = new MLine(this, 0, 0, this.color);

        this.bubble  = createElement("div", {}, `acenter-h ${this.is_output ? "right" : "left"}-[-20px] rounded-200 w-2 h-2`, [
            createElement("div", {}, "relative w-[0px] h-[0px] acenter", [
                this.line.render()
            ])
        ]);
        this.bubble.style.backgroundColor = this.color;

        this.element = createElement("div", {}, "relative", [
            createElement("div", {}, "select-none text-sm font-300", [
                this.bubble,
                createElement("div", {}, `absolute h-[100%] w-6 ${this.is_output ? "right-[-24px]" : "left-[-24px]"}`, []),
                this.name
            ])
        ]);

        if (!this.is_output) {
            this.element.addEventListener("mouseover", (event) => this.graph.ressource_hover(this));
            this.element.addEventListener("mouseout", (event) => this.graph.ressource_end_hover());
        } else {
            let sx = 0;
            let sy = 0;
            append_drag_listener(this.graph.scala, this.element, (dx, dy, ix, iy) => {
                sx += dx; sy += dy;
                this.line.x = sx; this.line.y = - sy;
                this.line.update_line();
            }, (ix, iy) => {
                sx = 0; sy = 0;
                this.line.x = 0;
                this.line.y = 0;
                this.line.update_line();

                let output = this;
                let input  = this.graph.current_ressource;
                if (!input) return ;
                // TODO add type validation

                input.appendParent(output);
            })
        }

        this.element.addEventListener("contextmenu", (event) => {
            event.preventDefault();

            this.clear();
        })
    }
    _render () { return this.element; }
}
class MNode extends Component {
    constructor (parent, name, x, y, inputs, outputs) {
        super(parent);

        this.name = name;

        this.inputs  = inputs;
        this.outputs = outputs;
        for (let input  of this.inputs ) input .setNode(this);
        for (let output of this.outputs) output.setNode(this);

        this.x    = x;
        this.y    = y;
        this.ix   = 0;
        this.iy   = 0;

        this._first_render();
    }
    setBackground (ix, iy) {
        this.ix = ix;
        this.iy = iy;

        this._use_delta();
    }
    _first_render () {
        this.element = createElement("div", {}, "forward-grid-node", [
            createElement("div", {}, "forward-grid-title p-2 px-4 text-base font-400 select-none", [ this.name ]),
            createElement("div", {}, "flex p-4 gap-4", [
                createElement("div", {}, "flex flex-col gap-1", [
                    ...(this.inputs.map((x) => x.render()))
                ]),
                createElement("div", {}, "flex-1", []),
                createElement("div", {}, "flex flex-col gap-1", [
                    ...(this.outputs.map((x) => x.render()))
                ])
            ])
        ]);

        append_drag_listener(this.parent.scala, this.element, (dx, dy, ix, iy) => {
            this.x += dx;
            this.y += dy;

            this._use_delta();

            for (let input of this.inputs)
                input.computeLine();
            for (let output of this.outputs)
                for (let child of output.childs)
                    child.computeLine();
        })

        this._use_delta();
    }
    _use_delta () {
        this.element.style.left = `${this.ix + this.x}px`;
        this.element.style.top  = `${this.iy + this.y}px`;
    }

    _render () {
        return this.element;
    }
}
