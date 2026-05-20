import json, urllib.parse

data = """[{"slug":"new-york-luxury-loft","url":"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"},{"slug":"san-francisco-victorian","url":"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"},{"slug":"nashville-country-estate","url":"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"},{"slug":"miami-beach-penthouse","url":"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"},{"slug":"austin-lakeside-retreat","url":"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"},{"slug":"hollywood-hills-mansion","url":"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"},{"slug":"aspen-mountain-lodge","url":"https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80"},{"slug":"malibu-oceanfront-estate","url":"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80"},{"slug":"chicago-downtown-condo","url":"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"},{"slug":"dallas-contemporary","url":"https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"},{"slug":"seattle-waterfront-home","url":"https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"},{"slug":"hamptons-summer-house","url":"https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80"},{"slug":"sedona-desert-oasis","url":"https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80"},{"slug":"charleston-historic-home","url":"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80"},{"slug":"portland-modern-eco-home","url":"https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80"},{"slug":"denver-city-view-penthouse","url":"https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80"},{"slug":"boston-back-bay-brownstone","url":"https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"},{"slug":"palm-springs-mid-century","url":"https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80"},{"slug":"san-diego-beach-house","url":"https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80"},{"slug":"honolulu-ocean-view-villa","url":"https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}]"""
arr = json.loads(data)

ids = {}
for x in arr:
    url = x['url']
    photo_id = urllib.parse.urlparse(url).path.split('/')[-1]
    if photo_id in ids:
        ids[photo_id].append(x['slug'])
    else:
        ids[photo_id] = [x['slug']]

for k, v in ids.items():
    if len(v) > 1:
        print(f'Duplicate photo ID {k}: {v}')
