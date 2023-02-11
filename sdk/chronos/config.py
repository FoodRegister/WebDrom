"""
.fcs file specification

Object type:
    [ DATABASE      = 0 ]
    [ STRING        = 1 ]
    [ TEXTFIELD     = 2 ]
    [ CHARFIELD     = 3 ]

File bytes :
Magic number  (32) : 0xFC420411
Major version (16)
Minor version (16)

Object count (32)

for each object {
    Object type (8)
        [ DATABASE Field = 0 ]
}
"""

MAGIC_NUMBER  = 0xFC420411 # 0xFC420411
MAJOR_VERSION = 1
MINOR_VERSION = 0

OBJECT_TYPE__DATABASE_FIELD = 0
OBJECT_TYPE__STRING_FIELD   = 1
OBJECT_TYPE__TEXT_FIELD     = 2
OBJECT_TYPE__CHAR_FIELD     = 3
OBJECT_TYPE__BOOLEAN_FIELD  = 4
