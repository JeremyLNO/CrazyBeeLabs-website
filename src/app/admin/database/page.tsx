import { MigrateButton } from "@/components/admin/MigrateButton";
import { Hex } from "@/components/ui/Hex";

export const metadata = { title: "Admin · Database" };

export default function AdminDatabasePage() {
  return (
    <>
      <div className="page-head">
        <span className="kicker">
          <Hex /> Admin
        </span>
        <h1>Database</h1>
        <p className="lead">
          Apply pending schema migrations. Idempotent (uses <code>IF NOT EXISTS</code>),
          so it is safe to run anytime.
        </p>
      </div>
      <MigrateButton />
    </>
  );
}
