-- Tao database danh rieng cho kiem thu.
--
-- Tep nay duoc image postgres chay mot lan duy nhat, khi volume du lieu con trong,
-- tuc lan dau `docker compose up -d db` tren mot may chua co gi.
-- Nho vay database test khong con phai tao bang tay bang docker exec.
--
-- Luoc do cua database nay do `scripts/prepare-test-db.mjs` ap, vi no sinh ra tu
-- contract.ts chu khong phai tu SQL viet tay.

CREATE DATABASE capstoneone_test;
