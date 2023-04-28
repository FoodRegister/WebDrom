

const MATERIAL_CATEGORY = (function () {
    const FLOAT_COLOR   = "#45B69C";
    const MATRIX_COLOR  = "#5B8B9E";
    const TEXTURE_COLOR = "#AF5D63";

    let vec1 = new MGraph_Type("Scalar", FLOAT_COLOR);
    let vec2 = new MGraph_Type("2D Vector", FLOAT_COLOR);
    let vec3 = new MGraph_Type("3D Vector", FLOAT_COLOR);
    let vec4 = new MGraph_Type("4D Vector", FLOAT_COLOR);

    let mat2 = new MGraph_Type("2D Matrix", MATRIX_COLOR);
    let mat3 = new MGraph_Type("3D Matrix", MATRIX_COLOR);
    let mat4 = new MGraph_Type("4D Matrix", MATRIX_COLOR);

    let sampler2D = new MGraph_Type("2D Texture", TEXTURE_COLOR);

    let vector_space_VEC_SCALAR = new MGraph_VariantVectorSpace(
        [ "Vector", "Scalar" ],
        [
            new MGraph_VectorSpace([ vec1, vec1 ]),
            new MGraph_VectorSpace([ vec2, vec1 ]),
            new MGraph_VectorSpace([ vec3, vec1 ]),
            new MGraph_VectorSpace([ vec4, vec1 ]),
        ]
    );
    let vector_space_VEC = new MGraph_VariantVectorSpace(
        [ "Result" ],
        [
            new MGraph_VectorSpace([ vec1 ]),
            new MGraph_VectorSpace([ vec2 ]),
            new MGraph_VectorSpace([ vec3 ]),
            new MGraph_VectorSpace([ vec4 ])
        ]
    );
    let vector_space_EMPTY = new MGraph_VariantVectorSpace(
        [],
        [ new MGraph_VectorSpace([]) ]
    );

    let scale_vector = new MGraph_Function(
        "Scale",
        vector_space_VEC_SCALAR,
        vector_space_VEC
    );
    let const_vec1 = new MGraph_Function("Scalar",    vector_space_EMPTY, vec1.as_variant_vector_space("Scalar"));
    let const_vec2 = new MGraph_Function("2D Vector", vector_space_EMPTY, vec2.as_variant_vector_space("Vector"));
    let const_vec3 = new MGraph_Function("3D Vector", vector_space_EMPTY, vec3.as_variant_vector_space("Vector"));
    let const_vec4 = new MGraph_Function("4D Vector", vector_space_EMPTY, vec4.as_variant_vector_space("Vector"));

    let category_constants = new MGraph_Category(
        "Constant", [], [ const_vec1, const_vec2, const_vec3, const_vec4 ]
    );
    let category_operands = new MGraph_Category(
        "Operands", [], [ scale_vector ]
    );

    let root_category = new MGraph_Category(
        "ROOT", [ category_constants, category_operands ], []
    );

    return {
        types: {
            vec1: vec1,
            vec2: vec2,
            vec3: vec3,
            vec4: vec4,
            mat2: mat2,
            mat3: mat3,
            mat4: mat4,
            sampler2D, sampler2D
        },
        library: new MGraph_Library(root_category)
    }
})();

