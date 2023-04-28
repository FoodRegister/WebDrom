
from fparse import *
from models.mesh import *

LevelType = ModelType([
    ("mesh_array", ArrayFieldType.restrict(MeshType)),
    ("instances",  ArrayFieldType.restrict(MeshType)),
    ("scripts",    StringArray)
])
