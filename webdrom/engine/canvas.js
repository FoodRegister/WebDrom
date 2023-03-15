
class WebGLCanvas extends Component {
    constructor (parent, engine) {
        super(parent);

        this._first_render();
        this.engine = engine;
    }

    _first_render () {
        this.canvas = createElement("canvas", {}, "", []);

        this.web_gl = new ExtendedWebGLContext(this.canvas.getContext("webgl"))
        this.shader = this.web_gl.loadProgram(`attribute vec3 aVertexPosition;
        
        void main() {
          gl_Position = vec4(aVertexPosition, 1.0);
        }`, `void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
          }`);
        this.shader.aVertexPosition = 0;

        this.observer = new ResizeObserver( (event) => this.onResize(event) )
        this.observer.observe(this.canvas)
    }
    drawCallback () {
        this.web_gl.clearColor(0.0, 0.0, 0.0, 1.0)
        this.web_gl.clearDepth(1.0)
        this.web_gl.clear(this.web_gl.COLOR_BUFFER_BIT | this.web_gl.DEPTH_BUFFER_BIT);
    }
    onResize (event_array) {
        for (let event of event_array) {
            if (event.target !== this.canvas) continue ;

            this.canvas.setAttribute( "width",  event.contentRect.width  );
            this.canvas.setAttribute( "height", event.contentRect.height );

            this.web_gl = new ExtendedWebGLContext( this.canvas.getContext("webgl") )
            this.engine.drawCallback();
        }
    }
    _render () {
        return this.canvas;
    }
}
