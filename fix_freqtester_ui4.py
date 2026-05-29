import json
with open('FreqTester_LR_MOD_laser.maxpat', 'r') as f:
    data = json.load(f)
boxes_to_keep = []
boxes_to_delete = ['obj-122', 'obj-297', 'obj-299', 'obj-111', 'obj-108']
for b in data['patcher']['boxes']:
    if b['box'].get('id') not in boxes_to_delete:
        boxes_to_keep.append(b)
data['patcher']['boxes'] = boxes_to_keep
lines_to_keep = []
for line in data['patcher']['lines']:
    l = line['patchline']
    if l['source'][0] not in boxes_to_delete and l['destination'][0] not in boxes_to_delete:
        lines_to_keep.append(line)
data['patcher']['lines'] = lines_to_keep
with open('FreqTester_LR_MOD_laser.maxpat', 'w') as f:
    json.dump(data, f, indent=4)
