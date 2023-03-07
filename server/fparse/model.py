
class FieldType:
    __pc_id_count = 0
    __instances   = {}

    @staticmethod
    def instances():
        return FieldType.__instances
    @staticmethod
    def __gen_pc_id ():
        FieldType.__pc_id_count += 1

        return FieldType.__pc_id_count - 1

    def __init__(self):
        self.__packet_id = self.__gen_pc_id()

        FieldType.__instances[self.__packet_id] = self
    def validate (self, buffer):
        field_type = buffer.uint(2)

        return field_type == self.packet_id()
    def read(self, buffer):
        assert self.validate(buffer)

        return self._read(buffer)
    def _read (self, buffer):
        return None
    def can_write (self, object):
        return False
    def write (self, buffer, object):
        buffer.write_uint(self.packet_id(), 2)

        self._write(buffer, object)
    def _write(self, buffer, object):
        pass

    def packet_id(self):
        return self.__packet_id

class _AnyFieldType(FieldType):
    def __init__(self) -> None:
        super().__init__()
    def validate(self, buffer):
        return False
    def read(self, buffer):
        field_type = buffer.uint(2)

        return FieldType.instances()[field_type]._read(buffer)
    def can_write(self, object):
        return False
    def write(self, buffer, object):
        for key in FieldType.instances():
            val = FieldType.instances()[key]

            if val.can_write(object):
                val.write(buffer, object)
                return
        
        assert False, "Could not write object"

AnyFieldType = _AnyFieldType()
