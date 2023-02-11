
def read_uint8 (file):
    return ord(file.read(1))
def read_uint (file, size=4):
    if size <= 0: return 0

    return 256 * read_uint(file, size - 1) + read_uint8(file)
def read_size (file, size):
    return file.read(size)
def read_string (file):
    size = read_uint(file)
    return read_size(file, size)
def read_bool (file):
    return read_uint8(file) != 0

def write_uint8 (file, value):
    file.write(chr( value ))
def write_uint (file, value, size=4):
    if size == 0: return
    write_uint( file, value // 256, size = size - 1 )
    write_uint8( file, value % 256 )
def write_size (file, string, size):
    assert len(string) == size, "Unexpected behavior in write_size function"
    file.write(string)
def write_string (file, string):
    write_uint( file, len(string) )
    write_size( file, string, len(string) )
def write_bool (file, bool):
    value = 1 if bool else 0
    write_uint8(file, value)