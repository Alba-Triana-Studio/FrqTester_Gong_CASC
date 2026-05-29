import json

with open('FreqTester_LR_MOD_laser.maxpat', 'r') as f:
    data = json.load(f)

for b in data['patcher']['boxes']:
    id_ = b['box'].get('id', '')
    if id_ == 'obj-pw1_slider':
        b['box']['presentation_rect'] = [49.66143, 625.0, 115.0, 25.0]
    elif id_ == 'obj-pw1_label':
        b['box']['presentation_rect'] = [49.66143, 600.0, 89.0, 22.0]

with open('FreqTester_LR_MOD_laser.maxpat', 'w') as f:
    json.dump(data, f, indent=4)
