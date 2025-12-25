import React from 'react';
import Hero from '../components/Hero';
import LatestCollection from '../components/LatestCollection';
import BestSeller from '../components/BestSeller';
import Onsale from '../components/Onsale';
import OurPolicy from '../components/OurPolicy';
import NewsletterBox from '../components/NewsletterBox';

const Home = () => {
    return (
        <div>
            {/* <Hero /> */}
            <LatestCollection />
            <BestSeller />
            <Onsale />
            <OurPolicy />
            <NewsletterBox />
        </div>
    );
}

export default Home;