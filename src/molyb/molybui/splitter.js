
class __MSplitter_Separator extends Component {
    constructor (parent, cls_separator, cls_active, idx) {
        super(parent);

        this.cls_separator = cls_separator;
        this.cls_active    = cls_active;
        this._first_render();

        this.idx = idx;
    }

    _first_render () {
        this.element = createElement("div", {}, this.cls_separator, [])

        const functions = Tailwind.bindClass( this.element, "hidden" )
        this.disable = functions[0]
        this.enable  = functions[1]

        const active_f = Tailwind.bindClass(this.element, this.cls_active)
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
    constructor (parent, ...components) {
        super(parent);

        this.components = components;

        this.sizes = [];
        for (let component of components) this.sizes.push(0);

        this._first_render();
        this.apply_sizes();
    }
    startDrag () {
        this.__sizes = [];
        for (let i of this.sizes) this.__sizes.push(i);
    }
    drag (idx, delta) {
        let dy = delta[1];
        this.sizes[idx]     = this.__sizes[idx]     + dy;
        this.sizes[idx + 1] = this.__sizes[idx + 1] - dy; 
        console.log(delta, this.__sizes)
        console.log(this.sizes)
        this.apply_sizes();
    }

    apply_sizes () {
        let idx = 0;
        for (let component of this.components) {
            component.style.height    = `${this.sizes[idx]}px`;
            component.style.maxHeight = `${this.sizes[idx ++]}px`;
            component.style.overflow  = "scroll";
        }
    }

    _first_render () {
        let childs = []
        let idx = 0;
        for (let component of this.components) {
            if (childs.length != 0) childs.push(new __MSplitter_Separator( this, "cursor-s-resize h-2 w-full absolute hover:bg-Vwebdrom-editor-blue duration-300 delay-75", "bg-Vwebdrom-editor-blue", idx - 1 ).render())

            childs.push(component)
            idx ++;
        }
        
        this.element = createElement("div", {}, "w-full h-full max-w-full max-h-full", childs)
    }

    _render () {
        return this.element;
    }
}
