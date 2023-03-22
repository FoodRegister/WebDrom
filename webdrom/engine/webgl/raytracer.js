
class RayTracer {
    constructor () {
        this.unique_id = 1;

        this.metadata = {}
    }

    append (mesh) {
        this.metadata[this.unique_id] = mesh;
        this.unique_id += 1;

        return this.unique_id - 1;
    }
    getMeshInstance (unique_id) {
        return this.metadata[unique_id]
    }
}
