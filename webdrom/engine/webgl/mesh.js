
const RAYTRACER_SHADER = [ `attribute vec3 aVertexPosition;
uniform vec3 uniqueColor;
uniform mat4 mModel;
uniform mat4 mProj;
varying lowp vec4 vColor;

void main(void) {
  gl_Position = mProj * mModel * vec4(aVertexPosition, 1.0);
  vColor = vec4(uniqueColor, 1.0);
}`, `varying lowp vec4 vColor;

void main(void) {
    gl_FragColor = vColor;
  }` ]

function create_raytracer_shader (context) {
    if (!(context.raytracer)) {
        context.raytracer = context.loadProgram(
            ...RAYTRACER_SHADER);
        context.raytracer.addTarget("aVertexPosition", 0);
    }
}

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
        create_raytracer_shader(this.context);
        
        let r = unique_id % 256;
        let g = ((unique_id - r) / 256) % 256;
        let b = ((unique_id - r - 256 * g) / 256 / 256) % 256;
        
        this.context.raytracer.use();
        this.context.raytracer.uniqueColor = new Vec3(r / 255.0, g / 255.0, b / 255.0);
        this.context.raytracer.render(this.vao, this.ebo);
    }
};

class MeshInstance {
    constructor (context, mesh, transform) {
        this.context = context;
        this.mesh    = mesh;

        this.transform = transform;
    }

    render (shader) {
        shader.use();
        shader.mModel = this.transform;
        shader.mProj  = this.context.projection;

        this.mesh.render(shader);
    }
    renderRTS (raytracer) {
        create_raytracer_shader(this.context);

        this.context.raytracer.use();
        this.context.raytracer.mModel = this.transform;
        this.context.raytracer.mProj  = this.context.projection;

        this.mesh.renderRTS(raytracer.append( this ));
    }
};
