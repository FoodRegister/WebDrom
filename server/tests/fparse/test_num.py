
from fparse import *
from fparse.buffer import *

import random

def int_out(val=0, mode=UIntFieldType):
    out = IO_Output()
    mode.write(out, val)
    
    assert out.array == [(2, 2), (4, val)]

    inr = IO_Input(out.array)
    assert inr.offset == -1
    assert mode.to_json(val) == val
    res = mode.read(inr)
    assert inr.offset == 1
    assert res == val
def num_out(val=0, mode=NumberFieldType):
    out = IO_Output()
    mode.write(out, val)
    
    assert out.array == [(2, 3), (4, len(str(val))), str(val)]

    inr = IO_Input(out.array)
    assert inr.offset == -1
    assert mode.to_json(val) == val
    res = mode.read(inr)
    assert inr.offset == 2
    assert res == val

def test_out_range ():
    for i in range(256):
        int_out(i)
        int_out(i, AnyFieldType)
def test_out_random ():
    for i in range(256):
        val = random.randint(0, int(1e9))
        int_out(val)
        int_out(val, AnyFieldType)
def test_num_range():
    i = 0.0
    for _ in range(256):
        i += 0.123
        num_out(i)
        num_out(i, AnyFieldType)
def test_num_random():
    for _ in range(256):
        i = random.random() * 2000
        num_out(i)
        num_out(i, AnyFieldType)
