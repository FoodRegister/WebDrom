
class Transform {
    constructor (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
        this.__x  = x;
        this.__y  = y;
        this.__z  = z;
        this.__rx = rx;
        this.__ry = ry;
        this.__rz = rz;
        this.__sx = sx;
        this.__sy = sy;
        this.__sz = sz;
    }

    _has_cache () {
        return this.__matrix !== undefined;
    }
    _matrix () {
        // scale
        // sx 0 0 0
        // 0 sy 0 0
        // 0 0 sz 0
        // 0 0  0 1

        // transform
        // 1 0 0 dx
        // 0 1 0 dy
        // 0 0 1 dz
        // 0 0 0 1

        // rotation (phi)
        // cos (phi) | -sin (phi)
        // ----------------------
        // sin (phi) |  cos (phi)
        // x cos(phi) - y sin (phi)
        // x sin(phi) + y cos(phi)

        let matrix = glMatrix.mat4.create();
        glMatrix.mat4.translate(matrix, matrix, [ this.__x,  this.__y,  this.__z  ]);
        glMatrix.mat4.scale    (matrix, matrix, [ this.__sx, this.__sy, this.__sz ]);

        glMatrix.mat4.rotateX  (matrix, matrix, this.__rx / 180.0 * Math.PI);
        glMatrix.mat4.rotateY  (matrix, matrix, this.__ry / 180.0 * Math.PI);
        glMatrix.mat4.rotateZ  (matrix, matrix, this.__rz / 180.0 * Math.PI);

        this.__matrix = matrix;

        return this.__matrix;
    }
    matrix () {
        if (this._has_cache()) return this.__matrix;
        return this._matrix();
    }

    use_in_uniform (shader, buffer) {
        let location = buffer.location;
        shader.context.uniformMatrix4fv( location, false, this.matrix() )
    }
}

class PerspectiveTransform extends Transform {
    constructor (fov, aspect, zNear, zFar) {
        super(0, 0, 0, 0, 0, 0, 1, 1, 1);

        this.fov = fov;
        this.asp = aspect;
        this.zNr = zNear;
        this.zFr = zFar;
    }

    _matrix () {
        const projectionMatrix = glMatrix.mat4.create();

        // note: glmatrix.js a toujours comme premier argument la destination
        // où stocker le résultat.
        glMatrix.mat4.perspective(projectionMatrix,
                            this.fov,
                            this.asp,
                            this.zNr,
                            this.zFr);
        
        this.__matrix = projectionMatrix;

        return this.__matrix;
    }
}
