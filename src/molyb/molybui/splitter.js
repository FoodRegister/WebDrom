
class __MSplitter_Separator extends Component {
    constructor (parent, cls_separator, cls_active, idx) {
        console.log(cls_separator, cls_active)
        super(parent);

        this.cls_separator = cls_separator;
        this.cls_active    = cls_active;
        this._first_render();

        this.idx = idx;
    }

    _first_render () {
        const innerBG = createElement("div", {}, this.cls_separator, [])
        this.element = createElement("div", {}, "w-0 h-0 flex-0 z-5", [
            innerBG
        ])

        const functions = Tailwind.bindClass( this.element, "hidden" )
        this.disable = functions[0]
        this.enable  = functions[1]

        const active_f = Tailwind.bindClass(innerBG, this.cls_active)
        this.active_e = active_f[0]
        this.active_d = active_f[1]

        this.element.onmousedown = (event) => this.dragMouseDown(event)
    }

    dragMouseDown (event) {
        this.start = [ event.clientX, event.clientY ];

        event.preventDefault();
        document.onmouseup   = (event) => this.dragMouseUp   (event);
        document.onmousemove = (event) => this.dragMouseMove (event);

        this.parent.startDrag();
        this.active_e();
    }
    dragMouseUp (event) {
        document.onmouseup   = null;
        document.onmousemove = null;
        this.active_d();
    }
    dragMouseMove (event) {
        this.position = [ event.clientX, event.clientY ];
        let delta = [ event.clientX - this.start[0], event.clientY - this.start[1] ];
        console.log(event, delta)
        
        this.parent.drag( this.idx, delta );
    }
    
    _render () {
        return this.element;
    }
}

class MSplitter extends Component {
    constructor (parent, axis="vertical", css_config=undefined, ...components) {
        super(parent);
        this.css_config = css_config;
        if (axis != "vertical" && axis != "horizontal") throw "Could not recognize axis name for MSplitter";
        
        if (axis == "vertical") {
            this.axisField = 1;
            this.field = "height";
            this.maxField = "maxHeight";
        } else {
            this.axisField = 0;
            this.field = "width";
            this.maxField = "maxWidth";
        }

        this.components = components;
        if (this.components.size > 2) throw "MSplitter doesn't support more than 2 components right now"

        this.sizes     = [];
        this.min_sizes = [];
        this.collapse  = [];
        for (let component of components) {
            this.sizes.push(0);
            this.min_sizes.push(200);
            this.collapse.push(true);
        }

        this._first_render();
        this.apply_sizes();

        this.last_size = 0;
    }
    startDrag () {
        this.__sizes = [];
        for (let i of this.sizes) this.__sizes.push(i);
    }
    drag (idx, delta) {
        let dsize = delta[this.axisField];
        let full_size = this.__sizes[idx] + this.__sizes[idx + 1];

        this.sizes[idx]     = this.__sizes[idx]     + dsize;
        this.sizes[idx + 1] = this.__sizes[idx + 1] - dsize;

        if (this.min_sizes[idx] && this.sizes[idx] < this.min_sizes[idx]) {
            if (this.collapse[idx] && this.sizes[idx] <= 60) {
                this.sizes[idx] = 0;
                this.sizes[idx + 1] = full_size;
            } else {
                this.sizes[idx] = this.min_sizes[idx];
                this.sizes[idx + 1] = full_size - this.min_sizes[idx];
            }
        } else if (this.min_sizes[idx + 1] && this.sizes[idx + 1] < this.min_sizes[idx + 1]) {
            if (this.collapse[idx + 1] && this.sizes[idx + 1] <= 60) {
                this.sizes[idx + 1] = 0;
                this.sizes[idx] = full_size;
            } else {
                this.sizes[idx + 1] = this.min_sizes[idx + 1];
                this.sizes[idx] = full_size - this.min_sizes[idx + 1];
            }
        }
        
        this.apply_sizes();
    }

    onresize (event) {
        event = event[0];
        let size = event.contentRect[this.field];

        let delta_size = size - this.last_size;
        
        this.last_size = size;

        if (delta_size >= 0) {
            this.sizes[ this.sizes.length - 1 ] += delta_size;
        } else {
            let idx = this.sizes.length - 1;
            while (delta_size <= 0) {
                this.sizes[idx] += delta_size;

                delta_size = this.sizes[idx];
                this.sizes[idx] = Math.max(0, this.sizes[idx]);
                idx --;
            }
        }

        this.apply_sizes();
    }

    apply_sizes () {
        let idx = 0;
        for (let component of this.components) {
            component.style[this.field]    = `${this.sizes[idx]}px`;
            component.style[this.maxField] = `${this.sizes[idx ++]}px`;
            component.style.overflow       = "scroll";
        }

        let idx_last = this.sizes.length - 1;
        const last_s = this.separators[this.separators.length - 1]?.firstChild;
        if (last_s === undefined) return ;
        
        if (this.sizes[idx_last] == 0) {
            last_s.style.transform = this.axisField == 1 ? "translateY(-100%)" : "translateX(-100%)";
        } else last_s.style.transform = "";
    }

    _first_render () {
        this.separators = []
        let childs = []
        let idx = 0;
        for (let component of this.components) {
            if (childs.length != 0 && this.axisField == 1) 
                this.separators.push(new __MSplitter_Separator( this, this.css_config?.separtor?.vertical   ? this.css_config?.separtor?.vertical   : "cursor-s-resize h-2 w-full absolute hover:bg-Vwebdrom-editor-blue forward-msplitter-separator", this.css_config?.separtor?.active ? this.css_config?.separtor?.active : "bg-Vwebdrom-editor-blue", idx - 1 ).render())
            if (childs.length != 0 && this.axisField == 0) 
                this.separators.push(new __MSplitter_Separator( this, this.css_config?.separtor?.horizontal ? this.css_config?.separtor?.horizontal : "cursor-w-resize w-2 h-full absolute hover:bg-Vwebdrom-editor-blue forward-msplitter-separator", this.css_config?.separtor?.active ? this.css_config?.separtor?.active : "bg-Vwebdrom-editor-blue", idx - 1 ).render())
            if (this.separators.length != 0)
                childs.push(this.separators[this.separators.length - 1])

            childs.push(component)
            idx ++;
        }
        
        this.element = createElement("div", {}, `w-full h-full max-w-full max-h-full ${this.axisField == 0 ? "flex": ""}`, childs)
        this.observer = new ResizeObserver( (event) => this.onresize(event) );
        this.observer.observe(this.element);
    }

    _render () {
        return this.element;
    }
}
