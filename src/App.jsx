import React, { useState, useEffect } from 'react';
import './App.css'
import NewsItem from './elements/NewsItem';

const App = () => {
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState("");
  const [url, setUrl] = useState("http://hn.algolia.com/api/v1/search?query=");
  const [loading, setLoading] = useState(false);

  const fetchNews = () => { // This would be easier with Axios.
    setLoading(true);
    fetch(`${url}`)
      .then(result => result.json())
      .then(data => (setNews(data.hits), setLoading(false)))
      .catch(error => console.error(error));
  }

  const handleInputChange = (e) => {
    setSearch(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setUrl(`http://hn.algolia.com/api/v1/search?query=${search}`)
  }

  const showLoading = () => (
    <div id="loading-container">
      {
        loading ?
          <h2>Loading news...</h2>
          : ""}
    </div>
  );

  const searchForm = () => (
    <form id="search-form" onSubmit={handleSubmit}>
      <input type="text" id="search-news" placeholder="Search for a topic!" value={search || ""} onChange={handleInputChange}></input>
      <button type="submit">Search</button>
    </form>
  );

  const showNews = () => (
    news.filter((n) => n.url).map((n, index) => <NewsItem key={n.objectID} newsItem={n} index={index} />)
  );

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <main>
      <header>
        <h1 id="header">News App</h1>
        <h4 id="author">By VB6Enjoyer</h4>
      </header>
      {searchForm()}
      {showLoading()}
      <div id="news-container">
        {showNews()}
      </div>
    </main >
  )
}

export default App;
