import json

with open('P1Sound.maxpat', 'r') as f:
    data = json.load(f)

for b in data['patcher']['boxes']:
    if b['box'].get('id') == 'obj-1':
        print(f"obj-1 in P1Sound text: {b['box'].get('text')}")

