from bs4 import BeautifulSoup as soup
from urllib.request import urlopen
from urllib.request import urlretrieve
import os.path
import json

html_source = urlopen('https://fategrandorder.fandom.com/wiki/Kama')
html_page = html_source.read()
html_source.close()

soup_html = soup(html_page, 'lxml')

if not os.path.isfile('../server/public/imgs/kama.png'):
    img_container = soup_html.find('div', {'id': 'pi-tab-3'}).figure.a.img.attrs['src']
    urlretrieve(img_container, '../server/public/imgs/kama.png')
else:
    print('hello world')