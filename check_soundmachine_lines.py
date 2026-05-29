import json

with open('SoundMachine.maxpat', 'r') as f:
    data = json.load(f)

for line in data['patcher']['lines']:
    l = line['patchline']
    if l['destination'][0] == 'obj-21':
        print(f"{l['source'][0]} -> obj-21")
