# cPanel Cutover Checklist

## Stage A: Read Parity
- Compare legacy and Laravel read endpoints for members, youth, societies, logs.
- Validate counts and spot-check records.

## Stage B: Write Cutover
1. Members writes -> Laravel
2. Youth writes -> Laravel
3. Societies writes -> Laravel
4. Users writes -> Laravel
5. Attendance writes -> Laravel
6. Audit writes -> Laravel

## Stage C: Advanced
- Reports exports -> Laravel
- SMS -> Laravel Africa's Talking integration
- AI insights -> Laravel Gemini endpoint

## Stage D: Decommission
- Keep legacy API in standby during rollback window.
- Remove old Node/custom PHP routes after signoff.
