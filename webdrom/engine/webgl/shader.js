
class Shader {
    constructor (context, type, source) {
        this.context = context;
        this.__gl_id = -1;

        this.source = source;
        this.type   = type;

        return this.init();
    }

    init () {
        this.__gl_id = this.context.createShader(this.type);
        this.context.shaderSource(this.__gl_id, this.source);

        this.context.compileShader(this.__gl_id);

        if (! this.context.getShaderParameter(this.__gl_id, this.context.COMPILE_STATUS)) {
            // TODO append alert to context ?
            let message = this.context.getShaderInfoLog(this.__gl_id);
            this.context.deleteShader(this.__gl_id);
            alert("Alert not implemented, please forward : " + message)
            return null;
        }

        return this;
    }
}

class ShaderProgram {
    constructor (context, vertex, fragment) {
        if (!(vertex   instanceof Shader)) throw 'Expected shader in shaderprogram input'
        if (!(fragment instanceof Shader)) throw 'Expected shader in shaderprogram input'
    
        this.vertex   = vertex;
        this.fragment = fragment;

        this.context = context;

        this.__gl_id = -1;

        let t_v = this.init();
        if (t_v === null) return null;

        this.vbo_targets = {}

        return new Proxy(this, {
            get: (target, str) => {
                if (this.attribute_locations[str] === undefined)
                    return target[str];
            },
            set: (target, str, val) => {
                if (this.attribute_locations[str] !== undefined) {
                    let metadata = this.attribute_metadatas[str]
                    const buffer_data = { metadata: metadata, location: this.attribute_locations[str] }
                    
                    if (val instanceof VBO)
                        val.apply_to_shader(this, buffer_data);
                    else throw 'Could not recognize val type';

                    return true;
                }
                if (this.uniform_locations[str] !== undefined) {
                    let metadata = this.uniform_metadatas[str];
                    const buffer_data = { metadata: metadata, location: this.uniform_locations[str] }

                    if (val instanceof Vector) {
                        val.use_in_uniform(this, buffer_data);
                    } else if (val instanceof Transform) {
                        val.use_in_uniform(this, buffer_data);
                    } else throw 'Could not recognize val type';
                    
                    return true;
                }

                target[str] = val;
                return true;
            }
        })
    }

    use () {
        this.context.useProgram(this.__gl_id);
    }
    addTarget (name, vbo_id) {
        this.vbo_targets[name] = vbo_id;
    }
    render (vao, ebo = undefined) {
        for (let name in this.vbo_targets) {
            let target = this.vbo_targets[name];

            this[name] = vao.vbos[target];
            this.context.enableVert
        }

        this.use();
        if (ebo === undefined) {
            vao.render();
        } else {
            ebo.use();
            this.context.drawElements(
                this.context.TRIANGLES, 
                ebo.data.length, 
                this.context.UNSIGNED_SHORT, 
                0
            );
        }
    }

    init () {
        this.__gl_id = this.context.createProgram();
        this.context.attachShader( this.__gl_id, this.vertex  .__gl_id );
        this.context.attachShader( this.__gl_id, this.fragment.__gl_id );
        this.context.linkProgram ( this.__gl_id );

        if (!this.context.getProgramParameter(this.__gl_id, this.context.LINK_STATUS)) {
            // TODO append alert to context ?
            let message = this.context.getProgramInfoLog(this.__gl_id);
            alert("Alert not implemented, please forward : " + message)
            return null;
        }

        let attribCount = this.context.getProgramParameter(this.__gl_id, this.context.ACTIVE_ATTRIBUTES)
        
        this.attribute_locations = {}
        this.attribute_metadatas = {}
        this.attributes          = []
        for (let idx = 0; idx < attribCount; idx ++) {
            let data = this.context.getActiveAttrib(this.__gl_id, idx);

            this.attribute_locations[data.name] = this.context.getAttribLocation(this.__gl_id, data.name);
            this.attribute_metadatas[data.name] = data
            this.attributes.push(data.name)
        }
        
        let uniformCount = this.context.getProgramParameter(this.__gl_id, this.context.ACTIVE_UNIFORMS);
        
        this.uniform_locations = {}
        this.uniform_metadatas = {}
        this.uniforms          = []
        for (let idx = 0; idx < uniformCount; idx ++) {
            let data = this.context.getActiveUniform(this.__gl_id, idx);
            
            this.uniform_locations[data.name] = this.context.getUniformLocation(this.__gl_id, data.name);
            this.uniform_metadatas[data.name] = data
            this.uniforms.push(data.name);
        }

        return this;
    }

    listAttributes () { return this.attributes }
    getAttributeLocation (name) { return this.attribute_locations[name] }
}
