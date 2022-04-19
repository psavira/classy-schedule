import json
import os
from pathlib import Path

pin = Path('./scheduler-data/testin.json')
pout = Path('./scheduler-data/testout.json')

with open(pin, 'r') as f:
    data = json.loads(f.read())

data['age'] = int(data['age']) * 2
new_json = json.dumps(data)

if os.path.exists(pout):
    os.remove(pout)

with open(pout, 'w') as f:
    f.write(new_json)
