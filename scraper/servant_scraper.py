from selenium import webdriver  
from selenium.common.exceptions import NoSuchElementException  
from selenium.webdriver.common.keys import Keys  
from bs4 import BeautifulSoup as soup
from urllib.request import Request, urlretrieve, urlopen
import os.path
from time import sleep
import json

url = 'https://grandorder.wiki/Servant_Icons'
req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})

html_source = urlopen(req)
html_page = html_source.read()
html_source.close()

soup_html = soup(html_page, 'lxml')

body_container = soup_html.find('div', {'id': 'bodyContent', 'class': 'mw-body-content'})
icon_img_container = body_container.find('div', {'id': 'mw-content-text', 'class': 'mw-content-ltr'})
imgs = icon_img_container.findAll('img')
imgs.reverse()

icon_imgs = {}
for img in imgs:
    try:
        icon_imgs[int(img.attrs['src'][-7:-4])] = 'https://grandorder.wiki' + img.attrs['src']
    except Exception as e:
        print(e)

# Array containing all the urls that contains the urls to the servant profiles
tabs = ['101 ~ 200', '201 ~ 300']
servant_url = []
all_servant_info = {}

browser = webdriver.Chrome(executable_path=r"/mnt/c/Users/Kevin Huynh/Documents/chromedriver.exe")
browser.get('https://fategrandorder.fandom.com/wiki/Servant_List_by_ID')

for tab in tabs:
    link = browser.find_element_by_link_text(tab)
    link.click()
sleep(.5)
html_source = browser.page_source  
browser.quit()

# We extract all the <a> tags within a specific container
soup_html = soup(html_source,'lxml')  
container = soup_html.find('div', {'id':'tabber-430881ea4667c450017cd66f4cdb917b'})
servants = container.findAll('tr');

# For each <a> tag, check if it's an img. If so, continue.
# Else append the <href> to an array.
for servant in servants:
    try:
        servant_url.append('https://fategrandorder.fandom.com' + servant.td.a.attrs['href'])
    except:
        continue

# For each servant, extract necessary information for database
for url in servant_url:
    # Uses urllib because no information is dynamically
    html_source = urlopen(url)
    html_page = html_source.read()
    html_source.close()

    soup_html = soup(html_page, 'lxml')

    notice_container = soup_html.find('table', {'class': 'PageNotice'})
    if notice_container == None:
        servant_status = 'Permanent'
    else:
        servant_status = notice_container.tr.td.find_next_sibling('td').b.string.strip()

    servant_content = soup_html.find('article', {'class': 'WikiaMainContent'})

    profile_container = servant_content.find('div', {'class': 'ServantInfoWrapper'})
    servant_name = profile_container.find('p', {'class': 'ServantInfoName'}).b.string
    servant_class = profile_container.find('div', {'class': 'ServantInfoClass'}).a.attrs['title']
    servant_rarity = profile_container.find('div', {'class': 'ServantInfoStars'}).string
    profile_container_wrapper = profile_container.find('div', {'class': 'ServantInfoStatsWrapper'})
    print(servant_name)
    # The rows are not the actual rows of the table, but the rows that we're interested in
    first_row = profile_container_wrapper.table.tr.find_next_sibling('tr')

    # Many servants have alternative names, so we must check to skip over
    if first_row.td.span != None and first_row.td.span.attrs['title'] == 'Also Known As':
        first_row = first_row.find_next_sibling('tr')

    servant_id = first_row.td.b.next_sibling.strip()
    servant_cost = first_row.td.find_next_sibling('td').b.next_sibling.strip()

    second_row = first_row.find_next_sibling('tr')
    servant_atk = second_row.td.span.next_sibling.strip().split('/')
    servant_hp = second_row.td.find_next_sibling('td').span.next_sibling.strip().split('/')

    third_row = second_row.find_next_sibling('tr').find_next_sibling('tr')
    voice_actor = third_row.td.b.next_sibling.strip()
    illustrator = third_row.td.find_next_sibling('td').b.next_sibling.strip()

    fourth_row = third_row.find_next_sibling('tr')
    attribute = fourth_row.td.b.next_sibling.strip()

    fifth_row = fourth_row.find_next_sibling('tr')
    star_absorbtion = ''.join([text for text in fifth_row.td.findAll(text=True, recursive=False) if len(text) > 1]).replace('\n', '').strip()
    star_generation = ''.join([text for text in fifth_row.td.find_next_sibling('td').findAll(text=True, recursive=False) if len(text) > 1]).replace('\n', '').strip()

    sixth_row = fifth_row.find_next_sibling('tr')
    np_charge_atk = ''.join([text for text in sixth_row.td.findAll(text=True, recursive=False) if len(text) > 1]).replace('\n', '').strip()
    np_charge_def = ''.join([text for text in sixth_row.td.find_next_sibling('td').findAll(text=True, recursive=False) if len(text) > 1]).replace('\n', '').strip()

    seventh_row = sixth_row.find_next_sibling('tr')
    death_rate = ''.join([text for text in seventh_row.td.findAll(text=True, recursive=False) if len(text) > 1]).replace('\n', '').strip()
    alignment = seventh_row.td.find_next_sibling('td').b.next_sibling.strip()

    eigth_row = seventh_row.find_next_sibling('tr')
    gender = eigth_row.td.b.next_sibling.strip()

    ninth_row = eigth_row.find_next_sibling('tr')
    traits = [trait.replace('.', '') for trait in ninth_row.td.b.next_sibling.strip().split(', ')]

    for i in range(len(traits)):
        if traits[i] == 'Servants':
            traits[i] = 'Servant'
        elif traits[i] == 'Pseudo-Servants':
            traits[i] = 'Pseudo-Servant'

    tenth_row = ninth_row.find_next_sibling('tr')
    cards = tenth_row.th.div.img.attrs['alt'].replace('.png', '')

    # Each servants have three skills, but some may be upgraded
    skills = {}
    div_skill_titles = [{'title': 'First Skill'}, {'title': 'Second Skill'}, {'title': 'Third Skill'}]

    skill_number = 1.0
    # Iterates over each of the three skills
    for div_titles in div_skill_titles:
        try:
            skill_number_suffix = .0
            skill_div_container = servant_content.find('div', div_titles)

            # In case of whitespaces on html (Circe)
            if skill_div_container == None:
                div_titles = {'title': div_titles['title'] + ' '}
                skill_div_container = servant_content.find('div', div_titles)

            skill_container = skill_div_container.findAll('table', {'class': 'wikitable'})
            # For each skill (there can be multiple via upgrade),
            # find the skill information (name, rank, effect, skillups, cooldown)
            for skill in skill_container:
                if skill.tr.th != None:
                    continue

                skill_name = skill.td.find_next_sibling('td').a.string
                skill_rank = skill.td.find_next_sibling('td').a.next_sibling.strip()
                skill_effects = skill.tr.find_next_sibling('tr').findAll('td')

                for i in skill_effects:
                    effect = []
                    skill_ups = {}
                    
                    # Remove the whitespaces and new lines from the effect strings
                    for j in i.findAll(text=True):
                        effect.append(j.strip())
                    
                    skill_up_row = skill.tr.find_next_sibling('tr').find_next_sibling('tr').find_next_sibling('tr')
                    it = skill_up_row
                    # Iterate through each skill up row and puts it in a list
                    while it.th.string == None:
                        skill_ups[''.join(it.th.findAll(text=True)).strip()] = [ele.string.strip() for ele in it.findAll('td')]
                        it = it.find_next_sibling('tr')
                
                
                    # For each skill find the min and max cooldown
                    cooldown_row = it
                    max_cd = cooldown_row.td.string.strip()
                    min_cd = cooldown_row.td.find_next_sibling('td').find_next_sibling('td').string.strip()

                # Store all info on the three skills into a dict.
                skills[skill_name] = {'Rank': skill_rank, 'Effects': effect, 'Skill Number': skill_number + skill_number_suffix,
                                        'Skill Ups': skill_ups, 'Cooldown': min_cd + '-' + max_cd}
                skill_number_suffix += .1
            skill_number += 1
        except Exception as e:
            print(e)
            continue

    passive_skills = {}
    np_info = {}
    dialogue = {}
    stats = {}
    ascension_materials = {}
    skill_materials = {}
    bond_ce = None

    # Find all the headers (i.e. Skills, Noble Phantasm, Biography, etc.)
    header_iterator = soup_html.findAll('h2')

    # Loops through all the headers to search for specific ones
    # Once we've reached the header we want, we extract info from the table
    for header in header_iterator:
        if header.span != None and header.span.string != None:
            label = header.span.string.strip()
            if label == 'Passive Skills':
                passive_skill_container = header.find_next_sibling()
                if passive_skill_container.name == 'div':
                    try:
                        passive_skill_list = passive_skill_container.div.table.findAll('tr')
                    except:
                        continue
                else:
                    passive_skill_list = passive_skill_container.findAll('tr')

                # If ps contains a string inside <td>, then it contains the name and rank of passive skill
                # The row directly after consists of all the effects of the passive skill
                for ps in passive_skill_list:
                    try:
                        if ps.td.string != None and ps.td.string.strip().isnumeric():
                            ps_name = ps.td.find_next_sibling('td').find_next_sibling('td').a.string.strip()
                            ps_rank = ps.td.find_next_sibling('td').find_next_sibling('td').a.next_sibling.strip()
                        else:
                            all_effects = ps.findAll('td')
                            delimiter = '. '
                            for effect in all_effects:
                                # Finds all the effects of the passive skill
                                ps_effect = ' '.join(effect.findAll(text=True))
                                # Formatting
                                ps_effect = [' '.join(i.split()).replace(' .', '') for i in [(e + delimiter).strip() for e in ps_effect.split(delimiter) if e]]
                            passive_skills[ps_name] = {'Rank': ps_rank, 'Effect': ps_effect}
                    except:
                        continue

            # Retrieves necessary information about the noble phantasm
            elif 'Noble Phantasm' in label :
                np_container = header.find_next_sibling('div').div
                all_np_effects = {}
                all_np_oc_effects = {}
                while np_container != None and np_container.attrs['title'].strip().lower() != 'video' and 'NPC' not in np_container.attrs['title']:
                    try:
                        np_table = np_container.table
                        if np_table.caption == None:
                            np_table = np_table.find_next_sibling('table')
                        np_names = ': '.join([name for name in np_table.caption.findAll(text=True) if len(name) > 1])

                        np_first_row = np_table.tr
                        np_type = np_first_row.th.a.img.attrs['alt'].replace('.png', '')
                        np_second_row = np_first_row.find_next_sibling('tr')
                        np_rank = np_second_row.td.string.strip()
                        np_classification = ' '.join(np_second_row.td.find_next_sibling('td').findAll(text=True))

                        while np_second_row.th == None or np_second_row.th.string.strip() != 'Effect':
                            np_second_row = np_second_row.find_next_sibling('tr')

                        np_effect = [effect.strip() for effect in np_second_row.td.findAll(text=True) if len(effect) > 1]
                        np_third_row = np_second_row.find_next_sibling('tr').find_next_sibling('tr')

                        while np_third_row.th != None and np_third_row.th.find(text=True, recursive=False).strip() != 'Overcharge Effect':
                            np_modifier = [dm.string.strip() for dm in np_third_row.findAll('td')]
                            all_np_effects[np_third_row.th.find(text=True, recursive=False).strip()] = np_modifier
                            np_third_row = np_third_row.find_next_sibling('tr')

                        np_fourth_row = np_third_row
                        np_oc_effect = [ele for ele in [oc_effect.strip() for oc_effect in np_fourth_row.td.findAll(text=True)] if len(ele) > 1]

                        np_fifth_row = np_fourth_row.find_next_sibling('tr').find_next_sibling('tr')

                        while np_fifth_row != None and np_fifth_row.th.find(text=True, recursive=False).strip() != None:
                            np_oc = [oc.string.strip() for oc in np_fifth_row.findAll('td')]
                            all_np_oc_effects[np_fifth_row.th.find(text=True, recursive=False).strip()] = np_oc
                            np_fifth_row = np_fifth_row.find_next_sibling('tr')

                        np_container = np_container.find_next_sibling('div')

                    except Exception as e:
                        print(e)
                        np_container = np_container.find_next_sibling('div')
                        continue

                    np_info[np_names] = {'Rank': np_rank, 'Type': np_type, 'Effect': np_effect, 'Classification': np_classification, 
                                        'Modifiers': all_np_effects, 'OC Effect': np_oc_effect, 'OC': all_np_oc_effects}

            elif label == 'Bond Level':
                if servant_id != '1':
                    bond_ce_container = header.find_next_sibling('table')
                    bond_ce_iter = bond_ce_container.tr
                    while bond_ce_iter.th.string == None or bond_ce_iter.th.string.strip() != 'Bond 10 Reward':
                        bond_ce_iter = bond_ce_iter.find_next_sibling('tr')

                    all_text = [text.strip() for text in bond_ce_iter.td.find_next_sibling('td').findAll(text=True) if len(text) > 1]
                    bond_ce = all_text[0]

            elif label == 'Stats':
                stats_container = header.find_next_sibling('table')
                stats_data = stats_container.findAll('td')
                for stat in stats_data:
                    stats[stat.b.string.strip()[:-1]] = stat.b.next_sibling.strip()
            
            elif label == 'Biography':
                dialogue_container = header.find_next_sibling()

                if dialogue_container.name == 'div':
                    dialogue_container = dialogue_container.find('table')

                dialogue_rows = dialogue_container.findAll('tr')
                dialogue_rows.pop(0)
                try:
                    for row in dialogue_rows:
                        if row.th.string != None:
                            row_title = row.th.string.strip()
                            for elem in row.td.find_next_sibling('td').findAll('br'):
                                elem.append('\n')
                            row_dialogue = ''.join([text for text in row.td.find_next_sibling('td').findAll(text=True)])
                            dialogue[row_title] = row_dialogue
                except:
                    continue
            
            elif label == 'Ascension':
                ascension_mat_container = header.find_next_sibling('table')
                asc_mat_row = ascension_mat_container.tbody.tr.find_next_sibling('tr')

                for i in range(0, 4):
                    asc_mat_col = asc_mat_row.td.find_next_sibling('td')
                    materials = {}

                    for j in range(0, 5):
                        if asc_mat_col.find('a') == None:
                            asc_mat_col = asc_mat_col.find_next_sibling('td')
                            continue

                        if asc_mat_col.find('a') != None and asc_mat_col.div != None:
                            asc_item = asc_mat_col.find('a').attrs['title']

                            if asc_mat_col.div.find('div', {'class': 'InumNum'}, recursive=False).string == None:
                                asc_item_amt = 1
                            else:
                                asc_item_amt = asc_mat_col.div.find('div', {'class': 'InumNum'}, recursive=False).string.strip()

                            asc_mat_col = asc_mat_col.find_next_sibling('td')
                            materials[asc_item] = {'Amount': asc_item_amt}

                    ascension_materials['Ascension ' + str(i + 1)] = materials
                    asc_mat_row = asc_mat_row.find_next_sibling('tr')
            
            elif label == 'Skill Reinforcement':
                skill_mat_container = header.find_next_sibling('table')
                skill_mat_row = skill_mat_container.tbody.tr.find_next_sibling('tr')

                for i in range(0, 9):
                    skill_mat_col = skill_mat_row.td.find_next_sibling('td')
                    materials = {}

                    for j in range(0, 5):
                        if skill_mat_col.find('a') == None:
                            skill_mat_col = skill_mat_col.find_next_sibling('td')
                            continue

                        if skill_mat_col.find('a') != None and skill_mat_col.div != None:
                            skill_item = skill_mat_col.find('a').attrs['title'].replace('_', ' ')

                            if skill_mat_col.div.find('div', {'class': 'InumNum'}, recursive=False).string == None:
                                skill_item_amt = 1
                            else:
                                skill_item_amt = skill_mat_col.div.find('div', {'class': 'InumNum'}, recursive=False).string.strip()

                            skill_mat_col = skill_mat_col.find_next_sibling('td')
                            materials[skill_item] = {'Amount': skill_item_amt}

                    skill_materials['Skill ' + str(i + 1)] = materials
                    skill_mat_row = skill_mat_row.find_next_sibling('tr')

    img_container = soup_html.findAll('div', {'class': 'pi-image-collection-tab-content'})
    img_src = img_container[0].figure.a.img.attrs['src']
    for img in img_container:
        if img.figure.a.attrs['title'] == 'Stage 4' or img.figure.a.attrs['title'] == 'Stage4':
            img_src = img.figure.a.img.attrs['src'].replace('static', 'vignette', 1)
            break

    # Some enemy servants (i.e. Beast III/R) doesn't have min atk or hp
    if len(servant_atk) == 1:
        servant_atk.append(servant_atk[0])
        servant_atk[0] = None
    if len(servant_hp) == 1:
        servant_hp.append(servant_hp[0])
        servant_hp[0] = None

    # Object containing all the information about the servant
    try:
        servant_data = {
            'ID': int(servant_id),
            'Status': servant_status,
            'Gender': gender,
            'Class': servant_class,
            'Rarity': len(servant_rarity.split()),
            'Cost': int(servant_cost),
            'Stats': stats,
            'Min Atk': servant_atk[0],
            'Max Atk': servant_atk[1],
            'Min HP':  servant_hp[0],
            'Max HP':  servant_hp[1],
            'Star Absorbtion': star_absorbtion,
            'Star Generation': star_generation,
            'NP Charge Atk': np_charge_atk,
            'NP Charge Def': np_charge_def,
            'Death Rate': death_rate,
            'Attribute': attribute,
            'Alignment': alignment,
            'Traits': traits,
            'Cards': cards,
            'Skills': skills,
            'Skill Reinforcement': skill_materials,
            'Ascension Materials': ascension_materials,
            'Passives': passive_skills,
            'Noble Phantasm': np_info,
            'Voice Actor': voice_actor,
            'Illustrator': illustrator,
            'Bond CE': bond_ce,
            'Dialogues': dialogue,
            'Final Asc Path': img_src,
            'Icon Path': icon_imgs[int(servant_id)]
        }
        all_servant_info[servant_name] = servant_data
    except Exception as e:
        print(e)

    # Sleeps for 1 second after every request
    sleep(1)

# Puts all servant information into a .json file
with open('servant_details.json', 'w') as file:
    json.dump(all_servant_info, file, indent=4)
