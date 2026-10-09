import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { ProductSchema } from "@/lib/products";

const API_BASE = "https://dummyjson.com/products";
const DeleteProductResultSchema = z.object({
  id: z.number(),
  isDeleted: z.literal(true),
});

type DeleteProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DeleteProductPage({
  params,
}: DeleteProductPageProps) {
  const { id: rawId } = await params;
  if (!/^\d+$/.test(rawId)) {
    notFound();
  }

  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id < 1) {
    notFound();
  }

  const response = await fetch(`${API_BASE}/${id}`, { cache: "no-store" });
  if (response.status === 404) {
    notFound();
  }
  if (!response.ok) {
    throw new Error(
      `เรียกข้อมูลสินค้าไม่สำเร็จ สถานะ ${response.status} ${response.statusText}`
    );
  }

  const productResult = ProductSchema.safeParse(await response.json());
  if (!productResult.success) {
    throw new Error("รูปแบบข้อมูลสินค้าที่ได้รับไม่ถูกต้อง");
  }

  async function deleteProduct() {
    "use server";

    const deleteResponse = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    if (!deleteResponse.ok) {
      throw new Error(
        `ลบสินค้าไม่สำเร็จ สถานะ ${deleteResponse.status} ${deleteResponse.statusText}`
      );
    }

    const deleteResult = DeleteProductResultSchema.safeParse(
      await deleteResponse.json()
    );
    if (!deleteResult.success || deleteResult.data.id !== id) {
      throw new Error("ผลการลบสินค้าที่ได้รับไม่ถูกต้อง");
    }

    redirect("/");
  }

  const product = productResult.data;

  return (
    <main className="product-explorer">
      <h1 className="page-title">ยืนยันการลบสินค้า</h1>
      <section className="product-panel">
        <h2>{product.title}</h2>
        <p>หมวดหมู่: {product.category}</p>
        <p>ราคา: {product.price}</p>
        <p>จำนวนคงเหลือ: {product.stock}</p>
        {product.description && <p>{product.description}</p>}
        <p role="alert">เมื่อลบแล้วจะไม่สามารถกู้คืนรายการนี้ได้</p>

        <div className="form-actions">
          <form action={deleteProduct}>
            <button
              className="row-action-button delete-button"
              type="submit"
            >
              ยืนยันลบสินค้า
            </button>
          </form>
          <Link className="cancel-button" href="/">
            ยกเลิก
          </Link>
        </div>
      </section>
    </main>
  );
}
