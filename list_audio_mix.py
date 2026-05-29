import json

with open('FreqTester_LR_MOD_laser.maxpat', 'r') as f:
    data = json.load(f)

for b in data['patcher']['boxes']:
    box = b['box']
    text = box.get('text', '')
    if '+~' in text or 'soundmachine' in text or 'dac~' in text or 'ezdac~' in text or 'send' in text or 'receive' in text or 's ' in text or 'r ' in text:
        # We can look at what mixes the signals
        pass

# Let's search for lines connected to the e