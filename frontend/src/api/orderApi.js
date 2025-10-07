// --- DATABASE GIẢ (Trong bộ nhớ) ---
// [CẬP NHẬT] Đã thêm 20 đơn hàng mới để dữ liệu phong phú hơn
const initialData = [
  {
    id: "78912",
    customerName: "Nguyễn Văn An",
    orderDate: "18-09-2025",
    totalAmount: 10000000,
    status: "Delivered",
    phone: "0905123456",
    address: "123 Đường 3/2, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 1,
        name: "Canon EOS R5",
        sku: "P001-BLK",
        price: 3899,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?Text=R5",
      },
      {
        id: 2,
        name: "Lens Cap",
        sku: "A012",
        price: 159,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?Text=Cap",
      },
    ],
  },
  {
    id: "78913",
    customerName: "Trần Thị Bích",
    orderDate: "18-09-2025",
    totalAmount: 2499,
    status: "Shipped",
    phone: "0905123457",
    address: "456 Đường CMT8, Quận Bình Thủy, Cần Thơ",
    products: [
      {
        id: 3,
        name: "Sony A7 IV",
        sku: "P002-BLK",
        price: 2499,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/00FF00/FFFFFF?Text=A7IV",
      },
    ],
  },
  {
    id: "78914",
    customerName: "Lê Hoàng Cẩm",
    orderDate: "19-09-2025",
    totalAmount: 550,
    status: "Processing",
    phone: "0905123458",
    address: "789 Đường Nguyễn Văn Linh, Quận Cái Răng, Cần Thơ",
    products: [
      {
        id: 4,
        name: "Tripod",
        sku: "A005",
        price: 450,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/FFFF00/000000?Text=Tripod",
      },
      {
        id: 5,
        name: "Memory Card 128GB",
        sku: "A008",
        price: 100,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/00FFFF/000000?Text=Card",
      },
    ],
  },
  {
    id: "78915",
    customerName: "Phạm Dũng",
    orderDate: "20-09-2025",
    totalAmount: 1500,
    status: "Pending",
    phone: "0905123459",
    address: "101 Đường Trần Hưng Đạo, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 6,
        name: "Nikon Z6 II",
        sku: "P003-BLK",
        price: 1500,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/FF00FF/FFFFFF?Text=Z6II",
      },
    ],
  },
  {
    id: "78916",
    customerName: "Đặng Thị Em",
    orderDate: "21-09-2025",
    totalAmount: 89,
    status: "Cancelled",
    phone: "0905123460",
    address: "212 Đường 30/4, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 7,
        name: "Cleaning Kit",
        sku: "A010",
        price: 89,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/C0C0C0/000000?Text=Kit",
      },
    ],
  },
  // ---- 20 Dòng mới đã được thêm vào ----
  {
    id: "78917",
    customerName: "Nguyễn Thị Hoa",
    orderDate: "22-09-2025",
    totalAmount: 2999,
    status: "Delivered",
    phone: "0906000001",
    address: "321 Đường 3/2, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 8,
        name: "Sony A7 III",
        sku: "P006-BLK",
        price: 2999,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/FF00FF/FFFFFF?Text=A7III",
      },
    ],
  },
  {
    id: "78918",
    customerName: "Phạm Văn Tài",
    orderDate: "23-09-2025",
    totalAmount: 1599,
    status: "Shipped",
    phone: "0906000002",
    address: "654 Đường 30/4, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 9,
        name: "Panasonic Lumix S5",
        sku: "P007-BLK",
        price: 1599,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/00FFFF/000000?Text=S5",
      },
    ],
  },
  {
    id: "78919",
    customerName: "Lê Thị Mai",
    orderDate: "24-09-2025",
    totalAmount: 1899,
    status: "Processing",
    phone: "0906000003",
    address: "987 Đường Mậu Thân, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 10,
        name: "Olympus OM-D E-M1",
        sku: "P008-BLK",
        price: 1899,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/FFA500/FFFFFF?Text=OMD",
      },
    ],
  },
  {
    id: "78920",
    customerName: "Trần Văn Bình",
    orderDate: "25-09-2025",
    totalAmount: 999,
    status: "Pending",
    phone: "0906000004",
    address: "202 Đường Trần Hưng Đạo, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 11,
        name: "GoPro HERO9",
        sku: "P009-BLK",
        price: 999,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/008000/FFFFFF?Text=GoPro",
      },
    ],
  },
  {
    id: "78921",
    customerName: "Vũ Thị Hạnh",
    orderDate: "26-09-2025",
    totalAmount: 1299,
    status: "Cancelled",
    phone: "0906000005",
    address: "303 Đường Nguyễn Văn Cừ, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 12,
        name: "Canon EOS M50",
        sku: "P010-WHT",
        price: 1299,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/FFFFFF/000000?Text=M50",
      },
    ],
  },
  {
    id: "78922",
    customerName: "Nguyễn Văn Sơn",
    orderDate: "27-09-2025",
    totalAmount: 2099,
    status: "Delivered",
    phone: "0906000006",
    address: "404 Đường 3/2, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 13,
        name: "Nikon D750",
        sku: "P011-BLK",
        price: 2099,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?Text=D750",
      },
    ],
  },
  {
    id: "78923",
    customerName: "Trần Thị Lan",
    orderDate: "28-09-2025",
    totalAmount: 1799,
    status: "Shipped",
    phone: "0906000007",
    address: "505 Đường 30/4, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 14,
        name: "Sony RX100 VII",
        sku: "P012-BLK",
        price: 1799,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?Text=RX100",
      },
    ],
  },
  {
    id: "78924",
    customerName: "Lê Văn Phúc",
    orderDate: "29-09-2025",
    totalAmount: 1599,
    status: "Processing",
    phone: "0906000008",
    address: "606 Đường Mậu Thân, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 15,
        name: "Fujifilm X-S10",
        sku: "P013-BLK",
        price: 1599,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/00FF00/FFFFFF?Text=XS10",
      },
    ],
  },
  {
    id: "78925",
    customerName: "Phạm Thị Thu",
    orderDate: "30-09-2025",
    totalAmount: 899,
    status: "Pending",
    phone: "0906000009",
    address: "707 Đường Trần Hưng Đạo, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 16,
        name: "DJI Osmo Pocket",
        sku: "P014-BLK",
        price: 899,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/FFFF00/000000?Text=Osmo",
      },
    ],
  },
  {
    id: "78926",
    customerName: "Võ Văn Quang",
    orderDate: "01-10-2025",
    totalAmount: 1199,
    status: "Cancelled",
    phone: "0906000010",
    address: "808 Đường Nguyễn Văn Cừ, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 17,
        name: "Panasonic GH5",
        sku: "P015-BLK",
        price: 1199,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/000000/FFFFFF?Text=GH5",
      },
    ],
  },
  {
    id: "78927",
    customerName: "Nguyễn Thị Kim",
    orderDate: "02-10-2025",
    totalAmount: 1399,
    status: "Delivered",
    phone: "0906000011",
    address: "909 Đường 3/2, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 18,
        name: "Canon EOS 90D",
        sku: "P016-BLK",
        price: 1399,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/FF00FF/FFFFFF?Text=90D",
      },
    ],
  },
  {
    id: "78928",
    customerName: "Phạm Văn Hòa",
    orderDate: "03-10-2025",
    totalAmount: 1499,
    status: "Shipped",
    phone: "0906000012",
    address: "1010 Đường 30/4, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 19,
        name: "Sony ZV-1",
        sku: "P017-BLK",
        price: 1499,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/00FFFF/000000?Text=ZV1",
      },
    ],
  },
  {
    id: "78929",
    customerName: "Lê Thị Hương",
    orderDate: "04-10-2025",
    totalAmount: 1099,
    status: "Processing",
    phone: "0906000013",
    address: "1111 Đường Mậu Thân, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 20,
        name: "Olympus PEN-F",
        sku: "P018-BLK",
        price: 1099,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/FFA500/FFFFFF?Text=PENF",
      },
    ],
  },
  {
    id: "78930",
    customerName: "Trần Văn Lâm",
    orderDate: "05-10-2025",
    totalAmount: 799,
    status: "Pending",
    phone: "0906000014",
    address: "1212 Đường Trần Hưng Đạo, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 21,
        name: "GoPro HERO8",
        sku: "P019-BLK",
        price: 799,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/008000/FFFFFF?Text=GoPro8",
      },
    ],
  },
  {
    id: "78931",
    customerName: "Vũ Thị Ngọc",
    orderDate: "06-10-2025",
    totalAmount: 999,
    status: "Cancelled",
    phone: "0906000015",
    address: "1313 Đường Nguyễn Văn Cừ, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 22,
        name: "Canon EOS M6",
        sku: "P020-WHT",
        price: 999,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/FFFFFF/000000?Text=M6",
      },
    ],
  },
  {
    id: "78932",
    customerName: "Nguyễn Văn Phước",
    orderDate: "07-10-2025",
    totalAmount: 2199,
    status: "Delivered",
    phone: "0906000016",
    address: "1414 Đường 3/2, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 23,
        name: "Nikon D780",
        sku: "P021-BLK",
        price: 2199,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?Text=D780",
      },
    ],
  },
  {
    id: "78933",
    customerName: "Trần Thị Thanh",
    orderDate: "08-10-2025",
    totalAmount: 1899,
    status: "Shipped",
    phone: "0906000017",
    address: "1515 Đường 30/4, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 24,
        name: "Sony RX10 IV",
        sku: "P022-BLK",
        price: 1899,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?Text=RX10",
      },
    ],
  },
  {
    id: "78934",
    customerName: "Lê Văn Tùng",
    orderDate: "09-10-2025",
    totalAmount: 1699,
    status: "Processing",
    phone: "0906000018",
    address: "1616 Đường Mậu Thân, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 25,
        name: "Fujifilm X-E4",
        sku: "P023-BLK",
        price: 1699,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/00FF00/FFFFFF?Text=XE4",
      },
    ],
  },
  {
    id: "78935",
    customerName: "Phạm Thị Hồng",
    orderDate: "10-10-2025",
    totalAmount: 899,
    status: "Pending",
    phone: "0906000019",
    address: "1717 Đường Trần Hưng Đạo, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 26,
        name: "DJI Osmo Action",
        sku: "P024-BLK",
        price: 899,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/FFFF00/000000?Text=Action",
      },
    ],
  },
  {
    id: "78936",
    customerName: "Võ Văn Phát",
    orderDate: "11-10-2025",
    totalAmount: 1199,
    status: "Cancelled",
    phone: "0906000020",
    address: "1818 Đường Nguyễn Văn Cừ, Quận Ninh Kiều, Cần Thơ",
    products: [
      {
        id: 27,
        name: "Panasonic G9",
        sku: "P025-BLK",
        price: 1199,
        quantity: 1,
        imageUrl: "https://via.placeholder.com/150/000000/FFFFFF?Text=G9",
      },
    ],
  },
];

let ordersDB = JSON.parse(JSON.stringify(initialData));

// Helper function để chuyển chuỗi ngày 'dd-mm-yyyy' thành đối tượng Date
const parseDate = (dateString) => {
  const [day, month, year] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// Hàm giả lập API chính để lấy danh sách đơn hàng
export const getOrders = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // --- LOGIC LỌC ĐƠN HÀNG THEO THÁNG HIỆN TẠI CHO STATUS GRID ---
      const now = new Date();
      // Để phục vụ demo, ta sẽ giả sử "hôm nay" là ngày 24-09-2025
      // Khi dùng thực tế, bạn chỉ cần dùng: const now = new Date();
      const demoDate = new Date("2025-09-24T12:00:00");
      const currentYear = demoDate.getFullYear();
      const currentMonth = demoDate.getMonth(); // Tháng 9 là 8 (0-indexed)

      // Lọc ra các đơn hàng chỉ trong tháng và năm hiện tại
      const ordersThisMonth = ordersDB.filter((order) => {
        const orderDate = parseDate(order.orderDate);
        return (
          orderDate.getFullYear() === currentYear &&
          orderDate.getMonth() === currentMonth
        );
      });

      // Tính toán `statusCounts` dựa trên dữ liệu CỦA THÁNG NÀY
      const statusCounts = ordersThisMonth.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
      statusCounts.Total = ordersThisMonth.length; // Tổng đơn hàng trong tháng
      // --- KẾT THÚC LOGIC CHO STATUS GRID ---

      // --- LOGIC CHO BẢNG DỮ LIỆU (Hoạt động trên toàn bộ data) ---
      let processedData = [...ordersDB];

      // 1. Lọc và Sắp xếp dựa trên các tham số từ frontend
      if (params.q) {
        processedData = processedData.filter((item) =>
          item.id.toLowerCase().includes(params.q.toLowerCase())
        );
      }

      processedData = processedData.filter((item) => {
        if (
          params.statuses?.length > 0 &&
          !params.statuses.includes(item.status)
        )
          return false;
        const minPrice = parseFloat(params.priceRange.min);
        const maxPrice = parseFloat(params.priceRange.max);
        if (
          params.priceRange.min &&
          !isNaN(minPrice) &&
          item.totalAmount < minPrice
        )
          return false;
        if (
          params.priceRange.max &&
          !isNaN(maxPrice) &&
          item.totalAmount > maxPrice
        )
          return false;
        const startDate = params.dateRange.start
          ? new Date(params.dateRange.start)
          : null;
        const endDate = params.dateRange.end
          ? new Date(params.dateRange.end)
          : null;
        if (startDate || endDate) {
          startDate?.setHours(0, 0, 0, 0);
          endDate?.setHours(23, 59, 59, 999);
          const itemDate = parseDate(item.orderDate);
          if (startDate && itemDate < startDate) return false;
          if (endDate && itemDate > endDate) return false;
        }
        return true;
      });

      processedData.sort((a, b) => {
        if (params.dateSort !== "default") {
          const dateA = parseDate(a.orderDate);
          const dateB = parseDate(b.orderDate);
          const dateComparison =
            params.dateSort === "asc" ? dateA - dateB : dateB - dateA;
          if (dateComparison !== 0) return dateComparison;
        }
        if (params.priceSort !== "default") {
          return params.priceSort === "asc"
            ? a.totalAmount - b.totalAmount
            : b.totalAmount - a.totalAmount;
        }
        return 0;
      });

      const totalItems = processedData.length;
      // 2. Phân trang trên dữ liệu đã được lọc và sắp xếp
      const paginatedData = processedData.slice(
        (params.currentPage - 1) * params.itemsPerPage,
        params.currentPage * params.itemsPerPage
      );

      // Trả về kết quả cuối cùng
      resolve({
        data: paginatedData, // Dữ liệu cho bảng
        totalCount: totalItems, // Tổng số item cho phân trang của bảng
        statusCounts: statusCounts, // Dữ liệu cho StatusGrid (chỉ trong tháng)
      });
    }, 500);
  });
};

// Hàm giả lập API để cập nhật trạng thái đơn hàng
export const updateOrderStatus = ({ orderId, newStatus }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const orderIndex = ordersDB.findIndex((o) => o.id === orderId);
      if (orderIndex === -1) {
        return reject(new Error("Không tìm thấy đơn hàng"));
      }
      ordersDB[orderIndex].status = newStatus;
      resolve(ordersDB[orderIndex]);
    }, 300);
  });
};
