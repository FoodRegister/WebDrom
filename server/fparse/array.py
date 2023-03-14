
from fparse.model import AnyFieldType, FieldType

class _ArrayField(FieldType):
    def _read(self, buffer):
        size = buffer.uint(4)

        objects = []
        for i in range(size):
            objects.append(AnyFieldType.read(buffer))
        
        return objects
    def can_write(self, object):
        return type(object) == list
    def _write(self, buffer, object):
        buffer.write_uint(len(object), 4)

        for obj in object:
            AnyFieldType.write(buffer, obj)

ArrayField = _ArrayField()
