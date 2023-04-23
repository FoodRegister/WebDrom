
function append_drag_listener (element, callback) {
    let integralX = 0;
    let integralY = 0;
    element.addEventListener("mousedown", (event) => {
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
    });
}
document.addEventListener("mouseup", (event) => {
    document.onmousemove = undefined;
});
function neg_mod (h, mod) {
    if (h >= 0) return h % mod;

    return (mod - (- h) % mod);
}
function cap (x, min_x, max_x) {
    if (x < min_x) return min_x;
    if (x > max_x) return max_x;

    return x;
}

const GRAPH_BACKGROUND_TILING = 25;

/**
 * Molyb Graph-Based Editor
 */
class MGraph extends Component {
    constructor (parent, engine) {
        super(parent);

        this.nodes = [ new MNode(this, "Default MNode", 0, 0, [
            new MNode_Ressource(this, "Input 1", "#3c3c3c"),
            new MNode_Ressource(this, "Input 2", "#3c3c3c")
        ], [
            new MNode_Ressource(this, "Output", "#3c3c3c", true)
        ]),
        new MNode(this, "Default MNode", 400, 0, [
            new MNode_Ressource(this, "Input 1", "#3c3c3c"),
            new MNode_Ressource(this, "Input 2", "#3c3c3c")
        ], [
            new MNode_Ressource(this, "Output", "#3c3c3c", true)
        ]) ];

        this._first_render();
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
    constructor (parent, name, color, is_output = false) {
        super(parent);

        this.left  = left;
        this.name  = name;
        this.color = color;

        this._first_render();
    }
    _first_render () {
        this.bubble  = createElement("div", {}, `acenter-h ${this.is_output ? "right" : "left"}-[-20px] rounded-200 w-2 h-2`, []);
        this.bubble.style.backgroundColor = this.color;

        this.element = createElement("div", {}, "relative", [
            createElement("div", {}, "select-none text-sm font-300", [
                this.bubble,
                this.name
            ])
        ]);
    }
    _render () { return this.element; }
}
class MNode extends Component {
    constructor (parent, name, x, y, inputs, outputs) {
        super(parent);

        this.name = name;

        this.inputs  = inputs;
        this.outputs = outputs;

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
