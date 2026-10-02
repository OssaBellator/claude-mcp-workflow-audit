# Retail Master Pricing Pilot — Synthetic Reference

This reference demonstrates the first paid-pilot shape for a small retailer. It is **synthetic/open-source methodology, not customer work**.

## Outcome

Turn supplier invoice/product rows into a checkable master price list without guessing missing inputs. The workflow calculates landed cost and a proposed selling price, flags incomplete or duplicate rows, and never changes Shopify/live inventory without explicit approval.

## Inputs

Required per row:
- supplier SKU or stable product identifier
- product name
- supplier unit cost
- purchase currency
- quantity
- shipping allocation
- customs/duty allocation
- FX rate into store currency

Optional/configurable:
- other landed-cost allocation
- target gross margin
- purchase basis: wholesale or retail

## Deterministic calculations

```text
converted_unit_cost = supplier_unit_cost × fx_rate
landed_unit_cost = converted_unit_cost + shipping_per_unit + customs_per_unit + other_cost_per_unit
proposed_price = landed_unit_cost / (1 - target_margin)
gross_margin_at_proposed_price = (proposed_price - landed_unit_cost) / proposed_price
```

No calculation proceeds when a required numeric input is absent or invalid. The workflow reports the missing field rather than inventing a value.

## Quality checks

Each row can emit:
- `MISSING_REQUIRED_FIELD`
- `INVALID_NUMBER`
- `DUPLICATE_SKU`
- `ZERO_PRICE`
- `UNKNOWN_PURCHASE_BASIS`
- `READY_FOR_REVIEW`

Duplicate detection uses the stable supplier SKU first. Fuzzy product-name matching may be shown as a suggestion but must not silently merge records.

## Action boundary

The pilot produces **proposals only**. It does not update Shopify prices, products, inventory, publish social content, send payments, or alter supplier records. Any later Shopify write workflow must:

1. show the exact proposed changes,
2. obtain explicit owner approval,
3. make only the approved writes,
4. verify the resulting Shopify state,
5. retain evidence IDs and a recovery path.

## Example synthetic row

| Field | Value |
|---|---:|
| SKU | DEMO-001 |
| Supplier cost | 100 AED |
| FX rate | 0.41 AUD/AED |
| Shipping allocation | A$5 |
| Customs allocation | A$3 |
| Other allocation | A$1 |
| Target margin | 40% |

Calculated converted cost: A$41.00  
Calculated landed cost: A$50.00  
Proposed selling price: A$83.33  
Gross margin at proposed price: 40%

These values are illustrative only.

## Pilot acceptance tests

1. Complete row produces transparent calculations.
2. Missing FX rate produces a flag and no guessed price.
3. Duplicate SKU is surfaced before merge/import.
4. Zero supplier cost is flagged.
5. Wholesale vs retail purchase basis remains visible.
6. Changing target margin deterministically changes proposed price.
7. No Shopify write occurs during calculation/review.
8. Re-running identical input produces identical output.
9. Owner can export the master list and maintain it without the original implementer.
10. Configuration documents currencies, margin assumptions, subscriptions, access scopes, and recovery steps.

## Handoff

Deliverables should include the master sheet/database, field definitions, calculation rules, import procedure, approval procedure, access inventory, recurring costs, test cases, and a short operator guide. Accounts and configuration should remain under the buyer's ownership.
