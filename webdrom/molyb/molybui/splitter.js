
class __MSplitter_Separator extends Component {
    constructor (parent, cls_separator, cls_active, idx) {
        super(parent);

        this.cls_separator = cls_separator;
        this.cls_active    = cls_active;
        this._first_render();

        this.idx = idx;
    }

    _first_render () {
        const innerBG = createElement("div", {}, this.cls_separator, [])
        this.element = createElement("div", {}, "flex-0", [
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
        
        this.parent.drag( this.idx, delta );
    }
    
    _render () {
        return this.element;
    }
}

class MSplitter extends Component {
    constructor (parent, axis="vertical", css_config=undefined, absolute_separator=true, ...components) {
        super(parent);
        this.css_config = css_config;
        if (axis != "vertical" && axis != "horizontal") throw "Could not recognize axis name for MSplitter";
        
        this.absolute_separator = absolute_separator;
        this.separator_size     = 8;

        this.transfer_delta = false;

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
    computeLastSize () {
        this.last_size = this.absolute_separator ? 0 : this.separators.length * this.separator_size;
        for (let size of this.sizes)
            this.last_size += size;
    }
    startDrag () {
        this.__sizes = [];
        for (let i of this.sizes) this.__sizes.push(i);
    }
    dragForward ( idx, jdx, delta ) {
        if (idx < 0 || idx >= this.sizes.length || jdx < 0 || jdx >= this.sizes.length)
            return ;

        let cur_i_size = this.sizes[idx]
        let cur_j_size = this.sizes[jdx]
        let local_size = cur_i_size + cur_j_size

        let potential_i = this.sizes[idx] - this.min_sizes[idx]
        let potential_j = this.sizes[jdx] - this.min_sizes[jdx]

        let v_delta = delta;
        if (this.__sizes[idx] == 0 || delta < 0) {
            delta = Math.max( delta, - potential_i)
        }
        if (this.__sizes[jdx] == 0 || delta > 0) {
            delta = Math.min( delta, potential_j );
        }

        if (this.sizes[idx] + v_delta <= 60 && this.collapse[idx]) {
            delta = - this.sizes[idx];
        } else if (this.sizes[jdx] - v_delta <= 60 && this.collapse[jdx]) {
            delta = this.sizes[jdx];
        }

        this.sizes[idx] += delta;
        this.sizes[jdx] -= delta;
        
        let d_delta = v_delta - delta;

        if (v_delta * delta < 0) return ;
        if (!this.transfer_delta || d_delta == 0) return ;
    
        if (d_delta < 0) this.dragForward( idx - 1, jdx, d_delta )
        else this.dragForward( idx, jdx + 1, d_delta )
    }
    drag (idx, delta) {
        for (let id = 0; id < this.sizes.length; id ++)
            this.sizes[id] = this.__sizes[id];
        
        let dsize = delta[this.axisField];
        
        this.dragForward( idx, idx + 1, dsize );
        
        this.apply_sizes();
    }

    onresize (event) {
        event = event[0];
        let size = event.contentRect[this.field];
        this.computeLastSize();
        let delta_size = size - this.last_size;

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

    compute_start_transform_separator () {
        return this.sizes[0] == 0 ? 1 : 0;
    }
    apply_sizes () {
        let idx = 0;
        for (let component of this.components) {
            component.style[this.field]    = `${this.sizes[idx]}px`;
            component.style[this.maxField] = `${this.sizes[idx ++]}px`;
            component.style.overflow       = "auto";
        }

        if (!this.absolute_separator) return ;

        let idx_v0 = this.compute_start_transform_separator();

        for (let idx_sep = 0; idx_sep < this.separators.length; idx_sep ++) {
            const el = this.separators[idx_sep].firstChild;
            if (idx_sep >= idx_v0)
                el.style.transform = this.axisField == 1 ? "translateY(calc(-100% + 1px))" : "translateX(calc(-100% + 1px))";
            else
                el.style.transform = "";
        }

        // let idx_last = this.sizes.length - 1;
        // const last_s = this.separators[this.separators.length - 1]?.firstChild;
        // if (last_s === undefined) return ;
        // 
        // if (this.sizes[idx_last] == 0) {
        //     last_s.style.transform = this.axisField == 1 ? "translateY(-100%)" : "translateX(-100%)";
        // } else last_s.style.transform = "";
    }

    _first_render () {
        this.separators = []
        let childs = []
        let idx = 0;
        for (let component of this.components) {
            if (childs.length != 0 && this.axisField == 1) 
                this.separators.push(new __MSplitter_Separator( this, this.css_config?.separtor?.vertical   ? this.css_config?.separtor?.vertical   : `cursor-s-resize h-2 w-full ${this.absolute_separator ? "absolute" : ""} hover:bg-Vwebdrom-editor-blue forward-msplitter-separator`, this.css_config?.separtor?.active ? this.css_config?.separtor?.active : "bg-Vwebdrom-editor-blue", idx - 1 ).render())
            if (childs.length != 0 && this.axisField == 0) 
                this.separators.push(new __MSplitter_Separator( this, this.css_config?.separtor?.horizontal ? this.css_config?.separtor?.horizontal : `cursor-w-resize w-2 h-full ${this.absolute_separator ? "absolute" : ""} hover:bg-Vwebdrom-editor-blue forward-msplitter-separator`, this.css_config?.separtor?.active ? this.css_config?.separtor?.active : "bg-Vwebdrom-editor-blue", idx - 1 ).render())
            if (this.separators.length != 0)
                childs.push(this.separators[this.separators.length - 1])

            childs.push(component)
            idx ++;
        }
        
        this.element = createElement("div", {}, `w-full h-full max-w-full max-h-full relative ${this.axisField == 0 ? "flex": ""}`, childs)
        this.observer = new ResizeObserver( (event) => this.onresize(event) );
        this.observer.observe(this.element);
    }

    _render () {
        return this.element;
    }
}
