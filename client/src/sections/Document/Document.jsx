// eslint-disable-next-line
import React, { useState, useEffect} from 'react';
import classes from './Document.module.css'
// import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMetrics } from '../../http/metricAPI';
// import { getSimilarDocs } from '../../http/searchAPI';
// import Loading from '../Loading';
// import { useContext } from 'react';
// import { AppContext } from '../../routes/AppContext';
// import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
// import Accordion from '@mui/material/Accordion';
// import AccordionSummary from '@mui/material/AccordionSummary';
// import AccordionDetails from '@mui/material/AccordionDetails';
// import Typography from '@mui/material/Typography';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import ToggleButton from '@mui/material/ToggleButton';
// import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
// import { getCollections, editCollection } from '../../http/collectionAPI'
// import InputLabel from '@mui/material/InputLabel';
// import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
// import Select from '@mui/material/Select';
// import Alert from '@mui/material/Alert';

const interval_s = 30 // sec

const Document = () => {
  const [metrics, setMetrics] = useState({})
  const fetchMetrics = async () => {
    try {
      const data = await getMetrics()
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
      <div className={classes.main}>
      {
      Object.entries(metrics).map(([key, value]) => (
          <div className={classes.metric_div}>
            {key}: {value}
          </div>
        ))
      }
      </div>
    </section>
  )
}

export default Document;