# Kế hoạch Sửa lỗi Bổ sung (ITSS2) - Giai đoạn 2.1

Tôi đã ghi nhận lỗi tạo dự án luôn ở trạng thái `Planning` và lỗi không tự động hoàn thành dự án (`Finished`) khi toàn bộ công việc đã xong. Dưới đây là kế hoạch sửa đổi chi tiết, kết hợp rà soát các vấn đề nhất quán dữ liệu Backend và Frontend.

---

## 1. Các vấn đề cần giải quyết & Giải pháp đề xuất

### Vấn đề 1: Tạo dự án luôn bị gán cứng trạng thái `Planning`
* **Nguyên nhân:** 
  * Trong [App.tsx](file:///d:/ITSS2/frontend/src/app/App.tsx), hàm `handleCreateProject` đang gán cứng trường `status: 'Planning'`.
  * Ở Backend, hàm `createProject` trong [project.service.js](file:///d:/ITSS2/backend/src/services/project.service.js) cũng gán cứng `initialStatus = 'Planning'` (hoặc tự động chuyển `In Progress` theo ngày) và bỏ qua `status` từ client gửi lên.
* **Cách khắc phục:**
  * **Frontend:** Thêm state `createProjectStatus` trong `App.tsx` để lưu lại trạng thái của cột mà người dùng bấm nút tạo (Ví dụ: `Planning`, `In Progress`...). Truyền trạng thái này vào payload gửi đi.
  * **Backend:** Sửa hàm `createProject` để ưu tiên sử dụng trường `status` nhận được từ client.

---

### Vấn đề 2: Dự án không tự động chuyển sang `Finished` khi các task hoàn thành
* **Nguyên nhân:**
  * Hàm `recalculateCompletion` trong [project.service.js](file:///d:/ITSS2/backend/src/services/project.service.js) hiện chỉ tính toán phần trăm hoàn thành (`completion`) và cập nhật vào bảng `Project`, hoàn toàn bỏ qua việc tự động thay đổi trạng thái của dự án.
* **Cách khắc phục:**
  * Cập nhật hàm `recalculateCompletion` ở Backend:
    * Nếu tỉ lệ hoàn thành đạt `100%` (và dự án có ít nhất 1 task), tự động cập nhật trạng thái dự án sang `Finished`.
    * Nếu tỉ lệ hoàn thành giảm xuống dưới `100%` (ví dụ do mở lại task hoặc thêm task mới) mà dự án đang ở trạng thái `Finished`, tự động chuyển lại sang `In Progress`.

---

### Vấn đề 3: Thành viên bị xóa khỏi dự án vẫn giữ phân công nhiệm vụ (Tự phát hiện)
* **Nguyên nhân:**
  * Hàm `removeMember` trong [project.service.js](file:///d:/ITSS2/backend/src/services/project.service.js) chỉ ngắt kết nối User ra khỏi Project, không gỡ bỏ phân công nhiệm vụ trong project đó.
* **Cách khắc phục:**
  * Cập nhật hàm `removeMember`: khi xóa một thành viên ra khỏi dự án, thực hiện cập nhật cơ sở dữ liệu ngắt kết nối (disconnect) thành viên đó khỏi tất cả các `Task` thuộc dự án hiện tại.

---

### Vấn đề 4: Điểm khả dụng bị lệch màu sắc hiển thị giữa danh sách và popup chi tiết (Tự phát hiện)
* **Nguyên nhân:**
  * [TaskRecommendations.tsx](file:///d:/ITSS2/frontend/src/components/common/TaskRecommendations.tsx) sử dụng ngưỡng điểm trên thang 10: `>= 7` (xanh), `>= 4` (vàng), dưới `4` (cam).
  * Trong khi đó, [TaskDetailPopup.tsx](file:///d:/ITSS2/frontend/src/components/common/TaskDetailPopup.tsx) dùng ngưỡng rất thấp: `>= 2.5` (xanh), `>= 1.5` (vàng).
* **Cách khắc phục:**
  * Thay thế ngưỡng màu của `TaskDetailPopup.tsx` để đồng bộ khớp với thang điểm chuẩn của `TaskRecommendations.tsx`.

---

## 2. Kế hoạch & Checklist triển khai sửa lỗi

### Bước 1: Sửa logic Tạo dự án & Tự động cập nhật Trạng thái (Backend & Frontend)
- [ ] Cập nhật Frontend `App.tsx` và `ProjectList.tsx` để truyền trạng thái cột sang form tạo dự án mới.
- [ ] Cập nhật Backend `createProject` trong `project.service.js` để tôn trọng trường `status` do Frontend gửi lên.
- [ ] Cập nhật hàm `recalculateCompletion` trong `project.service.js` để tự động cập nhật trạng thái dự án thành `Finished` (khi completion = 100) hoặc chuyển về `In Progress` (khi completion < 100).

### Bước 2: Tự động dọn dẹp phân công task khi xóa thành viên
- [ ] Cập nhật hàm `removeMember` trong `project.service.js` để tự động ngắt kết nối thành viên bị xóa ra khỏi mọi tasks thuộc dự án.

### Bước 3: Đồng bộ hóa UI điểm khả dụng
- [ ] Đồng bộ lại ngưỡng màu sắc điểm khả dụng của `TaskDetailPopup.tsx` khớp với `TaskRecommendations.tsx`.

---

## 3. Kế hoạch kiểm thử (Verification Plan)

1. **Tạo dự án theo cột:**
   * Truy cập giao diện Project Board.
   * Click dấu `+` tạo dự án mới ở cột `In Progress` hoặc `Finished`.
   * Đảm bảo dự án mới được xếp đúng vào cột đã chọn và lưu đúng trạng thái đó vào DB.
2. **Tự động cập nhật trạng thái hoàn thành:**
   * Chọn một dự án có 2 task đang ở trạng thái `In Progress` / `Not Started`.
   * Chuyển tất cả task sang `Done`. Đảm bảo trạng thái của dự án tự động chuyển sang `Finished`.
   * Mở lại 1 task thành `In Progress`. Đảm bảo dự án tự động chuyển về `In Progress`.
3. **Xóa thành viên:**
   * Xóa một thành viên đang được gán task ra khỏi dự án. Đảm bảo thành viên đó không còn hiển thị ở phần assignee của các task thuộc dự án đó nữa.
4. **Điểm khả dụng:**
   * Xem một task quá hạn và kiểm tra màu sắc hiển thị của điểm khả dụng ở cả danh sách đề xuất ngoài và popup chi tiết đảm bảo đồng bộ (Ví dụ: điểm `3.0` phải hiển thị màu cam ở cả hai nơi).
