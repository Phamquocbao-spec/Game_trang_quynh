TRẠNG QUỲNH: KẺ HACK THIÊN MỆNH — PHIÊN BẢN V3
=================================================

CẬP NHẬT V3: 50 CÂU HỎI — 5 CÂU NGẪU NHIÊN MỖI ẢI

- Ải 1: 20 câu dân gian. Mỗi lượt rút ngẫu nhiên 5 câu.
- Ải 2: 20 câu suy luận, đố mẹo. Mỗi lượt rút ngẫu nhiên 5 câu.
- Ải 3: 10 câu hack não đối thoại với Ngọc Hoàng. Mỗi lượt rút ngẫu nhiên 5 câu.
- Phải trả lời ĐÚNG CẢ 5 CÂU mới vượt qua một ải.
- Trả lời SAI một câu: lượt hiện tại kết thúc ngay, hiện màn thất bại.
- Bấm "Thử lại ải này · 5 câu mới" để chơi lại ải vừa thua.
- Bộ 5 câu mới bảo đảm KHÔNG trùng câu nào trong bộ 5 câu vừa thua.
- Các ải đã vượt qua vẫn được giữ nguyên.
- Hết các câu chưa dùng, ngân hàng được xáo trộn lại để sử dụng tiếp.
- Bấm "Chơi lại" ở thanh trên cùng để reset toàn bộ hành trình.

CÁCH CHẠY:
1. Giải nén ZIP, mở thư mục gamedangian trong VS Code.
2. Nhấp chuột phải index.html > Open with Live Server.
3. Nhấn "Bắt đầu hành trình".
4. WASD / phím mũi tên để di chuyển; nhấp bản đồ để tự đi tới.
5. Đến gần một ải mở khóa rồi nhấn E để giải câu đố.
6. Trả lời đúng 5 câu liên tiếp. Nếu sai, bấm nút thử lại bộ câu mới.
7. Hoàn thành 3 ải và đi tới cổng Bế Quan góc trên phải bản đồ.

CẤU TRÚC:
- index.html: giao diện.
- sytem.css: phong cách, hiệu ứng.
- game.js: 50 câu hỏi, logic chọn ngẫu nhiên, câu đố và gameplay.
- anh/: ảnh bìa, map và các sprite từ hình người chơi gửi.

SỬA / THÊM CÂU HỎI:
- Mở game.js bằng VS Code.
- Tìm "const QUESTION_BANK".
- Có 3 mảng tương ứng Ải 1/2/3. Mỗi hàng gồm:
  ["Nội dung câu hỏi", "Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D", 0-3, "Giải thích"]
- Chỉ số đáp án đúng: A=0, B=1, C=2, D=3.
- Nhớ giữ nguyên dấu ngoặc, dấu phẩy và dấu nháy khi chỉnh.

LƯU Ý:
- Hình ảnh và map giữ theo bản V2 đã làm cho cuộc thi.
- Bản V3 thực hiện chọn ngẫu nhiên bằng Fisher-Yates dùng Math.random.
- Một số câu trong bộ 50 câu đã được làm rõ cách diễn đạt để tránh mơ hồ (ví dụ tờ tiền thay vì đồng tiền).
- Game là thử nghiệm game jam (map tĩnh có các điểm tương tác), chưa phải tilemap với va chạm chi tiết.


NANG CAP V4: DONG HO 15 GIAY / CAU
- Moi cau trong 3 ai co 15 giay de tra loi.
- Thanh dem nguoc xanh chuyen do khi con 5 giay.
- Het gio = tra loi sai, phai thu lai ai hien tai voi 5 cau moi.
- Da vuot ai nao thi giu tien do ai do.
- Khi tra loi xong hoac roi thu thach, dong ho duoc xoa de tranh chay ngam.
