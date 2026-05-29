import json

with open('FreqTester_LR_MOD_laser.maxpat', 'r') as f:
    data = json.load(f)

boxes_to_keep = []
boxes_to_delete = []

ui_ids_to_delete = [
    'obj-106', 'obj-107', 'obj-218', 'obj-219', 'obj-217', 'obj-215', 'obj-212', 
    'obj-421', 'obj-422', 'obj-419', 'obj-209', 'obj-208', 'obj-206', 'obj-205', 'obj-204', 'obj-203',
    'obj-321', 'obj-322', 'obj-329', 'obj-330', 'obj-337', 'obj-338', 'obj-359', 'obj-360', 'obj-367', 'obj-368', 'obj-375', 'obj-376',
    'obj-327', 'obj-328', 'obj-335', 'obj-336', 'obj-343', 'obj-344', 'obj-365', 'obj-366', 'obj-373', 'obj-374', 'obj-381', 'obj-382',
    'obj-306', 'obj-307', 'obj-313', 'obj-314', 'obj-316', 'obj-318', 'obj-349', 'obj-350', 'obj-403', 'obj-404', 'obj-406', 'obj-407',
    'obj-242', 'obj-245', 'obj-239'
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
