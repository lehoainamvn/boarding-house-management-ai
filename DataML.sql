-- 1. Dọn dẹp Cursor (Giữ nguyên của bạn)
IF CURSOR_STATUS('global', 'room_cursor') >= -1
BEGIN
    CLOSE room_cursor;
    DEALLOCATE room_cursor;
END
GO

-- 2. Khai báo biến
DECLARE @houseId INT = 14; 
DECLARE @months INT = 24; -- Tạo hẳn 2 năm dữ liệu cho AI học sướng luôn

DECLARE @currentRoomId INT, @tenantId INT;
DECLARE @roomPrice DECIMAL(12,2), @totalAmt DECIMAL(12,2);
DECLARE @i INT, @invoiceDate DATETIME, @monthStr NVARCHAR(7);
DECLARE @electricUsed INT, @waterUsed INT, @eCost DECIMAL(12,2), @wCost DECIMAL(12,2);

-- Biến bổ sung để tạo quy luật
DECLARE @seasonFactor FLOAT; -- Yếu tố mùa hè/đông
DECLARE @trendFactor FLOAT;   -- Yếu tố lạm phát/tăng giá theo thời gian

DECLARE room_cursor CURSOR GLOBAL FOR 
SELECT id, room_price FROM rooms WHERE house_id = @houseId;

OPEN room_cursor;
FETCH NEXT FROM room_cursor INTO @currentRoomId, @roomPrice;

WHILE @@FETCH_STATUS = 0
BEGIN
    SELECT TOP 1 @tenantId = tenant_id FROM tenant_rooms WHERE room_id = @currentRoomId;
    IF @tenantId IS NULL SELECT TOP 1 @tenantId = tenant_id FROM tenant_rooms;

    IF @tenantId IS NOT NULL
    BEGIN
        SET @i = 1; 
        WHILE @i <= @months
        BEGIN
            SET @invoiceDate = DATEADD(month, -@i, GETDATE());
            SET @monthStr = FORMAT(@invoiceDate, 'yyyy-MM');
            
            -- GIẢ LẬP TRỐNG PHÒNG: Chỉ tạo hóa đơn nếu RAND() > 0.15 
            -- (Tức là có khoảng 15% xác suất phòng bị trống tháng đó)
            IF RAND() > 0.15 
            BEGIN
                SET @seasonFactor = 1.0;
                IF MONTH(@invoiceDate) IN (5,6,7,8) SET @seasonFactor = 1.4;
                IF MONTH(@invoiceDate) IN (11,12,1) SET @seasonFactor = 0.8;

                SET @trendFactor = 1.0 + ((@months - @i) * 0.005);
                SET @electricUsed = (80 + (RAND() * 40)) * @seasonFactor;
                SET @waterUsed = (5 + (RAND() * 3)); 
                SET @eCost = @electricUsed * 3500;
                SET @wCost = @waterUsed * 15000;
                SET @totalAmt = (@roomPrice * @trendFactor) + @eCost + @wCost + (RAND() * 20000);

                INSERT INTO invoices (room_id, tenant_id, [month], room_price, electric_used, water_used, electric_cost, water_cost, total_amount, [status], created_at, paid_at) 
                VALUES (@currentRoomId, @tenantId, @monthStr, @roomPrice, @electricUsed, @waterUsed, @eCost, @wCost, @totalAmt, 'PAID', @invoiceDate, @invoiceDate);
            END
            SET @i = @i + 1;
        END
    END
    FETCH NEXT FROM room_cursor INTO @currentRoomId, @roomPrice;
END

CLOSE room_cursor;
DEALLOCATE room_cursor;
PRINT N'✅ ĐÃ BƠM DỮ LIỆU CÓ QUY LUẬT CHO NHÀ 14! AI SẼ HỌC RẤT CHUẨN.';