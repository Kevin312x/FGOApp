from bs4 import BeautifulSoup as soup
from urllib.request import urlopen
from time import sleep
from collections import OrderedDict
import json

# Page containing links to all mystic codes
html_source = urlopen('https://fategrandorder.fandom.com/wiki/Mystic_Codes')
html_page = html_source.read()
html_source.close()

soup_html = soup(html_page, 'lxml')
h2_headers = soup_html.find('article', {'id': 'WikiaMainContent'}).findAll('h2')

# Extract all the links and store it into a list
mc_links = []
for header in h2_headers:
    try:
        mc_links.append('https://fategrandorder.fandom.com' + header.span.a.attrs['href'])
    except:
        continue

# For each url, extract necessary information about the mystic code
all_mc_info = {}
for link in mc_links:
    html_source = urlopen(link)
    html_page = html_source.read()
    html_source.close()

    # Name of the mystic code
    soup_html = soup(html_page, 'lxml')
    mc_name = soup_html.find('h1', {'class': 'page-header__title'}).string.strip()

    content_container = soup_html.find('div', {'id': 'mw-content-text'})
    skill_container = content_container.find('div', {'style': 'overflow: hidden;'}).div.findAll('div', recursive=False)

    # Skills of the mystic code
    skills = {}
    for skill in skill_container:
        first_row = skill.table.tr

        # If row states 'Available from the start', move to next row
        if first_row.th != None and first_row.th.string.strip() == 'Available from the start':
            first_row = first_row.find_next_sibling('tr')

        try:
            # Extracts name of the skill
            skill_name = first_row.td.find_next_sibling('td').a.string.strip()

            # Finds all of the skill's effects
            second_row = first_row.find_next_sibling('tr')
            skill_effect = ' '.join([effect.strip() for effect in second_row.td.findAll(text=True)])
            
            # Extracts the modifiers of the skills upon level up
            skillups = {}
            skillup_row_iter = second_row.find_next_sibling('tr').find_next_sibling('tr')

            # Skill ups stop when the row reaches the 'cooldown' section
            while skillup_row_iter.th.find(text=True).strip() != 'Cooldown':
                skillups[skillup_row_iter.th.noscript.next_sibling.strip()] = [ele.string.strip() for ele in skillup_row_iter.findAll('td')]
                skillup_row_iter = skillup_row_iter.find_next_sibling('tr')

            # Extracts the cooldown with unique values
            cooldown_row = skillup_row_iter
            cooldowns = list(OrderedDict.fromkeys([cd.string.strip() for cd in cooldown_row.findAll('td')]))
            
            # Store all skill info into a dict
            skills[skill_name] = {
                'Effect': skill_effect,
                'Skill Ups': skillups,
                'Cooldowns': cooldowns
            }

        except:
            continue

        # Store all skills into another dict
        all_mc_info[mc_name] = {
            'Skills': skills
        }

        sleep(.5)

# Writes into a .json file
with open('mc_details.json', 'w') as file:
    json.dump(all_mc_info, file, indent=4)