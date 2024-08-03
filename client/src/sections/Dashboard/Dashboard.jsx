// eslint-disable-next-line
import React, { useState, useEffect} from 'react';
import classes from './Dashboard.module.css';
import { getMetrics } from '../../http/metricAPI';
import Loading from '../Loading';
import Plot from 'react-plotly.js';

const interval_s = 60 // sec

function formatID(v) {
  if (v === 'KABAN' || v === 'QBAYES') {
    return "<b>" + v + "</b>";
  }
  return v;
}

function formatStrOrArr(v) {
  if (typeof v === 'string') {
    return v;
  };
  return v.map((value, index) => `<p>${index + 1}. ${value}</p>`).join(" ");
}

function formatDate(date) {
  const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
  ];

  function getDaySuffix(day) {
      if (day >= 11 && day <= 13) {
          return 'th';
      }
      switch (day % 10) {
          case 1: return "st";
          case 2: return "nd";
          case 3: return "rd";
          default: return "th";
      }
  }

  
  const month = months[date.getMonth()];
  const day = date.getDate();
  const suffix = getDaySuffix(day);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${month} ${day}${suffix} ${hours}:${minutes}:${seconds}`;
}

const parseISODate = (isoString) => {
  return new Date(isoString);
};

const Table = ({table}) => {
  const rating_table = table.table
  const time = table.datetime
  return (<div className={classes.table}>
          <h2>Список подавших документы ({formatDate(time)})</h2>
          <table>
              <thead>
                  <tr>
                      <th> </th>
                      <th>ID</th>
                      <th>Общий скор</th>
                      <th>Только экзамен</th>
                      <th>Доп баллы (ИД)</th>
                      <th>Диплом</th>
                      <th>Оригинал диплома</th>
                      <th>Виды поступления</th>
                      <th>Максимальный приоритет на ИИ</th>
                  </tr>
              </thead>
              <tbody>
                  {rating_table.map((chel, index) => (
                      <tr key={index} color={(check.index >= 206) ? ('red') : ('green')}>
                          <td>{chel.index}</td>
                          <td dangerouslySetInnerHTML={{__html: formatID(chel.id)}}></td>
                          <td>{chel.max_score}</td>
                          <td>{chel.only_exam}</td>
                          <td>{chel.only_dop}</td>
                          <td>{chel.max_diplom}</td>
                          <td>{chel.orig_docs}</td>
                          <td dangerouslySetInnerHTML={{__html: formatStrOrArr(chel.postup_types)}}></td>
                          <td>{chel.max_prior}</td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>)
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState([])
  const fetchMetrics = async () => {
    try {
      const raw_data = await getMetrics()
      const data = raw_data.map(metric => ({
        ...metric,
        records: metric.records.map(record => ({
          ...record,
          datetime: parseISODate(record.datetime)
        }))
      }));
      setMetrics(data)
    } catch (error) {
      console.error('Ошибка при получении метрик:', error);
    }
  }
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, interval_s * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id={classes.doc}>
      <h1>Дашборд ИТМО</h1>
      <div className={classes.main}>
      {
        metrics.length ? (
          metrics.map((metric) => (
           !((metric.metric_name === 'Баллы') || (metric.metric_name === 'Место') || (metric.metric_name === 'table')) ?
            (<div className={classes.metric_main}>
              <div key={metric.metric_name} className={classes.metric_div}>
                <p className={classes.metric_name}><b>{metric.metric_name}</b></p>
                <p className={classes.metric_value}>{metric.records[metric.records.length - 1].value}</p>
                <p className={classes.metric_datetime}>{formatDate(metric.records[metric.records.length - 1].datetime)}</p>
              </div>
              <Plot
              data={[
                {
                  x: metric.records.map((record) => record.datetime),
                  y: metric.records.map((record) => record.value),
                  type: 'plot',
                },
              ]}
              layout={ {width: 600, height: 350, title: metric.metric_name} }
            />
          </div>) : (
            !(metric.metric_name === 'table') ? 
            (<div className={classes.metric_main}>
            <div key={metric.metric_name} className={classes.metric_div}>
              <p className={classes.metric_name}><b>{metric.metric_name}</b></p>
              <p className={classes.metric_value}>
                Kaban: {metric.records[metric.records.length - 1].value[0] + " | "}
                qBayes: {metric.records[metric.records.length - 1].value[1]}
              </p>
              <p className={classes.metric_datetime}>{formatDate(metric.records[metric.records.length - 1].datetime)}</p>
            </div>
            <Plot
            data={[
              {
                x: metric.records.map((record) => record.datetime),
                y: metric.records.map((record) => record.value[0]),
                type: 'plot',
                name: "Kaban"
              },
              {
                x: metric.records.map((record) => record.datetime),
                y: metric.records.map((record) => record.value[1]),
                type: 'plot',
                name: "qBayes"
              },
            ]}
            layout={ {width: 600, height: 350, title: metric.metric_name} }
          />
        </div>) : (
          <Table table={metric.records[0]} />
        )
          )
          ))
        ) : (<Loading height='50vh' />)
        
      }
      </div>
    </section>
  )
}

export default Dashboard;