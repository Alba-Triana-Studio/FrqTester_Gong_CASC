import json
with open('FreqTester_LR_MOD_laser.maxpat', 'r') as f:
    data = json.load(f)

for line in data['patcher']['lines']:
    l = line['patchline']
    if l['destination'][0] in ['obj-312', 'obj-310', 'obj-298']:
        print(f"{l['source'][0]} -> {l['destination'][0]}")
