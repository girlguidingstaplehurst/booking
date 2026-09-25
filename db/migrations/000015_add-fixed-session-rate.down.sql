alter table booking_rates
    drop constraint booking_rates_pricing_mode_check,
    drop column pricing_mode,
    drop column session_price;
