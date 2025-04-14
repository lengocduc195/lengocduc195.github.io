# My Personal Page

Đây là dự án trang web cá nhân được xây dựng bằng Next.js, TypeScript, và Tailwind CSS.

## Mục lục

-   [Giới thiệu](#giới-thiệu)
-   [Cấu trúc dự án](#cấu-trúc-dự-án)
-   [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
    -   [Yêu cầu](#yêu-cầu)
    -   [Cài đặt](#cài-đặt)
    -   [Chạy môi trường phát triển](#chạy-môi-trường-phát-triển)
    -   [Build dự án](#build-dự-án)
    -   [Deploy lên GitHub Pages](#deploy-lên-github-pages)
-   [Giải thích các thành phần chính](#giải-thích-các-thành-phần-chính)
    -   [`src/app`](#srcapp)
    -   [`src/components`](#srccomponents)
    -   [`src/assets/data`](#srcassetsdata)
-   [Đóng góp](#đóng-góp)
-   [Giấy phép](#giấy-phép)

## Giới thiệu

Trang web này được tạo ra để giới thiệu bản thân, các dự án, bài viết, kỹ năng và các hoạt động khác của tôi.

## Cấu trúc dự án

```
my-personal-page/
├── .github/                # Cấu hình GitHub Actions (ví dụ: deploy)
│   └── workflows/
│       └── deploy.yml
├── public/                 # Chứa các file tĩnh (hình ảnh, fonts, ...)
├── src/
│   ├── app/                # Định tuyến và UI của các trang (App Router)
│   │   ├── (page_group)/   # Các thư mục con cho từng trang (ví dụ: about, projects)
│   │   │   ├── page.tsx    # UI chính của trang
│   │   │   └── README.md   # Giải thích về trang
│   │   ├── layout.tsx      # Layout gốc của ứng dụng
│   │   ├── page.tsx        # UI của trang chủ
│   │   └── globals.css     # CSS toàn cục
│   ├── components/         # Các React components tái sử dụng
│   │   ├── Navbar.tsx      # Component thanh điều hướng
│   │   └── README.md       # Giải thích thư mục components
│   └── assets/             # Chứa các tài nguyên khác (ví dụ: dữ liệu JSON)
│       └── data/
│           ├── projects.json
│           ├── publications.json
│           └── ...         # Các file dữ liệu khác
├── .eslintrc.json          # Cấu hình ESLint
├── .gitignore              # Các file/thư mục bị Git bỏ qua
├── next.config.mjs         # Cấu hình Next.js
├── package.json            # Thông tin dự án và dependencies
├── package-lock.json       # Phiên bản chính xác của các dependencies
├── postcss.config.mjs      # Cấu hình PostCSS (cho Tailwind)
├── tailwind.config.ts      # Cấu hình Tailwind CSS
├── tsconfig.json           # Cấu hình TypeScript
└── README.md               # File README chính (bạn đang đọc)
```

## Hướng dẫn sử dụng

### Yêu cầu

-   Node.js (Phiên bản 20.x hoặc mới hơn được khuyến nghị)
-   npm (Thường đi kèm với Node.js)
-   Git

### Cài đặt

1.  Clone repository này:
    ```bash
    git clone <your-repository-url>
    cd my-personal-page
    ```
2.  Cài đặt dependencies:
    ```bash
    npm install
    # hoặc npm ci (để cài đặt chính xác theo package-lock.json)
    ```

### Chạy môi trường phát triển

```bash
npm run dev
```

Mở trình duyệt và truy cập `http://localhost:3000`.

Trang web sẽ tự động cập nhật khi bạn thay đổi code.

### Build dự án

Để tạo phiên bản tối ưu cho production (bao gồm cả việc xuất file tĩnh để deploy lên GitHub Pages):

```bash
npm run build
```

Quá trình build sẽ tạo ra thư mục `out/` chứa các file tĩnh của trang web.

### Deploy lên GitHub Pages

Có hai cách chính:

1.  **Sử dụng script `deploy` (với `gh-pages`):**
    -   Đảm bảo bạn đã cài đặt `gh-pages`: `npm install gh-pages --save-dev`
    -   Chạy lệnh:
        ```bash
        npm run deploy
        ```
    -   Lệnh này sẽ build dự án, tạo file `.nojekyll`, và đẩy thư mục `out` lên nhánh `gh-pages`.
    -   Vào Settings > Pages của repository GitHub, chọn nhánh `gh-pages` làm nguồn.

2.  **Sử dụng GitHub Actions (Khuyến nghị):**
    -   File workflow `.github/workflows/deploy.yml` đã được cung cấp.
    -   Mỗi khi bạn push code lên nhánh `main`, GitHub Actions sẽ tự động build và deploy trang web lên nhánh `gh-pages`.
    -   Chỉ cần cấu hình GitHub Pages trong Settings > Pages để sử dụng nhánh `gh-pages` làm nguồn.

## Giải thích các thành phần chính

### `src/app`

Đây là nơi chứa code chính của ứng dụng sử dụng Next.js App Router.

-   **Routing:** Mỗi thư mục con trong `app` tương ứng với một segment của URL. Ví dụ: `src/app/about` tương ứng với đường dẫn `/about`.
-   **`page.tsx`:** File này định nghĩa giao diện người dùng (UI) chính cho một route. Nó phải export một React component.
-   **`layout.tsx`:** Định nghĩa UI chung được chia sẻ giữa nhiều trang. `src/app/layout.tsx` là Root Layout áp dụng cho toàn bộ ứng dụng.
-   **`README.md` (trong các thư mục con):** Cung cấp giải thích chi tiết về mục đích và cấu trúc của từng trang (ví dụ: `src/app/about/README.md`).

Xem thêm: [Next.js App Router Documentation](https://nextjs.org/docs/app)

### `src/components`

Chứa các React components tái sử dụng được trong toàn bộ ứng dụng.

-   Giúp code gọn gàng, dễ bảo trì và tái sử dụng.
-   Ví dụ: `Navbar.tsx`.
-   Xem chi tiết trong [`src/components/README.md`](./src/components/README.md).

### `src/assets/data`

Thư mục này chứa các file dữ liệu tĩnh (ví dụ: JSON) được sử dụng để hiển thị nội dung trên các trang.

-   Ví dụ: `projects.json` chứa danh sách các dự án, `publications.json` chứa danh sách các bài báo.
-   Các trang tương ứng (ví dụ: `ProjectsPage`, `PublicationsPage`) sẽ đọc dữ liệu từ các file này để hiển thị.

## Đóng góp

Nếu bạn muốn đóng góp, vui lòng tạo Pull Request.

## Giấy phép

[MIT](./LICENSE) (Bạn có thể cần tạo file LICENSE nếu muốn)
