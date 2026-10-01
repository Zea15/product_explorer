"use client";

import { useState,useEffect } from "react";
import ProductSearchForm from "./ProductSearchForm";
import { defaultQuery, fetchProducts } from "@/lib/products";
import type { Product, ProductList, SearchQuery, ProductDraft } from "@/lib/products";
import ProductForm from "./ProductForm";

type LoadState = "idle" |  "loading" | "error" | "ready";

export default function ProductExplorer() {
  const [products, setProducts] = useState<Product[]>([]);
  ///const [status, setStatus] = useState<LoadState>("idle");
  const [status, setStatus] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const editingProduct = products.find((item) => item.id === editingId) ?? null;

  function showResult(list: ProductList) {
    setProducts(list.products);
    setStatus("ready");
  }

  function showError(error: unknown) {
    setErrorMessage(
      error instanceof Error ? error.message : "เรียกข้อมูลไม่สำเร็จ"
    );
    setStatus("error");
  }
  async function loadProducts(query: SearchQuery) {
    setStatus("loading");
    setErrorMessage("");

    try {
      showResult(await fetchProducts(query));
    } catch (error) {
      showError(error);
    }
  }  
  function saveProduct(draft: ProductDraft) {
    if (editingId !== null) {
      setProducts((current) =>
        current.map((item) =>
          item.id === editingId ? { ...item, ...draft, id: editingId } : item
        )
      );
      setEditingId(null);
      return;
    }

    setProducts((current) => [...current, { ...draft, id: Date.now() }]);
  }

  function removeProduct(id: number) {
    setProducts((current) => current.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  }

  useEffect(() => {
    fetchProducts(defaultQuery).then(showResult).catch(showError);
  }, []);

  return (
    <main className="product-explorer">
      <h1 className="page-title">รายการสินค้า</h1>

      <button
        type="button"
        className="load-button"
        onClick={() => loadProducts(defaultQuery)}
        disabled={status === "loading"}
      >
        {status === "loading" ? "กำลังโหลด" : "โหลดข้อมูล"}
      </button>

      <ProductSearchForm onSearch={loadProducts} />

      {<section className="product-panel" aria-live="polite">
        {/*status === "idle" && <p>คลิกปุ่มโหลดข้อมูลเพื่อเริ่ม</p>*/}

        {status === "loading" && <p>กำลังโหลดข้อมูล</p>}

        {status === "error" && <p role="alert">{errorMessage}</p>}

        {status === "ready" && products.length === 0 && (
          <p>ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
        )}

        {status === "ready" && products.length > 0 && (
          <table className="product-table">
            <thead>
              <tr>
                <th>รูป</th>
                <th>ชื่อสินค้า</th>
                <th>ราคา</th>
                <th>คงเหลือ</th>
                <th>หมวดหมู่</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id}>
                  <td className="image-cell">
                    <img className="product-image" src={item.thumbnail ?? item.image ?? item.images?.[0]} alt={item.title} width="100" />
                  </td>
                  <td>{item.title}</td>
                  <td>{item.price}</td>
                  <td>{item.stock}</td>
                  <td>{item.category}</td>
                  <td className="row-actions">
                    <button
                      type="button"
                      className="row-action-button"
                      onClick={() => setEditingId(item.id)}
                    >
                      แก้ไข
                    </button>
                    <button
                      type="button"
                      className="row-action-button delete-button"
                      onClick={() => removeProduct(item.id)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>}
      
      <ProductForm
        key={editingId ?? "new"}
        editing={editingProduct}
        onSave={saveProduct}
        onCancel={() => setEditingId(null)}
      />
    </main>
  );
}
