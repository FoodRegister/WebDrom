
const RAYTRACER_SHADER = [ `attribute vec2 aVertexPosition;
uniform vec3 uniqueColor;
varying lowp vec4 vColor;

void main(void) {
  gl_Position = vec4(aVertexPosition, 0.0, 1.0);
  vColor = vec4(uniqueColor, 1.0);
}`, `varying lowp vec4 vColor;

void main(void) {
    gl_FragColor = vColor;
  }` ]

class Mesh {
    constructor (context, vao_data, ebo_data) {
        this.context = context;
        this.vao     = new VAO(context, vao_data)
        this.ebo     = new EBO(context, ebo_data)
    }

    render (shader) {
        shader.render(this.vao, this.ebo);
    }
    renderRTS (unique_id = 1) {
        if (!(this.context.raytracer)) {
            this.context.raytracer = this.context.loadProgram(
                ...RAYTRACER_SHADER);
            this.context.raytracer.addTarget("aVertexPosition", 0);
        }
        
        let r = unique_id % 256;
        let g = ((unique_id - r) / 256) % 256;
        let b = ((unique_id - r - 256 * g) / 256 / 256) % 256;
        
        this.context.raytracer.use();
        this.context.raytracer.uniqueColor = new Vec3(r / 255.0, g / 255.0, b / 255.0);
        this.context.raytracer.render(this.vao, this.ebo);
    }
};

class MeshInstance {
    constructor (context, mesh) {
        this.context = context;
        this.mesh    = mesh;
    }

    render (shader) {
        this.mesh.render(shader);
    }
    renderRTS (raytracer) {
        this.mesh.renderRTS(raytracer.append( this ));
    }
};
