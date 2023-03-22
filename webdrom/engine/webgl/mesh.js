
class Mesh {
    constructor (context, vao_data, ebo_data) {
        this.context = context;
        this.vao     = new VAO(context, vao_data)
        this.ebo     = new EBO(context, ebo_data)
    }

    render (shader) {
        shader.render(this.vao, this.ebo);
    }
};
