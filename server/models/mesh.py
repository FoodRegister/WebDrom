
from fparse import *
from models.script import StringArray
from models.vector import VAO, VBO, EBO, Vec3Type

MeshType = ModelType([
    ("name",    StringFieldType),
    ("mesh_id", UIntFieldType),
    ("buffer",  VAO),
    ("faces",   EBO),
    ("scripts", StringArray)
])
MeshInstance = ModelType([
    ("position", Vec3Type),
    ("rotation", Vec3Type),
    ("scale",    Vec3Type),
    ("mesh_id",  UIntFieldType)
])
