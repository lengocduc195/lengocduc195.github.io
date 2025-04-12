# Giải thích Trang About (`src/app/about/page.tsx`)

File này định nghĩa giao diện người dùng (UI) cho trang "About Me" (route `/about`).

## Mục đích:

Cung cấp thông tin chi tiết về bản thân, ví dụ:

-   Giới thiệu chung
-   Học vấn
-   Kinh nghiệm làm việc
-   Sở thích
-   Thông tin liên hệ (có thể đặt ở đây hoặc trang riêng)

## Cấu trúc:

-   Nằm trong thư mục `src/app/about/`.
-   File `page.tsx` export một React component (ví dụ: `AboutPage`).
-   Sử dụng các thẻ HTML và lớp Tailwind CSS để trình bày nội dung.

## Tương tác với Layout:

Nội dung của component `AboutPage` sẽ được render bên trong `RootLayout` (`src/app/layout.tsx`), do đó nó sẽ tự động có thanh điều hướng (`Navbar`) và các thành phần chung khác được định nghĩa trong layout.

## Dữ liệu:

Hiện tại, nội dung đang là placeholder. Bạn cần chỉnh sửa file này để thêm thông tin cá nhân thực tế.
Trong tương lai, nếu thông tin phức tạp, có thể xem xét việc tách dữ liệu ra file JSON (trong `src/assets/data`) và đọc vào component này. 