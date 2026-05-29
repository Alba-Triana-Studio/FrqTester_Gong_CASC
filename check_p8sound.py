import json

with open('p8sound.maxpat', 'r') as f:
    data = json.load(f)

for line in data['patcher']['lines']:
    l = line['patchline']
    if l['destination'][0] == 'obj-13':
        print(f"{l['source'][0]} -> obj-13 inlet {l['destination'][1]}")
