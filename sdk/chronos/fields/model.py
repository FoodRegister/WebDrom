
from chronos.config import OBJECT_TYPE__DATABASE_FIELD
from chronos.fields     import FCS_Field, add_to_field_array
from chronos.fields.var import FCS_StringField
from chronos.utils      import read_uint8, write_uint8

class FCS_DatabaseModel (FCS_Field):
    def __init__(
            self, 
            package    : FCS_StringField, 
            model_name : FCS_StringField, 
            fields
        ):
        self.__package    = package
        self.__model_name = model_name
        self.__fields     = fields
    def package    (self): return self.__package   .name()
    def model_name (self): return self.__model_name.name()

    def fields (self): return self.__fields

    @staticmethod
    def generate(file):
        package    = FCS_StringField.generate( file )
        model_name = FCS_StringField.generate( file )

        field_count = read_uint8( file )
        fields      = [  ]
        
        for field_id in range( field_count ):
            field_type = read_uint8( file )

            fields.append( FCS_Field.generate( field_type, file ) )
    
        return FCS_DatabaseModel( package, model_name, fields )
    def write(self, file, append_type=True):
        if append_type: write_uint8( file, OBJECT_TYPE__DATABASE_FIELD )
        self.__package   .write(file, False)
        self.__model_name.write(file, False)

        write_uint8( file, len(self.fields()) )

        for field_id, field in enumerate( self.fields() ):
            field.write(file)

add_to_field_array( OBJECT_TYPE__DATABASE_FIELD, FCS_DatabaseModel )