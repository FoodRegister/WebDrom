
class WebGLCanvas extends Component {
    constructor (parent, engine) {
        super(parent);

        this._first_render();
        this.engine = engine;
    }

    _first_render () {
        this.canvas = createElement("canvas", { onclick: (ev) => this.onClick(ev) }, "w-full h-full", []);
        this.component = createElement("div", {}, "w-full", [
            createElement("div", {}, "w-full h-full overflow-none", [
                this.canvas
            ])
        ]);

        this.make_gl();

        this.observer = new ResizeObserver( (event) => this.onResize(event) )
        this.observer.observe(this.canvas);
    }
    make_projection () {
        const fov = 45 * Math.PI / 180;
        const asp = this.canvas.clientWidth / this.canvas.clientHeight;
        const zNr = 0.1;
        const zFr = 100.0;
        
        this.web_gl.projection = new PerspectiveTransform(fov, asp, zNr, zFr);
    }
    make_gl () {
        this.web_gl = new ExtendedWebGLContext(this.canvas.getContext("webgl"))
        this.make_projection();
        this.shader = this.web_gl.loadProgram(`attribute vec3 aVertexPosition;
        attribute vec3 aVertexColor;
        uniform mat4 mModel;
        uniform mat4 mProj;
        varying lowp vec4 vColor;
        
        void main(void) {
          gl_Position = mProj * mModel * vec4(aVertexPosition, 1.0);
          vColor = vec4(aVertexColor, 1.0);
        }`, `varying lowp vec4 vColor;
        
        void main(void) {
            gl_FragColor = vColor;
          }`);
        this.shader.addTarget("aVertexPosition", 0);
        this.shader.addTarget("aVertexColor", 1);

        const mu_z = -12;

        this.mesh = new Mesh(
            this.web_gl,
            [
                [ [0.5, 0.5, mu_z], [-0.5, 0.5, mu_z], [0.5, -0.5, mu_z], [-0.5, -0.5, mu_z] ],
                [ [1, 0, 0], [0, 1, 0], [0, 0, 1], [0.5, 0.5, 0] ]
            ],
            [ 0, 1, 2, 1, 2, 3 ]
        )
        this.cube1 = new MeshInstance(this.web_gl, this.mesh, new Transform(0, 0, 0, 0, 0, Math.PI, 2, 1, 1))
        this.cube2 = new MeshInstance(this.web_gl, this.mesh, new Transform(0, 0, 0, 0, Math.PI / 40, Math.PI, 1, 2, 1))
    }
    clear () {
        this.web_gl.clearColor(0.0, 0.0, 0.0, 1.0)
        this.web_gl.clearDepth(1.0)
        this.web_gl.enable(this.web_gl.DEPTH_TEST);
        this.web_gl.depthFunc(this.web_gl.LEQUAL);
        this.web_gl.clear(this.web_gl.COLOR_BUFFER_BIT | this.web_gl.DEPTH_BUFFER_BIT);
    }
    drawCallback () {
        this.clear();
        this.cube1.render(this.shader);
        this.cube2.render(this.shader);
    }

    runPixelComputations (pixel_array) {
        this.raytracer = new RayTracer();
        
        this.clear();
        this.cube1.renderRTS(this.raytracer);
        this.cube2.renderRTS(this.raytracer);

        let buffer = this.getBuffer();

        let res = [];
        for (let pixel of pixel_array) {
            let pixel_color = buffer[buffer.length - 1 - pixel[1]][pixel[0]];
            let mesh_instance = this.raytracer.getMeshInstance(pixel_color)
            
            res.push(mesh_instance);
        }

        this.drawCallback();

        return res;
    }
    getBuffer (use_alpha = false) {
        let coef_alpha = use_alpha ? 1 : 0;

        const pixels = new Uint8Array(
            this.web_gl.drawingBufferWidth * this.web_gl.drawingBufferHeight * 4
        );
        this.web_gl.readPixels(
            0,
            0,
            this.web_gl.drawingBufferWidth,
            this.web_gl.drawingBufferHeight,
            this.web_gl.RGBA,
            this.web_gl.UNSIGNED_BYTE,
            pixels
        );
        
        let table = [];
        for (let i = 0; i < this.web_gl.drawingBufferHeight; i ++) {
            let array = [];
            for (let j = 0; j < this.web_gl.drawingBufferWidth; j ++) {
                let start = (this.web_gl.drawingBufferWidth * i + j) * 4;

                let x = pixels[start] + pixels[start + 1] * 256
                      + pixels[start + 2] * 256 * 256
                      + (pixels[start + 3] * 256 * 256 * 256) * coef_alpha;
                array.push(x);
            }
            table.push(array);
        }

        return table;
    }
    onClick (event) {
        let mesh_instance = this.runPixelComputations([ [ event.layerX, event.layerY ] ])[0];
        console.log(mesh_instance)
    }

    onResize (event_array) {
        for (let event of event_array) {
            if (event.target !== this.canvas) continue ;

            this.canvas.setAttribute( "width",  event.contentRect.width  );
            this.canvas.setAttribute( "height", event.contentRect.height );

            this.make_projection();
            
            this.web_gl.viewport( 0, 0, event.contentRect.width, event.contentRect.height );
            this.engine.drawCallback();
        }
    }
    _render () {
        return this.component;
    }
}
