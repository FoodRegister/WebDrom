
from fparse.model  import AnyFieldType
from fparse.string import StringFieldType
from fparse.number import UIntFieldType

# WARNING never ever remove one of these assertions
assert AnyFieldType   .packet_id() == 0, "Improperly configured fparse"
assert StringFieldType.packet_id() == 1, "Improperly configured fparse"
assert UIntFieldType  .packet_id() == 2, "Improperly configured fparse"
