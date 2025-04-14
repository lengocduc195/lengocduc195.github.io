# Giải thích Trang Projects (`src/app/projects/page.tsx`)

File này định nghĩa giao diện người dùng (UI) cho trang "My Projects" (route `/projects`).

## Mục đích:

Trưng bày các dự án bạn đã thực hiện hoặc đóng góp.
Đối với mỗi dự án, thường bao gồm:

-   Tên dự án
-   Mô tả ngắn gọn
-   Công nghệ sử dụng
-   Liên kết đến repository (GitHub, GitLab,...)
-   Liên kết đến demo trực tiếp (nếu có)
-   Hình ảnh hoặc video minh họa (tùy chọn)

## Cấu trúc:

-   Nằm trong thư mục `src/app/projects/`.
-   File `page.tsx` export một React component (ví dụ: `ProjectsPage`).
-   Sử dụng các thẻ HTML và lớp Tailwind CSS để trình bày danh sách dự án (ví dụ: sử dụng grid hoặc flexbox).

## Tương tác với Layout:

Nội dung của component `ProjectsPage` sẽ được render bên trong `RootLayout` (`src/app/layout.tsx`).

## Dữ liệu:

Trang này được thiết kế để đọc dữ liệu dự án từ một file JSON bên ngoài, ví dụ: `src/assets/data/projects.json`.

-   **Đọc dữ liệu:** Component `ProjectsPage` (là một Server Component theo mặc định) có thể trực tiếp đọc file JSON từ hệ thống file phía server trong quá trình build hoặc render.
-   **Hiển thị:** Dữ liệu đọc được sẽ được lặp qua và hiển thị dưới dạng danh sách hoặc card dự án.

Xem cách đọc và hiển thị dữ liệu trong code của `src/app/projects/page.tsx`. 