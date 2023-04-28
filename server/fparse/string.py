
from fparse.model import FieldType

class _StringFieldType(FieldType):
    def _read(self, buffer):
        length = buffer.uint(4)
        return buffer.read(length).decode(buffer.encoding())
    def can_write(self, object):
        return isinstance(object, str)
    def _write(self, buffer, object):
        buffer.write_uint(len(object), 4)
        buffer.write(bytes(object, buffer.encoding()))

StringFieldType = _StringFieldType()
