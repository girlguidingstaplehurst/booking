import { AdminPoster } from "../../Poster";

export async function markInvoicePaid(invoiceID) {
  return await AdminPoster(
    `/api/v1/admin/invoices/by-id/${invoiceID}/mark-as-paid`,
    null,
  );
}
