
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

class _NumberFieldType(FieldType):
    def __init__(self):
        super().__init__()
    def _read(self, buffer):
        str_size = buffer.uint(4)
        return float(buffer.read(str_size))
    def can_write(self, object):
        return isinstance(object, float) or isinstance(object, int)
    def _write(self, buffer, object):
        string = str(object)
        buffer.write_uint(len(string), 4)

        buffer.write(bytes(string, encoding=buffer.encoding()))

# default uint type is 32 bytes
UIntFieldType   = _UIntFieldType(4)
NumberFieldType = _NumberFieldType()
