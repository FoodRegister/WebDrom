
function create_extended_context_proxy ( object ) {
    return new Proxy( object, {
        get: (target, value) => {
            if (target[value] !== undefined) return target[value]
            if (target.context[value] instanceof Function)
                return target.context[value].bind( target.context )
            return target.context[value]
        }
    })
}


class ExtendedWebGLContext {
    constructor (context) {
        this.context = context;

        return create_extended_context_proxy(this);
    }

    loadShader (type, source) {
        return new Shader(this, type, source);
    }
    loadVertexShader (source) {
        return this.loadShader(this.VERTEX_SHADER, source);
    }
    loadFragmentShader (source) {
        return this.loadShader(this.FRAGMENT_SHADER, source);
    }

    loadProgram (vert_source, frag_source) {
        let vertex = this.loadVertexShader  (vert_source);
        let fragmt = this.loadFragmentShader(frag_source);

        return new ShaderProgram(this, vertex, fragmt)
    }
}

