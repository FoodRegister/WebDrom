
from fparse        import *
from fparse.number import NumberFieldType
from fparse.json   import Serializable

class Vec2(Serializable):
    def __init__(self, x=0, y=0):
        self.x, self.y = x, y
    def to_json (self, *args):
        return [ self.x, self.y ]
class Vec3(Serializable):
    def __init__(self, x=0, y=0, z=0) -> None:
        self.x, self.y, self.z = x, y, z
    def to_json(self, *args):
        return [ self.x, self.y, self.z ]

NF = NumberFieldType

Vec2Type = ModelType(
    [ ("x", NF), ("y", NF) ], 
    Vec2
)
Vec3Type = ModelType(
    [ ("x", NF), ("y", NF), ("z", NF) ],
    Vec3
)

ArrayVec2 = ArrayFieldType.restrict(Vec2Type)
ArrayVec3 = ArrayFieldType.restrict(Vec3Type)

VBO = ArrayVec2 | ArrayVec3
VAO = ArrayFieldType.restrict(VBO)
EBO = ArrayFieldType.restrict(UIntFieldType)
