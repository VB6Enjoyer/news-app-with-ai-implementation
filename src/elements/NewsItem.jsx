// TODO Comment this code before I forget what all of this does!
"use client"

import { useState, useRef, useLayoutEffect } from "react"
import { createPortal } from "react-dom"
import "./NewsItem.css"

const NewsItem = ({ newsItem, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [aiComment, setAiComment] = useState("");
    const [isGeneratingComment, setIsGeneratingComment] = useState(false);
    const boxRef = useRef(null);
    const popupRef = useRef(null);

    const handleMouseEnter = () => {
        setIsHovered(true)
        generateAIComment();
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
    }

    const handleMouseMove = (e) => {
        // Get the actual position of the box in the viewport

        const { clientX, clientY } = e
        const { innerWidth, innerHeight } = window

        // Calculate popup dimensions (only when visible)
        let popupWidth = 200 // Default estimate
        let popupHeight = 100 // Default estimate

        if (isHovered && popupRef.current) {
            const popupRect = popupRef.current.getBoundingClientRect()
            popupWidth = popupRect.width
            popupHeight = popupRect.height
        }

        const offset = 15

        // Start with default position
        let x = clientX + offset
        let y = clientY + offset

        // Adjust position if too close to the right edge
        if (x + popupWidth > innerWidth) {
            x = clientX - popupWidth - offset
        }

        // Adjust position if too close to the bottom edge
        if (y + popupHeight > innerHeight) {
            y = clientY - popupHeight - offset
        }

        setPopupPosition({ x, y })
    }

    const getBorderColor = (numComments) => {
        if (numComments > 1000) return '#ff4c4c';
        if (numComments > 500) return '#ffa500';
        if (numComments > 150) return '#ffd700'
        return '#353535';
    };

    const generateAIComment = async () => {
        setIsGeneratingComment(true)
        try {
            // Replace with your HuggingFace API key and model
            const API_KEY = import.meta.env.VITE_HUGGINGFACE_API_TOKEN
            const API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest"

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: `${newsItem.title}`
                })
            })

            const data = await response.json();

            if (data && data[0][0] && data[0][1] && data[0][2]) {
                setAiComment(data.map(arr => arr.sort((a, b) => a.label.localeCompare(b.label))));
            } else {
                setAiComment("AI comment not available.")
            }
        } catch (error) {
            console.error("Error generating AI comment:", error)
            setAiComment("Error generating comment. Please try again.")
        } finally {
            setIsGeneratingComment(false)
        }
    }

    useLayoutEffect(() => {
        const styleElement = document.createElement("style")
        document.head.appendChild(styleElement)

        const styleSheet = styleElement.sheet
        const rule = `.news-box:nth-child(${index + 1}) { 
            animation-delay: ${index * 0.1}s;
            opacity: 0;
            z-index: 1;
        }`

        styleSheet.insertRule(rule, styleSheet.cssRules.length)

        return () => {
            document.head.removeChild(styleElement)
        }
    }, [index])

    return (
        <span className="news-box" ref={boxRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseMove={handleMouseMove}
            style={{
                borderColor: getBorderColor(newsItem.num_comments),
            }}
        >
            <a href={newsItem.url}>{newsItem.title}</a>

            {isHovered &&
                createPortal(
                    <span
                        className="news-data"
                        ref={popupRef}
                        style={{
                            top: popupPosition.y,
                            left: popupPosition.x,
                        }}
                    >
                        {newsItem.num_comments > 1000 ? <p className="viral-news">VIRAL!</p> : ""}
                        <p>Author: {newsItem.author}</p>
                        <p>Date: {newsItem.created_at.split("T")[0]}</p>
                        <p>Comments: {newsItem.num_comments}</p>
                        <p>URL: {newsItem.url}</p>

                        <div className="ai-comment-section">
                            {isGeneratingComment && <p className="generating-comment">Generating sentiment...</p>}

                            {aiComment && (
                                <div className="ai-comment">
                                    <p>Positive: {(aiComment[0][2].score * 100).toFixed(2)}%</p>
                                    <p>Neutral: {(aiComment[0][1].score * 100).toFixed(2)}%</p>
                                    <p>Negative: {(aiComment[0][0].score * 100).toFixed(2)}%</p>
                                </div>
                            ) || <p></p>}
                        </div>
                    </span>,
                    document.body,
                )}
        </span>
    );
}

export default NewsItem;

