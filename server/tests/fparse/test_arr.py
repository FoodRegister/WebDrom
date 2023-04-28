
from fparse import *
from fparse.buffer import *

import random

from tests.fparse.test_str import random_string

def get_randint ():
    return random.randint(0, int(1e9))
def get_randstring ():
    return random_string()
def get_random ():
    return random.choice([ get_randint(), get_randstring() ])

def get_array (size = 8):
    return [ get_random() for i in range(size) ]
def get_iarray (size = 8):
    return [ get_randint() for i in range(size) ]
def get_sarray (size = 8):
    return [ get_randstring() for i in range(size) ]
def repartition (a = 0, b = 8):
    return random.shuffle(
        get_iarray(a) + get_sarray(b)
    )
def get_siarray (size=8):
    s0 = random.randint(1, size - 1)
    s1 = size - s0

    return repartition(s0, s1)

def validate (array, mode=ArrayFieldType):
    out = IO_Output()
    mode.write(out, array)

    fields = [ (2, 4), (4, len(array)) ]
    for v in array:
        if isinstance(v, int):
            fields.append((2, 2))
            fields.append((4, v))
        elif isinstance(v, str):
            fields.append((2, 1))
            fields.append((4, len(v)))
            fields.append(v)
    
    assert out.array == fields
    assert mode.to_json(array) == array

    inr = IO_Input(out.array)
    assert inr.offset == -1
    res = mode.read(inr)
    assert res == array
    assert inr.offset == len(fields) - 1
def dont_validate (array, mode):
    try:
        mode.write(IO_Output(), array)
    except AssertionError:
        return
    print(array)
    assert False, "array was correct"

def test_random ():
    for i in range(256):
        arr = get_array()
        validate(arr)
        validate(arr, AnyFieldType)

def test_int_restriction ():
    _int_array = ArrayFieldType.restrict(UIntFieldType)

    for i in range(256):
        arr = get_iarray()
        validate(arr, _int_array)
def test_int_restriction_false ():
    _int_array = ArrayFieldType.restrict(UIntFieldType)

    for i in range(256):
        arr = get_siarray(16)
        
        assert not _int_array.can_write(arr)
        dont_validate(arr, _int_array)
def test_string_restriction ():
    _str_array = ArrayFieldType.restrict(StringFieldType)

    for i in range(256):
        arr = get_sarray()
        validate(arr, _str_array)
def test_string_restriction_false ():
    _str_array = ArrayFieldType.restrict(StringFieldType)

    for i in range(256):
        arr = get_siarray(16)
        
        assert not _str_array.can_write(arr)
        dont_validate(arr, _str_array)

def test_both_restriction ():
    _si_array = ArrayFieldType.restrict( UIntFieldType | StringFieldType )

    dont_validate([0, "qa", 1.01], _si_array)
    validate([0, "qa"], _si_array)