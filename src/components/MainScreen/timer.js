import React, { useState, useEffect } from 'react';

function Timer() {
    let interval = React.useRef();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
    }, []);

    useEffect(() => {
        return () => {
            clearInterval(interval);
        }
    }, [])

    return (
        <>
            {time.toLocaleTimeString()}
        </>
    );
}

export default Timer;
