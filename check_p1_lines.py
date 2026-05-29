import json

with open('P1Sound.maxpat', 'r') as f:
    data = json.load(f)

for line in data['patcher']['lines']:
    l = line['patchline']
    if l['destination'][0] == 'obj-20':
        print(f"{l['source'][0]} -> obj-20 inlet {l['destination'][1]}")
