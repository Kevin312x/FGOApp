from bs4 import BeautifulSoup as soup
from urllib.request import urlopen
from time import sleep
import json

# Opens the url that contains all the links to each material
html_links = urlopen('https://fategrandorder.fandom.com/wiki/Category:Items')
links_page = html_links.read()
html_links.close()

mat_links = {}
all_mat_info = {}
soup_html = soup(links_page, 'lxml')
table_container = soup_html.findAll('table', {'class': 'wikitable'})
material_rarity = ''

try:
    for table in table_container:
        row_container = table.findAll('tr')
        for row in row_container:
            if row.th != None:
                material_rarity = row.th.a.string.split('/')[1]
                mat_links[material_rarity] = []
            elif row.td != None:
                mat_links[material_rarity].append('https://fategrandorder.fandom.com/' + row.td.a.attrs['href'])
except IndexError:
    pass
except Exception as e:
    print(e)

mat_links[material_rarity].pop()
all_rarity = list(mat_links.keys())

for rarity in all_rarity:
    for link in mat_links[rarity]:
        html_source = urlopen(link)
        html_page = html_source.read()
        html_source.close()

        soup_html = soup(html_page, 'lxml')
        mat_name = soup_html.find('h1', {'id': 'firstHeading'}).string.strip()
        table_container = soup_html.find('table', {'class': 'wikitable'})
        
        img_container = table_container.find('img')
        mat_image = img_container.attrs['src'].replace('static', 'vignette', 1)
        if 'data:image' in mat_image:
            mat_image = img_container.attrs['data-src'].replace('static', 'vignette', 1)
        description_container = soup_html.find('div', {'class': 'tabbertab', 'title': 'NA'})
        if description_container == None:
            description_container = soup_html.find('div', {'class': 'tabbertab', 'title': 'TL'})
        all_text = description_container.p.findAll(text=True, recursive=False)
        mat_description = [text.strip() for text in all_text if len(text) > 1]
        
        mat_data = {
            'Rarity': rarity,
            'Image': mat_image,
            'Description': mat_description
        }
        all_mat_info[mat_name] = mat_data

# Puts all material information into a .json file
with open('material_details.json', 'w') as file:
    json.dump(all_mat_info, file, indent=4)