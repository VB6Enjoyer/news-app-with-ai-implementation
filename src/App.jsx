import React, { useState, useEffect, useCallback } from 'react';
import './App.css'
import NewsItem from './elements/NewsItem';
import Translator from './elements/Translator';

const App = () => {
  const [news, setNews] = useState([]); // Stores the news fetched from the API
  const [search, setSearch] = useState(""); // User's search filter
  const [url, setUrl] = useState("http://hn.algolia.com/api/v1/search?query="); // API's url
  const [loading, setLoading] = useState(false); // Is the code fetching news from the API?
  const [useAI, setUseAI] = useState(true);

  // Fetch news from the API, uses useCallback() to prevent the function from being recreated on every render unless its dependencies (url) change
  const fetchNews = useCallback(async () => { // * This would be easier with Axios
    setLoading(true); // Currently fetching news, so "loading" is true

    fetch(`${url}`)
      .then(result => result.json()) // Once a response has been received, parses it into a json
      .then(data => (setNews(data.hits), setLoading(false))) // Extract the "hits" (news objects) from the response, no longer fetching news so "loading" is false
      .catch(error => console.error(error)); // If there was an error during the process, log it into the console
  }, [url])

  // Set the user's search filter based on the user's input
  const handleInputChange = (e) => {
    setSearch(e.target.value);
  }

  // Applies the user's search filter to the API's url to fetch more news
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the page from refreshing as per default
    setUrl(`http://hn.algolia.com/api/v1/search?query=${search}`);
  }

  // If the code is fetching news from the API, show a "Loading news..." message
  const showLoading = () => (
    <div id="loading-container">
      {
        loading ?
          <h2 id="loading-news">Loading news...</h2>
          : ""}
    </div>
  );

  // Inputs container including search form, AI on/off button and translator buttons
  const formContainer = () => (
    <div id="inputs-container"> {/* Container of all inputs and buttons */}
      <div id="form-container"> {/* Container for the search form and submit button */}
        <form id="search-form" onSubmit={handleSubmit}>
          <input type="text" id="search-news" placeholder="Search for a topic!" value={search || ""} onChange={handleInputChange}></input>
          <button id="search-news-button" type="submit">Search</button>
        </form>

        {/* Toggles useAI between true and false to determine whether AI sentiment analysis is on or off */}
        <button id="ai-button" onClick={() => setUseAI(prev => !prev)}>{useAI ? 'AI ✔️' : 'AI ❌'}</button>

      </div>
      <Translator /> {/* Includes all the translation buttons */}
    </div>
  );

  // Filter out news without a URL, then creates a NewsItem component for each news, passing a key, the news obj, the index and the useAI boolean as args
  const showNews = () => (
    <div id="news-container">
      {news.filter((n) => n.url || n.story_url).map((n, index) => <NewsItem key={n.objectID} newsItem={n} index={index} useAI={useAI} />)}
    </div>
  );

  // Fetch news each time the API's url is updated, so each time the user makes a new search
  useEffect(() => {
    fetchNews(); // This runs when fetchNews is changed as a new fetchNews is created upon a change in the url
  }, [fetchNews]);

  return (
    <main>
      <header>
        <h1 id="header">News App</h1>
        <h4 id="author">By <a href="https://github.com/VB6Enjoyer">VB6Enjoyer</a></h4>
      </header>
      {formContainer()}
      {showLoading()}
      {/* Shows news if there are any to show,  else return an 'error' message and... uh... image */}
      {news.length > 0 ? showNews() : loading ?
        <p></p>
        : <div id="no-news-container">
          <h1 id="no-news">No news articles could be found.</h1><br />
          <img id="boohoo" src="https://i.imgur.com/qkfsF6C.png" placeholder="Boohoo!" />
        </div>}
    </main >
  );
}

export default App;
