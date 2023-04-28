
from fparse.json import Serializable


NATIVE_TYPE_RESERVED = 256

class FieldType(Serializable):
    __pc_id_count = 0
    __instances   = {}

    @staticmethod
    def start_module ():
        pass
    @staticmethod
    def end_module():
        assert FieldType.__pc_id_count < NATIVE_TYPE_RESERVED
        FieldType.__pc_id_count = NATIVE_TYPE_RESERVED
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
    def __or__(self, b):
        return AnyFieldType.restrict( [self, b] )
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
        assert self.can_write(object)

        buffer.write_uint(self.packet_id(), 2)

        self._write(buffer, object)
    def _write(self, buffer, object):
        pass

    def packet_id(self):
        return self.__packet_id
    def to_json(self, object):
        return object

class _AnyFieldType(FieldType):
    def __init__(self, restrictions = []) -> None:
        self.restrictions = restrictions
        
        if len(restrictions) == 0:
            super().__init__()
    def restricted_instances (self):
        return self.restrictions if len(self.restrictions) != 0 else FieldType.instances()
    def validate(self, buffer):
        return False
    def read(self, buffer):
        field_type = buffer.uint(2)

        return self.restricted_instances()[field_type]._read(buffer)
    def can_write(self, object):
        if len(self.restrictions) == 0: return False

        rest = self.restrictions
        for key in rest:
            if key.can_write(object):
                return True
        return False
    def write(self, buffer, object):
        if len(self.restrictions) != 0:
            instances = self.restricted_instances()

            for val in instances:
                if val.can_write(object):
                    val.write(buffer, object)
                    return

            assert False, "Could not write object"
        instances = self.restricted_instances()
        for key in instances:
            val = instances[key]

            if val.can_write(object):
                val.write(buffer, object)
                return
        
        assert False, "Could not write object"
    def restrict (self, array):
        v = _AnyFieldType(array)
        v._FieldType__packet_id = self.packet_id()
        return v
    def to_json(self, object):
        instances = self.restricted_instances()
        if isinstance(instances, dict):
            for key in instances:
                val = instances[key]

                if val.can_write(object):
                    return val.to_json(object)
        else:
            for val in instances:
                if val.can_write(object):
                    return val.to_json(object)

        assert False, "Could not find subclass"

# Default object
class DObj:
    def __init__(self, **kwargs):
        for key in kwargs:
            setattr(self, key, kwargs[key])
        self.__kwargs = kwargs

class ModelType(FieldType):
    def __init__(self, fields, target=DObj):
        super().__init__()

        self.fields = fields # array of tuple (name, field_type)
        self.target = target
    def can_write(self, object):
        if isinstance(object, dict):
            object = self.target( **object )
        if not isinstance(object, self.target): return False
        for field_name, field_type in self.fields:
            if  hasattr(object, field_name) \
            and field_type.can_write(getattr(object, field_name)):
                continue
            return False
        return True
                
    def _read(self, buffer):
        object = {}

        for field_name, field_type in self.fields:
            object[field_name] = field_type.read(buffer)

        return self.target( **object )
    def _write(self, buffer, object):
        if isinstance(object, dict):
            object = self.target( **object )
        for field_name, field_type in self.fields:
            assert hasattr(object, field_name)

            field_type.write(buffer, getattr(object, field_name))
        return super()._write(buffer, object)

    def to_json(self, object):
        if isinstance(object, dict):
            object = self.target( **object )
        if isinstance(object, Serializable):
            return object.to_json(object)
        json = {  }
        for field_name, field_type in self.fields:
            assert hasattr(object, field_name)

            json[field_name] \
             = field_type.to_json(getattr(object, field_name))
        return json

AnyFieldType = _AnyFieldType()
