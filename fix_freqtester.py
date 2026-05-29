import json

with open('FreqTester_LR_MOD_laser.maxpat', 'r') as f:
    data = json.load(f)

boxes_to_keep = []
boxes_to_delete = []

for b in data['patcher']['boxes']:
    box = b['box']
    text = box.get('text', '')
    id_ = box.get('id', '')
    
    should_delete = False
    
    for i in range(2, 9):
        for prefix in ['phase', 'PW', 'p', 'gpitch', 'solo', 'mute', 'vol', 'pitch', 'slidepitch', 'amp', 'mutem', 'solom', 'lvl', 'zero']:
            if f'{prefix}{i}' in text:
                should_delete = True
                
    if 'mixR' in text or 'mixout2' in text:
        should_delete = True
        
    if should_delete:
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
