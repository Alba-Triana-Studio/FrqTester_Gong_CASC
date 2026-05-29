import json

with open('FreqTester_LR_MOD_laser.maxpat', 'r') as f:
    data = json.load(f)

boxes_to_keep = []
boxes_to_delete = []

ui_ids_to_delete = [
    'obj-213', 'obj-240', 'obj-248', 'obj-267', 'obj-142', 'obj-255', 
    'obj-114', 'obj-115', 'obj-190', 'obj-182', 'obj-195', 'obj-194', 'obj-207', 'obj-199', 
    'obj-228', 'obj-229', 'obj-223', 'obj-224', 'obj-152', 'obj-151', 'obj-265', 'obj-264', 
    'obj-100', 'obj-119', 'obj-167', 'obj-294', 'obj-247', 'obj-253', 'obj-165', 'obj-286', 
    'obj-101', 'obj-112', 'obj-168', 'obj-295', 
    'obj-173', 'obj-174', 'obj-175', 'obj-176', 
    'obj-208', 'obj-209', 'obj-206', 'obj-205', 'obj-204', 'obj-203', 
    'obj-408', 'obj-409', 'obj-410', 'obj-411', 
    'obj-301'
]

for b in data['patcher']['boxes']:
    box = b['box']
    id_ = box.get('id', '')
    
    if id_ in ui_ids_to_delete:
        boxes_to_delete.append(id_)
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
