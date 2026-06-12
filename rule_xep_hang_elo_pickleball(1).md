# Quy định xếp hạng Elo Pickleball đôi cho CLB khoảng 12 người

Tài liệu này mô tả hệ thống xếp hạng trình độ cá nhân cho CLB pickleball có khoảng 12 người chơi, tổ chức giải nội bộ mỗi tháng 1 lần theo thể thức đánh đôi.

Mục tiêu của hệ thống là:

- Xếp hạng **trình độ cá nhân**, không chỉ xếp hạng cặp đôi.
- Phù hợp với CLB nhỏ hoặc vừa, khoảng 10-14 người, trong đó thường có khoảng 12 người tham gia mỗi buổi.
- Dễ tính bằng Google Sheets hoặc Excel.
- Có thể mở rộng khi CLB có thêm thành viên mới.
- Hạn chế việc một người bị lệ thuộc quá nhiều vào partner cố định.
- Tạo cơ sở công bằng để chia cặp, chia bảng và theo dõi sự tiến bộ.

---

## 1. Nguyên tắc chung

Mỗi người chơi có một điểm Elo cá nhân.

Ví dụ ban đầu:

```text
Tất cả người chơi bắt đầu với Elo = 1000
```

Khi thi đấu đôi, Elo của một đội được tính bằng trung bình Elo của 2 người trong đội.

```text
Rating đội A = (Elo A1 + Elo A2) / 2
Rating đội B = (Elo B1 + Elo B2) / 2
```

Sau mỗi trận, cả 2 người trong cùng một đội được cộng hoặc trừ số điểm như nhau.

Điểm Elo là điểm cá nhân, nhưng kết quả được sinh ra từ trận đánh đôi.

---

## 2. Công thức xác suất thắng kỳ vọng

Xác suất thắng kỳ vọng không lấy từ dữ liệu bên ngoài, mà được tính từ chênh lệch Elo giữa hai đội.

Với đội A đấu đội B:

```text
E_A = 1 / (1 + 10 ^ ((R_B - R_A) / 400))
```

Trong đó:

```text
E_A = xác suất thắng kỳ vọng của đội A
R_A = rating đội A
R_B = rating đội B
400 = hệ số chuẩn trong hệ Elo
```

Xác suất thắng kỳ vọng của đội B:

```text
E_B = 1 - E_A
```

### Bảng tham khảo nhanh

| Chênh lệch Elo | Đội mạnh hơn có xác suất thắng kỳ vọng |
|---:|---:|
| 0 điểm | 50.0% |
| 50 điểm | 57.1% |
| 100 điểm | 64.0% |
| 200 điểm | 76.0% |
| 300 điểm | 84.9% |
| 400 điểm | 90.9% |

---

## 3. Công thức cập nhật Elo

Sau mỗi trận, điểm Elo được cập nhật theo công thức:

```text
Elo mới = Elo cũ + K × H × (S - E)
```

Trong đó:

```text
K = hệ số biến động điểm
H = hệ số cách biệt tỷ số
S = kết quả thực tế
E = xác suất thắng kỳ vọng
```

Giá trị của `S`:

```text
Thắng: S = 1
Thua:  S = 0
```

Với đội thắng, công thức sẽ cộng điểm.

Với đội thua, công thức sẽ trừ điểm.

---

## 4. Hệ số K

Hệ số K quyết định điểm Elo thay đổi nhanh hay chậm.

Với CLB khoảng 12 người, nên dùng hệ số K như sau:

| Trạng thái người chơi | K đề xuất |
|---|---:|
| Người mới hoặc 10 trận đầu tiên | 40 |
| Giai đoạn CLB mới chạy hệ thống | 32 |
| Người chơi ổn định | 24 |
| Người đã có từ 30 trận trở lên | 16 |

Khuyến nghị đơn giản:

```text
3 giải đầu tiên của CLB: dùng K = 32 cho tất cả
Người mới trong 10 trận đầu: dùng K = 40
Từ giải thứ 4 trở đi: dùng K = 24
Sau khi một người đã chơi ít nhất 30 trận: dùng K = 16
```

Lý do:

- Ban đầu cần K cao để phân loại trình độ nhanh.
- CLB khoảng 12 người sẽ có nhiều tổ hợp partner hơn nhóm 8 người, nên Elo cần đủ nhạy trong giai đoạn đầu.
- Sau khi bảng xếp hạng ổn định, giảm K để tránh một trận may mắn làm biến động quá mạnh.
- Người đã có nhiều trận thì Elo đáng tin hơn, nên không cần thay đổi quá nhanh.

---

## 5. Hệ số cách biệt tỷ số

Có thể tính thêm hệ số cách biệt tỷ số để phản ánh mức độ thắng thua.

Không nên để hệ số này quá mạnh, vì pickleball đôi có thể bị ảnh hưởng bởi partner, phong độ, sân bãi, thể lực và matchup.

Khuyến nghị:

| Kết quả trận | Cách biệt điểm | Hệ số H |
|---|---:|---:|
| Thắng sít sao | 1-3 điểm | 1.00 |
| Thắng vừa | 4-6 điểm | 1.15 |
| Thắng đậm | 7 điểm trở lên | 1.25 |

Ví dụ với trận đánh đến 11 điểm:

```text
11-9  → cách biệt 2 điểm → H = 1.00
11-6  → cách biệt 5 điểm → H = 1.15
11-3  → cách biệt 8 điểm → H = 1.25
```

Nếu muốn hệ thống đơn giản hơn, có thể bỏ hệ số này và luôn đặt:

```text
H = 1.00
```

---

## 6. Ví dụ tính Elo sau một trận

Giả sử có trận:

```text
Đội A: Nam + Minh
Đội B: Huy + Long
```

Elo hiện tại:

| Người chơi | Elo |
|---|---:|
| Nam | 1050 |
| Minh | 1000 |
| Huy | 980 |
| Long | 970 |

Rating hai đội:

```text
R_A = (1050 + 1000) / 2 = 1025
R_B = (980 + 970) / 2 = 975
```

Xác suất thắng kỳ vọng của đội A:

```text
E_A = 1 / (1 + 10 ^ ((975 - 1025) / 400))
E_A ≈ 0.571
```

Đội B:

```text
E_B = 1 - 0.571 = 0.429
```

Giả sử đội A thắng 11-6.

```text
S_A = 1
S_B = 0
H = 1.15
K = 24
```

Điểm thay đổi của đội A:

```text
Delta_A = 24 × 1.15 × (1 - 0.571)
Delta_A ≈ 11.84
```

Điểm thay đổi của đội B:

```text
Delta_B = 24 × 1.15 × (0 - 0.429)
Delta_B ≈ -11.84
```

Elo mới:

| Người chơi | Elo cũ | Thay đổi | Elo mới |
|---|---:|---:|---:|
| Nam | 1050 | +11.84 | 1061.84 |
| Minh | 1000 | +11.84 | 1011.84 |
| Huy | 980 | -11.84 | 968.16 |
| Long | 970 | -11.84 | 958.16 |

Có thể làm tròn Elo đến số nguyên:

```text
Nam: 1062
Minh: 1012
Huy: 968
Long: 958
```

---

## 7. Format giải hiện tại — 6 đội, 2 bảng, vòng loại + knock-out

Giải hiện tại gồm **6 đội**, chia thành **2 bảng (bảng A và bảng B)**, mỗi bảng 3 đội. Thi đấu theo **vòng tròn tính điểm** trong bảng, sau đó lấy nhất nhì mỗi bảng vào vòng knock-out.

### Vòng bảng (Group Stage)

```text
Mỗi bảng: 3 đội đánh vòng tròn → mỗi đội chơi 2 trận.
Tổng: 6 trận vòng bảng (3 trận/bảng × 2 bảng).
Xếp hạng trong bảng: thắng/thua → hiệu số điểm → đối đầu trực tiếp.
Nhất và nhì bảng vào vòng bán kết.
```

Lịch vòng bảng mẫu:

| Trận | Bảng | Đội đấu |
|---:|---|---|
| 1 | A | A1 vs A2 |
| 2 | A | A1 vs A3 |
| 3 | A | A2 vs A3 |
| 4 | B | B1 vs B2 |
| 5 | B | B1 vs B3 |
| 6 | B | B2 vs B3 |

### Vòng knock-out

```text
Bán kết 1: Nhất bảng A vs Nhì bảng B
Bán kết 2: Nhất bảng B vs Nhì bảng A
Tranh 3-4: Thua bán kết 1 vs Thua bán kết 2
Chung kết:  Thắng bán kết 1 vs Thắng bán kết 2
```

### Tổng số trận mỗi đội

| Giai đoạn | Số trận |
|---|---:|
| Vòng bảng | 2 trận |
| Bán kết | 1 trận |
| Chung kết hoặc tranh 3-4 | 1 trận |
| **Tổng tối đa** | **4 trận** |

### Hệ số K cho vòng knock-out

Vòng knock-out có tính quyết định cao hơn, nên nhân thêm hệ số vòng:

| Vòng | Hệ số vòng (M) |
|---|---:|
| Vòng bảng | 1.00 |
| Bán kết | 1.25 |
| Tranh 3-4 | 1.10 |
| Chung kết | 1.50 |

Công thức Elo cho vòng knock-out:

```text
Elo mới = Elo cũ + K × H × M × (S - E)
```

Ví dụ: Trận chung kết với K = 24, H = 1.15, M = 1.50:

```text
Delta = 24 × 1.15 × 1.50 × (S - E)
```

---

## 8. Cách chia cặp và xếp bảng

### Chia đôi cặp trong đội

Mỗi đội gồm 2 người. Khi ghép đội, nên cân bằng Elo hai đội để trận có tính cạnh tranh:

```text
Bước 1: Sắp xếp tất cả người chơi theo Elo từ cao xuống thấp.
Bước 2: Chia thành 2 nhóm (nhóm trên và nhóm dưới).
Bước 3: Mỗi đội = 1 người nhóm trên + 1 người nhóm dưới.
Bước 4: Ghép các đội thành trận sao cho rating hai đội chênh dưới 100 điểm.
Bước 5: Kiểm tra lịch sử partner, tránh lặp cặp trong cùng giải.
```

### Chia bảng cho 6 đội

Khi xếp 6 đội vào 2 bảng, nên chia đều theo sức mạnh để hai bảng cân bằng nhau:

```text
Bước 1: Xếp 6 đội theo rating trung bình (Elo trung bình 2 người trong đội).
Bước 2: Đội xếp 1, 4 vào bảng A → Đội xếp 2, 5 vào bảng B → Đội xếp 3, 6 vào bảng A.
        Hoặc dùng bốc thăm có kiểm soát (seed 1 và 2 vào 2 bảng khác nhau).
Bước 3: Đảm bảo tổng rating 3 đội mỗi bảng không chênh nhau quá nhiều.
```

Ví dụ chia bảng theo seed:

| Seed | Đội | Bảng |
|---:|---|---|
| 1 | Đội mạnh nhất | A |
| 2 | Đội mạnh thứ 2 | B |
| 3 | Đội mạnh thứ 3 | B |
| 4 | Đội mạnh thứ 4 | A |
| 5 | Đội mạnh thứ 5 | A |
| 6 | Đội yếu nhất | B |

---

## 9. Lịch mẫu giải 6 đội — 2 bảng, knock-out

### Vòng bảng

Giả sử 6 đội:

```text
Bảng A: Đội A1, A2, A3
Bảng B: Đội B1, B2, B3
```

| Lượt | Sân 1 | Sân 2 |
|---:|---|---|
| 1 | A1 vs A2 | B1 vs B2 |
| 2 | A1 vs A3 | B1 vs B3 |
| 3 | A2 vs A3 | B2 vs B3 |

Sau vòng bảng: lấy nhất và nhì mỗi bảng vào bán kết.

### Vòng knock-out

| Trận | Đội đấu | Hệ số vòng (M) |
|---|---|---:|
| Bán kết 1 | Nhất A vs Nhì B | 1.25 |
| Bán kết 2 | Nhất B vs Nhì A | 1.25 |
| Tranh 3-4 | Thua BK1 vs Thua BK2 | 1.10 |
| Chung kết | Thắng BK1 vs Thắng BK2 | 1.50 |

Lưu ý:

```text
- Mỗi đội đánh tối thiểu 3 trận (2 bảng + 1 knock-out).
- Đội vào chung kết đánh 4 trận tổng cộng.
- Ghi tỷ số đầy đủ để tính hệ số H (cách biệt điểm).
```

---

## 10. Luật tránh lệch partner và opponent

Vì đánh đôi phụ thuộc khá nhiều vào partner, CLB nên có thêm luật vận hành để Elo phản ánh trình độ cá nhân tốt hơn.

Khuyến nghị:

```text
1. Trong cùng một giải, một người không đánh cặp với cùng một partner quá 1 lần.
2. Trong 2 giải liên tiếp, hạn chế lặp lại cùng partner quá 2 lần.
3. Nếu có thể, trong cùng một giải, tránh để một người gặp cùng opponent quá 2 lần.
4. Khi chia cặp, ưu tiên trận có rating hai đội chênh nhau dưới 100 điểm.
5. Nếu không thể cân bằng tuyệt đối, chấp nhận lệch nhưng vẫn tính Elo bình thường.
```

Thứ tự ưu tiên khi chia lịch:

```text
1. Mọi người có số trận gần bằng nhau.
2. Không lặp partner trong cùng giải.
3. Rating hai đội trong mỗi trận gần nhau.
4. Hạn chế gặp lại cùng opponent quá nhiều.
5. Không để người mới liên tục gặp đội quá mạnh.
```

---

## 11. Cách ghi nhận kết quả trận

Mỗi trận nên ghi tối thiểu các thông tin sau:

| Cột | Nội dung |
|---|---|
| Ngày | Ngày thi đấu |
| Giải số | Ví dụ: Tháng 01/2026 |
| Vòng | Vòng 1 đến vòng 6 |
| Sân | Sân 1, Sân 2, Sân 3 |
| Đội A - Người 1 | Tên người chơi |
| Đội A - Người 2 | Tên người chơi |
| Đội B - Người 1 | Tên người chơi |
| Đội B - Người 2 | Tên người chơi |
| Điểm đội A | Ví dụ: 11 |
| Điểm đội B | Ví dụ: 6 |
| Đội thắng | A hoặc B |
| Rating đội A trước trận | Tính từ Elo trước trận |
| Rating đội B trước trận | Tính từ Elo trước trận |
| Expected đội A | Xác suất thắng kỳ vọng đội A |
| Expected đội B | Xác suất thắng kỳ vọng đội B |
| K | Hệ số K |
| H | Hệ số cách biệt tỷ số |
| Delta đội A | Điểm cộng/trừ của mỗi người đội A |
| Delta đội B | Điểm cộng/trừ của mỗi người đội B |

---

## 12. Bảng xếp hạng chính

Bảng xếp hạng nên có các cột sau:

| Cột | Ý nghĩa |
|---|---|
| Hạng | Thứ hạng hiện tại |
| Tên | Tên người chơi |
| Elo | Điểm Elo hiện tại |
| Trận | Tổng số trận đã chơi |
| Thắng | Số trận thắng |
| Thua | Số trận thua |
| Tỷ lệ thắng | Thắng / Tổng trận |
| Hiệu số điểm | Tổng điểm ghi được - tổng điểm thua |
| Elo thay đổi tháng này | Elo hiện tại - Elo đầu tháng |
| Phong độ 5 trận gần nhất | Ví dụ: W-W-L-W-L |
| Số partner khác nhau | Để xem người đó đã đánh với nhiều người chưa |
| Trạng thái | Active / Inactive / Provisional |

Thứ hạng chính được sắp xếp theo:

```text
1. Elo cao hơn
2. Nếu bằng Elo: xét đối đầu trực tiếp
3. Nếu vẫn bằng: xét tỷ lệ thắng
4. Nếu vẫn bằng: xét hiệu số điểm
5. Nếu vẫn bằng: xét số trận đã chơi
```

---

## 13. Điều kiện để được xếp hạng chính thức

Để tránh bảng xếp hạng bị lệch do người chơi quá ít trận, nên có điều kiện tối thiểu.

Khuyến nghị:

```text
Chỉ được xếp hạng chính thức nếu đã chơi ít nhất 12 trận.
```

Người chưa đủ 12 trận vẫn có Elo, nhưng được ghi trạng thái:

```text
Provisional / Tạm tính
```

Sau khi đủ 12 trận, người đó được đưa vào bảng xếp hạng chính thức.

Lý do chọn 12 trận:

```text
Với CLB khoảng 12 người, 12 trận là mốc tối thiểu để người chơi đã trải qua nhiều partner và opponent khác nhau.
```

---

## 14. Quy định Elo khởi điểm theo Tier

CLB chia người chơi thành **4 tier** dựa trên đánh giá trình độ ban đầu. Mỗi tier có Elo khởi điểm khác nhau:

| Tier | Mô tả trình độ | Elo khởi điểm |
|---|---|---:|
| Tier 1 | Trình độ cao nhất CLB | 1300 |
| Tier 2 | Trình độ khá | 1200 |
| Tier 3 | Trình độ trung bình | 1100 |
| Tier 4 | Người mới hoặc trình độ thấp | 1000 |

Việc phân tier do **ban chuyên môn CLB đánh giá** trước khi hệ thống Elo đi vào vận hành chính thức.

Trong giai đoạn đầu (3 giải đầu tiên), nên dùng hệ số K cao hơn để hệ thống tự điều chỉnh về đúng trình độ thực:

```text
3 giải đầu tiên: K = 32 cho tất cả (bất kể tier)
Từ giải thứ 4 trở đi: K = 24
Sau khi một người đã chơi từ 30 trận trở lên: K = 16
```

Nếu một người được đánh giá sai tier, hệ thống Elo sẽ tự điều chỉnh qua thi đấu — không cần can thiệp thủ công trừ khi lệch quá rõ và có sự đồng thuận của ban quản lý.

Khi có người mới gia nhập CLB sau khi hệ thống đã vận hành:

```text
- Nếu được phân tier bởi ban chuyên môn: dùng Elo theo bảng tier trên.
- Nếu không rõ trình độ: bắt đầu ở 1000, dùng K = 40 trong 10 trận đầu.
```

---

## 15. Quy định người nghỉ lâu

Nếu một người không tham gia trong thời gian dài, Elo vẫn được giữ nguyên nhưng trạng thái chuyển thành inactive.

Khuyến nghị:

```text
Nghỉ 3 tháng liên tiếp: trạng thái Inactive
Quay lại thi đấu: giữ Elo cũ và tiếp tục tính bình thường
```

Không nên tự động trừ Elo vì nghỉ lâu, vì mục tiêu của bảng là phản ánh kết quả thi đấu thực tế.

---

## 16. Quy định trận được tính Elo

Một trận chỉ được tính Elo nếu thỏa mãn các điều kiện:

```text
1. Hai đội thống nhất trước trận rằng trận này được tính Elo.
2. Trận có ghi đầy đủ tỷ số.
3. Trận có đủ 4 người chơi.
4. Không thay người giữa trận.
5. Không có sự cố khiến trận bị hủy giữa chừng.
```

Không nên tính Elo cho:

```text
- Trận tập nhẹ
- Trận giao lưu không ghi điểm nghiêm túc
- Trận có người bỏ cuộc giữa chừng
- Trận đổi partner giữa trận
- Trận không thống nhất trước là tính Elo
```

Nếu một người chấn thương hoặc bỏ cuộc giữa trận, ban tổ chức nên quyết định:

```text
Nếu trận chưa qua nửa thời lượng: hủy trận, không tính Elo
Nếu trận gần kết thúc và hai bên đồng ý: giữ kết quả, tính Elo
```

---

## 17. Phân nhóm trình độ (Tier)

CLB phân thành **4 tier** tương ứng với Elo khởi điểm và ngưỡng xếp hạng:

| Tier | Elo | Mô tả |
|---|---:|---|
| Tier 1 | 1300 trở lên | Advanced — trình độ cao nhất CLB |
| Tier 2 | 1200 – 1299 | Intermediate-High — khá |
| Tier 3 | 1100 – 1199 | Intermediate — trung bình |
| Tier 4 | Dưới 1100 | Developing — đang phát triển |

Lưu ý:

```text
- Tier chỉ dùng để xếp Elo khởi điểm ban đầu.
- Sau khi hệ thống vận hành, thứ hạng thực tế do Elo quyết định, không cố định theo tier.
- Một người Tier 4 có thể vượt ngưỡng 1100 sau vài giải nếu chơi tốt.
```

Sau khoảng 3-6 tháng vận hành, nên xem lại phân bổ Elo thực tế của CLB và điều chỉnh ngưỡng tier nếu mặt bằng chung đã thay đổi đáng kể.

---

## 18. Công thức Google Sheets / Excel

Giả sử:

```text
RA = rating đội A
RB = rating đội B
K = hệ số K
H = hệ số cách biệt tỷ số
SA = kết quả đội A: thắng = 1, thua = 0
SB = kết quả đội B: thắng = 1, thua = 0
```

### Expected đội A

```excel
=1/(1+10^((RB-RA)/400))
```

### Expected đội B

```excel
=1-Expected_A
```

Hoặc tính trực tiếp:

```excel
=1/(1+10^((RA-RB)/400))
```

### Delta đội A

```excel
=K*H*(SA-Expected_A)
```

### Delta đội B

```excel
=K*H*(SB-Expected_B)
```

### Elo mới cho mỗi người đội A

```excel
=Elo_Cu + Delta_A
```

### Elo mới cho mỗi người đội B

```excel
=Elo_Cu + Delta_B
```

---

## 19. Cách làm file Google Sheets đơn giản

Nên tạo 4 sheet:

```text
1. Players
2. Matches
3. Pairing History
4. Leaderboard
```

### Sheet `Players`

| Cột | Nội dung |
|---|---|
| Player ID | Mã người chơi |
| Name | Tên |
| Initial Elo | Elo khởi điểm |
| Current Elo | Elo hiện tại |
| Matches | Số trận |
| Wins | Số thắng |
| Losses | Số thua |
| Status | Active / Inactive / Provisional |

### Sheet `Matches`

Mỗi dòng là một trận.

| Cột | Nội dung |
|---|---|
| Date | Ngày |
| Tournament | Tên giải |
| Round | Vòng |
| Court | Sân |
| A1 | Người 1 đội A |
| A2 | Người 2 đội A |
| B1 | Người 1 đội B |
| B2 | Người 2 đội B |
| Score A | Điểm đội A |
| Score B | Điểm đội B |
| Winner | A hoặc B |
| RA | Rating đội A trước trận |
| RB | Rating đội B trước trận |
| Expected A | Xác suất kỳ vọng đội A |
| Expected B | Xác suất kỳ vọng đội B |
| K | Hệ số K |
| H | Hệ số tỷ số |
| Delta A | Điểm thay đổi đội A |
| Delta B | Điểm thay đổi đội B |

### Sheet `Pairing History`

Sheet này rất hữu ích với CLB 12 người, vì số tổ hợp partner nhiều hơn.

| Cột | Nội dung |
|---|---|
| Player | Người chơi |
| Partner | Người đánh cặp |
| Times Together | Số lần đánh cặp |
| Last Together | Lần gần nhất đánh cặp |
| Opponent | Đối thủ đã gặp |
| Times Opposed | Số lần gặp đối thủ này |

Mục tiêu:

```text
- Tránh trùng partner quá nhiều.
- Biết ai chưa từng đánh cặp với ai.
- Biết ai gặp nhau quá nhiều để vòng sau né bớt.
```

### Sheet `Leaderboard`

Tổng hợp từ `Players` và `Matches`.

| Cột | Nội dung |
|---|---|
| Rank | Hạng |
| Name | Tên |
| Elo | Elo hiện tại |
| Matches | Trận |
| Wins | Thắng |
| Losses | Thua |
| Win Rate | Tỷ lệ thắng |
| Point Diff | Hiệu số điểm |
| Last 5 | Phong độ 5 trận gần nhất |
| Unique Partners | Số partner khác nhau |
| Status | Trạng thái |

---

## 20. Khuyến nghị vận hành

Để hệ thống công bằng và dễ duy trì:

```text
1. Cập nhật Elo ngay sau mỗi trận hoặc ngay sau mỗi giải.
2. Công khai bảng Elo cho cả CLB.
3. Không chỉnh tay Elo nếu không có lý do rõ ràng.
4. Không thay đổi công thức giữa mùa giải.
5. Nếu muốn đổi rule, áp dụng từ tháng tiếp theo.
6. Lưu lịch sử từng trận để có thể kiểm tra lại.
7. Lưu cả lịch sử partner để tránh một người được đánh cặp với người mạnh quá nhiều.
```

Nên chốt một mùa giải theo quý hoặc nửa năm:

```text
Mùa 1: 3 tháng
Mùa 2: 3 tháng tiếp theo
```

Cuối mùa có thể trao giải:

```text
- Elo cao nhất
- Tăng Elo nhiều nhất
- Tỷ lệ thắng cao nhất
- Người tiến bộ nhất
- Cặp đôi có thành tích tốt nhất
- Người đánh với nhiều partner nhất
```

---

## 21. Bộ rule đề xuất dùng ngay

Phiên bản ngắn gọn để áp dụng ngay cho CLB:

```text
1. Elo khởi điểm theo tier do ban chuyên môn phân loại:
   - Tier 1: 1300 | Tier 2: 1200 | Tier 3: 1100 | Tier 4: 1000
2. Đánh đôi nhưng tính Elo cá nhân.
3. Rating đội = trung bình Elo của 2 người trong đội.
4. Expected score dùng công thức Elo chuẩn với hệ số 400.
5. 3 giải đầu tiên dùng K = 32 cho tất cả.
6. Người mới chưa rõ trình độ: K = 40 trong 10 trận đầu, Elo khởi điểm = 1000.
7. Sau giai đoạn đầu: K = 24.
8. Người đã có từ 30 trận trở lên: K = 16.
9. Hệ số tỷ số (H):
   - Cách biệt 1-3 điểm: H = 1.00
   - Cách biệt 4-6 điểm: H = 1.15
   - Cách biệt 7+ điểm: H = 1.25
10. Hệ số vòng (M) — áp dụng cho knock-out:
    - Vòng bảng:   M = 1.00
    - Bán kết:     M = 1.25
    - Tranh 3-4:   M = 1.10
    - Chung kết:   M = 1.50
11. Elo mới = Elo cũ + K × H × M × (S - E).
12. Format giải: 6 đội, 2 bảng vòng tròn → nhất nhì vào bán kết → chung kết + tranh 3-4.
13. Chia bảng theo seed để 2 bảng cân bằng nhau về tổng rating.
14. Chỉ xếp hạng chính thức nếu đã chơi ít nhất 12 trận.
15. Nghỉ 3 tháng liên tiếp: chuyển trạng thái Inactive.
16. Trận chỉ tính Elo nếu hai bên thống nhất trước và có ghi tỷ số đầy đủ.
17. Trong cùng một giải, hạn chế tối đa việc một người đánh cặp cùng partner quá 1 lần.
18. Khi chia trận, ưu tiên rating hai đội chênh nhau dưới 100 điểm.
```

---

## 22. Lưu ý quan trọng

Elo không phải là thước đo tuyệt đối hoàn hảo. Trong đánh đôi, kết quả còn bị ảnh hưởng bởi:

```text
- Partner
- Chiến thuật
- Phong độ trong ngày
- Thể lực
- Matchup giữa các lối chơi
- Sân bãi
- Bóng
- Áp lực thi đấu
```

Vì vậy, Elo nên được dùng như một chỉ số tham khảo chính, kết hợp với quan sát thực tế khi chia đội hoặc phân nhóm.

Với CLB khoảng 12 người, hệ thống sẽ phản ánh tốt hơn sau khoảng:

```text
3-6 giải nội bộ
hoặc
mỗi người có ít nhất 12-20 trận được tính Elo
```

Sau giai đoạn đó, bảng xếp hạng sẽ bắt đầu phản ánh tương đối đúng trình độ của từng người.
