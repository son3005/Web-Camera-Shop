import React, { lazy } from 'react';

import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            index: true,
            element: <Home />,
        },
        {
        path: 'products/:productId', // ví dụ: /products/canon-eos-r5
        // element: <ProductDetailPage />,
        element: <div>Đây là trang chi tiết sản phẩm</div>, // Placeholder
        }
    ]
};

export default MainRoutes;