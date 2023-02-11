
from chronos.config import *
from chronos.fields import FCS_Field, add_to_field_array
from chronos.utils  import *

class FCS_VarField:
    @staticmethod
    def create (type, name, *parameters):
        class FCS_InnerField(FCS_Field):
            def __init__(self, string):
                self.__string = string

                for name, prot_read, prot_write, default in parameters:
                    setattr(self, name, default)
            def name (self):
                return self.__string
            def type (self):
                return type

            def __str__(self):
                return f"{self.__string}:{type}"
            @staticmethod
            def generate(file):
                length = read_uint( file )
            
                field = FCS_InnerField( read_size(file, length) )
                for name, prot_read, prot_write, default in parameters:
                    setattr(field, name, prot_read(file))

                return field
            def write(self, file, append_type=True):
                if append_type: write_uint8( file, self.type() )
                write_uint( file, len(self.name()) )
                write_size( file, self.name(), len(self.name()) )

                for name, prot_read, prot_write, default in parameters:
                    value = getattr(self, name)
                    
                    prot_write( file, value )

        FCS_InnerField.__name__ = name
        add_to_field_array( type, FCS_InnerField )
        return FCS_InnerField

FCS_StringField  = FCS_VarField.create(OBJECT_TYPE__STRING_FIELD, "StringField")
FCS_TextField    = FCS_VarField.create(OBJECT_TYPE__TEXT_FIELD, "TextField", ("default", read_string, write_string, ""))
FCS_CharField    = FCS_VarField.create(OBJECT_TYPE__CHAR_FIELD, "CharField", ("default", read_string, write_string, ""), ("max_length", read_uint, write_uint, 50))
FCS_BooleanField = FCS_VarField.create(OBJECT_TYPE__BOOLEAN_FIELD, "BooleanField", ("default", read_bool, write_bool, False))