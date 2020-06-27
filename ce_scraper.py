from selenium import webdriver  
from selenium.common.exceptions import NoSuchElementException  
from selenium.webdriver.common.keys import Keys  
from bs4 import BeautifulSoup as soup
from urllib.request import urlopen

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
            craft_essences.append(rows.td.a.attrs['href'])
    except:
        continue

