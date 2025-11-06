"use client" // "This should be rendered client-side"

import { useState, useRef, useLayoutEffect } from "react"
import { createPortal } from "react-dom"
import { formatDate } from "../utilities/formatRelativeTime"
import "./NewsItem.css"

const NewsItem = ({ newsItem, index, useAI }) => {
    const [isHovered, setIsHovered] = useState(false); // Checks whether a news item is hovered over
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 }); // Sets the position for the metadata popup
    const [aiComment, setAiComment] = useState(""); // Sets the AI's comment (sentiment analysis)
    const [isGeneratingComment, setIsGeneratingComment] = useState(false); // "Is the AI generating a comment currently?"
    const boxRef = useRef(null); // Track the news item container for positioning or animations
    const popupRef = useRef(null); // Control the popup/modal that shows news metadata

    // Sets "isHovered" to true once a mouse enters a news box, so that it may show the popup
    const handleMouseEnter = () => {
        setIsHovered(true);

        // If useAI (lifted up from the App component) is true, then generate an AI sentiment analysis
        if (useAI) {
            generateAIComment();
        }
    }

    // Sets "isHovered" to false once a mouse leaves a news box, so that the popup will disappear
    const handleMouseLeave = () => {
        setIsHovered(false);
    }

    // Moves the popup with the mouse
    const handleMouseMove = (e) => {
        const { clientX, clientY } = e; // Gets current mouse coordinates
        const { innerWidth, innerHeight } = window; // Gets the browser window dimensions

        // Calculate popup dimensions (only when visible) using default estimates in px
        let popupWidth = 200;
        let popupHeight = 100;

        // If the popup appeared, gets the actual dimensions and position of it relative to the viewport
        if (isHovered && popupRef.current) {
            const popupRect = popupRef.current.getBoundingClientRect();
            popupWidth = popupRect.width;
            popupHeight = popupRect.height;
        }

        const offset = 15; // Offset so that the mouse pointer doesn't overlap with the popup

        // Sets the default position of the popup + offset, appearing slightly to the bottom right of the pointer
        let x = clientX + offset;
        let y = clientY + offset;

        // Adjust position of the popup if too close to the right edge
        if (x + popupWidth > innerWidth) {
            x = clientX - popupWidth - offset;
        }

        // Adjust position of the popup if too close to the bottom edge
        if (y + popupHeight > innerHeight) {
            y = clientY - popupHeight - offset;
        }

        setPopupPosition({ x, y });
    }

    // Sets the border of the news boxes to different colors depending on their number of comments
    const getBorderColor = (numComments) => {
        if (numComments > 1000) return '#ff4c4c'; // Red, "viral"
        if (numComments > 500) return '#ffa500'; // Orange
        if (numComments > 150) return '#ffd700'; // Yellow
        return '#353535'; // Dark gray, default
    };

    // Uses HuggingFace Inference API to generate a sentiment analysis of the headline
    const generateAIComment = async () => {
        setIsGeneratingComment(true); // The analysis is being generated, so a "loading" text will be displayed

        try {
            const API_KEY = import.meta.env.VITE_HUGGINGFACE_API_TOKEN; // Environment variable for the API stored in .env.local in the root folder
            const API_URL = "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest";

            const response = await fetch(API_URL, { // * I really should use Axios
                method: "POST",
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: `${newsItem.title}`
                })
            })

            const data = await response.json(); // Wait for the response to be parsed into a json

            if (!data.error & data && data[0][0] && data[0][1] && data[0][2]) {
                setAiComment(data.map(arr => arr.sort((a, b) => a.label.localeCompare(b.label)))); // Maps the objects and sorts negatively alphabetically (Positive, Neutral, Negative)
            } else {
                console.log(data);
                console.log(data.error)
                console.log(data[0][0]);
                console.log(data[0][1]);
                console.log(data[0][2);
                setAiComment("AI comment not available."); // If the API returns an error (like running out of credits when you have a free token), set the comment to "Not available"
            }
        } catch (error) {
            console.error("Error generating AI comment:", error);
            setAiComment("Error generating comment. Please try again.");
        } finally {
            setIsGeneratingComment(false); // After it's all done, set generatingComment to false to remove the "loading" message
        }
    }

    // Create a new stylesheet to set a dynamic animation to make news boxes appear on screen
    useLayoutEffect(() => { // Runs synchronously after DOM mutations and completes before browser repaints, unlike useEffect()
        const styleElement = document.createElement("style");
        document.head.appendChild(styleElement);

        const styleSheet = styleElement.sheet;
        const rule = `.news-box:nth-child(${index + 1}) { 
            animation-delay: ${index * 0.1}s;
            opacity: 0;
            z-index: 1;
        }`; // Increase the animation delay for every child to make the animation smooth

        styleSheet.insertRule(rule, styleSheet.cssRules.length);

        return () => {
            document.head.removeChild(styleElement); // Remove the style element when the component unmounts to prevent memory leaks
        }
    }, [index]); // Only runs when index changes

    return (
        <span className="news-box" ref={boxRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseMove={handleMouseMove}
            style={{ borderColor: getBorderColor(newsItem.num_comments) }}>

            <a className="headline" href={newsItem.url || newsItem.story_url}>{newsItem.title || newsItem.story_title}</a>

            {/* If a news box is hovered over, render the popup into the body (not its parent) using createPortal() */}
            {isHovered &&
                createPortal(
                    <span className="news-data" ref={popupRef}
                        style={{
                            top: popupPosition.y,
                            left: popupPosition.x,
                        }}>

                        {/* Adds a "VIRAL!" message if the news has over 1000 comments*/}
                        {newsItem.num_comments > 1000 ? <p className="viral-news">VIRAL!</p> : ""}

                        <p>Author: {newsItem.author}</p>
                        <p>{formatDate(newsItem.created_at.split("T")[0])}</p> {/*Split at "T" to only show YYYY-MM-DD*/}
                        <p>Comments: {newsItem.num_comments || "Unknown"}</p>
                        <p>URL: {newsItem.url || newsItem.story_url}</p>

                        {/* If "useAI" is true, then also render the sentiment analysis (or an error message) */}
                        <div className="ai-comment-section">
                            {useAI ? (
                                <>
                                    {isGeneratingComment && (
                                        <p className="generating-comment">Generating sentiment...</p>
                                    )}

                                    {typeof aiComment !== "string" ? (
                                        <div className="ai-comment">
                                            <p className="positive-text">
                                                Positive: {(aiComment[0][2].score * 100).toFixed(2)}%
                                            </p>
                                            <p className="neutral-text">
                                                Neutral: {(aiComment[0][1].score * 100).toFixed(2)}%
                                            </p>
                                            <p className="negative-text">
                                                Negative: {(aiComment[0][0].score * 100).toFixed(2)}%
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="sentiment-not-available">
                                            AI sentiment analysis is not currently available.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="ai-disabled">AI sentiment analysis is disabled.</p>
                            )}
                        </div>
                    </span>,
                    document.body, // Determines which element the popup is rendered into
                )}
        </span>
    );
}

export default NewsItem;








