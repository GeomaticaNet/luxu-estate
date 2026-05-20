import json, urllib.request, random

data = """[{"id":"7646a61a-b1de-4e1a-9804-010f1a53278a","slug":"miami-beach-penthouse","url":"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"67cf0581-5972-4c36-8705-29437e818cc3","slug":"austin-lakeside-retreat","url":"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"4ad446bb-c470-47fd-bc43-5f63b1100184","slug":"new-york-luxury-loft","url":"https://images.unsplash.com/photo-1600607687644-aac4c15cecb1?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"f6ac0731-9a7e-4922-bb8b-2fb56e23372b","slug":"hollywood-hills-mansion","url":"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"60ba0463-eb6a-41b3-ab81-5a0ff91765ad","slug":"aspen-mountain-lodge","url":"https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"f49398bc-2c6f-4894-8ffc-ab862923a68b","slug":"malibu-oceanfront-estate","url":"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"292cf054-0a34-44c3-991c-21f00d2b8749","slug":"chicago-downtown-condo","url":"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"6e46d96c-2d30-466a-bd53-cd11690e1de6","slug":"san-diego-beach-house","url":"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000","is_main":false},{"id":"30d22bc9-0b6c-4984-9025-09e01013bae4","slug":"seattle-waterfront-home","url":"https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"d57d048f-3a88-4a29-85e1-d186a81fbb05","slug":"san-francisco-victorian","url":"https://images.unsplash.com/photo-1502672260266-1c1de2d93688?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"fd3495c9-ff2a-4f06-9dca-71cf3e839458","slug":"hamptons-summer-house","url":"https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"c6fe5344-2b4f-48eb-baa6-5ea5ec053207","slug":"sedona-desert-oasis","url":"https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"1d5e9fe6-ee4c-44ce-8acc-e3b396f2c886","slug":"charleston-historic-home","url":"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"3a18cd38-ff48-41b2-98a3-1a257e821200","slug":"portland-modern-eco-home","url":"https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"7ef3a28b-2ccb-42ee-8904-854ded8e4dd1","slug":"denver-city-view-penthouse","url":"https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"b90983bf-1bd4-445b-9fd3-24e39393de06","slug":"boston-back-bay-brownstone","url":"https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"cf6e84a0-60b7-49ca-8fc0-b8bdcab79577","slug":"palm-springs-mid-century","url":"https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"6f0c7e5c-3d7f-4eab-a3dc-4c2609279583","slug":"nashville-country-estate","url":"https://images.unsplash.com/photo-1501183638710-841bfd591740?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"51f0725d-634a-47b7-a42c-b456e95359c2","slug":"dallas-contemporary","url":"https://images.unsplash.com/photo-1505843513577-22bb7dc39e08?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"d68f6580-fd7c-469c-891c-6d744e1f3917","slug":"honolulu-ocean-view-villa","url":"https://images.unsplash.com/photo-1503899036067-c6b772b1573c?auto=format&fit=crop&w=1200&q=80","is_main":true},{"id":"6e46d96c-2d30-466a-bd53-cd11690e1de6","slug":"san-diego-beach-house","url":"https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80","is_main":true}]"""

props = json.loads(data)
prop_ids = list(set([p['id'] for p in props]))

FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585153490-76fb20a32601?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600573472559-4700b5220c81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585152915-d208bec867a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503899036067-c6b772b1573c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1505843513577-22bb7dc39e08?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512111468-477c8248162b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1501183638710-841bfd591740?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1430285561322-780f5f6b2158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1464146072230-91cfaafc40d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
]

# Quick filter to drop broken ones
broken_keywords = ["1600607687644", "1502672260266", "1501183638710", "1505843513577", "1503899036067"]
working = [u for u in FALLBACK_IMAGES if not any(b in u for b in broken_keywords)]

sql = "INSERT INTO property_images (property_id, url, is_main, sort_order) VALUES \n"
inserts = []
random.seed(42)

for pid in prop_ids:
    imgs = random.sample(working, 3)
    for idx, img in enumerate(imgs):
        inserts.append(f"('{pid}', '{img}', false, {idx + 1})")

sql += ",\n".join(inserts) + ";"

with open("insert_extras.sql", "w") as f:
    f.write(sql)
print("SQL file created with", len(inserts), "inserts")
