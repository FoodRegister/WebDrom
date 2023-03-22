
class WebGLCanvas extends Component {
    constructor (parent, engine) {
        super(parent);

        this._first_render();
        this.engine = engine;
    }

    _first_render () {
        this.canvas = createElement("canvas", {}, "w-full h-full", []);
        this.component = createElement("div", {}, "w-full", [
            createElement("div", {}, "w-full h-full overflow-none", [
                this.canvas
            ])
        ]);

        this.make_gl();

        this.observer = new ResizeObserver( (event) => this.onResize(event) )
        this.observer.observe(this.canvas);
    }
    make_gl () {
        this.web_gl = new ExtendedWebGLContext(this.canvas.getContext("webgl"))
        this.shader = this.web_gl.loadProgram(`attribute vec2 aVertexPosition;
        attribute vec3 aVertexColor;
        varying lowp vec4 vColor;
        
        void main(void) {
          gl_Position = vec4(aVertexPosition, 0.0, 1.0);
          vColor = vec4(aVertexColor, 1.0);
        }`, `varying lowp vec4 vColor;
        
        void main(void) {
            gl_FragColor = vColor;
          }`);
        this.shader.addTarget("aVertexPosition", 0);
        this.shader.addTarget("aVertexColor", 1);

        this.cube = new Mesh(
            this.web_gl,
            [
                [ [0.5, 0.5], [-0.5, 0.5], [0.5, -0.5], [-0.5, -0.5], [0.75, -0.5] ],
                [ [1, 0, 0], [0, 1, 0], [0, 0, 1], [0.5, 0.5, 0], [0, 0.5, 0.5] ]
            ],
            [ 0, 1, 2, 1, 2, 3, 1, 2, 4 ]
        )
    }
    drawCallback () {
        this.web_gl.clearColor(0.0, 0.0, 0.0, 1.0)
        this.web_gl.clearDepth(1.0)
        this.web_gl.enable(this.web_gl.DEPTH_TEST);
        this.web_gl.depthFunc(this.web_gl.LEQUAL);
        this.web_gl.clear(this.web_gl.COLOR_BUFFER_BIT | this.web_gl.DEPTH_BUFFER_BIT);
        
        this.cube.render(this.shader);
    }
    onResize (event_array) {
        for (let event of event_array) {
            if (event.target !== this.canvas) continue ;

            this.canvas.setAttribute( "width",  event.contentRect.width  );
            this.canvas.setAttribute( "height", event.contentRect.height );
            
            this.web_gl.viewport( 0, 0, event.contentRect.width, event.contentRect.height );
            this.engine.drawCallback();
        }
    }
    _render () {
        return this.component;
    }
}
