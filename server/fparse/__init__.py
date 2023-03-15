
from fparse.model  import AnyFieldType, ModelType, FieldType
from fparse.string import StringFieldType
from fparse.number import UIntFieldType, NumberFieldType
from fparse.array  import ArrayFieldType

# WARNING never ever remove one of these assertions
assert AnyFieldType   .packet_id() == 0, "Improperly configured fparse"
assert StringFieldType.packet_id() == 1, "Improperly configured fparse"
assert UIntFieldType  .packet_id() == 2, "Improperly configured fparse"
assert NumberFieldType.packet_id() == 3, "Improperly configured fparse"
assert ArrayFieldType .packet_id() == 4, "Improperly configured fparse"

FieldType.end_module()