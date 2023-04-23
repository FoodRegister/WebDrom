
class MLine extends Component {
    constructor (parent, x, y, color) {
        super(parent);

        this.x = x;
        this.y = y;
        this.line = createElement("div", {}, "absolute left-0 top-0", []);
        this.line.style.backgroundColor = color;

        this.update_line();
    }
    update_line () {
        this.line.style.height = "2px";
        if (this.x == 0 && this.y == 0) {
            this.line.style.width = 0;
            return ;
        }
        let size = Math.sqrt(this.x * this.x + this.y * this.y);
        this.line.style.width = size + "px";

        const ang = Math.atan2(this.y, this.x) / Math.PI * 180;
        let transform = `translate(${this.x / 2}px, ${-this.y / 2}px) translateX(-50%) translateX(4px) rotate(${-ang}deg)`
        
        this.line.style["-webkit-transform"] = transform;
        this.line.style["-moz-transform"]    = transform;
        this.line.style["-ms-transform"]     = transform;
        this.line.style["-o-transform"]      = transform;
        this.line.style["-transform"]        = transform;
        //this.line.style.height = H    + 'px';
    }

    _render() {
        return this.line;
    }
};
