import React, { useContext, useEffect, useState } from 'react'
import {ShopContext} from '../contexts/ShopContext';
import Title from './Title'
import ProducItem from './ProductItem'

const RelatedProducts = ({category, subCategory}) => {

  const {products} = useContext(ShopContext);

  const related = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.filter((item) => item.category === category && item.subCategory === subCategory).slice(0,5);
  }, [products, category, subCategory]);

  return (
    <div className='mt-24'>
      <div className="py-2 text-3xl text-center">
        <Title text1={'RELATED'} text2={'PRODUCTS'} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-2 gap-y-6">
        {
          related.map((item) => (
            <ProducItem key={item._id} name={item.name} types={item.types} id={item._id} images={item.images} />
          ))
        }

      </div>
      
    </div>
  )
}

export default RelatedProducts
