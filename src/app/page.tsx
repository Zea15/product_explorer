import ProductExplorer from "@/components/ProductExplorer";
import { AuthButtons } from "@/components/auth-buttons";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <>
      <header className="auth-header">
        <div className="brand-lockup" aria-label="Product Studio">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span>Product Studio</span>
        </div>
        <AuthButtons
          isLoggedIn={Boolean(session?.user)}
          userName={session?.user?.name}
        />
      </header>
      <ProductExplorer />
    </>
  );
}
