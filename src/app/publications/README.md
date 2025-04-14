# Giải thích Trang Publications (`src/app/publications/page.tsx`)

File này định nghĩa giao diện người dùng (UI) cho trang "My Publications" (route `/publications`).

## Mục đích:

Liệt kê các bài báo khoa học, bài báo hội nghị, chương sách, hoặc các ấn phẩm khác mà bạn là tác giả hoặc đồng tác giả.
Thông tin thường bao gồm:

-   Tiêu đề bài báo/ấn phẩm
-   Tên các tác giả
-   Tên tạp chí/hội nghị/nhà xuất bản
-   Năm xuất bản
-   Liên kết đến bài báo (DOI, PDF, trang web)
-   Tóm tắt (tùy chọn)

## Cấu trúc:

-   Nằm trong thư mục `src/app/publications/`.
-   File `page.tsx` export một React component (ví dụ: `PublicationsPage`).
-   Sử dụng các thẻ HTML và lớp Tailwind CSS để trình bày danh sách ấn phẩm một cách rõ ràng.

## Tương tác với Layout:

Nội dung của component `PublicationsPage` sẽ được render bên trong `RootLayout` (`src/app/layout.tsx`).

## Dữ liệu:

Trang này được thiết kế để đọc dữ liệu ấn phẩm từ một file JSON bên ngoài, ví dụ: `src/assets/data/publications.json`.

-   **Đọc dữ liệu:** Component `PublicationsPage` (Server Component) đọc file JSON.
-   **Hiển thị:** Dữ liệu được lặp qua và hiển thị theo định dạng trích dẫn hoặc danh sách.

Xem cách đọc và hiển thị dữ liệu trong code của `src/app/publications/page.tsx`. 