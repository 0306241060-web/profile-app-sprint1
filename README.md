# ĐỒ ÁN MÔN HỌC: ỨNG DỤNG QUẢN LÝ GHI CHÚ (REACTJS & NODEJS)

**Giảng viên hướng dẫn:** [Nguyễn Hoàng Việt]

**Nhóm thực hiện:** Nhóm [số nhóm]

**Thành viên:**
1. [Họ tên] - [Mã SV] - Vai trò: PM & QA
2. [Nguyễn Hoàng Long] - [0306241050] - Vai trò: Frontend Developer
3. [Ngô Xuân Thanh Phong] - [0306241060] - Vai trò: Backend Developer

## 1. Công nghệ sử dụng

- **Frontend:** ReactJS (Vite), React Router DOM.
- **Backend:** Node.js, Express.js.
- **Cơ sở dữ liệu:** File System (lưu trữ bằng định dạng `.json` để quản lý và trình bày).

## 2. Yêu cầu môi trường

- Máy tính cần cài đặt sẵn **Node.js** (phiên bản v16 trở lên).

## 3. Hướng dẫn cài đặt & Chạy dự án (Rất quan trọng)

Dự án được chia làm 2 phần chạy độc lập. Vui lòng mở 2 cửa sổ Terminal (Command Prompt) để chạy song song.

### Bước 1: Khởi động Backend (Máy chủ API)

Mở Terminal 1, di chuyển vào thư mục `backend` và chạy lệnh:

bash
cd backend
npm install
node server.js
Lưu ý: Backend sẽ chạy tại `http://localhost:5000`. Hệ thống sẽ tự động sinh thư mục `data/` chứa các file JSON. Vui lòng không xóa thư mục này khi hệ thống đang chạy.

### Bước 2: Khởi động Frontend (Giao diện)

Mở Terminal 2, di chuyển vào thư mục `frontend` và chạy lệnh:

    cd frontend
    npm install
    npm run dev

Lưu ý: Frontend sẽ chạy tại `http://localhost:5173` (hoặc cổng khác hiển thị trên terminal). Mở đường dẫn này trên trình duyệt để sử dụng hệ thống.

## 4. Tài khoản / Mật khẩu Demo

Mật khẩu mặc định nhập tài khoản.

Để xem khu vực Ghi chú riêng tư, vui lòng vào menu "Cài đặt" để tạo mật khẩu mới.

---
