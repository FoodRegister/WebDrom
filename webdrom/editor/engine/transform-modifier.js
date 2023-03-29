
class TransformEditorComponent extends Component {
    constructor (parent) {
        super(parent);

        this._first_render();
    }

    setTarget (target) {
        this.target = target;
        
        this.pos.setValue(target?.__x,  target?.__y,  target?.__z);
        this.rot.setValue(target?.__rx, target?.__ry, target?.__rz);
        this.sca.setValue(target?.__sx, target?.__sy, target?.__sz);
    }

    _first_render () {
        this.pos = new Vec3Input(this, (x, y, z) => {
            if (this.target === undefined) return ;

            this.target.__x = x;
            this.target.__y = y;
            this.target.__z = z;
            this.target.__matrix = undefined;
        })
        this.rot = new Vec3Input(this, (x, y, z) => {
            if (this.target === undefined) return ;

            this.target.__rx = x;
            this.target.__ry = y;
            this.target.__rz = z;
            this.target.__matrix = undefined;
        })
        this.sca = new Vec3Input(this, (x, y, z) => {
            if (this.target === undefined) return ;

            this.target.__sx = x;
            this.target.__sy = y;
            this.target.__sz = z;
            this.target.__matrix = undefined;
        })

        this.element = createElement("div", {}, "px-4", [
            createElement("div", {}, "px-4 text-lg font-200 pt-2", [ "Position" ]),
            this.pos.render(),
            createElement("div", {}, "px-4 text-lg font-200 pt-2", [ "Rotation" ]),
            this.rot.render(),
            createElement("div", {}, "px-4 text-lg font-200 pt-2", [ "Scale" ]),
            this.sca.render()
        ]);
    }
    _render () { return this.element; }
}
