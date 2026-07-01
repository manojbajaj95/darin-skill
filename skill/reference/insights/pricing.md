# Pricing recipe

## What to find

Pricing page, plan tiers, feature matrices, billing copy, upgrade/downgrade language.

## Recipe-specific checks

1. **Tier logic** — do plan names and limits match how you actually want to segment users?
2. **Who each plan targets** — can you name the ICP per tier? Does copy match `PRODUCT.md` Users?
3. **Free tier / trial** — if present in code, is it deliberate per strategy or accidental drift?
4. **Feature gating** — do gated features align with active `hypotheses/` bets?
5. **Value metric** — is pricing tied to the value customers get (seats, usage, outcomes) or arbitrary?

## Common misalignments

- Enterprise features on self-serve tier when strategy says PLG first
- Missing tier for the segment interviews keep mentioning
- Pricing page sells capabilities you're explicitly not building
