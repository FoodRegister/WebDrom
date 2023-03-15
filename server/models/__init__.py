
from fparse        import *
from models.vector import Vec2Type, Vec3Type

assert Vec2Type.packet_id() == 256
assert Vec3Type.packet_id() == 257
