import { useState, useEffect } from "react";

/**
 * Custom hook để trì hoãn (debounce) một giá trị.
 * Hữu ích để trì hoãn việc cập nhật, ví dụ: chờ người dùng nhập xong mới tìm kiếm.
 * @param {*} giaTri Giá trị cần debounce.
 * @param {number} doTre Thời gian trì hoãn (miligiây).
 * @returns {*} Giá trị đã được debounce.
 */
export function useDebounce(giaTri, doTre) {
  // State để lưu trữ giá trị đã debounce
  const [giaTriDebounced, setGiaTriDebounced] = useState(giaTri);

  useEffect(
    () => {
      // Thiết lập một timer để cập nhật giá trị debounce sau khoảng thời gian `doTre`
      const handler = setTimeout(() => {
        setGiaTriDebounced(giaTri);
      }, doTre);

      // Dọn dẹp timer nếu giá trị thay đổi (đặt lại thời gian trì hoãn)
      // hoặc nếu component unmount
      return () => {
        clearTimeout(handler);
      };
    },
    // Chạy lại effect chỉ khi giá trị hoặc độ trễ thay đổi
    [giaTri, doTre]
  );

  // Trả về giá trị đã debounce mới nhất
  return giaTriDebounced;
}

// Cách export khác (nếu bạn thích default export)
// export default useDebounce;
