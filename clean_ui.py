import json

with open('FreqTester_LR_MOD_laser.maxpat', 'r') as f:
    data = json.load(f)

for b in data['patcher']['boxes']:
    box = b['box']
    if 'presentation_rect' in box and box.get('presentation', 0) == 1:
        rect = box['presentation_rect']
        x = rect[0]
        y = rect[1]
        
        keep = False
        if x >= 1400 and y < 620:
            keep = True
        elif x < 350 and y < 620:
            keep = True
        elif box.get('id') == 'obj-418':
            keep = True # title
            
        if not keep:
            box['presentation'] = 0

with open('FreqTester_LR_MOD_laser.maxpat', 'w') as f:
    json.dump(data, f, indent=4)
