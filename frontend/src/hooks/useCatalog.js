// // src/hooks/useCatalog.js
// import { useQuery } from "@tanstack/react-query";
// import { getProducts, getProductById } from "../api/productApi";

// // Chuẩn hóa 1 item về card-friendly (để không vỡ Card/Overlay cũ)
// export const toCardItem = (p) => {
//   if (!p) return null;
//   const image =
//     p.image ||
//     p.thumbnail ||
//     p.image_url ||
//     p.variants?.[0]?.image ||
//     `https://via.placeholder.com/400x300.png?text=${encodeURIComponent(
//       p.brand || p.category || "Camera"
//     )}`;

//   const price =
//     p.price ?? p.price_from ?? p.variants?.[0]?.selling_price ?? undefined;

//   return {
//     ...p,
//     image,
//     price,
//   };
// };

// // “Mới ra mắt”: tạm là trang đầu
// export const useNewProducts = (limit = 12) =>
//   useQuery({
//     queryKey: ["catalog", "new", limit],
//     queryFn: async () => {
//       const data = await getProducts({
//         page: 1,
//         limit,
//         searchTerm: "",
//         filters: {},
//       });
//       return (data.items || []).map(toCardItem);
//     },
//   });

// // “Nổi bật”: tạm sort theo tồn kho giảm dần
// export const useFeaturedProducts = (limit = 12) =>
//   useQuery({
//     queryKey: ["catalog", "featured", limit],
//     queryFn: async () => {
//       const data = await getProducts({
//         page: 1,
//         limit,
//         searchTerm: "",
//         filters: { sortBy: { stock: "desc" } },
//       });
//       return (data.items || []).map(toCardItem);
//     },
//   });

// // Danh sách có filter/sort/paging
// export const useCatalogList = ({ page, limit, brand, sortBy, searchTerm }) =>
//   useQuery({
//     queryKey: ["products", page, limit, brand, sortBy, searchTerm],
//     queryFn: async () => {
//       const filters = {
//         sortBy: { name: null, price: null, stock: null },
//         brands: [],
//         status: [],
//         stockStatus: [],
//         priceRange: { min: "", max: "" },
//       };

//       // brand ở UI = key (canon/sony/nikon/...)
//       if (brand && brand !== "all") filters.brands = [brand];

//       // map sort
//       if (sortBy === "priceLow") filters.sortBy.price = "asc";
//       if (sortBy === "priceHigh") filters.sortBy.price = "desc";
//       if (sortBy === "nameAZ") filters.sortBy.name = "asc";
//       if (sortBy === "nameZA") filters.sortBy.name = "desc";
//       if (sortBy === "stockHigh") filters.sortBy.stock = "desc";

//       const data = await getProducts({
//         page,
//         limit,
//         searchTerm: searchTerm || "",
//         filters,
//       });

//       return {
//         ...data,
//         items: (data.items || []).map(toCardItem),
//       };
//     },
//     keepPreviousData: true,
//   });

// // Chi tiết
// export const useProductDetail = (productId) =>
//   useQuery({
//     queryKey: ["product", productId],
//     queryFn: async () => {
//       const p = await getProductById(productId);
//       return toCardItem(p);
//     },
//     enabled: !!productId,
//   });
