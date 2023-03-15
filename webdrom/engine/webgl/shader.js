
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

        return new Proxy(this, {
            set: (target, str, val) => {
                if (this.attribute_locations[str] === undefined) {
                    target[str] = val;
                    return true;
                }

                let metadata = this.attribute_metadatas[str]
                console.log(metadata, context)
                return true;
            }
        })
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
            console.log(this.context.getActiveAttrib(this.__gl_id, idx))

            this.attribute_locations[data.name] = this.context.getAttribLocation(this.__gl_id, data.name);
            this.attribute_metadatas[data.name] = data
            this.attributes.push(data.name)
        }

        return this;
    }

    listAttributes () { return this.attributes }
    getAttributeLocation (name) { return this.attribute_locations[name] }
}
