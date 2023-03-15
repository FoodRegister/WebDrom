
from fparse import *
from fparse.buffer import *

import random
import string

def random_letter () :
    return random.choice(string.ascii_letters)
def random_string (size=32):
    return "".join([ random_letter() for i in range(size) ])

def string_check (str, mode=StringFieldType):
    out = IO_Output()
    mode.write(out, str)

    assert out.array == [(2, 1), (4, len(str)), str]

    inr = IO_Input(out.array)
    assert inr.offset == -1
    assert mode.to_json(str) == str
    res = mode.read(inr)
    assert inr.offset == 2
    assert res == str
def string_fcheck(str):
    string_check(str)
    string_check(str, AnyFieldType)

def test_default ():
    for s in [ "", "a", "aaa", "aba" ]:
        string_fcheck(s)
def test_random ():
    for id in range(256):
        string_fcheck(random_string())
