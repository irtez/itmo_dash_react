import React from 'react'
import classes from './404.module.css'
import { Link } from 'react-router-dom'

const NotFound = () => {
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
  return (
    <section id={classes.NotFound}>
      <h1>Запрашиваемая страница не найдена.</h1>
      <section class={classes.errorcontainer}>
        <span>4</span>
        <span><span class={classes.screenreadertext}>0</span></span>
        <span>4</span>
      </section>
      <div class={classes.linkcontainer}>
        <Link onClick={handleScrollToTop} to='/' class={classes.morelink}>На главную страницу</Link>
      </div>
    </section>
  )
}

export default NotFound