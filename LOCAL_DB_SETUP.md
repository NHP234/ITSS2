# Hướng dẫn setup Local DB cho App Project Management
## Requirements:
- PostgreSQL 16.0 trở lên

## Thiết lập local database
### Khởi tạo
Trên pgAdmin hoặc DBeaver, tạo database tên ``itss2``.
Tìm file ``backend/.env.example`` , copy sang 1 file ``.env`` và viết 1 dòng duy nhất:
```
DATABASE_URL="postgresql://postgres:admin@localhost:5432/itss2
```
Chú ý thay ``postgres`` và ``admin`` thành username và password tương ứng.

### Migration
Thực hiện migration thông qua các command sau:
```
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

Sau đó thực hiện chạy như bình thường.

