import axios from "axios";

// --- CÔNG TẮC CHUYỂN ĐỔI ---
const USE_MOCK_API = true;

// ===================================================================
// --- KHU VỰC API GIẢ LẬP (NÂNG CẤP VỚI BIẾN THỂ) ---
// ===================================================================

let mockProducts = Array.from({ length: 200 }, (_, i) => {
  const brands = ["Canon", "Sony", "Nikon", "Fujifilm", "Panasonic"];
  const brand = brands[i % 5];
  const modelNumber = Math.floor(Math.random() * 800) + 100;
  const productName = `${brand} XM-${modelNumber}`;

  const colors = ["Đen", "Bạc", "Trắng", "Xám Titan", "Đỏ"];
  const numVariants = Math.floor(Math.random() * 4) + 1;
  const variants = [];
  let totalQuantity = 0;
  let minPrice = Infinity;

  for (let j = 0; j < numVariants; j++) {
    const price = Math.floor(Math.random() * 2000) + 500;
    const quantity = Math.floor(Math.random() * 50);

    variants.push({
      id: `V${i + 1}-${j + 1}`,
      color: colors[j % colors.length],
      cost_price: price * 0.8,
      selling_price: price,
      sale_price: price * 0.9,
      stock: quantity,
      sku: `SKU-${String(i + 1).padStart(4, "0")}-${j + 1}`,
      image: `https://via.placeholder.com/150/000000/FFFFFF/?text=${brand}`,
    });

    totalQuantity += quantity;
    if (price < minPrice) {
      minPrice = price;
    }
  }

  return {
    id: `P${String(i + 1).padStart(4, "0")}`,
    name: productName,
    brand: brand.toLowerCase(),
    isActive: Math.random() > 0.2,
    description: `Mô tả chi tiết cho sản phẩm ${productName}. Đây là dòng máy ảnh chuyên nghiệp với nhiều tính năng vượt trội.`,
    category: "Máy ảnh Mirrorless",
    sku: `SKU-MASTER-${String(i + 1).padStart(4, "0")}`,
    weight: (Math.random() * 1.5 + 0.5).toFixed(2),
    dimensions: `${Math.floor(Math.random() * 10 + 10)} x ${Math.floor(
      Math.random() * 5 + 5
    )} x ${Math.floor(Math.random() * 5 + 8)} cm`,
    total_stock: totalQuantity,
    price_from: minPrice,
    variants: variants,
    specs: {
      lighting: {
        iso: `100 - ${Math.floor(Math.random() * 6 + 25) * 100}`,
        shutter_speed: `1/${Math.floor(Math.random() * 4 + 4) * 1000} giây`,
        metering: "Đa vùng, Trung tâm, Điểm",
        white_balance: "Tự động, Ánh sáng ban ngày, Mây",
        continuous_shooting_speed: `${Math.floor(Math.random() * 10 + 5)} fps`,
      },
      image: {
        sensor_format: "Full-Frame",
        resolution: `${Math.floor(Math.random() * 30 + 20)} MP`,
        image_size: `${Math.floor(Math.random() * 2000 + 6000)} x ${Math.floor(
          Math.random() * 1000 + 4000
        )}`,
        aspect_ratio: "3:2, 16:9",
        sensor_type: "CMOS",
        image_format: "JPEG, RAW",
        stabilization: "5 trục trong thân máy",
        lens_mount: `${brand.toUpperCase()} Mount`,
      },
      video: {
        encoding: "H.264, H.265",
        resolution: "4K UHD, Full HD",
        microphone: "Tích hợp Stereo",
        audio_format: "AAC, Linear PCM",
      },
      focus: {
        type: "Tự động và Thủ công",
        mode: "Liên tục, Đơn lẻ",
        points: `${Math.floor(Math.random() * 500 + 150)} điểm`,
      },
      viewfinder_monitor: {
        viewfinder_type: "Điện tử OLED",
        monitor_features: "Cảm ứng, Xoay lật",
        monitor_resolution: `${(Math.random() * 1 + 1).toFixed(2)} triệu điểm`,
        monitor_size: "3.0 inch",
        viewfinder_magnification: `0.${Math.floor(Math.random() * 10 + 70)}x`,
        viewfinder_coverage: "100%",
        viewfinder_size: "0.5 inch",
        viewfinder_resolution: `${(Math.random() * 1.5 + 2).toFixed(
          2
        )} triệu điểm`,
      },
      flash: {
        built_in_flash: "Không",
        flash_mode: "Tự động, On, Off, Slow Sync",
        sync_speed: `1/${Math.floor(Math.random() * 50 + 200)} giây`,
        hot_shoe: "Có",
        flash_compensation: "-3 to +3 EV",
        external_flash_sync: "Có",
      },
      connectivity: {
        gps: "Không",
        wireless: "Wi-Fi, Bluetooth",
        jacks: "USB-C, HDMI D, 3.5mm Mic/Headphone",
        card_slots: "2 x SD/SDHC/SDXC (UHS-II)",
      },
      other: {
        battery: `LP-E${Math.floor(Math.random() * 10 + 6)} Lithium-Ion`,
      },
    },
  };
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getProducts = async ({
  page = 1,
  limit = 10,
  searchTerm = "",
  filters = {},
}) => {
  if (USE_MOCK_API) {
    console.log(
      `MOCK: Lấy trang ${page}, giới hạn ${limit}, tìm kiếm "${searchTerm}"`,
      "Filters:",
      filters
    );
    await sleep(750);

    let filtered = [...mockProducts];

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.brands?.length > 0) {
      filtered = filtered.filter((p) => filters.brands.includes(p.brand));
    }

    if (filters.status?.length > 0) {
      filtered = filtered.filter((p) => {
        const productStatus = p.isActive ? "active" : "inactive";
        return filters.status.includes(productStatus);
      });
    }

    if (filters.priceRange?.min || filters.priceRange?.max) {
      const min = parseFloat(filters.priceRange.min) || 0;
      const max = parseFloat(filters.priceRange.max) || Infinity;
      filtered = filtered.filter(
        (p) => p.price_from >= min && p.price_from <= max
      );
    }

    const sortOrders = filters.sortBy || {};
    const sortKeys = Object.keys(sortOrders).filter((key) => sortOrders[key]);

    if (sortKeys.length > 0) {
      filtered.sort((a, b) => {
        for (const key of sortKeys) {
          const direction = sortOrders[key] === "asc" ? 1 : -1;
          let valA, valB;

          switch (key) {
            case "price":
              valA = a.price_from;
              valB = b.price_from;
              break;
            case "name":
              valA = a.name.toLowerCase();
              valB = b.name.toLowerCase();
              break;
            case "stock":
              valA = a.total_stock;
              valB = b.total_stock;
              break;
            default:
              continue;
          }

          if (valA < valB) return -1 * direction;
          if (valA > valB) return 1 * direction;
        }
        return 0;
      });
    }

    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
      currentPage: page,
    };
  }

  try {
    const response = await apiClient.get("/products", {
      params: { page, limit, search: searchTerm, ...filters },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
    throw new Error(
      error.response?.data?.message || "Không thể kết nối đến máy chủ"
    );
  }
};

export const getProductById = async (productId) => {
  if (USE_MOCK_API) {
    console.log(`MOCK: Lấy chi tiết sản phẩm ID: ${productId}`);
    await sleep(500);
    const product = mockProducts.find((p) => p.id === productId);
    return product || null;
  }

  try {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tìm thấy sản phẩm"
    );
  }
};

export const createProduct = async (productData) => {
  if (USE_MOCK_API) {
    console.log(" MOCK: Tạo sản phẩm mới...", productData);
    await sleep(500);
    const newProduct = {
      ...productData,
      id: `P${Date.now().toString().slice(-4)}`,
      total_stock: productData.variants.reduce(
        (acc, v) => acc + (parseInt(v.stock, 10) || 0),
        0
      ),
      price_from: Math.min(
        ...productData.variants.map((v) => v.selling_price || Infinity)
      ),
      specs: {},
    };
    mockProducts.unshift(newProduct);
    return newProduct;
  }
  try {
    const response = await apiClient.post("/products", productData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    throw new Error(error.response?.data?.message || "Không thể tạo sản phẩm");
  }
};

export const updateProduct = async ({ productId, productData }) => {
  if (USE_MOCK_API) {
    console.log(` MOCK: Cập nhật sản phẩm ID: ${productId}`, productData);
    await sleep(500);
    let updatedProduct = null;
    mockProducts = mockProducts.map((p) => {
      if (p.id === productId) {
        updatedProduct = {
          ...p,
          ...productData,
          total_stock: productData.variants.reduce(
            (acc, v) => acc + (parseInt(v.stock, 10) || 0),
            0
          ),
          price_from: Math.min(
            ...productData.variants.map((v) => v.selling_price || Infinity)
          ),
        };
        return updatedProduct;
      }
      return p;
    });
    return updatedProduct;
  }
  try {
    const response = await apiClient.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    throw new Error(
      error.response?.data?.message || "Không thể cập nhật sản phẩm"
    );
  }
};

export const deleteProduct = async (productId) => {
  if (USE_MOCK_API) {
    console.log(` MOCK: Xóa sản phẩm ID: ${productId}`);
    await sleep(500);
    mockProducts = mockProducts.filter((p) => p.id !== productId);
    return { message: `Sản phẩm ${productId} đã được xóa.` };
  }
  try {
    const response = await apiClient.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    throw new Error(error.response?.data?.message || "Không thể xóa sản phẩm");
  }
};
