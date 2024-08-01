// eslint-disable-next-line
import React, { useState, useEffect} from 'react';
import classes from './Document.module.css';
import { getMetrics } from '../../http/metricAPI';
import Loading from '../Loading';
import '@react-pdf-viewer/core/lib/styles/index.css';
import Plot from 'react-plotly.js';

const interval_s = 30 // sec

function formatDate(date) {
  console.log(typeof date);
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

const Document = () => {
  const [metrics, setMetrics] = useState([])
  const fetchMetrics = async () => {
    try {
      const raw_data = await getMetrics()
      console.log(raw_data)
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
    // Первоначальная загрузка метрик
    fetchMetrics();

    // Установка интервала для обновления метрик каждые 30 секунд
    const interval = setInterval(fetchMetrics, interval_s * 1000);

    // Очистка интервала при размонтировании компонента
    return () => clearInterval(interval);
  }, []);

  return (
    <section id={classes.doc}>
      <h1>Дашборд ИТМО</h1>
      <div className={classes.main}>
      {
        metrics.length ? (
          metrics.map((metric) => (
            <div className={classes.metric_main}>
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
                  // mode: 'lines+markers',
                  // marker: {color: 'red'},
                },
                // {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
              ]}
              layout={ {width: 600, height: 350, title: metric.metric_name} }
            />
          </div>
          ))
        ) : (<Loading height='50vh' />)
        
      }
      </div>
    </section>
  )
}

export default Document;