import json

with open('FreqTester_LR_MOD_laser.maxpat', 'r') as f:
    data = json.load(f)

boxes = data['patcher']['boxes']
print(f"Total boxes: {len(boxes)}")
for b in boxes:
    box = b['box']
    text = box.get('text', '')
    maxclass = box.get('maxclass', '')
    id_ = box.get('id', '')
    print(f"{id_} | {maxclass} | {text}")
