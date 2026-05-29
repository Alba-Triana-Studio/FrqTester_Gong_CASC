import json

with open('P1Sound.maxpat', 'r') as f:
    data = json.load(f)

for line in data['patcher']['lines']:
    l = line['patchline']
    if l['destination'][0] == 'obj-20' and l['source'][0] == 'obj-23':
        l['destination'][1] = 2

with open('P1Sound.maxpat', 'w') as f:
    json.dump(data, f, indent=4)
