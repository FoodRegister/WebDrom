
from fparse import *
from fparse.buffer import *

import random

from fparse.model import DObj

def randint ():
    return random.randint(0, int(1e9))
def as_obj(**keys):
    return DObj(**keys)
def random_object ():
    return as_obj(**{ "year": randint(), "month": randint(), "day": randint() })

def create_model ():
    global DayFieldType
    DayFieldType = ModelType([
        ("year",  UIntFieldType),
        ("month", UIntFieldType),
        ("day",   UIntFieldType)
    ])
    ## Bypassing collisions in pytest field computations

    assert DayFieldType.packet_id() == 256
    FieldType   ._FieldType__pc_id_count = 256
    DayFieldType._FieldType__packet_id  = 65535
    FieldType   ._FieldType__instances[65535] = DayFieldType
    return DayFieldType

def test_model_packet ():
    assert DayFieldType.packet_id() == 65535

def validate (mode, object):
    out = IO_Output()
    
    expected = [
        (2, 65535), 
        (2, 2), (4, object.year), 
        (2, 2), (4, object.month), 
        (2, 2), (4, object.day)
    ]

    mode.write(out, object)
    assert expected == out.array

    inr = IO_Input(out.array)
    assert inr.offset == -1

    res = mode.read(inr)
    assert inr.offset == len(expected) - 1
    assert mode.to_json(object) == { "year": object.year, "month": object.month, "day": object.day }
    arr_mode = ArrayFieldType.restrict(mode)
    assert arr_mode.to_json([ object ]) == [{ "year": object.year, "month": object.month, "day": object.day }]
    assert arr_mode.to_json([ object ] * 2) == [{ "year": object.year, "month": object.month, "day": object.day }] * 2

    assert res.year  == object.year
    assert res.month == object.month
    assert res.day   == object.day

def test_random():
    for i in range(256):
        date = random_object()

        validate(DayFieldType, date)
        validate(AnyFieldType, date)

create_model()
