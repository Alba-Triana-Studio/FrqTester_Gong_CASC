import json
with open('FreqTester_LR_MOD_laser.maxpat', 'r') as f:
    data = json.load(f)

ui_ids_to_delete = [
    'obj-424', 'obj-423', 'obj-422', 'obj-66', 'obj-30', 'obj-410', 'obj-301', 'obj-300', 
    'obj-346', 'obj-347', 'obj-351', 'obj-352', 'obj-357', 'obj-358', 'obj-173', 'obj-62', 
    'obj-51', 'obj-228', 'obj-229', 'obj-115', 'obj-114', 'obj-240', 'obj-247', 'obj-122', 
    'obj-100', 'obj-112', 'obj-4', 'obj-38', 'obj-49', 'obj-408', 'obj-409'
]

boxes_to_keep = []
boxes_to_delete = []

for b in data['patcher']['boxes']:
    if b['box'].get('id') in ui_ids_to_delete:
        boxes_to_delete.append(b['box'].get('id'))
    else:
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
