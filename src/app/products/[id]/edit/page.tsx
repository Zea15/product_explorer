import ProductForm from "@/components/ProductForm";
import {
  ProductDraftSchema,
  ProductSchema,
} from "@/lib/products";
import type { ProductDraft } from "@/lib/products";
import { notFound, redirect } from "next/navigation";

const API_BASE = "https://dummyjson.com/products";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
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

  async function saveProduct(draft: ProductDraft) {
    "use server";

    const draftResult = ProductDraftSchema.safeParse(draft);
    if (!draftResult.success) {
      throw new Error("ข้อมูลสินค้าไม่ถูกต้อง");
    }

    const updateResponse = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draftResult.data),
    });
    if (!updateResponse.ok) {
      throw new Error(
        `บันทึกสินค้าไม่สำเร็จ สถานะ ${updateResponse.status} ${updateResponse.statusText}`
      );
    }

    const updatedProduct = ProductSchema.safeParse(
      await updateResponse.json()
    );
    if (!updatedProduct.success) {
      throw new Error("รูปแบบข้อมูลสินค้าที่บันทึกไม่ถูกต้อง");
    }

    redirect("/");
  }

  async function cancelEdit() {
    "use server";
    redirect("/");
  }

  return (
    <main className="product-explorer">
      <h1 className="page-title">แก้ไขสินค้า</h1>
      <ProductForm
        editing={productResult.data}
        onSave={saveProduct}
        onCancel={cancelEdit}
      />
    </main>
  );
}
