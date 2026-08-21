export async function main() {
  console.log("Supabase is the production database; use the Supabase migration workflow for seed data.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
