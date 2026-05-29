import json

with open('FreqTester_LR_MOD_laser.maxpat', 'r') as f:
    data = json.load(f)

# The user explicitly wants to delete some more elements
boxes_to_keep = []
boxes_to_delete = []

ui_ids_to_delete = [
    'obj-106', 'obj-107', 'obj-218', 'obj-219', 'obj-217', 'obj-215', 'obj-212', 
    'obj-421', 'obj-422', 'obj-419', 'obj-209', 'obj-208', 'obj-206', 'obj-205', 'obj-204', 'obj-203',
    'obj-321', 'obj-322', 'obj-329', 'obj-330', 'obj-337', 'obj-338', 'obj-359', 'obj-360', 'obj-367', 'obj-368', 'obj-375', 'obj-376',
    'obj-327', 'obj-328', 'obj-335', 'obj-336', 'obj-343', 'obj-344', 'obj-365', 'obj-366', 'obj-373', 'obj-374'import json