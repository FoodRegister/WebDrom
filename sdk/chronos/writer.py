
from chronos.reader import MAGIC_NUMBER, MAJOR_VERSION, MINOR_VERSION
from chronos.utils  import *

def write (file, reader):
    write_uint(file, MAGIC_NUMBER)
    write_uint(file, MAJOR_VERSION, 2)
    write_uint(file, MINOR_VERSION, 2)

    write_uint(file, len(reader.fields))
    for field in reader.fields:
        field.write(file)