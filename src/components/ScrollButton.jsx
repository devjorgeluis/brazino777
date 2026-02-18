import { useState, useEffect } from 'react';

const ScrollButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 200) {
                setIsVisible(true);
            } 

            else if (currentScrollY < lastScrollY || currentScrollY <= 200) {
                setIsVisible(false);
            }
            
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return <>
        {isVisible && <div className="scroll-top-button scroll-top-button--show" onClick={scrollToTop}></div>}
    </>
}

export default ScrollButton;