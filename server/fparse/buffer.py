
class ReadFileBuffer:
    def encoding(self):
        return "utf-8"
    
    def __init__(self, file):
        self.__file = file
    def file(self):
        return self.__file
    def read(self, size=1):
        return self.__file.read(size)
    def uint(self, size=1):
        value = 0
        for idx in range(size):
            value *= 256
            value += ord(self.read())
        return value

class WriteFileBuffer:
    def encoding(self):
        return "utf-8"
    
    def __init__(self, file):
        self.__file = file
    def file(self):
        return self.__file
    
    def write(self, _bytes):
        self.__file.write(_bytes)
    def write_uint(self, integer, size=1):
        L = []
        for idx in range(size):
            L.append(int(integer % 256))
            integer //= 256
        
        L.reverse()
        self.write(bytes(L))

######################
# DEBUGGING PURPOSES #
######################

class IO_Input:
    def encoding(self):
        return "utf-8"
    
    def __init__(self, objects):
        self.objects = objects
        self.offset  = -1
    def next (self):
        self.offset += 1
        return self.objects[self.offset]
    def file(self):
        return None
    def read(self, size=1):
        o = self.next()

        assert len(o) == size and type(o) == str
        return bytes(o, encoding=self.encoding())
    def uint(self, size=1):
        o = self.next()

        assert type(o) == tuple and o[0] == size
        return o[1]
class IO_Output:
    def encoding(self):
        return "utf-8"
    
    def __init__(self):
        self.array = []
    def file(self):
        return None
    
    def write(self, _bytes):
        self.array.append(_bytes.decode(self.encoding()))
    def write_uint(self, integer, size=1):
        self.array.append((size, integer))
class IO_Print:
    def encoding(self):
        return "utf-8"
    
    def file(self):
        return None
    
    def write(self, _bytes):
        print(_bytes)
    def write_uint(self, integer, size=1):
        print(f"uint(size={size}, {integer})")