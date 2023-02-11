
from chronos.config import *
from chronos.fields import FCS_Field
from chronos.utils  import *

class FCS_Reader:
    def __init__ (self):
        pass
    def read (self, file):
        assert read_uint(file) == MAGIC_NUMBER, "Could not recognize magic number of .fcs file, make sure it is 0xFC420411"

        self.major_version = read_uint(file, 2)
        self.minor_version = read_uint(file, 2)

        assert self.major_version <= MAJOR_VERSION, "The .fcs file is too recent for the reader"
        assert self.major_version <  MAJOR_VERSION \
            or self.minor_version <= MINOR_VERSION, "The .fcs file is too recent for the reader"

        field_count = read_uint(file)

        self.fields = []
        for field_id in range(field_count):
            field_type = read_uint8( file )
            self.fields.append(FCS_Field.generate( field_type, file ))