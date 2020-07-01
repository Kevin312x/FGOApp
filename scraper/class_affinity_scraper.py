from urllib.request import urlopen
from bs4 import BeautifulSoup as soup
import json

html_source = urlopen('https://fategrandorder.fandom.com/wiki/Servants')
html_page = html_source.read()
html_source.close()

soup_html = soup(html_page, 'lxml')
h2_title = soup_html.findAll('h2')

class_triangle = {}
for title in h2_title:
    try:
        if title.span.string.strip() == 'Servant Triangle':
            class_triangle_container = title.find_next_sibling('table')
            iter_row = class_triangle_container.tr.find_next_sibling('tr').find_next_sibling('tr')
            
            while iter_row != None:
                class_triangle_info = {}
                iter_col = iter_row.th

                class_name = iter_col.a.attrs['title']
                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Base Multiplier'] = iter_col.string.strip()
                
                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Shielder'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Saber'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Archer'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Lancer'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Rider'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Caster'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Assassin'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Berserker'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Ruler'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Avenger'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Moon Cancer'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Alter Ego'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Foreigner'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Beast I'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Beast II'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Beast III/R'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Beast III/L'] = iter_col.string.strip()

                iter_col = iter_col.find_next_sibling('td')
                class_triangle_info['Beast (False)'] = iter_col.string.strip()

                class_triangle[class_name] = class_triangle_info
                iter_row = iter_row.find_next_sibling('tr')
            break
    except:
        continue

with open('class_affinity.json', 'w') as file:
    json.dump(class_triangle, file, indent=4)