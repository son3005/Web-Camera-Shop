// src/components/admin/inventory/ProductDetailModal.jsx
import React from 'react';
import { useChiTietSanPham } from '../../../hooks/use_san_pham';
import { Dialog } from '@headlessui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ProductDetailModal({ id, onClose }) {
  const { data, isLoading } = useChiTietSanPham(id);
  if (isLoading || !data) return null;

  const images = data.cac_bien_the.flatMap(bt =>
    bt.hinh_anhs.map(img => ({ url: img.url, alt: img.alt_text || '' }))
  );

  return (
    <Dialog open={!!id} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="bg-white rounded-lg max-w-4xl w-full p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-2xl font-bold">X</button>
          <h2 className="text-2xl font-bold mb-4">{data.ten_san_pham}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {images.length > 0 ? (
                <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} loop>
                  {images.map((img, i) => (
                    <SwiperSlide key={i}>
                      <img src={img.url} alt={img.alt} className="w-full h-96 object-contain" />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Không có ảnh</div>
              )}
            </div>
            <div>{/* Thông tin sản phẩm */}</div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}