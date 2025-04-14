# Giải thích `src/app/layout.tsx` (Root Layout)

File `layout.tsx` trong thư mục gốc `src/app` định nghĩa **Root Layout** cho toàn bộ ứng dụng Next.js.

## Chức năng chính:

1.  **Định nghĩa cấu trúc HTML cơ bản:** Nó bao gồm các thẻ `<html>` và `<body>` bắt buộc, áp dụng cho mọi trang trong ứng dụng.
2.  **Thêm Metadata mặc định:** Cấu hình các thẻ `<meta>` và `<title>` mặc định cho SEO và chia sẻ.
3.  **Import CSS toàn cục:** Import file `globals.css` để áp dụng các kiểu CSS cơ bản và cấu hình Tailwind CSS cho toàn bộ ứng dụng.
4.  **Thêm UI chung:** Đây là nơi lý tưởng để đặt các thành phần UI xuất hiện trên mọi trang, ví dụ như thanh điều hướng (`Navbar`) và chân trang (`Footer`). Trong dự án này, `Navbar` được import từ `@/components/Navbar` và render bên trong thẻ `<body>`.
5.  **Render `children`:** Layout nhận một prop `children` đại diện cho nội dung của trang hoặc layout con sẽ được render bên trong nó.
6.  **Tải Font:** Sử dụng `next/font` để tối ưu hóa việc tải và sử dụng font chữ (Geist Sans và Geist Mono) trong toàn bộ ứng dụng.

## Tại sao cần Root Layout?

-   **Nhất quán:** Đảm bảo giao diện người dùng nhất quán trên tất cả các trang.
-   **Tái sử dụng:** Tránh lặp lại code cấu trúc HTML và các thành phần chung ở mỗi trang.
-   **Tổ chức:** Tách biệt rõ ràng giữa cấu trúc chung của ứng dụng và nội dung cụ thể của từng trang.

Bất kỳ layout nào được định nghĩa trong các thư mục con của `src/app` sẽ *lồng* bên trong Root Layout này. 