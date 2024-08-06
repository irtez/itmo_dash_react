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
        'score_only_exam': [],
        'score_dop': [],
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
            score_exam_only = score_info[1].find('span').text
            score_dop = score_info[0].find('span').text
            orig_doc = chel.findAll('div', class_='RatingPage_table__info__quwhV')[-1].findAll('p')[-1].find('span').text
            info[code]['id'].append(id_)
            info[code]['score_exam'].append(float(score_ex))
            info[code]['score_dop'].append(float(score_dop or '0'))
            info[code]['score_only_exam'].append(float(score_exam_only or '0'))
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
            only_exam=('score_only_exam', 'max'),
            only_dop=('score_dop', 'max'),
            max_diplom=('score_diplom', 'max'),
            orig_docs=('original_docs', lambda x: 'да' if 'да' in x.tolist() else 'нет'),
            postup_types=('postup_type', lambda x: x.iloc[0] if len(set(x)) == 1 else list(set(x))),
            max_prior=('prioritet', 'min')
        ) \
        .sort_values(['max_score', 'max_diplom'], ascending=False) \
        .reset_index(drop=True)
    return res_agg

async def write_metrics(collection, collection_table):
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
    bvi_docs = res_agg[(res_agg.max_score >= 100) & (res_agg.orig_docs == 'да')]
    metrics['7. Место'] = (res_agg[res_agg.id.isin(CONFIG['our_ids'])].index + 1).tolist()
    metrics['8. Баллы'] = res_agg[res_agg.id.isin(CONFIG['our_ids'])].max_score.tolist()
    metrics['9. Все БВИ, подавшие доки'] = bvi_docs.shape[0]
    metrics['99. БВИ с приоритетом = 1, подавшие доки'] = bvi_docs[bvi_docs.max_prior == 1].shape[0]
    metrics['999. Диплом KABAN'] = 0 if res_agg[res_agg.id == CONFIG['our_ids'][0]].orig_docs.iloc[0] == 'нет' else 1
    metrics['999. Диплом QBAYES'] = 0 if res_agg[res_agg.id == CONFIG['our_ids'][1]].orig_docs.iloc[0] == 'нет' else 1

    my_id = res_agg[(res_agg.id == '19536506600')].index[0]
    dupl = res_agg.loc[my_id - 15 : my_id + 30].copy()
    dupl.loc[dupl.id == '19536506600', 'id'] = 'KABAN'
    dupl.loc[dupl.id == '14887345416', 'id'] = 'QBAYES'
    dupl['index'] = dupl.index + 1
    
    
    now = dt.datetime.now()#.strftime('%Y-%m-%d %H:%M:%S')
    metrics = [
        {
            'metric_name': k,
            'datetime': now,
            'value': v
        }
        for k, v in metrics.items()
    ]
    table_dict = {'table': dupl.to_dict(orient='records'), 'datetime': now}
    collection.insert_many(metrics)
    collection_table.replace_one({}, table_dict, upsert=True)
    return True

def get_day_suffix(day):
    if 11 <= day <= 13:
        return 'th'
    else:
        return {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
