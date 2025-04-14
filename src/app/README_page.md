# Giải thích `src/app/page.tsx` (Trang chủ)

File `page.tsx` trong thư mục gốc `src/app` định nghĩa giao diện người dùng (UI) cho **trang chủ** (route `/`) của ứng dụng.

## Chức năng:

-   Đây là trang đầu tiên người dùng nhìn thấy khi truy cập vào tên miền gốc của trang web.
-   Hiển thị lời chào mừng và một giới thiệu ngắn gọn.
-   Cung cấp các liên kết điều hướng chính đến các trang con khác (About, Projects, Publications, Skills, Blogs) thông qua component `<Link>` của Next.js.

## Cấu trúc cơ bản:

-   Export một React component (ví dụ: `HomePage`).
-   Sử dụng các thẻ HTML ngữ nghĩa (`<main>`, `<h1>`, `<p>`, `<nav>`).
-   Sử dụng các lớp tiện ích của Tailwind CSS để tạo kiểu.
-   Sử dụng component `<Link href="...">` để tạo liên kết điều hướng trong ứng dụng, giúp chuyển trang phía client (client-side navigation) mượt mà hơn.

## Tại sao lại ở thư mục gốc `src/app`?

Trong Next.js App Router, file `page.tsx` đặt trực tiếp trong thư mục `app` sẽ tự động được liên kết với route gốc (`/`). 