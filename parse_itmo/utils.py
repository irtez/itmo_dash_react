import requests
import pandas as pd
from config import CONFIG
#from main import collection
from bs4 import BeautifulSoup as bs
import datetime as dt


async def fetch_itmo() -> pd.DataFrame:
    """
    Fetch ITMO
    """
    pages = {}
    links = CONFIG['links']
    for code, link in links.items():
        page = requests.get(link).text
        pages[code] = bs(page, 'lxml')
    
    info = {
        code: {
            'id': [],
            'score_exam': [],
            'score_diplom': [],
            'original_docs': [],
            'postup_type': [],
            'prioritet': []
        }
        for code in pages
    }
    for code, page in pages.items():
        for chel in page.findAll('div', class_='RatingPage_table__item__qMY0F'):
            id_ = chel.find('p', class_='RatingPage_table__position__uYWvi').find('span').text
            score_info = chel.findAll('div', class_='RatingPage_table__infoLeft__Y_9cA')[1].findAll('p')
            postup_info = chel.findAll('div', class_='RatingPage_table__infoLeft__Y_9cA')[0].findAll('p')
            prior = postup_info[0].find('span').text
            postup_type = postup_info[1].find('span').text
            score_ex = score_info[2].text.replace('Балл ВИ+ИД: ', '')
            score_diplom = score_info[3].text.replace('Средний балл: *', '')
            orig_doc = chel.findAll('div', class_='RatingPage_table__info__quwhV')[-1].findAll('p')[-1].find('span').text
            info[code]['id'].append(id_)
            info[code]['score_exam'].append(float(score_ex))
            info[code]['score_diplom'].append(float(score_diplom))
            info[code]['original_docs'].append(orig_doc)
            info[code]['postup_type'].append(postup_type)
            info[code]['prioritet'].append(int(prior))
    for code in info:
        info[code] = pd.DataFrame(info[code])
        info[code]['program'] = code
    result = pd.concat(info, axis=0, ignore_index=True)
    res_agg = result.groupby('id', as_index=False) \
        .agg(
            max_score=('score_exam', 'max'),
            max_diplom=('score_diplom', 'max'),
            orig_docs=('original_docs', lambda x: 'да' if 'да' in x.tolist() else 'нет'),
            postup_types=('postup_type', lambda x: x.iloc[0] if len(set(x)) == 1 else list(set(x))),
            max_prior=('prioritet', 'min')
        ) \
        .sort_values(['max_score', 'max_diplom'], ascending=False) \
        .reset_index(drop=True)
    return res_agg

async def write_metrics(collection):
    res_agg = await fetch_itmo()
    metrics = {}
    metrics['1. БВИ всего'] = res_agg[res_agg.max_score >= 100].shape[0]
    metrics['2. БВИ с приоритетом > 1'] = res_agg[(res_agg.max_score >= 100) & (res_agg.max_prior > 1)].shape[0]
    metrics['3. Сдают экзамен, 0 баллов'] = res_agg[
        (res_agg.max_score == 0) & (res_agg.postup_types.apply(str).str.contains('ВЭ'))
    ].shape[0]
    metrics['4. > 0 и < 100 баллов'] = res_agg[(res_agg.max_score < 100) & (res_agg.max_score > 0)].shape[0]
    metrics['5. Проходной балл (с учетом всех БВИ)'] = res_agg[(res_agg.max_score < 100) & (res_agg.max_score > 0)] \
            .max_score \
            .iloc[205 - metrics['1. БВИ всего'] - 1]
    metrics['6. Проходной балл (с учетом БВИ приоритет = 1)'] = res_agg[(res_agg.max_score < 100) & (res_agg.max_score > 0)] \
            .max_score \
            .iloc[205 - (metrics['1. БВИ всего'] - metrics['2. БВИ с приоритетом > 1']) - 1]
    metrics['7. Место'] = (res_agg[res_agg.id.isin(CONFIG['our_ids'])].index + 1).tolist()
    metrics['8. Баллы'] = res_agg[res_agg.id.isin(CONFIG['our_ids'])].max_score.tolist()
    now = dt.datetime.now()#.strftime('%Y-%m-%d %H:%M:%S')
    metrics = [
        {
            'metric_name': k,
            'datetime': now,
            'value': v
        }
        for k, v in metrics.items()
    ]
    collection.insert_many(metrics)
    return True

def get_day_suffix(day):
    if 11 <= day <= 13:
        return 'th'
    else:
        return {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
