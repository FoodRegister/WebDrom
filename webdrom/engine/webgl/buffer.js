
function flatten (result, tensor) {
    for (let tens of tensor) {
        if (tens instanceof Array) {
            flatten(result, tens);
        } else result.push(tens);
    }
}
function shape (result, tensor) {
    if (!(tensor instanceof Array)) return ;

    result.push(tensor.length)
    shape(result, tensor[0]);
}

class VAO {
    constructor (context, tensor_array) {
        this.context = context;

        this.vbos = []

        this.offset = 0;
        this.shape  = [];
        shape(this.shape, tensor_array);
        if (this.shape.length != 3) throw 'VAO tensor should have shape of size 3';

        this.vertexCount = this.shape[1];
        
        let tensor_idx = 0;
        for (let tensor of tensor_array) {
            this.vbos.push(new VBO(context, tensor));

            tensor_idx ++;
        }
    }
    render () {
        this.context.drawArrays(
            this.context.TRIANGLE_STRIP, this.offset, this.vertexCount);
    }
}

class VBO {
    constructor (context, tensor, type=undefined) {
        this.context = context;

        this.data = []
        flatten(this.data, tensor);

        this.__gl_id = this.context.createBuffer();
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.__gl_id);

        this.shape = []
        shape(this.shape, tensor)

        if (this.shape.length != 2) throw 'VBO Tensor should have length 2';
        this.size         = this.shape[1];
        this.vertex_count = this.shape[0];
        this.offset       = 0;
        this.normalize    = false;

        if (type === undefined) {
            this.type = this.context.FLOAT;
            this.context.bufferData(this.context.ARRAY_BUFFER,
                new Float32Array(this.data),
                this.context.STATIC_DRAW);
        }
        else throw 'Error nothing other than float VBO implemented'
    }
    apply_to_shader (shader, metadata) {
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.__gl_id);
        this.context.vertexAttribPointer(
            metadata.location,
            this.size,
            this.type,
            this.normalize,
            0,
            this.offset);
        this.context.enableVertexAttribArray(
            metadata.location
        );
    }
}

class EBO {
    constructor (context, data) {
        this.context = context;
        this.data    = data;

        this.init();
    }

    init () {
        this.__gl_id = this.context.createBuffer();
        this.use();

        this.context.bufferData(
            this.context.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.data),
            this.context.STATIC_DRAW
          );
    }
    use () {
        this.context.bindBuffer(this.context.ELEMENT_ARRAY_BUFFER, this.__gl_id);
    }
}

class Vector { use_in_uniform (shader, metadata) { throw 'Default vector isn\'t implemented' } }

class WebGLFloat extends Vector {
    constructor (x) {
        super();
        this.x = x;
    }
    use_in_uniform (shader, metadata) {
        shader.context.uniform1f( metadata.location, this.x );
    }
}
class Vec2 extends Vector {
    constructor (x, y) {
        super();
        this.x = x;
        this.y = y;
    }
    use_in_uniform (shader, metadata) {
        shader.context.uniform2f( metadata.location, this.x, this.y );
    }
};
class Vec3 extends Vector {
    constructor (x, y, z) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }
    use_in_uniform (shader, metadata) {
        shader.context.uniform3f( metadata.location, this.x, this.y, this.z );
    }
};
