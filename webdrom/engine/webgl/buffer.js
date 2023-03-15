
class VAO {
    constructor (context) {
        this.context = context

        this.__gl_id = -1
    }

    init () {
        this.__gl_id = this.context.glGenVertexArrays(1)
    }
    load () {
        this.context.glBindVertexArray()
    }
}

class VBO {
    constructor (context) {

    }
}
