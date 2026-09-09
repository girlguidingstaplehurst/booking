alter table booking_invoices
    add event_id text references booking_events,
    add event_group_id text references booking_event_groups;

update booking_invoices bi
set event_id = grouped.event_id,
    event_group_id = grouped.event_group_id
from (
    select bii.invoice_id,
           min(bii.event_id) as event_id,
           min(be.event_group_id) as event_group_id
    from booking_invoice_items bii
    left join booking_events be on be.id = bii.event_id
    where bii.event_id is not null
    group by bii.invoice_id
) grouped
where bi.id = grouped.invoice_id;

alter table booking_invoice_items
    drop column event_id,
    drop column fk_invoice_id,
    drop column fk_event_id;
