
class ViewportComponent extends Component {
    constructor (parent, inner_component, dw = 0, dh = 0) {
        super(parent);

        this.component = inner_component.render();

        window.onresize = (event) => this.resize();

        this.dw = dw;
        this.dh = dh;
        this.resize();
    }
    resize () {
        this.component.style.width     = `${window.innerWidth  - this.dw}px`
        this.component.style.height    = `${window.innerHeight - this.dh}px`
        this.component.style.maxWidth  = `${window.innerWidth  - this.dw}px`
        this.component.style.maxHeight = `${window.innerHeight - this.dh}px`
    }

    _render () {
        return this.component;
    }
}
