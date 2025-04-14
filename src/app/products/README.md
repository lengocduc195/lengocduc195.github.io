# Giải thích Trang Products (`src/app/products/page.tsx`)

File này định nghĩa giao diện người dùng (UI) cho trang "My Products" (route `/products`).

## Mục đích:

Trang này dùng để giới thiệu các sản phẩm, dịch vụ, hoặc dự án thương mại mà bạn đã tạo ra hoặc đang cung cấp.
Thông tin có thể bao gồm:

-   Tên sản phẩm/dịch vụ
-   Mô tả tính năng, lợi ích
-   Hình ảnh/video minh họa
-   Liên kết đến trang web/demo sản phẩm
-   Thông tin giá cả (nếu có)
-   Lời chứng thực từ khách hàng (testimonials)

## Cấu trúc:

-   Nằm trong thư mục `src/app/products/`.
-   File `page.tsx` export một React component (ví dụ: `ProductsPage`).
-   Sử dụng các thẻ HTML và lớp Tailwind CSS để trình bày thông tin sản phẩm một cách hấp dẫn.

## Tương tác với Layout:

Nội dung của component `ProductsPage` sẽ được render bên trong `RootLayout` (`src/app/layout.tsx`).

## Dữ liệu:

Thông tin sản phẩm có thể được nhúng trực tiếp hoặc đọc từ file JSON (`src/assets/data/products.json`). 