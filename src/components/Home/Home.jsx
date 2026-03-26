import React from 'react';
import Card from '../Card';
import { cardInfo } from '../../data';    // Adjust path if needed

export default function Home(){
    return (
        
          <section>
            <h1 className="text-xl font-bold text-white mb-5">Categories</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {
                cardInfo.map((card, index) => (
                  <Card
                  key = {index}
                  title={card.title}
                  subtitle={card.subtitle}
                  bgColor={card.bgColor}
                  desc={card.desc}
                />
                ))
              }

            </div>
          </section>
          )
}