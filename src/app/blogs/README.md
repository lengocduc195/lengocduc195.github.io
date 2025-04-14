# Giải thích Trang Blogs (`src/app/blogs/page.tsx`)

File này định nghĩa giao diện người dùng (UI) cho trang "My Blogs" (route `/blogs`).

## Mục đích:

Hiển thị danh sách các bài viết blog của bạn. Thường bao gồm:

-   Tiêu đề bài viết
-   Ngày đăng
-   Tóm tắt ngắn (excerpt)
-   Liên kết để đọc bài viết đầy đủ (có thể dẫn đến trang chi tiết blog hoặc nền tảng blog khác).

## Cấu trúc:

-   Nằm trong thư mục `src/app/blogs/`.
-   File `page.tsx` export một React component (ví dụ: `BlogsPage`).
-   Sử dụng các thẻ HTML và lớp Tailwind CSS để trình bày danh sách bài viết.

## Tương tác với Layout:

Nội dung của component `BlogsPage` sẽ được render bên trong `RootLayout` (`src/app/layout.tsx`).

## Dữ liệu và Nội dung Blog:

Có nhiều cách để quản lý nội dung blog:

1.  **Dữ liệu tĩnh (JSON/Markdown):** Lưu trữ thông tin metadata (tiêu đề, ngày, tóm tắt, slug) trong file JSON (`src/assets/data/blogs.json`) và nội dung chi tiết trong các file Markdown riêng biệt. Trang `/blogs` sẽ đọc JSON để liệt kê, và có thể tạo các trang động (`/blogs/[slug]`) để hiển thị nội dung Markdown.
2.  **Headless CMS:** Sử dụng một hệ quản trị nội dung (CMS) không đầu (như Strapi, Contentful, Sanity) để quản lý bài viết. Trang Next.js sẽ gọi API của CMS để lấy dữ liệu.
3.  **Nền tảng Blog khác:** Chỉ đơn giản liệt kê tiêu đề và liên kết đến các bài viết trên các nền tảng như Medium, Dev.to, ...

Hiện tại, trang này chỉ là placeholder. Việc triển khai cụ thể phụ thuộc vào cách bạn muốn quản lý nội dung blog. 