# Giải thích thư mục `src/components`

Thư mục `src/components` chứa các React components có thể tái sử dụng trong toàn bộ ứng dụng. Việc tách các thành phần UI thành các components riêng biệt giúp:

-   **Tái sử dụng (Reusability):** Sử dụng cùng một component ở nhiều nơi khác nhau mà không cần lặp lại code.
-   **Dễ bảo trì (Maintainability):** Chỉnh sửa logic hoặc giao diện của một component ở một nơi duy nhất sẽ ảnh hưởng đến tất cả các nơi nó được sử dụng.
-   **Tính tổ chức (Organization):** Giữ cho code của các trang (trong `src/app`) gọn gàng hơn bằng cách tách các phần UI phức tạp hoặc lặp lại ra các file riêng.

## Ví dụ: `Navbar.tsx`

File `src/components/Navbar.tsx` là một ví dụ điển hình:

-   Nó định nghĩa cấu trúc và kiểu dáng cho thanh điều hướng (navigation bar) của trang web.
-   Nó chứa các liên kết (`<Link>`) đến các trang khác nhau trong ứng dụng.
-   Component này được import và sử dụng trong `src/app/layout.tsx` để đảm bảo thanh điều hướng xuất hiện trên tất cả các trang.

## Server vs. Client Components

Các components trong thư mục này có thể là Server Components hoặc Client Components, tùy thuộc vào nhu cầu:

-   **Server Components (Mặc định):** Nếu component chỉ hiển thị dữ liệu tĩnh hoặc không cần tương tác phía client (như `useState`, `useEffect`, event handlers), hãy giữ nó là Server Component. Ví dụ: `Navbar.tsx` hiện tại.
-   **Client Components:** Nếu component cần sử dụng state, lifecycle effects, hoặc các browser API, hãy thêm `"use client";` ở đầu file để đánh dấu nó là Client Component. Ví dụ: Một component carousel hình ảnh hoặc một form tương tác.

Sử dụng alias `@/components/...` (đã cấu hình trong `tsconfig.json` và `next.config.mjs`) để import các components này một cách thuận tiện từ bất kỳ đâu trong thư mục `src`. 