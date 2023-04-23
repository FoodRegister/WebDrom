
function append_drag_listener (element, callback, end_callback = undefined) {
    let integralX = 0;
    let integralY = 0;
    element.setAttribute("useDrag", "true");

    element.addEventListener("mousedown", (event) => {
        let target = event.target;
        while (target && (!target.hasAttribute("useDrag"))) target = target.parentNode;
        if (target != element) return ;

        let sx = event.clientX; let sy = event.clientY;
        
        document.onmousemove = (event) => {
            let x = event.clientX; let y = event.clientY;
            integralX += x - sx;
            integralY += y - sy;

            callback(x - sx, y - sy, integralX, integralY, (ix, iy) => {
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
    constructor (parent, engine) {
        super(parent);

        this.nodes = [ new MNode(this, "Default MNode", 200, 200, [
            new MNode_Ressource(this, this, "Input 1", "float", "#7DAF9C"),
            new MNode_Ressource(this, this, "Input 2", "int",   "#0A2472")
        ], [
            new MNode_Ressource(this, this, "Output",  "float", "#7DAF9C", true)
        ]),
        new MNode(this, "Default MNode", 200, 600, [
            new MNode_Ressource(this, this, "Input 1", "float", "#7DAF9C"),
            new MNode_Ressource(this, this, "Input 2", "int",   "#0A2472")
        ], [
            new MNode_Ressource(this, this, "Output",  "float", "#7DAF9C", true)
        ]),
        new MNode(this, "Default MNode", 600, 200, [
            new MNode_Ressource(this, this, "Input 1", "float", "#7DAF9C"),
            new MNode_Ressource(this, this, "Input 2", "float", "#7DAF9C")
        ], [
            new MNode_Ressource(this, this, "Output",  "int",   "#0A2472", true)
        ]) ];

        this.current_ressource = undefined;
        this._first_render();
    }
    ressource_hover (res) {
        this.current_ressource = res;
    }
    ressource_end_hover () {
        this.current_ressource = undefined;
    }
    _first_render () {
        this.bg_element = createElement("div", {}, "w-full h-full absolute forward-grid-background", []);
        this.element = createElement("div", {}, "w-full h-full relative overflow-hidden", [
            this.bg_element,
            ...(this.nodes.map((x) => x.render()))
        ]);

        append_drag_listener(this.bg_element, (dx, dy, ix, iy, modify) => {
            ix = cap(ix, - 2000, 2000); // TODO dynamic left and right border
            iy = cap(iy, - 2000, 2000); // TODO dynamic left and right border

            for (let node of this.nodes) node.setBackground(ix, iy);
            modify(ix, iy);

            ix = neg_mod(ix, GRAPH_BACKGROUND_TILING)
            iy = neg_mod(iy, GRAPH_BACKGROUND_TILING)

            this.bg_element.style.left = `${ix - 2 * GRAPH_BACKGROUND_TILING}px`;
            this.bg_element.style.top  = `${iy - 2 * GRAPH_BACKGROUND_TILING}px`;
        });
    }
    _render () {
        return this.element;
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
        this.setDebugColor();
    }
    appendChild (child) {
        this.childs.add(child);
        this.setDebugColor();
    }
    appendParent (parent) {
        if (parent === undefined) {
            if (this.parent) this.parent.removeChild(this);

            this.parent = undefined;
            this.setDebugColor();
            return ;
        }

        if (this.is_output
         || parent.node == this.node
         || this.node_type != parent.node_type) return false;
        if (this.parent) this.parent.removeChild(this);

        this.parent = parent;
        this.parent.appendChild(this);
        this.setDebugColor();
    }
    setDebugColor () {
        let is_debug = ((!this.is_output) && (this.parent !== undefined))
                    || (this.is_output && this.childs.size != 0);
        console.log(is_debug, this.parent, this.childs, this.is_output);
        let color = is_debug ? "#6c6c6c" : this.color;

        this.bubble.style.backgroundColor = color;
    }
    clear () {
        for (let child of this.childs) child.appendParent(undefined);
        if (this.parent) this.appendParent(undefined);
    }

    _first_render () {
        this.bubble  = createElement("div", {}, `acenter-h ${this.is_output ? "right" : "left"}-[-20px] rounded-200 w-2 h-2`, []);
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
            append_drag_listener(this.element, (dx, dy, ix, iy) => {  }, (ix, iy) => {
                let input  = this;
                let output = this.graph.current_ressource;
                if (!output) return ;

                output.appendParent(input);
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

        append_drag_listener(this.element, (dx, dy, ix, iy) => {
            this.x += dx;
            this.y += dy;

            this._use_delta();
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
