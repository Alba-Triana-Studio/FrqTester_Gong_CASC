import json

with open('FreqTester_LR_MOD_laser.maxpat', 'r') as f:
    data = json.load(f)

boxes = data['patcher']['boxes']
for b in boxes:
    box = b['box']
    if 'presentation_rect' in box and box.get('presentation', 0) == 1:
        text = box.get('text', '')
        maxclass = box.get('maxclass', '')
        id_ = box.get('id', '')
        rect = box['presentation_rect']
        print(f"{id_} | {maxclass} | {text} | X:{rect[0]} Y:{rect[1]}")
