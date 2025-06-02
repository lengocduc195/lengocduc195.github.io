# Hướng dẫn cập nhật quy tắc bảo mật Firebase

Để cho phép người dùng khách (chưa đăng nhập) được theo dõi trong hệ thống analytics, bạn cần cập nhật quy tắc bảo mật Firebase như sau:

## Bước 1: Đăng nhập vào Firebase Console

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn dự án của bạn

## Bước 2: Cập nhật quy tắc bảo mật cho Realtime Database

1. Trong menu bên trái, chọn "Realtime Database"
2. Chuyển đến tab "Rules" (Quy tắc)
3. Thay thế toàn bộ quy tắc hiện tại bằng quy tắc mới sau đây:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "orders": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid"
        }
      }
    },
    "orders": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": "createdAt",
      "$orderId": {
        ".read": "data.child('userId').val() === auth.uid",
        ".write": "!data.exists() || data.child('userId').val() === auth.uid"
      }
    },
    "analytics": {
      ".read": "auth != null",
      ".write": true,
      "pageViews": {
        ".indexOn": "timestamp"
      },
      "visitors": {
        ".indexOn": "timestamp"
      },
      "timeSpent": {
        ".indexOn": "timestamp"
      },
      "interactions": {
        ".indexOn": "timestamp"
      }
    }
  }
}
```

4. Nhấn "Publish" (Xuất bản) để lưu các thay đổi

## Bước 3: Kiểm tra lại

1. Sau khi cập nhật quy tắc, hãy thử truy cập trang web của bạn ở chế độ ẩn danh (Incognito)
2. Kiểm tra xem dữ liệu analytics có được ghi vào Firebase không
3. Kiểm tra trong Firebase Console, phần Realtime Database, xem có dữ liệu mới trong các nút `analytics/visitors`, `analytics/pageViews`, v.v. không

## Lưu ý về bảo mật

Quy tắc mới cho phép bất kỳ ai cũng có thể ghi dữ liệu vào nút `analytics`. Điều này là cần thiết để theo dõi người dùng khách, nhưng cũng có thể tiềm ẩn rủi ro bảo mật nếu không được quản lý đúng cách.

Để tăng cường bảo mật, bạn có thể cân nhắc:

1. Thêm xác thực cho các yêu cầu API từ phía máy chủ
2. Giới hạn tốc độ ghi dữ liệu
3. Xác thực dữ liệu trước khi lưu
4. Giám sát thường xuyên để phát hiện hoạt động bất thường

## Cấu trúc dữ liệu analytics

Với quy tắc mới, dữ liệu analytics sẽ được tổ chức như sau:

- `analytics/visitors`: Thông tin về người truy cập
- `analytics/pageViews`: Thông tin về lượt xem trang
- `analytics/timeSpent`: Thông tin về thời gian người dùng dành trên trang
- `analytics/interactions`: Thông tin về tương tác của người dùng

Mỗi nút đều có chỉ mục theo `timestamp` để tối ưu hóa truy vấn theo thời gian.
