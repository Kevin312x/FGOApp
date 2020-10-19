from bs4 import BeautifulSoup as soup
from urllib.request import urlopen
from time import sleep
import json

# Opens the url that contains all the links to each individual command codes
html_links = urlopen('https://fategrandorder.fandom.com/wiki/Command_Code_List/By_ID')
links_page = html_links.read()
html_links.close()

# Extracts the link to the command codes and stores it into an array
cc_links = []
soup_html = soup(links_page, 'lxml')
cc_link_container = soup_html.find('article', {'id': 'WikiaMainContent'}).find('table', {'class', 'wikitable sortable'})
container_rows = cc_link_container.findAll('tr')
container_rows.pop(0)

for rows in container_rows:
    link = rows.td.find_next_sibling('td').a.attrs['href']
    cc_links.append('https://fategrandorder.fandom.com' + link)

# Iterate through all the links and extracts necessary information
all_cc_info = {}
for links in cc_links:
    html_source = urlopen(links)
    html_page = html_source.read()
    html_source.close()

    # Extracts the name of the command code
    soup_html = soup(html_page, 'lxml')
    title = soup_html.find('h1').string.strip()
    rarity = len(soup_html.find('div', {'class': 'ServantInfoStars'}).string.strip().replace(' ', ''))
    print(title)

    # Extracts the ID and the Illustrator
    cc_container = soup_html.find('div', {'class': 'ServantInfoWrapper'}).div.find_next_sibling('div')
    stats_container = cc_container.table.findAll('tr', recursive=False)
    cc_id = stats_container[-1].td.b.next_sibling.strip()
    cc_illustrator = stats_container[-1].td.find_next_sibling('td').b.next_sibling.strip()

    # Extracts the img src
    img_container = cc_container.div.aside.figure.a.img
    img_src = img_container.attrs['src']
    
    # Extracts the effect
    effect_wrapper = cc_container.div.find_next_sibling('div').find_next_sibling('div')
    effect = ' '.join([i.strip() for i in effect_wrapper.table.tr.find_next_sibling('tr').findAll(text=True) if len(i) > 1])
    
    # Extracts the description (translated) by iterating over all the h2 headers
    h2_titles = soup_html.findAll('h2')
    for titles in h2_titles:
        if titles.span != None and titles.span.string.strip() == 'Lore':
            lore_container = titles.find_next_sibling('div').table.tr.find_next_sibling('tr')
            lore = ' '.join([i.strip() for i in lore_container.td.find_next_sibling('td').findAll(text=True) if len(i) > 1])
            break

    # Stores all extracted information into a dict
    cc_info = {
        'ID': cc_id,
        'Rarity': rarity,
        'Illustrator': cc_illustrator,
        'Effect': effect,
        'Description': lore,
        'Image Path': img_src
    }
    all_cc_info[title] = cc_info
    sleep(.3)

# Inserts all extracted information into a json file
with open('cc_details.json', 'w') as file:
    json.dump(all_cc_info, file, indent=4)