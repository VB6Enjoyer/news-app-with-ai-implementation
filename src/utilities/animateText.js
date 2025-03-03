// Promise that resolves after the specified delay in ms, used for the typing animation
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const animateText = async ({
    element, // Element from the DOM to aniamte text in
    text, // String to animate
    speed = 50, // Delay in ms between each letter typed
    randomness = 0.5, // Variation for the delay above
    callback = () => { } // Function to run after the animation (empty by default)
}) => {
    if (!element || !text) return; // If there's no element or no text specified, abort the function

    // Clear the element's text
    element.textContent = '';

    // Calculate base delay with randomness
    const getDelay = () => speed + (Math.random() * randomness * speed);

    try {
        // Animate each character
        for (let i = 0; i < text.length; i++) {
            await sleep(getDelay());
            element.textContent += text[i];
        }

        // Execute callback when animation completes
        callback();
    } catch (error) {
        console.error('Animation error:', error);
        element.textContent = text; // Fallback to instant text display if animation fails
    }
};

// Animates text in batches, used to animate all text in the news boxes at once
export const batchAnimateText = async ({
    elements,
    texts,
    speed = 50,
    randomness = 0.5,
    onComplete = () => { }
}) => {
    if (!elements?.length || !texts?.length) return;

    try {
        for (let i = 0; i < elements.length; i++) {
            if (texts[i]) {
                await animateText({
                    element: elements[i],
                    text: texts[i],
                    speed,
                    randomness
                });
            }
        }
        onComplete();
    } catch (error) {
        console.error('Batch animation error:', error);
        elements.forEach((el, i) => {
            if (el && texts[i]) el.textContent = texts[i]; // Fallback: display all texts instantly
        });
    }
};