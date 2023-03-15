
from fparse.model import AnyFieldType, FieldType

class _ArrayFieldType(FieldType):
    def __init__(self, restriction=None):
        self.restriction = restriction

        if restriction is None:
            super().__init__()
    def get_restriction (self):
        if self.restriction is None: return AnyFieldType
        return self.restriction
    def _read(self, buffer):
        size = buffer.uint(4)

        objects = []
        for i in range(size):
            objects.append(AnyFieldType.read(buffer))
        
        return objects
    def can_write(self, object):
        if type(object) != list: return False
        if self.restriction is not None:
            for obj in object:
                if not self.restriction.can_write(obj):
                    return False
        
        return True
    def _write(self, buffer, object):
        buffer.write_uint(len(object), 4)

        for obj in object:
            AnyFieldType.write(buffer, obj)
    def restrict (self, type):
        new_type = _ArrayFieldType(type)
        new_type._FieldType__packet_id = self.packet_id()

        return new_type
    def to_json(self, object):
        return list(map(lambda x: self.get_restriction().to_json(x), object))

ArrayFieldType = _ArrayFieldType()
