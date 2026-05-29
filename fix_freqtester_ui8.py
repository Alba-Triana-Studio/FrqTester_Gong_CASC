import json
with open('FreqTester_LR_MOD_laser.maxpat', 'r') as f:
    data = json.load(f)

for line in data['patcher']['lines']:
    l = line['patchline']
    if l['source'][0] == 'obj-pw1_slider':
        print(f"pw1 slider -> {l['destination'][0]}")
