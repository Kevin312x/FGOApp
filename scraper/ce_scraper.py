from selenium import webdriver  
from selenium.common.exceptions import NoSuchElementException  
from selenium.webdriver.common.keys import Keys  
from bs4 import BeautifulSoup as soup
from urllib.request import urlopen
from time import sleep
import json

tabs = ['101 ~ 200', '201 ~ 300', '301 ~ 400', '401 ~ 500', '501 ~ 600', '601 ~ 700',
         '701 ~ 800', '801 ~ 900', '901 ~ 1000', '1001 ~ 1100', '1101 ~ 1200', '1201 ~ 1300']

browser = webdriver.Chrome(executable_path=r"/mnt/c/Users/Kevin Huynh/Documents/chromedriver.exe")
browser.get('https://fategrandorder.fandom.com/wiki/Craft_Essence_List/By_ID')

for tab in tabs:
    link = browser.find_element_by_link_text(tab)
    link.click()

html_source = browser.page_source
browser.quit()

soup_html = soup(html_source,'lxml')
ce_container = soup_html.find('article', {'class': 'WikiaMainContent'}).div.div.div.find_next_sibling('div').div.find_next_sibling('div')
ce_container_rows = ce_container.findAll('tr')

craft_essences = []
for rows in ce_container_rows:
    try:
        if rows.td != None:
            craft_essences.append(rows.td.find_next_sibling('td').a.attrs['href'])
    except:
        continue

all_ce_info = {}
for ce_link in craft_essences:
    ce_info = {}
    html_source = urlopen(ce_link)
    html_page = html_source.read()
    html_source.close()

    soup_html = soup(html_page, 'lxml')
    
    try:
        ce_info_container = soup_html.find('aside', {'class': 'portable-infobox pi-background pi-theme-wikia pi-layout-default'})
        ce_name = ce_info_container.h2.string.strip()
        print(ce_name)
        ce_id = ce_info_container.section.find('div', {'data-source': 'id'}).div.string.strip()
        ce_illustrator = ce_info_container.section.find('div', {'data-source': 'illustrator'}).div.string.strip()
        ce_atk = ce_info_container.section.find('div', {'data-source': 'atk'}).div.string.strip()
        ce_hp = ''.join(ce_info_container.section.find('div', {'data-source': 'hp'}).div.findAll(text=True))
        ce_rarity = ce_info_container.section.find('div', {'data-source': 'stars'}).div.string.strip()[0]
        ce_cost = ce_info_container.section.find('div', {'data-source': 'cost'}).div.string.strip()

        ce_img_container = soup_html.find('figure', {'class': 'pi-image'})
        ce_img = ce_img_container.a.img.attrs['src']

        h2_headers = soup_html.findAll('h2')
        for header in h2_headers:
            if header.span != None and header.span.string.strip() == 'Effect':
                ce_effect_container = header.find_next_sibling('div').table
                effect = [eff for eff in ce_effect_container.tr.find_next_sibling('tr').td.findAll(text=True) if len(eff) > 1]
                if len(ce_effect_container.findAll('tr')) > 2:
                    mlb_effect = [eff for eff in ce_effect_container.tr.find_next_sibling('tr').find_next_sibling('tr').find_next_sibling('tr').td.findAll(text=True) if len(eff) > 1]
                else:
                    mlb_effect = None
            elif header.span != None and header.span.string.strip() == 'Lore':
                ce_dialogue_container = [text for text in header.find_next_sibling().table.tr.find_next_sibling('tr').td.find_next_sibling('td').findAll(text=True) if len(text) > 1]
                dialogue = ' '.join(ce_dialogue_container[1:])
    except e as Exception:
        print(e)
        
    ce_hp = ce_hp.split('/')
    ce_atk = ce_atk.split('/')
    if len(ce_hp) == 1:
        ce_hp.append(ce_hp[0])
    if len(ce_atk) == 1:
        ce_atk.append(ce_atk[0])

    ce_info = {
        'ID': ce_id,
        'Illustrator': ce_illustrator,
        'Min ATK': ce_atk[0],
        'Max ATK': ce_atk[1],
        'Min HP': ce_hp[0],
        'Max HP': ce_hp[1],
        'Rarity': ce_rarity,
        'Cost': ce_cost,
        'Effect': effect,
        'MLB Effect': mlb_effect,
        'Dialogue': dialogue,
        'Image Path': ce_img
    }
    all_ce_info[ce_name] = ce_info
    sleep(.5)

with open('ce_details.json', 'w') as file:
    json.dump(all_ce_info, file, indent=4)