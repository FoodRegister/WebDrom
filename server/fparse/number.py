
from fparse.model import FieldType

class _UIntFieldType(FieldType):
    def __init__(self, size):
        super().__init__()
        self.__size = size
    def size(self):
        return self.__size * 8
    def _read(self, buffer):
        return buffer.uint(self.__size)
    def can_write(self, object):
        return isinstance(object, int)
    def _write(self, buffer, object):
        buffer.write_uint(object, self.__size)

# default uint type is 32 bytes
UIntFieldType = _UIntFieldType(4)
