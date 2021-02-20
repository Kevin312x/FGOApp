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

html_links = urlopen('https://fategrandorder.fandom.com/wiki/Skill_Reinforcement_Items')
links_page = html_links.read()
html_links.close()

soup_html = soup(links_page, 'lxml')
categories = soup_html.findAll('div', {'class': 'tabbertab'})
for category in categories:
    items = category.findAll('h2')
    for item in items:
        item_name = item.span.string
        item_rarity = 'Bronze' if 'Shining' in item_name else 'Silver' if 'Magic' in item_name else 'Gold'
        item_image_container = item.find_next_sibling('table').tbody.tr.find_next_sibling('tr').td.find_next_sibling('td').img
        item_image = item_image_container.attrs['src'].replace('static', 'vignette', 1)
        if 'data:image' in item_image:
            item_image = item_image_container.attrs['data-src'].replace('static', 'vignette', 1)
        mat_data = {
            'Rarity': item_rarity,
            'Image': item_image,
            'Description': None
        }
        all_mat_info[item_name] = mat_data
        
html_links = urlopen('https://fategrandorder.fandom.com/wiki/Ascension_Items')
links_page = html_links.read()
html_links.close()

piece_categories = []
soup_html = soup(links_page, 'lxml')
piece_container = soup_html.find('div', {'class': 'tabbertab', 'title': 'Pieces'})
piece_categories.append(piece_container)
piece_categories.append(piece_container.find_next_sibling('div'))
piece_categories.append(soup_html.find('div', {'class': 'tabbertab', 'title': 'Event Servant'}))
for category in piece_categories:
    items = category.findAll('h2')
    for item in items:
        item_name = item.find('span', {'class': 'mw-headline'}).a.string
        item_rarity = 'Silver' if 'Piece' in item_name else 'Gold'
        item_image_container = item.find_next_sibling('table').tbody.tr.find_next_sibling('tr').td.find_next_sibling('td').img
        item_image = item_image_container.attrs['src'].replace('static', 'vignette', 1)
        if 'data:image' in item_image:
            item_image = item_image_container.attrs['data-src'].replace('static', 'vignette', 1)
        description_container = item.find_next_sibling('table').find('div', {'class': 'tabbertab', 'title': 'NA'})
        if description_container == None:
            description_container = item.find_next_sibling('table').find('div', {'class': 'tabbertab', 'title': 'TL'})
        if description_container != None:
            all_text = description_container.p.findAll(text=True, recursive=False)
            item_description = [text.strip() for text in all_text if len(text) > 1]
        else:
            item_description = None
        mat_data = {
            'Rarity'     : item_rarity,
            'Image'      : item_image,
            'Description': item_description
        }
        all_mat_info[item_name] = mat_data


html_links = urlopen('https://fategrandorder.fandom.com/wiki/QP')
links_page = html_links.read()
html_links.close()

soup_html = soup(links_page, 'lxml')
qp_content_container = soup_html.find('div', {'class': 'WikiaArticle', 'id': 'content'})
qp_img_container = qp_content_container.find('a').img
qp_img_src = qp_img_container.attrs['src'].replace('static', 'vignette', 1)
qp_descr = ''.join(qp_content_container.div.div.findChildren('p', recursive=False)[0].findAll(text=True)).strip()
mat_data = {
    'Rarity'     : 'None',
    'Image'      : qp_img_src,
    'Description': qp_descr
}
all_mat_info['QP'] = mat_data

# Puts all material information into a .json file
with open('material_details.json', 'w') as file:
    json.dump(all_mat_info, file, indent=4)