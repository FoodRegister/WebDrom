
from chronos.utils  import *
from chronos.config import *

field_array = {  }
def add_to_field_array ( type, object ):
    field_array[type] = object

class FCS_Field:
    @staticmethod
    def generate (field_type, file):
        if field_type in field_array:
            return field_array[field_type].generate(file)
        
        assert False, f"Field {field_type} not implemented"
    def write(self, file, append_type=True):
        pass

from chronos.fields.model import *
from chronos.fields.var   import *
