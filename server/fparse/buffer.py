
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