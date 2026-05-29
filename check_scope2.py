import json

with open('FreqTester_LR_MOD_laser.maxpat', 'r') as f:
    data = json.load(f)

for line in data['patcher']['lines']:
    l = line['patchline']
    dest = l['destination'][0]
    src = l['source'][0]
    if dest in ['obj-80', 'obj-76'] or src in ['obj-80', 'obj-76']:
        print(f"{src} -> {dest}")
