from selenium import webdriver  
from selenium.common.exceptions import NoSuchElementException  
from selenium.webdriver.common.keys import Keys  
from bs4 import BeautifulSoup as soup
from urllib.request import urlopen

# Array containing all the urls that contains the urls to the servant profiles
websites = ['https://fategrandorder.fandom.com/wiki/Sub:Servant_List_by_ID/1-100', 'https://fategrandorder.fandom.com/wiki/Sub:Servant_List_by_ID/101-200', 'https://fategrandorder.fandom.com/wiki/Sub:Servant_List_by_ID/201-300']
servant_url = []
# For each url, we open the url using selenium (because some html code is loaded dynamically)
# Then get the page source
for url in websites:
    browser = webdriver.Chrome(executable_path=r"/mnt/c/Users/Kevin Huynh/Documents/chromedriver.exe")
    browser.get(url)  
    html_source = browser.page_source  
    browser.quit()

# We extract all the <a> tags within a specific container
soup_html = soup(html_source,'lxml')  
container = soup_html.find('table', {'class':'wikitable sortable jquery-tablesorter'})
servants = container.findAll('a');

# For each <a> tag, check if it's an img. If so, continue.
# Else append the <href> to an array.
for servant in servants:
    if 'class' in servant.attrs:
        continue
    else:
        servant_url.append('https://fategrandorder.fandom.com' + servant.attrs['href'])

# For each servant, extract necessary information for database
for url in servant_url:
    # Uses urllib because no information is dynamically
    html_source = urlopen(url)
    html_page = html_source.read()
    html_source.close()

    soup_html = soup(html_page, 'lxml')
    servant_content = soup_html.find('article', {'class': 'WikiaMainContent'})

    profile_container = servant_content.find('div', {'class': 'ServantInfoWrapper'})
    servant_name = profile_container.find('p', {'class': 'ServantInfoName'}).b.string
    servant_class = profile_container.find('div', {'class': 'ServantInfoClass'}).a.attrs['title']
    servant_rarity = profile_container.find('div', {'class': 'ServantInfoStars'}).string

    profile_container_wrapper = profile_container.find('div', {'class': 'ServantInfoStatsWrapper'})
    first_row = profile_container_wrapper.table.tr.find_next_sibling('tr')
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
    star_absorbtion = fifth_row.td.span.next_sibling.strip()
    star_generation = fifth_row.td.find_next_sibling('td').span.next_sibling.strip()

    sixth_row = fifth_row.find_next_sibling('tr')
    np_charge_atk = sixth_row.td.span.next_sibling.strip()
    np_charge_def = sixth_row.td.find_next_sibling('td').span.next_sibling.strip()

    seventh_row = sixth_row.find_next_sibling('tr')
    death_rate = seventh_row.td.span.next_sibling.strip()
    alignment = seventh_row.td.find_next_sibling('td').b.next_sibling.strip()

    eigth_row = seventh_row.find_next_sibling('tr')
    gender = eigth_row.td.b.next_sibling.strip()

    first_row = profile_container_wrapper.table.find_next_sibling('table').tr
    traits = first_row.td.b.next_sibling.strip().split(', ')

    second_row = first_row.find_next_sibling('tr')
    cards = second_row.th.noscript.img.attrs['alt']

    skills = {}
    div_skill_titles = [{'title': 'First Skill'}, {'title': 'Second Skill'}, {'title': 'Third Skill'}]

    # Iterates over each of the three skills
    for div_titles in div_skill_titles:
        try:
            skill_container = servant_content.find('div', div_titles).findAll('table', {'class': 'wikitable'})

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
                        effect.append(j.strip().replace('\n', ''))
                    
                    skill_up_row = skill.tr.find_next_sibling('tr').find_next_sibling('tr').find_next_sibling('tr')
                    it = skill_up_row
                    # Iterate through each skill up row and puts it in a list
                    while it.th.string == None:
                        skill_ups[it.noscript.next_sibling.strip()] = [ele.string.strip().replace('\n', '') for ele in it.findAll('td')]
                        it = it.find_next_sibling('tr')
                
                
                    # For each skill find the min and max cooldown
                    cooldown_row = it
                    max_cd = cooldown_row.td.string.strip()
                    min_cd = cooldown_row.td.find_next_sibling('td').find_next_sibling('td').string.strip()

                # Store all info on the three skills into a dict.
                skills[skill_name] = {'Rank': skill_rank, 'Effects': effect, 
                                        'Skill Ups': skill_ups, 'Cooldown': min_cd + '-' + max_cd}
        except:
            continue



    header_iterator = soup_html.findAll('h2')
    passive_skills = {}
    np_info = {}
    bond_ce = None
    for header in header_iterator:
        if header.span != None and header.span.string != None:
            label = header.span.string.strip()

            if label == 'Passive Skills':
                passive_skill_container = header.find_next_sibling()
                if passive_skill_container.name == 'div':
                    passive_skill_list = passive_skill_container.div.table.findAll('tr')
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
                                ps_effect = [' '.join(i.split()).replace('\n', '').replace(' .', '') for i in [(e + delimiter).strip() for e in ps_effect.split(delimiter) if e]]
                            passive_skills[ps_name] = {'Rank': ps_rank, 'Effect': ps_effect}
                    except:
                        continue

            elif label == 'Noble Phantasm':
                np_container = header.find_next_sibling('div').div

                while np_container != None and np_container.attrs['title'].strip() != 'Video':
                    try:
                        np_table = np_container.table
                        if np_table.caption == None:
                            np_table = np_table.find_next_sibling('table')
                        np_names = ': '.join([name for name in np_table.caption.findAll(text=True) if len(name) > 1])

                        np_first_row = np_table.tr.find_next_sibling('tr')
                        if np_first_row == None:
                            np_first_row = np_table.caption.find_next_sibling('tr').find_next_sibling('tr')
                        np_rank = np_first_row.td.find(text=True).strip()
                        np_type = np_first_row.td.find_next_sibling('td').find_next_sibling('td').string.strip()

                        np_second_row = np_first_row.find_next_sibling('tr')
                        np_effect = [effect.strip().replace('\n', '') for effect in np_second_row.td.findAll(text=True)]

                        np_third_row = np_second_row.find_next_sibling('tr').find_next_sibling('tr')
                        np_dmg_modifier = [dm.string.strip() for dm in np_third_row.findAll('td')]

                        np_fourth_row = np_third_row.find_next_sibling('tr')
                        np_oc_effect = [ele for ele in [oc_effect.strip().replace('\n', '') for oc_effect in np_fourth_row.td.findAll(text=True)] if len(ele) > 1]

                        np_fifth_row = np_fourth_row.find_next_sibling('tr').find_next_sibling('tr')
                        np_oc = [oc.string.strip().replace('\n', '') for oc in np_fifth_row.findAll('td')]

                        np_container = np_container.find_next_sibling('div')
                    except:
                        np_container = np_container.find_next_sibling('div')
                        continue

                np_info[np_names] = {'Rank': np_rank, 'Type': np_type, 'Effect': np_effect, 
                                    'Modifiers': np_dmg_modifier, 'OC Effect': np_oc_effect, 'OC': np_oc}

            elif label == 'Bond Level':
                if servant_id != '1':
                    bond_ce_container = header.find_next_sibling('table')
                    bond_ce_iter = bond_ce_container.tr
                    while bond_ce_iter.th.string == None or bond_ce_iter.th.string.strip() != 'Bond 10 Reward':
                        bond_ce_iter = bond_ce_iter.find_next_sibling('tr')

                    bond_ce = bond_ce_iter.td.find_next_sibling('td').b.a.string.strip()

    print(servant_name)
    print(servant_class)
    print(servant_rarity)
    print(servant_id)
    print(servant_cost)
    print(servant_atk[0], servant_atk[1])
    print(servant_hp[0], servant_hp[1])
    print(voice_actor)
    print(illustrator)
    print(attribute)
    print(star_absorbtion)
    print(star_generation)
    print(np_charge_atk)
    print(np_charge_def)
    print(death_rate)
    print(alignment)
    print(gender)
    print(traits)
    print(cards)
    print(skills)
    print(passive_skills)
    print(np_info)
    print(bond_ce)