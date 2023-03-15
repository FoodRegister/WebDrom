
from fparse.buffer import *
from fparse import *
from models import *
from models.vector import *

import random

def rand_flt (a = -2000, b = 2000):
    return a + random.random() * (b - a)
def rand_vec (model = Vec3, size = 3):
    L = [ rand_flt() for i in range(size) ]

    return model(*L)
def rand_vec2 ():
    return rand_vec(Vec2, 2)
def rand_vec3 ():
    return rand_vec(Vec3, 3)

def fields_vec2 (vec):
    sx, sy = str(vec.x), str(vec.y)
    return [ 
        (2, 256), 
        (2, 3), (4, len(sx)), sx, 
        (2, 3), (4, len(sy)), sy
    ]
def fields_vec3 (vec):
    sx, sy, sz = str(vec.x), str(vec.y), str(vec.z)
    return [ 
        (2, 257), 
        (2, 3), (4, len(sx)), sx, 
        (2, 3), (4, len(sy)), sy, 
        (2, 3), (4, len(sz)), sz
    ]

def validate_vec2 (vec2, mode=Vec2Type):
    out = IO_Output()
    mode.write(out, vec2)

    assert out.array == fields_vec2(vec2)

    inr = IO_Input(out.array)
    assert inr.offset == -1
    res = mode.read(inr)
    assert isinstance(res, Vec2)
    assert mode.to_json(res) == [ res.x, res.y ]
    assert res.x == vec2.x
    assert res.y == vec2.y
    assert inr.offset == 6
def validate_vec3 (vec3, mode=Vec3Type):
    out = IO_Output()
    mode.write(out, vec3)

    assert out.array == fields_vec3(vec3)

    inr = IO_Input(out.array)
    assert inr.offset == -1
    res = mode.read(inr)
    assert isinstance(res, Vec3)
    assert res.x == vec3.x
    assert res.y == vec3.y
    assert res.z == vec3.z
    assert mode.to_json(res) == [ res.x, res.y, res.z ]
    assert inr.offset == 9

def test_vec2 ():
    for i in range(256):
        vec = rand_vec2()
        validate_vec2(vec)
        validate_vec2(vec, AnyFieldType)
def test_vec3 ():
    for i in range(256):
        vec = rand_vec3()
        validate_vec3(vec)
        validate_vec3(vec, AnyFieldType)

def gen_vbo (size=8):
    type, rand = random.choice([ (Vec2Type, rand_vec2), (Vec3Type, rand_vec3) ])
    return type, [ rand() for i in range(size) ]
def gen_vao (size_x = 8, size_y = 8):
    types = []
    vbos  = []
    for i in range(size_x):
        type, vbo = gen_vbo(size_y)

        types.append(type)
        vbos .append(vbo)
    
    return types, vbos

def validate_vao (types, vbos, mode = VAO):
    out = IO_Output()
    mode.write(out, vbos)

    expected = list(map(
        lambda vbo : list(map(
            lambda vec: [ vec.x, vec.y ] if isinstance(vec, Vec2) else [ vec.x, vec.y, vec.z ],
            vbo
        )),
        vbos
    ))
    out_array = [ (2, 4), (4, len(vbos)) ]
    for vbo in vbos:
        out_array.append((2, 4))
        out_array.append((4, len(vbo)))
        for vec in vbo:
            if isinstance(vec, Vec2):
                out_array.append((2, 256))
                out_array.append((2, 3))
                out_array.append((4, len(str(vec.x))))
                out_array.append(str(vec.x))
                out_array.append((2, 3))
                out_array.append((4, len(str(vec.y))))
                out_array.append(str(vec.y))
            if isinstance(vec, Vec3):
                out_array.append((2, 257))
                out_array.append((2, 3))
                out_array.append((4, len(str(vec.x))))
                out_array.append(str(vec.x))
                out_array.append((2, 3))
                out_array.append((4, len(str(vec.y))))
                out_array.append(str(vec.y))
                out_array.append((2, 3))
                out_array.append((4, len(str(vec.z))))
                out_array.append(str(vec.z))
    assert mode.to_json(vbos) == expected
    assert out.array == out_array
    inr = IO_Input(out.array)
    res = mode.read(inr)
    assert len(res) == len(vbos)
    for res_v, vbo in zip(res, vbos):
        assert len(res_v) == len(vbo)
        for rvec, vec in zip(res_v, vbo):
            assert rvec.x == vec.x
            assert rvec.y == vec.y
            if isinstance(vec, Vec3):
                assert isinstance(rvec, Vec3)
                assert rvec.z == vec.z
            else:
                assert isinstance(rvec, Vec2)

def test_vbo ():
    for i in range(32):
        types, vbos = gen_vao()
        validate_vao(types, vbos)
        